import { db } from '@/lib/db';
import { users } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionUser, ok, apiError } from '@/lib/api-utils';

// GET /api/me
export async function GET() {
    try {
        const { user } = await getSessionUser();
        return ok({
            id: user.id,
            auth0Id: user.auth0Id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            role: user.role,
            bio: user.bio,
            timezone: user.timezone,
            workspaces: user.memberships.map(m => ({
                id: m.workspace.id,
                name: m.workspace.name,
                slug: m.workspace.slug,
                plan: m.workspace.plan,
                role: m.role,
            })),
        });
    } catch (err) {
        return apiError(err);
    }
}

// PATCH /api/me
export async function PATCH(req: Request) {
    try {
        const { user } = await getSessionUser();
        const body = await req.json() as {
            name?: string;
            bio?: string;
            role?: string;
            timezone?: string;
            avatarUrl?: string;
        };

        const [updated] = await db
            .update(users)
            .set({
                name: body.name,
                bio: body.bio,
                role: body.role,
                timezone: body.timezone,
                avatarUrl: body.avatarUrl,
                updatedAt: new Date(),
            })
            .where(eq(users.id, user.id))
            .returning();

        return ok(updated);
    } catch (err) {
        return apiError(err);
    }
}
