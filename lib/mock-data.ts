/**
 * Central mock data library for all platform UI pages.
 * Swap these out for real API calls when backends are ready.
 */

// ── Generative Engine ─────────────────────────────────────────────────────────

export const MOCK_PDB_STRUCTURES = [
    { id: '6OIM', name: 'KRAS G12C (Switch-II pocket)', organism: 'Homo sapiens' },
    { id: '4UN3', name: 'SpCas9 bound to sgRNA', organism: 'Streptococcus pyogenes' },
    { id: '7OOO', name: 'Spike RBD / ACE2 complex', organism: 'SARS-CoV-2' },
    { id: '1BXL', name: 'p53 tumor suppressor', organism: 'Homo sapiens' },
];

export const MODELS = [
    {
        id: 'alphafold3',
        name: 'AlphaFold3',
        org: 'Google DeepMind',
        description: 'End-to-end structure prediction for proteins, nucleic acids, and small molecules.',
        tags: ['Structure Prediction', 'Multimer', 'Ligand'],
        recommended: true,
        estimatedGpuHours: 4.5,
    },
    {
        id: 'rfdiffusion',
        name: 'RFdiffusion',
        org: 'Baker Lab / IPD',
        description: 'Diffusion-based de novo protein design. Best for binder and scaffold design.',
        tags: ['Binder Design', 'De Novo', 'Scaffold'],
        recommended: false,
        estimatedGpuHours: 3.2,
    },
    {
        id: 'esm3',
        name: 'ESM-3',
        org: 'EvolutionaryScale',
        description: 'Multimodal language model over sequence, structure, and function simultaneously.',
        tags: ['Sequence', 'Function', 'Generative'],
        recommended: false,
        estimatedGpuHours: 2.1,
    },
    {
        id: 'esmfold',
        name: 'ESMFold',
        org: 'Meta AI',
        description: 'Ultra-fast single-sequence structure prediction. ~60× faster than AF2.',
        tags: ['Fast Inference', 'Single-Chain', 'Sequence-Only'],
        recommended: false,
        estimatedGpuHours: 0.5,
    },
] as const;

export const MOCK_GENERATIVE_RESULTS = [
    { rank: 1, sequence: 'MGGHHHHHHGSQPKKKRKVGGENLYFQS', pLDDT: 94.2, pTM: 0.91, bindingAffinity: -11.2, immunogenicity: 'Low', status: 'success' },
    { rank: 2, sequence: 'MGSEGHHHHHHGSQPKKKRKVGENHYS', pLDDT: 91.7, pTM: 0.88, bindingAffinity: -10.8, immunogenicity: 'Low', status: 'success' },
    { rank: 3, sequence: 'MGENLYFQSHHHHHHGSQPKKKRKVGE', pLDDT: 89.3, pTM: 0.85, bindingAffinity: -10.1, immunogenicity: 'Medium', status: 'success' },
    { rank: 4, sequence: 'MGSQPKKKRKVGGENHYSRAEEEDTQA', pLDDT: 87.8, pTM: 0.83, bindingAffinity: -9.7, immunogenicity: 'Low', status: 'success' },
    { rank: 5, sequence: 'MGHHHHHHGSQPKKKRKVGENLYQQST', pLDDT: 85.4, pTM: 0.80, bindingAffinity: -9.3, immunogenicity: 'Medium', status: 'success' },
    { rank: 6, sequence: 'MENLYFQSHHHHHGQPKKKRKVGSEDT', pLDDT: 83.1, pTM: 0.78, bindingAffinity: -8.9, immunogenicity: 'High', status: 'success' },
    { rank: 7, sequence: 'MGGSEGHHHHHHQLYFQSPKKKRKVGE', pLDDT: 81.9, pTM: 0.76, bindingAffinity: -8.6, immunogenicity: 'Low', status: 'success' },
    { rank: 8, sequence: 'MGSQPQHHHHHHKRKVGGENLYFQSSE', pLDDT: 79.5, pTM: 0.73, bindingAffinity: -8.2, immunogenicity: 'Medium', status: 'success' },
];

export const MOCK_LOG_LINES = [
    '[00:00] Initializing RFdiffusion v1.1.0...',
    '[00:01] Loading target structure: 6OIM (chain A)',
    '[00:02] Preprocessing hotspot residues: G12, C12, Q61',
    '[00:04] Configuring diffusion schedule: T=200, noise=0.2',
    '[00:06] Sampling scaffold 1/500...',
    '[00:12] Sampling scaffold 50/500... avg pLDDT: 81.2',
    '[00:24] Sampling scaffold 150/500... avg pLDDT: 83.4',
    '[00:38] Sampling scaffold 250/500... avg pLDDT: 84.1',
    '[00:52] Sampling scaffold 350/500... avg pLDDT: 85.7',
    '[01:06] Running ESMFold on top 50 scaffolds...',
    '[01:14] Filtering by pLDDT > 70 → 43 candidates retained',
    '[01:18] Running ProteinMPNN sequence design (8 seqs per scaffold)...',
    '[01:24] Computing binding affinities via Rosetta FastRelax...',
    '[01:31] Ranking by composite score (pLDDT × pTM × ΔG)...',
    '[01:33] Post-processing complete. 8 top candidates saved.',
];

// ── Simulation Console ────────────────────────────────────────────────────────

export function generateMockRMSDData(points = 100) {
    const data = [];
    let rmsd = 0.2;
    for (let i = 0; i < points; i++) {
        rmsd += (Math.random() - 0.48) * 0.08;
        rmsd = Math.max(0.1, Math.min(2.5, rmsd));
        data.push({
            time: i * 0.5, // nanoseconds
            rmsd: parseFloat(rmsd.toFixed(3)),
            rmsf: parseFloat((rmsd * 0.6 + Math.random() * 0.2).toFixed(3)),
        });
    }
    return data;
}

export const MOCK_MD_RESULT = {
    avgRMSD: 1.24,
    maxRMSD: 1.87,
    bindingDG: -9.8,
    Tm: 68.4,
    convergenceFrame: 62, // % through the simulation
    downloadLinks: {
        trajectory: '#',
        topology: '#',
        analysis: '#',
    },
};

// ── Agentic Copilot ───────────────────────────────────────────────────────────

export const MOCK_SESSIONS = [
    { id: 'ses-1', title: 'KRAS G12C binder design', preview: 'Run AlphaFold on 6OIM...', ago: '2h ago' },
    { id: 'ses-2', title: 'SpCas9 compact variant', preview: 'Optimize PAM flexibility...', ago: '1d ago' },
    { id: 'ses-3', title: 'IL-6 antibody screen', preview: 'Design VHH nanobody...', ago: '3d ago' },
];

export const MOCK_CONTEXT_FILES = [
    { id: 'f1', name: '6OIM.pdb', type: 'structure', size: '412 KB' },
    { id: 'f2', name: 'kras_targets.csv', type: 'data', size: '28 KB' },
];

export const MOCK_TOOL_CALLS = [
    {
        id: 'tc-1', tool: 'fetch_structure', label: 'Fetch PDB: 6OIM',
        status: 'done', duration: '1.2s',
        input: { pdb_id: '6OIM' },
        output: { chains: 2, residues: 189, resolution: '2.0Å' },
    },
    {
        id: 'tc-2', tool: 'run_alphafold3', label: 'AlphaFold3 Structure Prediction',
        status: 'done', duration: '4m 12s',
        input: { target: '6OIM:A', num_seeds: 5 },
        output: { pLDDT: 94.2, pTM: 0.91, top_model: 'model_v3_seed_0.pdb' },
    },
    {
        id: 'tc-3', tool: 'run_rfdiffusion', label: 'RFdiffusion Binder Design',
        status: 'running', duration: null,
        input: { target: '6OIM:A', hotspots: ['G12', 'C12'], num_designs: 500 },
        output: null,
    },
    {
        id: 'tc-4', tool: 'run_md', label: 'Molecular Dynamics (50ns)',
        status: 'pending', duration: null,
        input: null, output: null,
    },
];

// ── Data Lake ─────────────────────────────────────────────────────────────────

export const MOCK_DATA_TREE = [
    {
        id: 'proj-kras', name: 'KRAS G12C Program', type: 'folder',
        children: [
            { id: 'f-pdb1', name: '6OIM.pdb', type: 'structure', size: '412 KB', uploaded: '2025-02-28', by: 'Dr. Jane Smith' },
            { id: 'f-csv1', name: 'top_candidates.csv', type: 'data', size: '18 KB', uploaded: '2025-03-01', by: 'Dr. Jane Smith' },
            { id: 'f-fasta1', name: 'binder_sequences.fasta', type: 'sequence', size: '8 KB', uploaded: '2025-03-02', by: 'Alex Rivera' },
        ],
    },
    {
        id: 'proj-crispr', name: 'Compact CRISPR Editors', type: 'folder',
        children: [
            { id: 'f-pdb2', name: '4UN3.pdb', type: 'structure', size: '1.2 MB', uploaded: '2025-02-26', by: 'Alex Rivera' },
            { id: 'f-fasta2', name: 'cas_variants.fasta', type: 'sequence', size: '14 KB', uploaded: '2025-02-27', by: 'Alex Rivera' },
        ],
    },
];

// ── Lab Bridge ────────────────────────────────────────────────────────────────

export const MOCK_SYNTHESIS_ORDERS = [
    { id: 'ord-1', name: 'ABL1-Binder-Rank1', provider: 'Twist', status: 'delivered', sequences: 1, ordered: '2025-02-20' },
    { id: 'ord-2', name: 'KRAS Top-3 Binders', provider: 'IDT', status: 'in_synthesis', sequences: 3, ordered: '2025-03-01' },
    { id: 'ord-3', name: 'CompactCas-Variant-7', provider: 'Ginkgo', status: 'quote_sent', sequences: 1, ordered: '2025-03-03' },
];

export const MOCK_ASSAY_RESULTS = [
    { id: 'ar-1', molecule: 'ABL1-Binder-Rank1', assay: 'SPR Binding Affinity', Kd: '4.2 nM', IC50: null, result: 'pass', date: '2025-02-25' },
    { id: 'ar-2', molecule: 'ABL1-Binder-Rank1', assay: 'Thermal Stability (DSF)', Kd: null, IC50: '68.4 °C (Tm)', result: 'pass', date: '2025-02-26' },
    { id: 'ar-3', molecule: 'ABL1-Binder-Rank2', assay: 'SPR Binding Affinity', Kd: '12.1 nM', IC50: null, result: 'marginal', date: '2025-02-25' },
];

export const MOCK_IC50_CURVE = Array.from({ length: 12 }, (_, i) => ({
    logConc: -10 + i * 0.8,
    inhibition: 100 / (1 + Math.pow(10, -10 + i * 0.8 - (-8.4))) + (Math.random() - 0.5) * 3,
}));

// ── Settings ──────────────────────────────────────────────────────────────────

export const MOCK_TEAM_MEMBERS = [
    { id: 'u1', name: 'Dr. Jane Smith', email: 'dr.smith@axionbio.com', role: 'Admin', status: 'active', joined: '2025-01-15' },
    { id: 'u2', name: 'Alex Rivera', email: 'arivera@axionbio.com', role: 'Editor', status: 'active', joined: '2025-01-20' },
    { id: 'u3', name: 'Dr. Emily Chen', email: 'emily.chen@axionbio.com', role: 'Editor', status: 'active', joined: '2025-02-01' },
    { id: 'u4', name: 'Mark Torres', email: 'mtorres@axionbio.com', role: 'Viewer', status: 'invited', joined: '—' },
];

export const MOCK_API_KEYS = [
    { id: 'key-1', name: 'Production API', prefix: 'axb_prod_', scopes: ['jobs:read', 'jobs:write', 'molecules:read'], created: '2025-01-15', lastUsed: '2 hours ago' },
    { id: 'key-2', name: 'CI/CD Pipeline', prefix: 'axb_ci_', scopes: ['jobs:read'], created: '2025-02-01', lastUsed: 'Never' },
];

export const MOCK_AUDIT_LOGS = [
    { id: 'al-1', actor: 'Dr. Jane Smith', action: 'Invited member', target: 'mtorres@axionbio.com', timestamp: '2025-03-04 22:11' },
    { id: 'al-2', actor: 'Alex Rivera', action: 'Generated API key', target: 'CI/CD Pipeline', timestamp: '2025-03-03 14:05' },
    { id: 'al-3', actor: 'Dr. Jane Smith', action: 'Changed billing plan', target: 'Trial → Pro', timestamp: '2025-03-01 09:00' },
    { id: 'al-4', actor: 'Dr. Emily Chen', action: 'Uploaded file', target: '4UN3.pdb', timestamp: '2025-02-26 11:32' },
    { id: 'al-5', actor: 'Dr. Jane Smith', action: 'Created workspace', target: 'Smith Lab', timestamp: '2025-01-15 08:00' },
];

// ── Molecules Library ─────────────────────────────────────────────────────────

export type MoleculeStatus = 'candidate' | 'in_validation' | 'ordered' | 'failed' | 'archived';
export type MoleculeModality = 'protein_binder' | 'small_molecule' | 'crispr' | 'antibody';

export const MOCK_MOLECULES = [
    {
        id: 'mol-1',
        name: 'ABL1-Binder-Rank1',
        project: 'KRAS G12C Program',
        target: 'ABL1 (T315I)',
        modality: 'protein_binder' as MoleculeModality,
        status: 'in_validation' as MoleculeStatus,
        pLDDT: 94.2,
        pTM: 0.91,
        bindingDG: -11.2,
        Kd: '4.2 nM',
        Tm: 68.4,
        immunogenicity: 'Low' as const,
        createdBy: 'RFdiffusion',
        createdAt: '2025-02-28',
        sequence: 'MGGHHHHHHGSQPKKKRKVGGENLYFQS',
        tags: ['KRAS', 'Switch-II', 'Top-candidate'],
        starred: true,
        hasStructure: true,
        hasMD: true,
    },
    {
        id: 'mol-2',
        name: 'ABL1-Binder-Rank2',
        project: 'KRAS G12C Program',
        target: 'ABL1 (T315I)',
        modality: 'protein_binder' as MoleculeModality,
        status: 'candidate' as MoleculeStatus,
        pLDDT: 91.7,
        pTM: 0.88,
        bindingDG: -10.8,
        Kd: '12.1 nM',
        Tm: null,
        immunogenicity: 'Low' as const,
        createdBy: 'RFdiffusion',
        createdAt: '2025-02-28',
        sequence: 'MGSEGHHHHHHGSQPKKKRKVGENHYS',
        tags: ['KRAS', 'Switch-II'],
        starred: false,
        hasStructure: true,
        hasMD: false,
    },
    {
        id: 'mol-3',
        name: 'ABL1-Binder-Rank3',
        project: 'KRAS G12C Program',
        target: 'ABL1 (T315I)',
        modality: 'protein_binder' as MoleculeModality,
        status: 'candidate' as MoleculeStatus,
        pLDDT: 89.3,
        pTM: 0.85,
        bindingDG: -10.1,
        Kd: null,
        Tm: null,
        immunogenicity: 'Medium' as const,
        createdBy: 'RFdiffusion',
        createdAt: '2025-03-01',
        sequence: 'MGENLYFQSHHHHHHGSQPKKKRKVGE',
        tags: ['KRAS', 'Switch-II'],
        starred: false,
        hasStructure: true,
        hasMD: false,
    },
    {
        id: 'mol-4',
        name: 'CompactCas-Variant-7',
        project: 'Compact CRISPR Editors',
        target: 'SpCas9',
        modality: 'crispr' as MoleculeModality,
        status: 'ordered' as MoleculeStatus,
        pLDDT: 87.8,
        pTM: 0.83,
        bindingDG: -9.7,
        Kd: null,
        Tm: 72.1,
        immunogenicity: 'Low' as const,
        createdBy: 'ESM-3',
        createdAt: '2025-02-27',
        sequence: 'MGSQPKKKRKVGGENHYSRAEEEDTQA',
        tags: ['CRISPR', 'Compact', 'SaCas9-like'],
        starred: true,
        hasStructure: true,
        hasMD: true,
    },
    {
        id: 'mol-5',
        name: 'CompactCas-Variant-3',
        project: 'Compact CRISPR Editors',
        target: 'SpCas9',
        modality: 'crispr' as MoleculeModality,
        status: 'failed' as MoleculeStatus,
        pLDDT: 72.4,
        pTM: 0.68,
        bindingDG: -6.2,
        Kd: null,
        Tm: null,
        immunogenicity: 'High' as const,
        createdBy: 'ESM-3',
        createdAt: '2025-02-24',
        sequence: 'MGHHHHHHGSQPKKKRKVGENLYQQST',
        tags: ['CRISPR', 'Failed-stability'],
        starred: false,
        hasStructure: false,
        hasMD: false,
    },
    {
        id: 'mol-6',
        name: 'KRAS-VHH-001',
        project: 'KRAS G12C Program',
        target: 'KRAS G12C',
        modality: 'antibody' as MoleculeModality,
        status: 'in_validation' as MoleculeStatus,
        pLDDT: 85.4,
        pTM: 0.80,
        bindingDG: -9.3,
        Kd: '8.7 nM',
        Tm: 65.2,
        immunogenicity: 'Low' as const,
        createdBy: 'AlphaFold3',
        createdAt: '2025-03-02',
        sequence: 'MENLYFQSHHHHHGQPKKKRKVGSEDT',
        tags: ['KRAS', 'VHH', 'Nanobody'],
        starred: true,
        hasStructure: true,
        hasMD: false,
    },
    {
        id: 'mol-7',
        name: 'KRAS-VHH-002',
        project: 'KRAS G12C Program',
        target: 'KRAS G12C',
        modality: 'antibody' as MoleculeModality,
        status: 'candidate' as MoleculeStatus,
        pLDDT: 83.1,
        pTM: 0.78,
        bindingDG: -8.9,
        Kd: null,
        Tm: null,
        immunogenicity: 'Medium' as const,
        createdBy: 'AlphaFold3',
        createdAt: '2025-03-02',
        sequence: 'MGGSEGHHHHHHQLYFQSPKKKRKVGE',
        tags: ['KRAS', 'VHH'],
        starred: false,
        hasStructure: true,
        hasMD: false,
    },
    {
        id: 'mol-8',
        name: 'ABL1-Binder-Rank4',
        project: 'KRAS G12C Program',
        target: 'ABL1 (T315I)',
        modality: 'protein_binder' as MoleculeModality,
        status: 'archived' as MoleculeStatus,
        pLDDT: 79.5,
        pTM: 0.73,
        bindingDG: -8.2,
        Kd: null,
        Tm: null,
        immunogenicity: 'Medium' as const,
        createdBy: 'RFdiffusion',
        createdAt: '2025-02-20',
        sequence: 'MGSQPQHHHHHHKRKVGGENLYFQSSE',
        tags: ['KRAS', 'Archived'],
        starred: false,
        hasStructure: false,
        hasMD: false,
    },
];

// ── Projects ───────────────────────────────────────────────────────────────────

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';
export type ProjectPhase = 'Discovery' | 'Hit ID' | 'Lead Opt' | 'Preclinical';
export type ProjectModality = 'Protein Binder' | 'Nanobody' | 'PROTAC' | 'CRISPR' | 'Small Molecule' | 'Oligonucleotide';

export type MockProject = {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    program: string;
    indication: string;
    target: string;
    modality: ProjectModality;
    phase: ProjectPhase;
    moleculeIds: string[];
    memberCount: number;
    jobCount: number;
    lastActivity: string;
    createdAt: string;
    tags: string[];
    color: string;
    jobHistory: { id: string; type: string; model: string; status: string; date: string; molecules: number }[];
    labOrders: { id: string; molecule: string; provider: string; qty: number; status: string; date: string }[];
};

export const MOCK_PROJECTS: MockProject[] = [
    {
        id: 'proj-1',
        name: 'ABL1 Binder Campaign',
        status: 'active',
        description: 'De novo protein binder design targeting ABL1 kinase for CML therapy. Running RFdiffusion + ProteinMPNN pipeline.',
        program: 'Oncology',
        indication: 'Chronic Myeloid Leukemia (CML)',
        target: 'ABL1',
        modality: 'Protein Binder',
        phase: 'Lead Opt',
        moleculeIds: ['mol-1', 'mol-2', 'mol-8'],
        memberCount: 3, jobCount: 12,
        lastActivity: '2 hours ago', createdAt: '2026-02-10',
        tags: ['protein-binder', 'kinase', 'rfdiffusion'],
        color: 'bg-brand',
        jobHistory: [
            { id: 'job-1', type: 'Structure Prediction', model: 'AlphaFold3', status: 'completed', date: '2026-03-04', molecules: 5 },
            { id: 'job-2', type: 'Sequence Design', model: 'RFdiffusion', status: 'completed', date: '2026-03-03', molecules: 12 },
            { id: 'job-3', type: 'MD Simulation', model: 'GROMACS', status: 'running', date: '2026-03-05', molecules: 3 },
        ],
        labOrders: [
            { id: 'ord-1', molecule: 'ABL1-Binder-Rank1', provider: 'Twist Bioscience', qty: 1, status: 'In synthesis', date: '2026-03-01' },
            { id: 'ord-2', molecule: 'ABL1-Binder-Rank2', provider: 'IDT', qty: 1, status: 'Ordered', date: '2026-03-03' },
        ],
    },
    {
        id: 'proj-2',
        name: 'CompactCas9 Engineering',
        status: 'active',
        description: 'Engineering smaller Cas9 variants for AAV packaging. Uses ESM-3 for variant scoring and structure prediction.',
        program: 'Gene Therapy',
        indication: 'Duchenne Muscular Dystrophy (DMD)',
        target: 'Cas9',
        modality: 'CRISPR',
        phase: 'Hit ID',
        moleculeIds: ['mol-3'],
        memberCount: 2, jobCount: 6,
        lastActivity: '1 day ago', createdAt: '2026-02-20',
        tags: ['crispr', 'esm3', 'gene-therapy'],
        color: 'bg-cyan-500',
        jobHistory: [
            { id: 'job-4', type: 'CRISPR Design', model: 'ESM-3', status: 'completed', date: '2026-03-02', molecules: 8 },
            { id: 'job-5', type: 'Developability', model: 'GROMACS', status: 'completed', date: '2026-03-01', molecules: 4 },
        ],
        labOrders: [],
    },
    {
        id: 'proj-3',
        name: 'EGFR PROTAC Library',
        status: 'paused',
        description: 'PROTAC linker design for EGFR targeted degradation. Awaiting synthesis results from Twist Bioscience.',
        program: 'Oncology',
        indication: 'Non-Small Cell Lung Cancer (NSCLC)',
        target: 'EGFR',
        modality: 'PROTAC',
        phase: 'Discovery',
        moleculeIds: ['mol-4', 'mol-5'],
        memberCount: 2, jobCount: 4,
        lastActivity: '3 days ago', createdAt: '2026-01-28',
        tags: ['protac', 'degrader', 'egfr'],
        color: 'bg-violet-500',
        jobHistory: [
            { id: 'job-6', type: 'PROTAC Design', model: 'RFdiffusion', status: 'completed', date: '2026-02-25', molecules: 15 },
        ],
        labOrders: [
            { id: 'ord-3', molecule: 'EGFR-PROTAC-003', provider: 'Emerald Cloud Lab', qty: 2, status: 'Delivered', date: '2026-02-28' },
        ],
    },
    {
        id: 'proj-4',
        name: 'IL-6 Nanobody Screen',
        status: 'completed',
        description: 'AlphaFold3-guided nanobody affinity maturation against IL-6. Hit compounds progressed to SPR validation.',
        program: 'Immunology',
        indication: 'Rheumatoid Arthritis',
        target: 'IL-6',
        modality: 'Nanobody',
        phase: 'Preclinical',
        moleculeIds: ['mol-6', 'mol-7'],
        memberCount: 4, jobCount: 28,
        lastActivity: '2 weeks ago', createdAt: '2025-12-01',
        tags: ['nanobody', 'immunology', 'alphafold3'],
        color: 'bg-success',
        jobHistory: [
            { id: 'job-7', type: 'Structure Prediction', model: 'AlphaFold3', status: 'completed', date: '2026-01-10', molecules: 42 },
            { id: 'job-8', type: 'MD Simulation', model: 'GROMACS', status: 'completed', date: '2026-01-20', molecules: 10 },
        ],
        labOrders: [
            { id: 'ord-4', molecule: 'KRAS-VHH-001', provider: 'Twist Bioscience', qty: 3, status: 'Assay complete', date: '2026-02-01' },
        ],
    },
];
