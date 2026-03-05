import { db } from '@/lib/db';
import { activityLogs } from '@/src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSessionUser, ok, apiError, ApiError } from '@/lib/api-utils';

// GET /api/activity
// Returns the last 30 activity entries for the user's workspace.
export async function GET() {
    try {
        const { user } = await getSessionUser();
        const workspaceId = user.memberships[0]?.workspace.id;
        if (!workspaceId) throw new ApiError(400, 'No workspace');

        const rows = await db.query.activityLogs.findMany({
            where: eq(activityLogs.workspaceId, workspaceId),
            orderBy: [desc(activityLogs.createdAt)],
            limit: 30,
            with: {
                actor: { columns: { name: true, avatarUrl: true } },
            },
        });

        return ok(rows);
    } catch (err) {
        return apiError(err);
    }
}
