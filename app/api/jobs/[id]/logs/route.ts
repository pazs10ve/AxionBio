import { db } from '@/lib/db';
import { jobs, jobLogs } from '@/src/db/schema';
import { eq, gt, asc } from 'drizzle-orm';
import { getSessionUser, apiError, ApiError, sleep } from '@/lib/api-utils';
import { NextResponse } from 'next/server';

// GET /api/jobs/[id]/logs
// Server-Sent Events stream. Polls job_logs table every 2s and emits new rows.
// Closes automatically when the job reaches a terminal state.
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: jobId } = await params;
        const { user } = await getSessionUser();

        // Verify user has access to this job's workspace
        const job = await db.query.jobs.findFirst({ where: eq(jobs.id, jobId) });
        if (!job) throw new ApiError(404, 'Job not found');

        const hasAccess = user.memberships.some(m => m.workspace.id === job.workspaceId);
        if (!hasAccess) throw new ApiError(403, 'Access denied');

        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                const send = (data: unknown) => {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                };

                let lastLogId = 0;
                const TERMINAL = new Set(['success', 'failed', 'cancelled']);

                while (true) {
                    // Fetch any new log lines since last poll
                    const newLogs = await db.query.jobLogs.findMany({
                        where: logRow => gt(logRow.id, lastLogId)
                            ? eq(logRow.jobId, jobId)
                            : undefined,
                        orderBy: [asc(jobLogs.id)],
                        limit: 100,
                    });

                    // Filter to this job manually (drizzle compound where)
                    const filtered = newLogs.filter(l => l.jobId === jobId && l.id > lastLogId);
                    for (const log of filtered) {
                        send({ type: 'log', id: log.id, line: log.line, level: log.level, ts: log.createdAt });
                        lastLogId = log.id;
                    }

                    // Check current job status
                    const currentJob = await db.query.jobs.findFirst({
                        where: eq(jobs.id, jobId),
                        columns: { status: true, progressPct: true, currentStep: true },
                    });

                    if (currentJob) {
                        send({ type: 'progress', pct: currentJob.progressPct, step: currentJob.currentStep });
                    }

                    if (currentJob && TERMINAL.has(currentJob.status)) {
                        send({ type: 'done', status: currentJob.status });
                        controller.close();
                        return;
                    }

                    await sleep(2000);
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-store',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no',
            },
        });

    } catch (err) {
        return apiError(err);
    }
}
