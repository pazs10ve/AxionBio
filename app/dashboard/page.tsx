import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { db } from '@/src/db';
import { users, workspaceMembers, jobs, molecules, activityLogs } from '@/src/db/schema';
import { and, count, desc, eq, gte, sql, sum } from 'drizzle-orm';
import { DashboardLayoutShell } from '@/components/layout/DashboardLayoutShell';
import { DashboardKPIRow } from '@/components/dashboard/DashboardKPIRow';
import { RecentJobsTable } from '@/components/dashboard/RecentJobsTable';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickLaunchCards } from '@/components/dashboard/QuickLaunchCards';
import { Button } from '@/components/ui/button';
import { Plus, Bot } from 'lucide-react';
import { ensureUserSynced, getActiveWorkspace } from '@/lib/ensure-user-synced';

export default async function DashboardPage() {
    const session = await auth0.getSession();

    // v4 SDK: getSession() returns null when unauthenticated.
    // The middleware already guards /dashboard, but this is a type-safe fallback.
    if (!session) redirect('/auth/login');

    const { user: authUser } = session;

    // ── Middleware fallback: ensure user exists in DB ─────────────────────────
    const dbUser = await ensureUserSynced(authUser);
    if (!dbUser) redirect('/auth/login');

    // ── Resolve workspace (cached — no extra DB hit if called elsewhere in same render) ──
    const membership = await getActiveWorkspace(dbUser.id);

    // If no workspace yet, graceful empty state (can happen on very first load before webhook fires)
    if (!membership) {
        return (
            <DashboardLayoutShell>
                <div className="flex items-center justify-center h-full text-slate-500">
                    <p>Setting up your workspace... Refresh in a moment.</p>
                </div>
            </DashboardLayoutShell>
        );
    }

    const workspaceId = membership.workspaceId;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // ── Fetch all dashboard data in parallel ──────────────────────────────────
    const [
        activeJobsResult,
        candidatesResult,
        gpuHoursResult,
        labOrdersResult,
        recentJobsRaw,
        activityRaw,
    ] = await Promise.all([
        db.select({ count: count() }).from(jobs)
            .where(and(eq(jobs.workspaceId, workspaceId), sql`${jobs.status} IN ('running', 'queued')`)),

        db.select({ count: count() }).from(molecules)
            .where(and(eq(molecules.workspaceId, workspaceId), gte(molecules.createdAt, thirtyDaysAgo))),

        db.select({ total: sum(jobs.gpuHours) }).from(jobs)
            .where(and(eq(jobs.workspaceId, workspaceId), eq(jobs.status, 'success'), gte(jobs.completedAt, thirtyDaysAgo))),

        db.select({ count: count() }).from(jobs)
            .where(and(eq(jobs.workspaceId, workspaceId), eq(jobs.type, 'synthesis_order'), sql`${jobs.status} IN ('queued', 'running')`)),

        db.select({
            id: jobs.id, name: jobs.name, type: jobs.type, status: jobs.status,
            gpuHours: jobs.gpuHours, startedAt: jobs.startedAt, completedAt: jobs.completedAt, createdAt: jobs.createdAt,
            creatorName: users.name, creatorAvatar: users.avatarUrl,
        })
            .from(jobs)
            .leftJoin(users, eq(jobs.createdBy, users.id))
            .where(eq(jobs.workspaceId, workspaceId))
            .orderBy(desc(jobs.createdAt))
            .limit(10),

        db.select({
            id: activityLogs.id, actionType: activityLogs.actionType,
            entityId: activityLogs.entityId, entityType: activityLogs.entityType,
            metadata: activityLogs.metadata, createdAt: activityLogs.createdAt,
            actorId: activityLogs.actorId,
            actorName: users.name, actorEmail: users.email, actorAvatar: users.avatarUrl,
        })
            .from(activityLogs)
            .leftJoin(users, eq(activityLogs.actorId, users.id))
            .where(eq(activityLogs.workspaceId, workspaceId))
            .orderBy(desc(activityLogs.createdAt))
            .limit(20),
    ]);

    // ── Shape the data for components ─────────────────────────────────────────
    const kpis = {
        activeJobs: activeJobsResult[0]?.count ?? 0,
        candidatesGenerated30d: candidatesResult[0]?.count ?? 0,
        gpuHoursConsumed30d: Math.round(Number(gpuHoursResult[0]?.total ?? 0)),
        labOrdersPending: labOrdersResult[0]?.count ?? 0,
    };

    const recentJobs = recentJobsRaw.map((j) => ({
        id: j.id, name: j.name, type: j.type,
        status: j.status as 'running' | 'success' | 'failed' | 'queued' | 'cancelled',
        gpuHours: j.gpuHours,
        startedAt: j.startedAt, completedAt: j.completedAt, createdAt: j.createdAt,
        createdBy: { name: j.creatorName ?? 'Unknown', avatarUrl: j.creatorAvatar ?? null },
    }));

    const activityItems = activityRaw.map((a) => ({
        id: a.id, actionType: a.actionType,
        entityId: a.entityId, entityType: a.entityType,
        metadata: a.metadata as Record<string, unknown> | null,
        createdAt: a.createdAt,
        actor: {
            name: a.actorName ?? 'System',
            email: a.actorEmail ?? '',
            avatarUrl: a.actorAvatar ?? null,
        },
        isMine: a.actorId === dbUser.id,
    }));

    return (
        <DashboardLayoutShell>

            {/* Contextual Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Workspace Overview</h1>
                    <p className="text-slate-500 mt-1">
                        Welcome back, {authUser.name}. {membership.workspace.name}.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="bg-white hover:bg-slate-50 shadow-sm border-slate-200 text-slate-600 font-medium h-10 px-4">
                        <Bot className="w-4 h-4 mr-2 text-slate-500" />
                        Talk to Copilot
                    </Button>
                    <Button className="bg-brand hover:bg-brand-hover text-white shadow-sm font-medium h-10 px-4">
                        <Plus className="w-4 h-4 mr-2" />
                        New Job
                    </Button>
                </div>
            </div>

            {/* Primary KPIs */}
            <DashboardKPIRow kpis={kpis} />

            {/* Bento Box Grid for Lower Half */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Main Jobs Area */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    <QuickLaunchCards />

                    <div className="flex-1 min-h-[400px]">
                        <RecentJobsTable jobs={recentJobs} />
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="xl:col-span-1 min-h-[500px]">
                    <ActivityFeed activities={activityItems} currentUserId={dbUser.id} />
                </div>

            </div>

        </DashboardLayoutShell>
    );
}
