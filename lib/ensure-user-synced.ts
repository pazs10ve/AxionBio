import { db } from '@/src/db';
import { users, workspaces, workspaceMembers } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { cache } from 'react';

type Auth0User = {
    sub: string;
    email?: string | null;
    name?: string | null;
    picture?: string | null;
};

/**
 * Ensures the authenticated Auth0 user has a corresponding row in the `users`
 * table. Acts as a fallback for when the Auth0 Post-Registration Action webhook
 * hasn't been configured yet or failed to fire.
 *
 * Wrapped in React's `cache()` so it is deduplicated within a single render pass —
 * multiple Server Components importing and calling this in the same request will
 * only hit the DB once.
 */
export const ensureUserSynced = cache(async (authUser: Auth0User) => {
    if (!authUser.sub || !authUser.email) return null;

    // Fast path: user already exists (indexed lookup on auth0_id)
    const existing = await db.query.users.findFirst({
        where: (u, { eq: eqFn }) => eqFn(u.auth0Id, authUser.sub),
    });

    if (existing) return existing;

    // Slow path: first time we've seen this Auth0 user — create them + default workspace
    const [newUser] = await db
        .insert(users)
        .values({
            auth0Id: authUser.sub,
            email: authUser.email!,
            name: authUser.name ?? null,
            avatarUrl: authUser.picture ?? null,
        })
        .onConflictDoUpdate({
            target: users.auth0Id,
            set: {
                name: authUser.name ?? null,
                avatarUrl: authUser.picture ?? null,
                updatedAt: new Date(),
            },
        })
        .returning();

    const slug = authUser.email!.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
    const [newWorkspace] = await db
        .insert(workspaces)
        .values({
            name: `${authUser.name ?? authUser.email!.split('@')[0]}'s Workspace`,
            slug: `${slug}-${Date.now()}`,
            plan: 'trial',
        })
        .returning();

    await db.insert(workspaceMembers).values({
        userId: newUser.id,
        workspaceId: newWorkspace.id,
        role: 'admin',
    });

    return newUser;
});


/**
 * Resolves the active workspace for an already-synced DB user.
 * Also wrapped in `cache()` so it is deduplicated within the same render pass.
 * Any Server Component in the dashboard layout can call this without extra DB hits.
 */
export const getActiveWorkspace = cache(async (userId: string) => {
    return db.query.workspaceMembers.findFirst({
        where: (wm, { eq: eqFn }) => eqFn(wm.userId, userId),
        with: { workspace: true },
    });
});
