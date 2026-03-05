import { sleep } from '@/lib/api-utils';

// ── Shared types ──────────────────────────────────────────────────────────────

export type LogLevel = 'info' | 'warning' | 'error';

export type JobPayload = {
    jobId: string;
    type: string;
    parameters: Record<string, unknown>;
    onLog: (line: string, level?: LogLevel) => Promise<void>;
    onProgress: (pct: number, step: string) => Promise<void>;
};

export type MoleculeResult = {
    name: string;
    sequence: string;
    scores: Record<string, number | string>;
    pdbFileKey?: string;
};

export type JobResult = {
    molecules?: MoleculeResult[];
    trajectoryKey?: string;
    summaryKey?: string;
    rawOutputKey?: string;
    metadata?: Record<string, unknown>;
};

export interface ModelAdapter {
    run(payload: JobPayload): Promise<JobResult>;
}

// ── Stub adapter ──────────────────────────────────────────────────────────────
// Used for every model until real GCP endpoints are configured.
// Simulates a real job with realistic log lines and timing.

type StubStep = { ms: number; message: string; pct: number };

const STUB_STEPS: Record<string, StubStep[]> = {
    alphafold3: [
        { ms: 800, pct: 5, message: 'Initialising AlphaFold3 inference pipeline' },
        { ms: 1200, pct: 15, message: 'Running multiple sequence alignment (MSA)' },
        { ms: 2000, pct: 35, message: 'Computing template search against PDB70' },
        { ms: 1500, pct: 55, message: 'Running Evoformer stack (48 blocks)' },
        { ms: 1800, pct: 75, message: 'Structure module refinement' },
        { ms: 1000, pct: 90, message: 'Computing pLDDT and pTM scores' },
        { ms: 500, pct: 100, message: 'Writing output CIF and structure JSON' },
    ],
    rfdiffusion: [
        { ms: 600, pct: 5, message: 'Loading RFdiffusion weights' },
        { ms: 1000, pct: 15, message: 'Setting up contigmap and hotspot residues' },
        { ms: 2500, pct: 40, message: 'Running forward diffusion (T=200 timesteps)' },
        { ms: 3000, pct: 70, message: 'Reverse denoising — generating backbone' },
        { ms: 1200, pct: 85, message: 'Running ProteinMPNN sequence recovery' },
        { ms: 800, pct: 95, message: 'Self-consistency pLDDT filtering' },
        { ms: 400, pct: 100, message: 'Writing top-ranked designs to output' },
    ],
    esm3: [
        { ms: 500, pct: 10, message: 'Tokenising sequence input' },
        { ms: 1500, pct: 40, message: 'Running ESM-3 (98B params) forward pass' },
        { ms: 1200, pct: 70, message: 'Decoding structure and function tokens' },
        { ms: 600, pct: 90, message: 'Scoring variants by log-likelihood' },
        { ms: 300, pct: 100, message: 'Job complete' },
    ],
    esmfold: [
        { ms: 400, pct: 20, message: 'Loading ESMFold model' },
        { ms: 800, pct: 60, message: 'Single-sequence structure prediction' },
        { ms: 400, pct: 90, message: 'Computing per-residue pLDDT' },
        { ms: 200, pct: 100, message: 'Writing PDB output' },
    ],
    gromacs: [
        { ms: 600, pct: 5, message: 'Preparing topology (AMBER99SB-ILDN)' },
        { ms: 800, pct: 15, message: 'Solvating structure in TIP3P water box' },
        { ms: 700, pct: 25, message: 'Energy minimisation (1000 steps steepest descent)' },
        { ms: 1000, pct: 40, message: 'NVT equilibration (100 ps, V-rescale thermostat)' },
        { ms: 1000, pct: 55, message: 'NPT equilibration (100 ps, Parrinello-Rahman barostat)' },
        { ms: 3000, pct: 85, message: 'Running production MD (50 ns)' },
        { ms: 800, pct: 95, message: 'Computing RMSD, RMSF, Rg' },
        { ms: 400, pct: 100, message: 'Trajectory written to output' },
    ],
    openmm: [
        { ms: 500, pct: 10, message: 'Building OpenMM system with CHARMM36 FF' },
        { ms: 1000, pct: 30, message: 'Running energy minimisation' },
        { ms: 2000, pct: 65, message: 'Equilibration and production run' },
        { ms: 600, pct: 90, message: 'Analysing trajectory' },
        { ms: 300, pct: 100, message: 'Complete' },
    ],
    fep: [
        { ms: 700, pct: 10, message: 'Setting up lambda windows (20 states)' },
        { ms: 1500, pct: 30, message: 'Running alchemical perturbation simulations' },
        { ms: 2000, pct: 60, message: 'Computing free energy increments via MBAR' },
        { ms: 800, pct: 85, message: 'Calculating ΔΔG binding affinity' },
        { ms: 400, pct: 100, message: 'Free energy estimate ready' },
    ],
    cloud_lab: [
        { ms: 500, pct: 20, message: 'Validating synthesis request with CRO API' },
        { ms: 800, pct: 60, message: 'Order placed — awaiting confirmation' },
        { ms: 400, pct: 100, message: 'Order confirmed — tracking ID issued' },
    ],
};

const DEFAULT_STUB_STEPS: StubStep[] = [
    { ms: 800, pct: 25, message: 'Initialising job' },
    { ms: 1500, pct: 60, message: 'Processing' },
    { ms: 800, pct: 90, message: 'Finalising results' },
    { ms: 300, pct: 100, message: 'Complete' },
];

const STUB_MOLECULES: Record<string, MoleculeResult[]> = {
    alphafold3: [
        { name: 'Stub-AF3-Rank1', sequence: 'MGGHHHHHHGSQPKKKRKVGGENLYFQS', scores: { pLDDT: 94.2, pTM: 0.91, bindingDG: -11.2 } },
        { name: 'Stub-AF3-Rank2', sequence: 'MGSEGHHHHHHGSQPKKKRKVGENHYS', scores: { pLDDT: 91.7, pTM: 0.88, bindingDG: -10.8 } },
    ],
    rfdiffusion: [
        { name: 'Stub-RFD-Design1', sequence: 'MGENLYFQSHHHHHHGSQPKKKRKVGE', scores: { pLDDT: 89.3, pTM: 0.85, bindingDG: -10.1 } },
        { name: 'Stub-RFD-Design2', sequence: 'MGSQPKKKRKVGGENHYSRAEEEDTQA', scores: { pLDDT: 87.8, pTM: 0.83, bindingDG: -9.7 } },
        { name: 'Stub-RFD-Design3', sequence: 'MGHHHHHHGSQPKKKRKVGENLYQQST', scores: { pLDDT: 85.4, pTM: 0.80, bindingDG: -9.3 } },
    ],
    esm3: [
        { name: 'Stub-ESM3-Variant1', sequence: 'MENLYFQSHHHHHGQPKKKRKVGSEDT', scores: { pLDDT: 88.0, pTM: 0.84, logLikelihood: -1.23 } },
    ],
    esmfold: [
        { name: 'Stub-ESMFold-Rank1', sequence: 'MGGHHHHHHGSQPKKKRKVGGENLYFQS', scores: { pLDDT: 86.5, pTM: 0.82 } },
    ],
};

export class StubAdapter implements ModelAdapter {
    constructor(private modelType: string) { }

    async run({ jobId, type, onLog, onProgress }: JobPayload): Promise<JobResult> {
        const steps = STUB_STEPS[type] ?? DEFAULT_STUB_STEPS;
        const ts = () => new Date().toISOString().slice(11, 19);

        await onLog(`[${ts()}] [STUB] Starting ${type} — models not yet deployed. Using simulated output.`, 'warning');

        for (const step of steps) {
            await sleep(step.ms);
            await onLog(`[${ts()}] ${step.message}`);
            await onProgress(step.pct, step.message);
        }

        return {
            molecules: STUB_MOLECULES[type] ?? [],
            metadata: { stubMode: true, jobId, modelType: this.modelType },
        };
    }
}

// ── Real adapter base (GCP Cloud Run / Vertex AI endpoint pattern) ─────────────

export abstract class GcpAdapter implements ModelAdapter {
    protected abstract endpoint: string;
    protected abstract apiKey: string;

    async run({ jobId, parameters, onLog, onProgress }: JobPayload): Promise<JobResult> {
        const ts = () => new Date().toISOString().slice(11, 19);

        // 1. Submit job to GCP endpoint
        const submitRes = await fetch(`${this.endpoint}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({ jobId, ...parameters }),
        });

        if (!submitRes.ok) {
            const err = await submitRes.text();
            throw new Error(`GCP submit failed: ${submitRes.status} ${err}`);
        }

        const { inferenceId } = await submitRes.json() as { inferenceId: string };
        await onLog(`[${ts()}] Job submitted to GCP — inferenceId: ${inferenceId}`);

        // 2. Poll status endpoint
        while (true) {
            await sleep(3000);
            const statusRes = await fetch(`${this.endpoint}/status/${inferenceId}`, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` },
            });

            if (!statusRes.ok) continue;

            const status = await statusRes.json() as {
                state: 'running' | 'done' | 'failed';
                progressPct: number;
                currentStep: string;
                newLogs?: { message: string; level?: LogLevel }[];
                result?: JobResult;
                error?: string;
            };

            for (const log of status.newLogs ?? []) {
                await onLog(`[${ts()}] ${log.message}`, log.level);
            }
            await onProgress(status.progressPct, status.currentStep);

            if (status.state === 'done') return status.result!;
            if (status.state === 'failed') throw new Error(status.error ?? 'GCP job failed');
        }
    }
}

// Concrete GCP adapters — swap stub for real when endpoint env vars are set:
class AlphaFold3Adapter extends GcpAdapter {
    protected endpoint = process.env.GCP_AF3_ENDPOINT!;
    protected apiKey = process.env.GCP_AF3_API_KEY!;
}
class RFdiffusionAdapter extends GcpAdapter {
    protected endpoint = process.env.GCP_RFD_ENDPOINT!;
    protected apiKey = process.env.GCP_API_KEY!;
}
class ESM3Adapter extends GcpAdapter {
    protected endpoint = process.env.GCP_ESM3_ENDPOINT!;
    protected apiKey = process.env.GCP_API_KEY!;
}
class ESMFoldAdapter extends GcpAdapter {
    protected endpoint = process.env.GCP_ESMFOLD_ENDPOINT!;
    protected apiKey = process.env.GCP_API_KEY!;
}
class GROMACSAdapter extends GcpAdapter {
    protected endpoint = process.env.GCP_GROMACS_ENDPOINT!;
    protected apiKey = process.env.GCP_API_KEY!;
}
class OpenMMAdapter extends GcpAdapter {
    protected endpoint = process.env.GCP_OPENMM_ENDPOINT!;
    protected apiKey = process.env.GCP_API_KEY!;
}
class FEPAdapter extends GcpAdapter {
    protected endpoint = process.env.GCP_FEP_ENDPOINT!;
    protected apiKey = process.env.GCP_API_KEY!;
}
class CloudLabAdapter extends GcpAdapter {
    protected endpoint = process.env.GCP_CRO_ENDPOINT!;
    protected apiKey = process.env.GCP_API_KEY!;
}

// ── Registry — checks env vars to choose real vs stub ─────────────────────────

function resolve(type: string, endpoint: string | undefined, RealAdapter: new () => ModelAdapter): ModelAdapter {
    if (endpoint) {
        console.log(`[adapters] Using real GCP adapter for ${type}: ${endpoint}`);
        return new RealAdapter();
    }
    console.log(`[adapters] Using STUB adapter for ${type} — set env var to enable real inference`);
    return new StubAdapter(type);
}

export const ADAPTERS: Record<string, ModelAdapter> = {
    alphafold3: resolve('alphafold3', process.env.GCP_AF3_ENDPOINT, AlphaFold3Adapter),
    rfdiffusion: resolve('rfdiffusion', process.env.GCP_RFD_ENDPOINT, RFdiffusionAdapter),
    esm3: resolve('esm3', process.env.GCP_ESM3_ENDPOINT, ESM3Adapter),
    esmfold: resolve('esmfold', process.env.GCP_ESMFOLD_ENDPOINT, ESMFoldAdapter),
    gromacs: resolve('gromacs', process.env.GCP_GROMACS_ENDPOINT, GROMACSAdapter),
    openmm: resolve('openmm', process.env.GCP_OPENMM_ENDPOINT, OpenMMAdapter),
    fep: resolve('fep', process.env.GCP_FEP_ENDPOINT, FEPAdapter),
    cloud_lab: resolve('cloud_lab', process.env.GCP_CRO_ENDPOINT, CloudLabAdapter),
};
