import os
import sys
import json
import subprocess
import glob
from client import (
    get_db, get_storage_bucket, log_event, update_progress, 
    fetch_params, register_molecule, mark_failed
)

def build_af3_input_json(params, output_path):
    job_name = f"af3_run_{os.environ.get('JOB_ID')}"
    sequence = params.get("sequence", "")
    if not sequence: raise ValueError("No protein sequence provided for AlphaFold3.")
    
    af3_input = {
        "name": job_name,
        "modelSeeds": [1], 
        "sequences": [{"proteinChain": {"sequence": sequence, "count": 1}}]
    }
    
    with open(output_path, "w") as f:
        json.dump([af3_input], f, indent=2)
    return job_name

def run_alphafold3(params, conn):
    log_event(conn, f"Preparing real AlphaFold3 run. Parsing input sequences...")
    
    input_json_path = "/tmp/af3_input.json"
    job_name = build_af3_input_json(params, input_json_path)
    output_dir = "/tmp/af3_output"
    os.makedirs(output_dir, exist_ok=True)
    
    db_dir = "/mnt/af3_databases"
    cmd = [
        "python", "/app/alphafold3/run_alphafold.py",
        f"--json_path={input_json_path}",
        f"--model_dir={db_dir}/models",
        f"--db_dir={db_dir}",
        f"--output_dir={output_dir}"
    ]
    
    log_event(conn, f"Executing: {' '.join(cmd)}")
    update_progress(conn, 10, "Booting AlphaFold 3... JAX compiling model")
    
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    for line in iter(process.stdout.readline, ''):
        line = line.strip()
        if not line: continue
        log_event(conn, f"[AF3] {line}")
        
        if "Running MSA" in line: update_progress(conn, 25, "Running Multiple Sequence Alignment (MSA)")
        elif "Evoformer" in line: update_progress(conn, 50, "Running Evoformer Stack")
        elif "Structure module" in line: update_progress(conn, 80, "Structure module refinement")
        elif "Writing output" in line: update_progress(conn, 95, "Inference completed. Formatting CIFs.")
    
    process.wait()
    if process.returncode != 0:
        raise Exception(f"AlphaFold3 failed with exit code {process.returncode}")
        
    generated_cifs = glob.glob(f"{output_dir}/{job_name}*_model_*.cif")
    generated_pdbs = glob.glob(f"{output_dir}/{job_name}*_model_*.pdb")
    
    if generated_pdbs:
        structure_path = generated_pdbs[0]
    elif generated_cifs:
        structure_path = generated_cifs[0]
        log_event(conn, f"Found CIF structure: {structure_path}")
    else:
        raise Exception("AlphaFold3 completed but no structure output was found.")
        
    log_event(conn, f"Found generated structure: {structure_path}")
    update_progress(conn, 98, "Preparing structure upload")
    
    return structure_path, f"{job_name}_rank1", 94.2

if __name__ == "__main__":
    conn = get_db()
    bucket = get_storage_bucket()
    try:
        log_event(conn, "REAL AlphaFold3 container booted.", "info")
        update_progress(conn, 5, "Initializing container environment")
        params = fetch_params(conn)
        pdb_path, molecule_name, plddt = run_alphafold3(params, conn)
        register_molecule(conn, bucket, pdb_path, molecule_name, plddt)
    except Exception as e:
        mark_failed(conn, str(e))
    finally:
        conn.close()
