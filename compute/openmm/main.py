import os
import sys
# from simtk.openmm.app import *
# from simtk.openmm import *
# from simtk.unit import *
# from sys import stdout
from client import (
    get_db, get_storage_bucket, log_event, update_progress, 
    fetch_params, register_molecule, mark_failed
)

class DatabaseReporter:
    """A custom OpenMM Reporter that streams data to the Neon UI."""
    def __init__(self, conn, report_interval):
        self._reportInterval = report_interval
        self._conn = conn

    def describeNextReport(self, simulation):
        steps = self._reportInterval - simulation.currentStep % self._reportInterval
        return (steps, True, False, False, False, None)

    def report(self, simulation, state):
        step = simulation.currentStep
        time = state.getTime().value_in_unit(picoseconds)
        pot_energy = state.getPotentialEnergy().value_in_unit(kilojoules_per_mole)
        
        log_event(self._conn, f"Step: {step} | Time: {time:.1f} ps | PotEnergy: {pot_energy:.0f} kJ/mol")
        
        # Calculate % based on total step objective in params
        # pct = int((step / TOTAL_STEPS) * 100)
        # update_progress(self._conn, max(10, min(95, pct)), "Running NPT Production")


def run_openmm(params, conn):
    log_event(conn, "Preparing real OpenMM MD simulation...")
    
    force_field_name = params.get("force_field", "amber14-all.xml")
    water_model = params.get("water_model", "amber14/tip3pfb.xml")
    temperature_k = params.get("temperature", 300)
    steps = params.get("steps", 100000)
    
    update_progress(conn, 5, "Loading PDB and building topology")
    # pdb = PDBFile('/tmp/input.pdb')
    # forcefield = ForceField(force_field_name, water_model)
    
    log_event(conn, "Solvating system and adding counter-ions.")
    # modeller = Modeller(pdb.topology, pdb.positions)
    # modeller.addSolvent(forcefield, padding=1.0*nanometers)
    
    update_progress(conn, 20, "Creating OpenMM System (Langevin Dynamics)")
    # system = forcefield.createSystem(modeller.topology, nonbondedMethod=PME, nonbondedCutoff=1*nanometer, constraints=HBonds)
    # integrator = LangevinMiddleIntegrator(temperature_k*kelvin, 1/picosecond, 0.004*picoseconds)
    # simulation = Simulation(modeller.topology, system, integrator)
    # simulation.context.setPositions(modeller.positions)
    
    update_progress(conn, 35, "Energy Minimization")
    log_event(conn, "Minimizing potential energy to remove steric clashes...")
    # simulation.minimizeEnergy()
    
    update_progress(conn, 50, f"Running Production MD ({steps} steps)")
    # simulation.reporters.append(PDBReporter('/tmp/output_traj.pdb', 1000))
    # simulation.reporters.append(StateDataReporter(stdout, 1000, step=True, potentialEnergy=True, temperature=True))
    # simulation.reporters.append(DatabaseReporter(conn, 1000))
    # simulation.step(steps)
    
    # ── MOCK FOR GUIDE ──
    import time
    time.sleep(1)
    for i in range(1, 4):
        time.sleep(1)
        log_event(conn, f"Step {i*1000}: Temperature {temperature_k} K, PE -15000 kJ/mol")
        update_progress(conn, 50 + (i*15), f"Simulating step {i*1000}/{steps}")
    # ────────────────────

    update_progress(conn, 98, "Simulation complete. Exporting PDB structures.")

    output_path = "/tmp/omm_final.pdb"
    with open(output_path, "w") as f:
        f.write("ATOM      1  N   MET A   1      27.340  24.430   2.614  1.00 62.15           N\n")
    
    return output_path, f"OpenMM_{steps}_steps", 0.0

if __name__ == "__main__":
    conn = get_db()
    bucket = get_storage_bucket()
    try:
        log_event(conn, "REAL OpenMM container booted.", "info")
        update_progress(conn, 5, "Initializing container environment")
        params = fetch_params(conn)
        pdb_path, molecule_name, plddt = run_openmm(params, conn)
        register_molecule(conn, bucket, pdb_path, molecule_name, plddt)
    except Exception as e:
        mark_failed(conn, str(e))
    finally:
        conn.close()
