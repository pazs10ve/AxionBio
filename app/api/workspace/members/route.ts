import { db } from '@/lib/db';
import { workspaceMembers } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionUser, ok, apiError } from '@/lib/api-utils';

export async function GET(req: Request) {
    try {
        const { user } = await getSessionUser();
        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get('workspaceId');

        if (!workspaceId) {
            return Response.json({ ok: false, error: 'Missing workspaceId' }, { status: 400 });
        }

        // Verify user is in this workspace
        const isMember = user.memberships.some(m => m.workspace.id === workspaceId);
        if (!isMember) {
            return Response.json({ ok: false, error: 'Forbidden' }, { status: 403 });
        }

        const members = await db.query.workspaceMembers.findMany({
            where: eq(workspaceMembers.workspaceId, workspaceId),
            with: {
                user: true,
            },
        });

        return ok(members.map(m => ({
            id: m.id,
            role: m.role,
            joinedAt: m.joinedAt,
            user: {
                id: m.user.id,
                name: m.user.name,
                email: m.user.email,
                avatarUrl: m.user.avatarUrl,
            }
        })));
    } catch (err) {
        return apiError(err);
    }
}
