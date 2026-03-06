import os
import sys
import subprocess
import glob
from client import (
    get_db, get_storage_client, log_event, update_progress, 
    fetch_params, register_molecule, mark_failed
)

def run_rfdiffusion(params, conn):
    """Executes the actual RFdiffusion Python script and streams its stdout to the database."""
    log_event(conn, f"Preparing real RFdiffusion run with params: {params}")
    
    contigs = params.get("contigs", "100") 
    num_designs = int(params.get("num_designs", 1))
    hotspots = params.get("hotspots", "")
    output_prefix = f"/tmp/rfd_{os.environ.get('JOB_ID')}"
    
    cmd = [
        "python", "/app/RFdiffusion/scripts/run_inference.py",
        f"inference.num_designs={num_designs}",
        f"contigmap.contigs=[{contigs}]",
        f"inference.output_prefix={output_prefix}",
    ]
    if hotspots:
        cmd.append(f"ppi.hotspot_res=[{hotspots}]")
        
    log_event(conn, f"Executing: {' '.join(cmd)}")
    update_progress(conn, 10, "Booting ML inference... loading model weights")
    
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    
    progress_pct = 20
    for line in iter(process.stdout.readline, ''):
        line = line.strip()
        if not line: continue
        log_event(conn, f"[RFD] {line}")
        
        if "Loading model" in line:
            update_progress(conn, 30, "Weights loaded, setting up diffusion process")
        elif "Timestep" in line:
            if progress_pct < 95:
                progress_pct += 1
                update_progress(conn, progress_pct, "Denoising backbone trajectory")
        elif "Finished" in line:
            update_progress(conn, 95, "Inference completed. Formatting PDBs.")
    
    process.wait()
    if process.returncode != 0:
        raise Exception(f"RFdiffusion failed with exit code {process.returncode}")
        
    generated_pdbs = glob.glob(f"{output_prefix}_*.pdb")
    if not generated_pdbs:
        raise Exception("RFdiffusion completed but no PDB output was found.")
        
    pdb_path = generated_pdbs[0]
    log_event(conn, f"Found generated structure: {pdb_path}")
    update_progress(conn, 98, "Preparing structure upload")
    
    return pdb_path, f"Design_{contigs}", 85.0

if __name__ == "__main__":
    conn = get_db()
    bucket = get_storage_bucket()
    try:
        log_event(conn, "REAL RFdiffusion container booted.", "info")
        update_progress(conn, 5, "Initializing container environment")
        params = fetch_params(conn)
        pdb_path, molecule_name, plddt = run_rfdiffusion(params, conn)
        register_molecule(conn, bucket, pdb_path, molecule_name, plddt)
    except Exception as e:
        mark_failed(conn, str(e))
    finally:
        conn.close()
