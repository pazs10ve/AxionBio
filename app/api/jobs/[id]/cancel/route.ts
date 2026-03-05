import { db } from '@/lib/db';
import { jobs, activityLogs, notifications } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionUser, ok, apiError, ApiError } from '@/lib/api-utils';

// POST /api/jobs/[id]/cancel
export async function POST(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: jobId } = await params;
        const { user } = await getSessionUser();
        const workspaceId = user.memberships[0]?.workspace.id;
        if (!workspaceId) throw new ApiError(400, 'No workspace');

        const job = await db.query.jobs.findFirst({
            where: eq(jobs.id, jobId),
        });

        if (!job) throw new ApiError(404, 'Job not found');
        if (job.workspaceId !== workspaceId) throw new ApiError(403, 'Access denied');

        if (job.status !== 'queued' && job.status !== 'running') {
            throw new ApiError(400, `Cannot cancel a job with status "${job.status}"`);
        }

        const [updated] = await db.update(jobs)
            .set({
                status: 'cancelled',
                completedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(jobs.id, jobId))
            .returning();

        await db.insert(activityLogs).values({
            workspaceId,
            actorId: user.id,
            actionType: 'job_cancelled',
            entityId: jobId,
            entityType: 'job',
            metadata: { jobName: job.name, jobType: job.type },
        });

        await db.insert(notifications).values({
            userId: user.id,
            type: 'job_cancelled',
            title: 'Job cancelled',
            body: `${job.type} job "${job.name}" was cancelled`,
            entityId: jobId,
        });

        return ok({ cancelled: true, status: updated.status });
    } catch (err) {
        return apiError(err);
    }
}
