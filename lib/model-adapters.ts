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

import { BatchServiceClient } from '@google-cloud/batch';

// ── Real adapter base (GCP Batch execution pattern) ─────────────

export abstract class GcpAdapter implements ModelAdapter {
    protected abstract containerImage: string;
    protected abstract machineType: string;
    protected abstract requireGpu: boolean;

    async run({ jobId, parameters, onLog, onProgress }: JobPayload): Promise<JobResult> {
        const ts = () => new Date().toISOString().slice(11, 19);

        // 1. Initialize GCP Batch Client
        // It automatically picks up credentials if GOOGLE_APPLICATION_CREDENTIALS is set,
        // or we manually instantiate it using the env variables we added.
        const batchClient = new BatchServiceClient({
            credentials: {
                client_email: process.env.GCP_CLIENT_EMAIL,
                private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            projectId: process.env.GCP_PROJECT_ID,
        });

        const projectId = process.env.GCP_PROJECT_ID;
        const region = process.env.GCP_REGION || 'us-central1';

        await onLog(`[${ts()}] Preparing GCP Batch infrastructure for Job: ${jobId}`);

        // 2. Define the Batch Job
        // The container receives the database credentials so the Python `client.py` 
        // can connect back to our Neon Postgres to stream real-time logs bypassng Next.js.
        const jobDefinition: any = {
            taskGroups: [
                {
                    taskCount: 1,
                    taskSpec: {
                        runnables: [
                            {
                                container: {
                                    imageUri: this.containerImage,
                                    entrypoint: '', // Uses Dockerfile default `CMD ["python", "/app/main.py"]`
                                },
                            },
                        ],
                        computeResource: {
                            cpuMilli: 4000,
                            memoryMib: 16384,
                        },
                        environments: {
                            DATABASE_URL: process.env.DATABASE_URL || '',
                            JOB_ID: jobId,
                            R2_ENDPOINT: process.env.R2_ENDPOINT || '',
                            R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
                            R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
                            R2_BUCKET: process.env.R2_BUCKET || '',
                            // Optional: passing JSON stringified params if needed by the container directly
                            // Otherwise, the container fetches them from DB using JOB_ID.
                        },
                    },
                },
            ],
            allocationPolicy: {
                instances: [
                    {
                        policy: {
                            machineType: this.machineType,
                            provisioningModel: 'SPOT', // Massive cost savings
                        },
                    },
                ],
                location: {
                    allowedLocations: [`regions/${region}`],
                },
            },
            logsPolicy: {
                destination: 'CLOUD_LOGGING',
            },
        };

        // Inject GPU if required by the model (e.g., AF3, RFdiffusion)
        if (this.requireGpu) {
            jobDefinition.allocationPolicy.instances[0].policy.accelerators = [
                {
                    type: `projects/${projectId}/locations/${region}/acceleratorTypes/nvidia-l4`,
                    count: 1,
                },
            ];
            // Batch requires setting specific boot disks for GPU drivers
            jobDefinition.allocationPolicy.instances[0].policy.bootDisk = {
                image: 'projects/batch-custom-image/global/images/batch-cos-gpu-113',
            };
        }

        const batchJobName = `axionbio-${jobId.slice(0, 8)}-${Date.now()}`;

        // 3. Submit the Job to GCP
        await onLog(`[${ts()}] Requesting Spot VM (${this.machineType}${this.requireGpu ? ' + 1x L4 GPU' : ''}) in ${region}...`);

        try {
            const [response] = await batchClient.createJob({
                parent: `projects/${projectId}/locations/${region}`,
                jobId: batchJobName,
                job: jobDefinition,
            });

            await onLog(`[${ts()}] GCP Batch Job Scheduled. ID: ${response.uid}`);
            await onProgress(5, 'Awaiting GCP Spot VM Allocation...');

            // The Next.js API route now ENDS safely.
            // Why? Because the Python container handles everything from here:
            // - It boots up.
            // - It connects to Neon and writes to `job_logs` itself.
            // - It updates `progress_pct` on the `jobs` row itself.
            // - It uploads the `.pdb` to Cloudflare R2 itself.
            // - And it marks the job as `success` itself.
            //
            // We just return a "dummy" pending result because the DB row will be updated asynchronously.

            return {
                metadata: {
                    gcpBatchJobId: response.uid,
                    gcpBatchName: response.name,
                    asyncExecutionEnabled: true
                }
            };

        } catch (error: any) {
            throw new Error(`Failed to submit GCP Batch Job: ${error.message || 'Unknown GCP Error'}`);
        }
    }
}

// Concrete GCP adapters — map requested models to specific Docker containers
class AlphaFold3Adapter extends GcpAdapter {
    protected containerImage = process.env.GCP_IMAGE_ALPHAFOLD3 || 'placeholder-af3';
    protected machineType = 'g2-standard-12'; // Needs L4 GPU
    protected requireGpu = true;
}

class RFdiffusionAdapter extends GcpAdapter {
    protected containerImage = process.env.GCP_IMAGE_RFDIFFUSION || 'placeholder-rfd';
    protected machineType = 'g2-standard-8'; // Needs L4 GPU
    protected requireGpu = true;
}

class ESMFoldAdapter extends GcpAdapter {
    protected containerImage = process.env.GCP_IMAGE_ESMFOLD || 'placeholder-esmfold';
    protected machineType = 'g2-standard-8';
    protected requireGpu = true;
}

class GROMACSAdapter extends GcpAdapter {
    protected containerImage = process.env.GCP_IMAGE_GROMACS || 'placeholder-gromacs';
    protected machineType = 'g2-standard-16';
    protected requireGpu = true;
}

class OpenMMAdapter extends GcpAdapter {
    protected containerImage = process.env.GCP_IMAGE_OPENMM || 'placeholder-openmm';
    protected machineType = 'g2-standard-8';
    protected requireGpu = true;
}

// ── Registry — checks env vars to choose real vs stub ─────────────────────────

function resolve(type: string, imageEnv: string | undefined, RealAdapter: new () => ModelAdapter): ModelAdapter {
    // If we have GCP Service Account credentials, we attempt real Batch execution
    if (process.env.GCP_CLIENT_EMAIL && process.env.GCP_PRIVATE_KEY) {
        console.log(`[adapters] Using real GCP Batch adapter for ${type}`);
        return new RealAdapter();
    }
    console.log(`[adapters] Using STUB adapter for ${type} — missing GCP_CLIENT_EMAIL in .env.local`);
    return new StubAdapter(type);
}

export const ADAPTERS: Record<string, ModelAdapter> = {
    alphafold3: resolve('alphafold3', process.env.GCP_IMAGE_ALPHAFOLD3, AlphaFold3Adapter),
    rfdiffusion: resolve('rfdiffusion', process.env.GCP_IMAGE_RFDIFFUSION, RFdiffusionAdapter),
    esmfold: resolve('esmfold', process.env.GCP_IMAGE_ESMFOLD, ESMFoldAdapter),
    gromacs: resolve('gromacs', process.env.GCP_IMAGE_GROMACS, GROMACSAdapter),
    openmm: resolve('openmm', process.env.GCP_IMAGE_OPENMM, OpenMMAdapter),

    // For cloud lab, we still just use stubs until API keys are provided
    cloud_lab: new StubAdapter('cloud_lab'),
};
