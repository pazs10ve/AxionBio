import time
import json
from client import (
    get_db, get_storage_client, log_event, update_progress, 
    fetch_params, register_molecule, mark_failed
)

def run_scaffold(params, conn):
    """Simulates a scientific job."""
    log_event(conn, f"Scaffold executing with params: {json.dumps(params)}")
    
    update_progress(conn, 25, "Testing network ingress/egress")
    time.sleep(2)
    
    log_event(conn, "Simulating tensor operations...")
    for i in range(1, 4):
        time.sleep(1)
        update_progress(conn, 25 + (i * 20), f"Epoch {i}/3 completed")
        log_event(conn, f"Loss: 0.0{i}14")
        
    update_progress(conn, 95, "Generating output assets")
    
    # Create a dummy PDB
    output_path = "/tmp/scaffold_output.pdb"
    with open(output_path, "w") as f:
        f.write("ATOM      1  N   MET A   1      27.340  24.430   2.614  1.00 62.15           N\n")
        f.write("ATOM      2  CA  MET A   1      26.266  25.413   2.842  1.00 61.64           C\n")
        
    return output_path, "Scaffold-Test-01", 99.9

if __name__ == "__main__":
    conn = get_db()
    bucket = get_storage_bucket()
    
    try:
        log_event(conn, "Scaffold container booted successfully.", "info")
        update_progress(conn, 5, "Initializing container environment")
        
        params = fetch_params(conn)
        pdb_path, molecule_name, score = run_scaffold(params, conn)
        
        register_molecule(conn, bucket, pdb_path, molecule_name, score)
        
    except Exception as e:
        mark_failed(conn, str(e))
    finally:
        conn.close()
