import { db } from '@/src/db';
import { users, workspaces, workspaceMembers } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/auth/webhook
 *
 * Auth0 "Post-Registration" Action calls this endpoint whenever a new user
 * completes sign-up. The Action is configured in the Auth0 dashboard and
 * passes a shared secret in the `X-Webhook-Secret` header.
 *
 * Payload shape (from Auth0 Action):
 * {
 *   event: {
 *     user: {
 *       user_id: "auth0|...",
 *       email: "user@example.com",
 *       name: "Dr. Jane Smith",
 *       picture: "https://..."
 *     }
 *   }
 * }
 *
 * On receipt:
 * 1. Validates the shared secret
 * 2. Upserts the user into the `users` table
 * 3. Creates a personal default workspace for the user (if first time)
 * 4. Links the user to that workspace as 'admin'
 */
export async function POST(req: Request) {
    // ── Security: validate shared secret ──────────────────────────────────────
    const secret = req.headers.get('X-Webhook-Secret');
    if (secret !== process.env.AUTH0_WEBHOOK_SECRET) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const body = await req.json();
        const authUser = body?.event?.user;

        if (!authUser?.user_id || !authUser?.email) {
            return new Response('Invalid payload', { status: 400 });
        }

        const { user_id: auth0Id, email, name, picture: avatarUrl } = authUser;

        // ── 1. Upsert the user row ─────────────────────────────────────────────
        const [upsertedUser] = await db
            .insert(users)
            .values({ auth0Id, email, name: name ?? null, avatarUrl: avatarUrl ?? null })
            .onConflictDoUpdate({
                target: users.auth0Id,
                set: { name: name ?? null, avatarUrl: avatarUrl ?? null, updatedAt: new Date() },
            })
            .returning();

        // ── 2. Create a default personal workspace (only if user is truly new) ──
        const existingMemberships = await db
            .select()
            .from(workspaceMembers)
            .where(eq(workspaceMembers.userId, upsertedUser.id))
            .limit(1);

        if (existingMemberships.length === 0) {
            // Derive a unique slug from the user's email prefix
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

        return new Response(JSON.stringify({ ok: true, userId: upsertedUser.id }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('[webhook] Error processing Auth0 user sync:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
