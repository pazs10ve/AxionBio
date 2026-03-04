import { auth0 } from '@/lib/auth0';
import { db } from '@/src/db';
import { activityLogs, users, workspaceMembers } from '@/src/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * GET /api/dashboard/activity
 *
 * Returns the 20 most recent activity log entries for the authenticated user's
 * active workspace. Each entry is enriched with actor user info.
 *
 * Response shape: Array of {
 *   id, actionType, entityId, entityType, metadata,
 *   createdAt,
 *   actor: { name, avatarUrl, email }
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

    // ── Fetch activity with actor info ────────────────────────────────────────
    const feed = await db
        .select({
            id: activityLogs.id,
            actionType: activityLogs.actionType,
            entityId: activityLogs.entityId,
            entityType: activityLogs.entityType,
            metadata: activityLogs.metadata,
            createdAt: activityLogs.createdAt,
            actorName: users.name,
            actorEmail: users.email,
            actorAvatar: users.avatarUrl,
        })
        .from(activityLogs)
        .leftJoin(users, eq(activityLogs.actorId, users.id))
        .where(eq(activityLogs.workspaceId, workspaceId))
        .orderBy(desc(activityLogs.createdAt))
        .limit(20);

    const shaped = feed.map((entry) => ({
        id: entry.id,
        actionType: entry.actionType,
        entityId: entry.entityId,
        entityType: entry.entityType,
        metadata: entry.metadata,
        createdAt: entry.createdAt,
        actor: {
            name: entry.actorName ?? 'System',
            email: entry.actorEmail ?? '',
            avatarUrl: entry.actorAvatar ?? null,
        },
    }));

    return NextResponse.json(shaped);
}
