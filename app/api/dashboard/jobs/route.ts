import { auth0 } from '@/lib/auth0';
import { db } from '@/src/db';
import { jobs, users, workspaceMembers } from '@/src/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * GET /api/dashboard/jobs
 *
 * Returns the 10 most recent jobs for the authenticated user's active workspace.
 * Joins with the users table to include creator info for each job row.
 *
 * Response shape: Array of {
 *   id, name, type, status,
 *   createdBy: { name, avatarUrl },
 *   startedAt, completedAt, createdAt, gpuHours
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
    });

    if (!membership) return NextResponse.json([]);

    const workspaceId = membership.workspaceId;

    // ── Fetch recent jobs with creator info ───────────────────────────────────
    const recentJobs = await db
        .select({
            id: jobs.id,
            name: jobs.name,
            type: jobs.type,
            status: jobs.status,
            gpuHours: jobs.gpuHours,
            startedAt: jobs.startedAt,
            completedAt: jobs.completedAt,
            createdAt: jobs.createdAt,
            creatorName: users.name,
            creatorAvatar: users.avatarUrl,
        })
        .from(jobs)
        .leftJoin(users, eq(jobs.createdBy, users.id))
        .where(eq(jobs.workspaceId, workspaceId))
        .orderBy(desc(jobs.createdAt))
        .limit(10);

    const shaped = recentJobs.map((j) => ({
        id: j.id,
        name: j.name,
        type: j.type,
        status: j.status,
        gpuHours: j.gpuHours,
        startedAt: j.startedAt,
        completedAt: j.completedAt,
        createdAt: j.createdAt,
        createdBy: {
            name: j.creatorName ?? 'Unknown',
            avatarUrl: j.creatorAvatar ?? null,
        },
    }));

    return NextResponse.json(shaped);
}
