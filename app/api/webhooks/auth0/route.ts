import { db } from '@/src/db';
import { users, workspaces, workspaceMembers } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/auth/webhook (legacy path kept for backwards compatibility)
 *
 * Auth0 "Post-Registration" Action calls this endpoint whenever a new user
 * completes sign-up. Configure the Action in Auth0 dashboard to POST here
 * with `X-Webhook-Secret` header matching AUTH0_WEBHOOK_SECRET env var.
 *
 * Note: the ensureUserSynced middleware in lib/ensure-user-synced.ts acts as
 * a fallback if this webhook is not yet configured.
 */
export async function POST(req: Request) {
    const secret = req.headers.get('X-Webhook-Secret') ?? req.headers.get('x-auth0-secret');
    if (secret !== process.env.AUTH0_WEBHOOK_SECRET) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const body = await req.json();
        // Support both { event: { user } } and { user } payload shapes
        const authUser = body?.event?.user ?? body?.user;

        if (!authUser?.user_id || !authUser?.email) {
            return new Response('Invalid payload', { status: 400 });
        }

        const { user_id: auth0Id, email, name, picture: avatarUrl } = authUser;

        const [upsertedUser] = await db
            .insert(users)
            .values({ auth0Id, email, name: name ?? null, avatarUrl: avatarUrl ?? null })
            .onConflictDoUpdate({
                target: users.auth0Id,
                set: { name: name ?? null, avatarUrl: avatarUrl ?? null, updatedAt: new Date() },
            })
            .returning();

        // Create default workspace only for brand-new users
        const existingMemberships = await db
            .select()
            .from(workspaceMembers)
            .where(eq(workspaceMembers.userId, upsertedUser.id))
            .limit(1);

        if (existingMemberships.length === 0) {
            const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
            const [newWorkspace] = await db
                .insert(workspaces)
                .values({
                    name: `${name ?? email.split('@')[0]}'s Workspace`,
                    slug: `${slug}-${Date.now()}`,
                    plan: 'trial',
                })
                .returning();

            await db.insert(workspaceMembers).values({
                userId: upsertedUser.id,
                workspaceId: newWorkspace.id,
                role: 'admin',
            });
        }

        return Response.json({ ok: true, userId: upsertedUser.id });
    } catch (error) {
        console.error('[webhook] Error processing Auth0 user sync:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
