import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, workspaces, workspaceMembers } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth0 } from '@/lib/auth0';

// POST /api/auth/sync
// Called by Auth0 Post-Login Action after every login.
// Upserts the user row + creates a default personal workspace if this is their first login.
export async function POST(req: Request) {
    // Validate internal secret
    const secret = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (secret !== process.env.AUTH0_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as {
        auth0Id: string;
        email: string;
        name?: string;
        picture?: string;
    };

    // Upsert user
    const [user] = await db
        .insert(users)
        .values({
            auth0Id: body.auth0Id,
            email: body.email,
            name: body.name ?? null,
            avatarUrl: body.picture ?? null,
        })
        .onConflictDoUpdate({
            target: users.auth0Id,
            set: {
                email: body.email,
                name: body.name ?? undefined,
                avatarUrl: body.picture ?? undefined,
                updatedAt: new Date(),
            },
        })
        .returning();

    // Check if user already has a workspace
    const existingMembership = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.userId, user.id),
    });

    if (!existingMembership) {
        // Create a personal workspace
        const slug = body.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-') + '-ws';
        const [workspace] = await db
            .insert(workspaces)
            .values({
                name: `${body.name ?? body.email.split('@')[0]}'s Workspace`,
                slug,
            })
            .returning();

        await db.insert(workspaceMembers).values({
            workspaceId: workspace.id,
            userId: user.id,
            role: 'admin',
        });
    }

    return NextResponse.json({ ok: true, userId: user.id });
}
