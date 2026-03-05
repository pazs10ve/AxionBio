import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jobs, activityLogs, notifications } from '@/src/db/schema';
import { eq, and, desc, or } from 'drizzle-orm';
import { getSessionUser, ok, created, apiError, ApiError } from '@/lib/api-utils';

// GET /api/jobs
// Optional query params: ?projectId=...&status=...&type=...
export async function GET(req: Request) {
    try {
        const { user } = await getSessionUser();
        const workspaceId = user.memberships[0]?.workspace.id;
        if (!workspaceId) throw new ApiError(400, 'No workspace found');

        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get('projectId');
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const limit = parseInt(searchParams.get('limit') ?? '50');

        const conditions = [eq(jobs.workspaceId, workspaceId)];
        if (projectId) conditions.push(eq(jobs.projectId, projectId));
        if (status) conditions.push(eq(jobs.status, status));
        if (type) conditions.push(eq(jobs.type, type));

        const rows = await db.query.jobs.findMany({
            where: and(...conditions),
            orderBy: [desc(jobs.createdAt)],
            limit,
            with: {
                creator: { columns: { name: true, avatarUrl: true } },
                project: { columns: { id: true, name: true } },
            },
        });

        return ok(rows);
    } catch (err) {
        return apiError(err);
    }
}

// POST /api/jobs
// Submits a job and immediately dispatches it in the background.
export async function POST(req: Request) {
    try {
        const { user } = await getSessionUser();
        const workspaceId = user.memberships[0]?.workspace.id;
        if (!workspaceId) throw new ApiError(400, 'No workspace found');

        const body = await req.json() as {
            name: string;
            type: string;
            projectId?: string | null;
            parameters?: Record<string, unknown>;
            estimatedGpuHours?: number;
        };

        if (!body.name?.trim()) throw new ApiError(400, 'Job name required');
        if (!body.type) throw new ApiError(400, 'Job type required');

        // Insert job row
        const [job] = await db.insert(jobs).values({
            workspaceId,
            projectId: body.projectId ?? null,
            createdBy: user.id,
            name: body.name.trim(),
            type: body.type,
            status: 'queued',
            parameters: body.parameters ?? {},
            estimatedGpuHours: body.estimatedGpuHours ?? null,
            progressPct: 0,
            currentStep: 'Queued',
        }).returning();

        // Activity log
        await db.insert(activityLogs).values({
            workspaceId,
            actorId: user.id,
            actionType: 'job_started',
            entityId: job.id,
            entityType: 'job',
            metadata: { jobName: job.name, jobType: job.type },
        });

        // Dispatch asynchronously — fire and forget
        // We call our own /api/internal/dispatch endpoint
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
        fetch(`${appUrl}/api/internal/dispatch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.AUTH0_WEBHOOK_SECRET}`,
            },
            body: JSON.stringify({
                jobId: job.id,
                type: job.type,
                parameters: job.parameters ?? {},
                workspaceId,
                userId: user.id,
            }),
        }).catch(err => console.error('[dispatch fire-and-forget failed]', err));

        return created({ jobId: job.id, status: 'queued' });
    } catch (err) {
        return apiError(err);
    }
}
