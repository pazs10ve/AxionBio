import os
import sys
import json
from google.cloud import storage
import psycopg2
from datetime import datetime

# ── Env Vars injected by GCP Batch / Cloud Run ─────────────────────────────────
DATABASE_URL = os.environ.get("DATABASE_URL")
JOB_ID = os.environ.get("JOB_ID")
WORKSPACE_ID = os.environ.get("WORKSPACE_ID")
USER_ID = os.environ.get("USER_ID")

# ── Google Cloud Storage Credentials ───────────────────────────────────────────
GCS_BUCKET = os.environ.get("GCS_BUCKET")

def get_db():
    """Initializes the Neon Postgres connection."""
    try:
        return psycopg2.connect(DATABASE_URL)
    except Exception as e:
        print(f"Failed to connect to database: {e}")
        sys.exit(1)

def get_storage_bucket():
    """Initializes the GCS bucket client."""
    client = storage.Client()
    return client.bucket(GCS_BUCKET)

def log_event(conn, message, level="info"):
    """Streams a log line directly to the database so it appears instantly on the frontend."""
    ts = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    formatted = f"[{ts}] {message}"
    print(formatted) # Native stdout for GCP Cloud Logging
    
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO job_logs (id, job_id, line, level, created_at) VALUES (gen_random_uuid(), %s, %s, %s, NOW())",
                (JOB_ID, formatted, level)
            )
        conn.commit()
    except Exception as e:
        print(f"Database write error: {e}")

def update_progress(conn, pct, step_name):
    """Updates the percentage progress bar in the jobs table."""
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE jobs SET progress_pct = %s, current_step = %s, updated_at = NOW() WHERE id = %s",
                (pct, step_name, JOB_ID)
            )
        conn.commit()
    except Exception as e:
        print(f"Progress update error: {e}")

def fetch_params(conn):
    """Retrieves the JSON payload dictionary the user configured on the frontend."""
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT parameters FROM jobs WHERE id = %s", (JOB_ID,))
            res = cur.fetchone()
            return res[0] if res else {}
    except Exception as e:
        print(f"Failed to fetch job params: {e}")
        return {}

def mark_failed(conn, error_msg):
    """Hards fails the job when inference crashes."""
    log_event(conn, f"FATAL ERROR: {error_msg}", "error")
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE jobs SET status = 'failed', error_message = %s, completed_at = NOW(), updated_at = NOW() WHERE id = %s",
                (error_msg, JOB_ID)
            )
        conn.commit()
    except Exception as e:
        print(f"Failed to mark database row as failed: {e}")
    sys.exit(1)

def register_molecule(conn, bucket, pdb_path, molecule_name, score_plddt):
    """Uploads the inference PDB structure to GCS and registers it to the workspace."""
    log_event(conn, f"Uploading {pdb_path} to GCS storage...")
    
    molecule_id = f"mol_{int(datetime.now().timestamp())}"
    gcs_key = f"molecules/{molecule_id}/structure.pdb"
    
    # 1. GCS Upload
    try:
        blob = bucket.blob(gcs_key)
        blob.upload_from_filename(pdb_path)
        log_event(conn, f"Upload complete: {gcs_key}")
    except Exception as e:
        mark_failed(conn, f"GCS Upload failed: {e}")

    # 2. Extract FASTA (Simplified placeholder)
    sequence = "UNKNOWN_SEQUENCE_PARSER_TODO"

    # 3. Database Insertion
    log_event(conn, "Registering molecule record...")
    try:
        scores = json.dumps({"pLDDT": score_plddt})
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO molecules (id, workspace_id, source_job_id, created_by, name, molecule_type, sequence, scores, pdb_file_key, status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, 'protein', %s, %s, %s, 'candidate', NOW(), NOW())
            """, (molecule_id, WORKSPACE_ID, JOB_ID, USER_ID, molecule_name, sequence, scores, gcs_key))
            
            results_json = json.dumps({"molecules": [{"id": molecule_id, "name": molecule_name}]})
            cur.execute("""
                UPDATE jobs SET status = 'success', progress_pct = 100, current_step = 'Complete', results = %s, completed_at = NOW(), updated_at = NOW() WHERE id = %s
            """, (results_json, JOB_ID))
            
        conn.commit()
        log_event(conn, "[DONE] Molecular inference complete.")
    except Exception as e:
        mark_failed(conn, f"Postgres syntax error on molecule insert: {e}")
