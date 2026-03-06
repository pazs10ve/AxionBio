import { pgTable, serial, text, timestamp, boolean, uuid, jsonb, integer, real, bigserial, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── 1. Users ──────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    auth0Id: text('auth0_id').notNull().unique(),
    email: text('email').notNull().unique(),
    name: text('name'),
    avatarUrl: text('avatar_url'),
    role: text('role').default('scientist'),        // 'scientist' | 'pi' | 'admin' | 'viewer'
    bio: text('bio'),
    timezone: text('timezone').default('UTC'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ── 2. Workspaces ─────────────────────────────────────────────────────────────

export const workspaces = pgTable('workspaces', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    stripeCustomerId: text('stripe_customer_id'),
    plan: text('plan').default('trial').notNull(), // 'trial' | 'team' | 'enterprise'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ── 3. Workspace Members ───────────────────────────────────────────────────────

export const workspaceMembers = pgTable('workspace_members', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').default('viewer').notNull(), // 'admin' | 'editor' | 'viewer'
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// ── 4. Projects ───────────────────────────────────────────────────────────────

export const projects = pgTable('projects', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    createdBy: uuid('created_by').notNull().references(() => users.id),
    name: text('name').notNull(),
    description: text('description'),
    status: text('status').default('active').notNull(), // 'active' | 'paused' | 'completed' | 'archived'
    // Scientific fields
    target: text('target'),       // e.g. 'ABL1', 'EGFR'
    indication: text('indication'),   // e.g. 'Chronic Myeloid Leukemia'
    modality: text('modality'),     // 'Protein Binder' | 'Nanobody' | 'PROTAC' | 'CRISPR' | 'Small Molecule' | 'Oligonucleotide'
    phase: text('phase'),        // 'Discovery' | 'Hit ID' | 'Lead Opt' | 'Preclinical'
    program: text('program'),      // therapeutic area e.g. 'Oncology'
    color: text('color').default('bg-brand'), // Tailwind class for UI
    tags: text('tags').array(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ── 5. Jobs ───────────────────────────────────────────────────────────────────

export const jobs = pgTable('jobs', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
    createdBy: uuid('created_by').notNull().references(() => users.id),
    name: text('name').notNull(),
    // 'alphafold3' | 'rfdiffusion' | 'esm3' | 'esmfold' | 'gromacs' | 'openmm' | 'fep' | 'cloud_lab'
    type: text('type').notNull(),
    // 'queued' | 'running' | 'success' | 'failed' | 'cancelled'
    status: text('status').default('queued').notNull(),
    parameters: jsonb('parameters'),              // Job-type-specific input config
    results: jsonb('results'),                  // Output file keys / summarized metrics
    gpuHours: real('gpu_hours'),
    estimatedGpuHours: real('estimated_gpu_hours'),
    // real-time tracking
    progressPct: integer('progress_pct').default(0),
    currentStep: text('current_step'),              // e.g. "Running MSA search"
    errorMessage: text('error_message'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
    index('jobs_workspace_idx').on(t.workspaceId),
    index('jobs_project_idx').on(t.projectId),
    index('jobs_status_idx').on(t.status),
]);

// ── 6. Job Logs (append-only, streamed to client via SSE) ─────────────────────

export const jobLogs = pgTable('job_logs', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
    line: text('line').notNull(),
    level: text('level').default('info'), // 'info' | 'warning' | 'error'
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
    index('job_logs_job_idx').on(t.jobId),
]);

// ── 7. Molecules ──────────────────────────────────────────────────────────────

export const molecules = pgTable('molecules', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
    sourceJobId: uuid('source_job_id').references(() => jobs.id, { onDelete: 'set null' }),
    createdBy: uuid('created_by').notNull().references(() => users.id),
    name: text('name').notNull(),
    // 'protein' | 'peptide' | 'small_molecule' | 'nucleotide' | 'nanobody' | 'protac' | 'crispr_guide'
    moleculeType: text('molecule_type').notNull(),
    modality: text('modality'),          // human-readable e.g. 'Protein Binder'
    sequence: text('sequence'),          // amino acid or nucleotide sequence
    pdbId: text('pdb_id'),            // reference PDB if structure-based
    // { pLDDT, pTM, bindingDG, Kd, Tm, immunogenicity }
    scores: jsonb('scores'),
    status: text('status').default('candidate'), // 'candidate' | 'lead' | 'archived'
    starred: boolean('starred').default(false).notNull(),
    immunogenicity: text('immunogenicity'),    // 'Low' | 'Medium' | 'High'
    tags: text('tags').array(),
    // R2 object keys for file assets
    pdbFileKey: text('pdb_file_key'),      // .pdb / .cif structure file
    trajectoryKey: text('trajectory_key'),    // .xtc MD trajectory
    fastaKey: text('fasta_key'),         // .fasta sequence export
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
    index('molecules_workspace_idx').on(t.workspaceId),
    index('molecules_project_idx').on(t.projectId),
]);

// ── 8. Copilot Sessions ───────────────────────────────────────────────────────

export const copilotSessions = pgTable('copilot_sessions', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
    title: text('title').notNull().default('New session'),
    preview: text('preview'),              // first user message snippet for sidebar
    // pinned molecule/job context for this session
    contextMoleculeIds: text('context_molecule_ids').array(),
    contextJobIds: text('context_job_ids').array(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
    index('copilot_sessions_user_idx').on(t.userId),
    index('copilot_sessions_workspace_idx').on(t.workspaceId),
]);

// ── 9. Copilot Messages ───────────────────────────────────────────────────────

export const copilotMessages = pgTable('copilot_messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: uuid('session_id').notNull().references(() => copilotSessions.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),         // 'user' | 'agent'
    content: text('content').notNull(),
    // Array of { id, tool, label, status, input, output, duration }
    toolCalls: jsonb('tool_calls'),
    // For agent messages: which jobs were dispatched from this message
    spawnedJobIds: text('spawned_job_ids').array(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
    index('copilot_messages_session_idx').on(t.sessionId),
]);

// ── 10. Activity Logs ─────────────────────────────────────────────────────────

export const activityLogs = pgTable('activity_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    actorId: uuid('actor_id').notNull().references(() => users.id),
    // 'job_started' | 'job_completed' | 'job_failed' | 'molecule_saved'
    // 'data_ingested' | 'member_joined' | 'project_created' | 'order_placed'
    actionType: text('action_type').notNull(),
    entityId: text('entity_id'),
    entityType: text('entity_type'),  // 'job' | 'molecule' | 'project' | 'member'
    metadata: jsonb('metadata'),    // { jobName, modelType, moleculeName, ... }
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
    index('activity_workspace_idx').on(t.workspaceId),
]);

// ── 11. Datasets (Data Lake) ───────────────────────────────────────────────────

export const datasets = pgTable('datasets', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    uploadedBy: uuid('uploaded_by').notNull().references(() => users.id),
    name: text('name').notNull(),
    fileType: text('file_type').notNull(),       // e.g. 'text/csv', 'application/pdf'
    sizeBytes: integer('size_bytes').notNull(),
    r2Key: text('r2_key').notNull(),             // Path in R2 bucket
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
    index('datasets_workspace_idx').on(t.workspaceId),
]);

// ── 12. Notifications ─────────────────────────────────────────────────────────

export const notifications = pgTable('notifications', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    // 'job_complete' | 'job_failed' | 'molecule_saved' | 'member_joined' | 'order_update'
    type: text('type').notNull(),
    title: text('title').notNull(),
    body: text('body'),
    entityId: text('entity_id'),
    read: boolean('read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
    index('notifications_user_idx').on(t.userId),
    index('notifications_read_idx').on(t.read),
]);

// ── 13. Lab Orders ─────────────────────────────────────────────────────────────

export const labOrders = pgTable('lab_orders', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
    orderedBy: uuid('ordered_by').notNull().references(() => users.id),
    title: text('title').notNull(),
    vendor: text('vendor').notNull(),          // e.g. 'Twist Bioscience', 'Charles River'
    type: text('type').notNull(),              // 'DNA Synthesis', 'Protein Expression', 'Binding Assay'
    status: text('status').default('draft').notNull(), // 'draft', 'submitted', 'in_progress', 'shipped', 'completed', 'cancelled'
    trackingId: text('tracking_id'),
    metadata: jsonb('metadata'),               // e.g. sequence data, specs, custom instructions
    estimatedDeliveryDate: timestamp('estimated_delivery_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
    index('lab_orders_workspace_idx').on(t.workspaceId),
    index('lab_orders_project_idx').on(t.projectId),
]);

// ── Relations ─────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
    memberships: many(workspaceMembers),
    jobs: many(jobs),
    molecules: many(molecules),
    datasets: many(datasets),
    activities: many(activityLogs),
    projects: many(projects),
    copilotSessions: many(copilotSessions),
    notifications: many(notifications),
    labOrders: many(labOrders),
}));

export const workspacesRelations = relations(workspaces, ({ many }) => ({
    members: many(workspaceMembers),
    jobs: many(jobs),
    molecules: many(molecules),
    datasets: many(datasets),
    activities: many(activityLogs),
    projects: many(projects),
    copilotSessions: many(copilotSessions),
    labOrders: many(labOrders),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
    workspace: one(workspaces, { fields: [workspaceMembers.workspaceId], references: [workspaces.id] }),
    user: one(users, { fields: [workspaceMembers.userId], references: [users.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
    workspace: one(workspaces, { fields: [projects.workspaceId], references: [workspaces.id] }),
    creator: one(users, { fields: [projects.createdBy], references: [users.id] }),
    jobs: many(jobs),
    molecules: many(molecules),
    copilotSessions: many(copilotSessions),
    labOrders: many(labOrders),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
    workspace: one(workspaces, { fields: [jobs.workspaceId], references: [workspaces.id] }),
    project: one(projects, { fields: [jobs.projectId], references: [projects.id] }),
    creator: one(users, { fields: [jobs.createdBy], references: [users.id] }),
    molecules: many(molecules),
    logs: many(jobLogs),
}));

export const jobLogsRelations = relations(jobLogs, ({ one }) => ({
    job: one(jobs, { fields: [jobLogs.jobId], references: [jobs.id] }),
}));

export const moleculesRelations = relations(molecules, ({ one }) => ({
    workspace: one(workspaces, { fields: [molecules.workspaceId], references: [workspaces.id] }),
    project: one(projects, { fields: [molecules.projectId], references: [projects.id] }),
    sourceJob: one(jobs, { fields: [molecules.sourceJobId], references: [jobs.id] }),
    creator: one(users, { fields: [molecules.createdBy], references: [users.id] }),
}));

export const copilotSessionsRelations = relations(copilotSessions, ({ one, many }) => ({
    workspace: one(workspaces, { fields: [copilotSessions.workspaceId], references: [workspaces.id] }),
    user: one(users, { fields: [copilotSessions.userId], references: [users.id] }),
    project: one(projects, { fields: [copilotSessions.projectId], references: [projects.id] }),
    messages: many(copilotMessages),
}));

export const copilotMessagesRelations = relations(copilotMessages, ({ one }) => ({
    session: one(copilotSessions, { fields: [copilotMessages.sessionId], references: [copilotSessions.id] }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
    workspace: one(workspaces, { fields: [activityLogs.workspaceId], references: [workspaces.id] }),
    actor: one(users, { fields: [activityLogs.actorId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const datasetsRelations = relations(datasets, ({ one }) => ({
    workspace: one(workspaces, { fields: [datasets.workspaceId], references: [workspaces.id] }),
    uploader: one(users, { fields: [datasets.uploadedBy], references: [users.id] }),
}));
