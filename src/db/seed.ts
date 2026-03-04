import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

/** Upsert a user; handles both auth0_id and email unique constraint collisions */
async function upsertUser(values: {
    auth0Id: string; email: string; name: string;
}) {
    try {
        const result = await db
            .insert(schema.users)
            .values({ ...values, avatarUrl: null })
            .onConflictDoUpdate({
                target: schema.users.auth0Id,
                set: { name: values.name, updatedAt: new Date() },
            })
            .returning();
        if (result[0]) return result[0];
    } catch {
        // email uniqueness violated (different auth0Id, same email from an older seed)
    }

    // Always-safe: look up by email
    const existing = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, values.email),
    });
    return existing!;
}

async function seed() {
    console.log('🌱 Starting rich database seed...');

    try {
        // ── 1. Users ──────────────────────────────────────────────────────────
        const [jane, alex, emily] = await Promise.all([
            upsertUser({ auth0Id: 'auth0|seed-jane-smith', email: 'dr.smith@axionbio.com', name: 'Dr. Jane Smith' }),
            upsertUser({ auth0Id: 'auth0|seed-alex-rivera', email: 'arivera@axionbio.com', name: 'Alex Rivera' }),
            upsertUser({ auth0Id: 'auth0|seed-emily-chen', email: 'emily.chen@axionbio.com', name: 'Dr. Emily Chen' }),
        ]);
        console.log('✅ Users created');

        // ── 2. Workspace ──────────────────────────────────────────────────────
        const [workspace] = await db.insert(schema.workspaces).values({
            name: 'Smith Lab',
            slug: `smith-lab-${Date.now()}`,
            plan: 'trial',
        }).returning();
        console.log(`✅ Workspace: ${workspace.name}`);

        // ── 3. Members ────────────────────────────────────────────────────────
        await db.insert(schema.workspaceMembers).values([
            { userId: jane.id, workspaceId: workspace.id, role: 'admin' },
            { userId: alex.id, workspaceId: workspace.id, role: 'editor' },
            { userId: emily.id, workspaceId: workspace.id, role: 'editor' },
        ]);
        console.log('✅ Members linked');

        // ── 4. Projects ───────────────────────────────────────────────────────
        const [projKras, projCrispr] = await db.insert(schema.projects).values([
            {
                workspaceId: workspace.id,
                createdBy: jane.id,
                name: 'KRAS G12C Binder Program',
                description: 'Design high-affinity KRAS G12C binders via RFdiffusion + MD filter cascade.',
                status: 'active',
            },
            {
                workspaceId: workspace.id,
                createdBy: alex.id,
                name: 'Compact CRISPR Editors',
                description: 'Engineer hyper-compact Cas variants for AAV packaging.',
                status: 'active',
            },
        ]).returning();
        console.log('✅ Projects created');

        // ── 5. Jobs (mix of all types/statuses) ──────────────────────────────
        const now = new Date();
        const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000);

        const [j1, j2, j3, j4, j5] = await db.insert(schema.jobs).values([
            {
                workspaceId: workspace.id,
                projectId: projKras.id,
                createdBy: jane.id,
                name: 'KRAS_G12C_Binder_Design_v3',
                type: 'rfdiffusion',
                status: 'running',
                parameters: { target: 'PDB:6OIM', numSequences: 500, backbone_noise: 0.2 },
                gpuHours: null,
                estimatedGpuHours: 4.5,
                startedAt: hoursAgo(0.2),
            },
            {
                workspaceId: workspace.id,
                projectId: projKras.id,
                createdBy: jane.id,
                name: 'ABL1_Kinase_MD_50ns',
                type: 'gromacs',
                status: 'success',
                parameters: { receptor: 'P00519', forceField: 'AMBER99SB', simLength: '50ns', temp: 310 },
                results: { avgRMSD: 1.24, bindingDG: -9.8 },
                gpuHours: 6.2,
                startedAt: hoursAgo(8),
                completedAt: hoursAgo(2),
            },
            {
                workspaceId: workspace.id,
                projectId: projCrispr.id,
                createdBy: alex.id,
                name: 'SpCas9_ESM3_Embedding',
                type: 'esm3',
                status: 'success',
                parameters: { pdbId: '4UN3', numCandidates: 1000 },
                results: { topPLDDT: 94.3, clusterCount: 12 },
                gpuHours: 2.8,
                startedAt: hoursAgo(26),
                completedAt: hoursAgo(24),
            },
            {
                workspaceId: workspace.id,
                projectId: projKras.id,
                createdBy: emily.id,
                name: 'KRAS_Spike_AlphaFold3',
                type: 'alphafold3',
                status: 'failed',
                parameters: { sequences: ['MTEYKLVVVGAGGVGKSALTI'], multimer: false },
                results: { error: 'OOM: exceeded 24GB VRAM limit' },
                gpuHours: 1.1,
                startedAt: hoursAgo(48),
                completedAt: hoursAgo(47.5),
            },
            {
                workspaceId: workspace.id,
                projectId: projKras.id,
                createdBy: jane.id,
                name: 'KRAS_Top3_Synthesis_Order',
                type: 'synthesis_order',
                status: 'queued',
                parameters: { provider: 'twist', sequences: 3, codonOptimized: true },
                gpuHours: null,
            },
        ]).returning();
        console.log('✅ Jobs created');

        // ── 6. Molecules (saved candidates from j2 and j3) ───────────────────
        await db.insert(schema.molecules).values([
            {
                workspaceId: workspace.id,
                projectId: projKras.id,
                sourceJobId: j2.id,
                createdBy: jane.id,
                name: 'ABL1-Binder-Rank1',
                moleculeType: 'protein',
                sequence: 'MGGHHHHHHGSQPKKKRKV',
                scores: { pLDDT: 91.4, pTM: 0.87, bindingAffinity: -9.8, immunogenicity: 'low' },
                isFavorited: true,
            },
            {
                workspaceId: workspace.id,
                projectId: projCrispr.id,
                sourceJobId: j3.id,
                createdBy: alex.id,
                name: 'CompactCas-Variant-7',
                moleculeType: 'protein',
                sequence: 'MDKKYSIGLDIGTNSVGWAVITDE',
                scores: { pLDDT: 88.2, pTM: 0.82, bindingAffinity: -8.1, immunogenicity: 'medium' },
                isFavorited: false,
            },
            {
                workspaceId: workspace.id,
                projectId: projKras.id,
                sourceJobId: j2.id,
                createdBy: emily.id,
                name: 'ABL1-Binder-Rank2',
                moleculeType: 'protein',
                sequence: 'MGSEGHHHHHHGSQPKKK',
                scores: { pLDDT: 89.7, pTM: 0.84, bindingAffinity: -9.1, immunogenicity: 'low' },
                isFavorited: false,
            },
        ]);
        console.log('✅ Molecules saved');

        // ── 7. Activity Logs ──────────────────────────────────────────────────
        await db.insert(schema.activityLogs).values([
            {
                workspaceId: workspace.id, actorId: jane.id,
                actionType: 'job_started', entityId: j1.id, entityType: 'job',
                metadata: { jobName: j1.name, jobType: 'rfdiffusion' },
                createdAt: hoursAgo(0.2),
            },
            {
                workspaceId: workspace.id, actorId: jane.id,
                actionType: 'molecule_saved', entityId: j2.id, entityType: 'molecule',
                metadata: { moleculeName: 'ABL1-Binder-Rank1', score: -9.8 },
                createdAt: hoursAgo(2.1),
            },
            {
                workspaceId: workspace.id, actorId: jane.id,
                actionType: 'job_completed', entityId: j2.id, entityType: 'job',
                metadata: { jobName: j2.name, gpuHours: 6.2 },
                createdAt: hoursAgo(2),
            },
            {
                workspaceId: workspace.id, actorId: alex.id,
                actionType: 'job_completed', entityId: j3.id, entityType: 'job',
                metadata: { jobName: j3.name, gpuHours: 2.8 },
                createdAt: hoursAgo(24),
            },
            {
                workspaceId: workspace.id, actorId: emily.id,
                actionType: 'member_joined', entityId: emily.id, entityType: 'member',
                metadata: { memberName: 'Dr. Emily Chen', role: 'editor' },
                createdAt: hoursAgo(48),
            },
            {
                workspaceId: workspace.id, actorId: jane.id,
                actionType: 'project_created', entityId: projKras.id, entityType: 'project',
                metadata: { projectName: projKras.name },
                createdAt: hoursAgo(72),
            },
        ]);
        console.log('✅ Activity logs created');

        console.log('\n🎉 Seeding complete!');
        console.log(`   Workspace: ${workspace.name} (${workspace.id})`);
        console.log(`   Users: ${jane.email}, ${alex.email}, ${emily.email}`);
        console.log(`   Jobs: 5 (1 running, 2 success, 1 failed, 1 queued)`);

    } catch (error) {
        console.error('❌ Error during seeding:', error);
    } finally {
        process.exit(0);
    }
}

seed();
