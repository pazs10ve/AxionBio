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
