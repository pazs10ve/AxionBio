import { db } from '@/lib/db';
import { jobs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionUser, ok, apiError, ApiError } from '@/lib/api-utils';

// GET /api/jobs/[id]
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user } = await getSessionUser();

        const job = await db.query.jobs.findFirst({
            where: eq(jobs.id, id),
            with: {
                creator: { columns: { name: true, avatarUrl: true } },
                project: { columns: { id: true, name: true } },
                molecules: {
                    columns: {
                        id: true, name: true, moleculeType: true,
                        scores: true, status: true, starred: true,
                    },
                },
            },
        });

        if (!job) throw new ApiError(404, 'Job not found');

        const hasAccess = user.memberships.some(m => m.workspace.id === job.workspaceId);
        if (!hasAccess) throw new ApiError(403, 'Access denied');

        return ok(job);
    } catch (err) {
        return apiError(err);
    }
}
