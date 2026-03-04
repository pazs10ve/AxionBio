import { auth0 } from '@/lib/auth0';
import { db } from '@/src/db';
import { jobs, molecules, workspaceMembers } from '@/src/db/schema';
import { and, count, eq, gte, sql, sum } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * GET /api/dashboard/kpis
 *
 * Returns aggregated KPI data for the authenticated user's active workspace.
 * All values are scoped to the first workspace the user belongs to.
 *
 * Response shape:
 * {
 *   activeJobs: number,
 *   candidatesGenerated30d: number,
 *   gpuHoursConsumed30d: number,
 *   labOrdersPending: number,
 * }
 */
export async function GET() {
    const session = await auth0.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const auth0Id = session.user.sub;

    // ── Resolve user's active workspace ───────────────────────────────────────
    const membership = await db.query.workspaceMembers.findFirst({
        where: (wm, { eq: eqFn }) => eqFn(
            wm.userId,
            db.select({ id: sql<string>`users.id` })
                .from(sql`users`)
                .where(sql`users.auth0_id = ${auth0Id}`)
                .limit(1) as unknown as string
        ),
        with: { workspace: true },
    });

    if (!membership) {
        // Return zeroed KPIs if user hasn't been synced yet
        return NextResponse.json({
            activeJobs: 0,
            candidatesGenerated30d: 0,
            gpuHoursConsumed30d: 0,
            labOrdersPending: 0,
        });
    }

    const workspaceId = membership.workspaceId;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // ── Run KPI queries in parallel ───────────────────────────────────────────
    const [
        activeJobsResult,
        candidatesResult,
        gpuHoursResult,
        labOrdersResult,
    ] = await Promise.all([
        // Active jobs: running or queued
        db
            .select({ count: count() })
            .from(jobs)
            .where(and(
                eq(jobs.workspaceId, workspaceId),
                sql`${jobs.status} IN ('running', 'queued')`
            )),

        // Molecules generated in the last 30 days
        db
            .select({ count: count() })
            .from(molecules)
            .where(and(
                eq(molecules.workspaceId, workspaceId),
                gte(molecules.createdAt, thirtyDaysAgo)
            )),

        // GPU hours consumed by completed jobs in the last 30 days
        db
            .select({ total: sum(jobs.gpuHours) })
            .from(jobs)
            .where(and(
                eq(jobs.workspaceId, workspaceId),
                eq(jobs.status, 'success'),
                gte(jobs.completedAt, thirtyDaysAgo)
            )),

        // Lab orders (synthesis jobs) still pending
        db
            .select({ count: count() })
            .from(jobs)
            .where(and(
                eq(jobs.workspaceId, workspaceId),
                eq(jobs.type, 'synthesis_order'),
                sql`${jobs.status} IN ('queued', 'running')`
            )),
    ]);

    return NextResponse.json({
        activeJobs: activeJobsResult[0]?.count ?? 0,
        candidatesGenerated30d: candidatesResult[0]?.count ?? 0,
        gpuHoursConsumed30d: Math.round(Number(gpuHoursResult[0]?.total ?? 0)),
        labOrdersPending: labOrdersResult[0]?.count ?? 0,
    });
}
