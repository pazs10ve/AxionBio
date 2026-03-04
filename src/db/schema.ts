import { pgTable, serial, text, timestamp, boolean, uuid, jsonb, integer, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Users Table (Synced from Auth0)
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    auth0Id: text('auth0_id').notNull().unique(),
    email: text('email').notNull().unique(),
    name: text('name'),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Workspaces Table (Multi-tenancy)
export const workspaces = pgTable('workspaces', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    stripeCustomerId: text('stripe_customer_id'),
    plan: text('plan').default('trial').notNull(), // 'trial', 'team', 'enterprise'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Workspace Members (Many-to-Many junction)
export const workspaceMembers = pgTable('workspace_members', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
        .notNull()
        .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').default('viewer').notNull(), // 'admin', 'editor', 'viewer'
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// 4. Projects Table (Organisational grouping of work)
export const projects = pgTable('projects', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
        .notNull()
        .references(() => workspaces.id, { onDelete: 'cascade' }),
    createdBy: uuid('created_by')
        .notNull()
        .references(() => users.id),
    name: text('name').notNull(),
    description: text('description'),
    // 'active', 'archived', 'completed'
    status: text('status').default('active').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 5. Jobs Table (Generative tasks, MD simulations, synthesis orders)
export const jobs = pgTable('jobs', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
        .notNull()
        .references(() => workspaces.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
        .references(() => projects.id, { onDelete: 'set null' }),
    createdBy: uuid('created_by')
        .notNull()
        .references(() => users.id),
    name: text('name').notNull(),
    // 'alphafold3', 'rfdiffusion', 'esm3', 'esm_fold', 'gromacs', 'openmm', 'fep', 'synthesis_order', 'cloud_lab'
    type: text('type').notNull(),
    // 'queued', 'running', 'success', 'failed', 'cancelled'
    status: text('status').default('queued').notNull(),
    parameters: jsonb('parameters'),    // Job-type-specific input config
    results: jsonb('results'),          // Output file paths or summarized metrics
    gpuHours: real('gpu_hours'),        // Actual GPU hours consumed (set on completion)
    estimatedGpuHours: real('estimated_gpu_hours'), // Pre-run estimate
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 6. Molecules Table (Saved candidates from generative jobs)
export const molecules = pgTable('molecules', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
        .notNull()
        .references(() => workspaces.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
        .references(() => projects.id, { onDelete: 'set null' }),
    sourceJobId: uuid('source_job_id')
        .references(() => jobs.id, { onDelete: 'set null' }),
    createdBy: uuid('created_by')
        .notNull()
        .references(() => users.id),
    name: text('name').notNull(),
    // 'protein', 'peptide', 'small_molecule', 'nucleotide'
    moleculeType: text('molecule_type').notNull(),
    sequence: text('sequence'),         // Amino acid or nucleotide sequence
    pdbId: text('pdb_id'),              // Reference PDB ID if structure-based
    // { pLDDT, pTM, bindingAffinity, immunogenicityFlag, thermalStability }
    scores: jsonb('scores'),
    isFavorited: boolean('is_favorited').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 7. Activity Logs (For the Dashboard Activity Feed)
export const activityLogs = pgTable('activity_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
        .notNull()
        .references(() => workspaces.id, { onDelete: 'cascade' }),
    actorId: uuid('actor_id')
        .notNull()
        .references(() => users.id),
    // 'job_started', 'job_completed', 'job_failed', 'molecule_saved', 'data_ingested', 'member_joined', 'project_created'
    actionType: text('action_type').notNull(),
    entityId: text('entity_id'),        // The UUID of the entity being acted on
    entityType: text('entity_type'),    // 'job', 'molecule', 'project', 'member'
    metadata: jsonb('metadata'),        // Extra human-readable context (e.g. { jobName: 'KRAS...' })
    createdAt: timestamp('created_at').defaultNow().notNull(),
});


// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
    memberships: many(workspaceMembers),
    jobs: many(jobs),
    molecules: many(molecules),
    activities: many(activityLogs),
    projects: many(projects),
}));

export const workspacesRelations = relations(workspaces, ({ many }) => ({
    members: many(workspaceMembers),
    jobs: many(jobs),
    molecules: many(molecules),
    activities: many(activityLogs),
    projects: many(projects),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
    workspace: one(workspaces, {
        fields: [workspaceMembers.workspaceId],
        references: [workspaces.id],
    }),
    user: one(users, {
        fields: [workspaceMembers.userId],
        references: [users.id],
    }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
    workspace: one(workspaces, {
        fields: [projects.workspaceId],
        references: [workspaces.id],
    }),
    creator: one(users, {
        fields: [projects.createdBy],
        references: [users.id],
    }),
    jobs: many(jobs),
    molecules: many(molecules),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
    workspace: one(workspaces, {
        fields: [jobs.workspaceId],
        references: [workspaces.id],
    }),
    project: one(projects, {
        fields: [jobs.projectId],
        references: [projects.id],
    }),
    creator: one(users, {
        fields: [jobs.createdBy],
        references: [users.id],
    }),
    molecules: many(molecules),
}));

export const moleculesRelations = relations(molecules, ({ one }) => ({
    workspace: one(workspaces, {
        fields: [molecules.workspaceId],
        references: [workspaces.id],
    }),
    project: one(projects, {
        fields: [molecules.projectId],
        references: [projects.id],
    }),
    sourceJob: one(jobs, {
        fields: [molecules.sourceJobId],
        references: [jobs.id],
    }),
    creator: one(users, {
        fields: [molecules.createdBy],
        references: [users.id],
    }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
    workspace: one(workspaces, {
        fields: [activityLogs.workspaceId],
        references: [workspaces.id],
    }),
    actor: one(users, {
        fields: [activityLogs.actorId],
        references: [users.id],
    }),
}));
