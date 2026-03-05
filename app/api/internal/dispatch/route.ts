import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jobs, jobLogs, molecules, activityLogs, notifications } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { ADAPTERS } from '@/lib/model-adapters';
import { sleep } from '@/lib/api-utils';

// POST /api/internal/dispatch
// Called by /api/jobs after inserting a row. Runs the model adapter and
// streams log lines into the job_logs table. NOT intended to be called directly.
export async function POST(req: Request) {
    const secret = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (secret !== process.env.AUTH0_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as {
        jobId: string;
        type: string;
        parameters: Record<string, unknown>;
        workspaceId: string;
        userId: string;
    };

    // Mark running immediately
    await db.update(jobs).set({ status: 'running', startedAt: new Date(), progressPct: 0 })
        .where(eq(jobs.id, body.jobId));

    const writeLog = async (line: string, level: 'info' | 'warning' | 'error' = 'info') => {
        await db.insert(jobLogs).values({ jobId: body.jobId, line, level });
    };

    const updateProgress = async (pct: number, step: string) => {
        await db.update(jobs).set({ progressPct: pct, currentStep: step, updatedAt: new Date() })
            .where(eq(jobs.id, body.jobId));
    };

    try {
        const adapter = ADAPTERS[body.type];
        if (!adapter) throw new Error(`Unknown job type: ${body.type}`);

        const result = await adapter.run({
            jobId: body.jobId,
            type: body.type,
            parameters: body.parameters,
            onLog: writeLog,
            onProgress: updateProgress,
        });

        // Save results to job row
        await db.update(jobs).set({
            status: 'success',
            progressPct: 100,
            currentStep: 'Complete',
            results: result as Record<string, unknown>,
            completedAt: new Date(),
            updatedAt: new Date(),
        }).where(eq(jobs.id, body.jobId));

        // Auto-save generated molecules to the molecules table
        for (const mol of result.molecules ?? []) {
            const job = await db.query.jobs.findFirst({ where: eq(jobs.id, body.jobId) });
            await db.insert(molecules).values({
                workspaceId: body.workspaceId,
                projectId: job?.projectId ?? null,
                sourceJobId: body.jobId,
                createdBy: body.userId,
                name: mol.name,
                moleculeType: 'protein',
                sequence: mol.sequence,
                scores: mol.scores,
                pdbFileKey: mol.pdbFileKey ?? null,
                status: 'candidate',
                starred: false,
            });
        }

        // Write activity log
        await db.insert(activityLogs).values({
            workspaceId: body.workspaceId,
            actorId: body.userId,
            actionType: 'job_completed',
            entityId: body.jobId,
            entityType: 'job',
            metadata: {
                jobType: body.type,
                moleculesCount: result.molecules?.length ?? 0,
                stubMode: (result.metadata as Record<string, unknown>)?.stubMode ?? false,
            },
        });

        // Create in-app notification
        await db.insert(notifications).values({
            userId: body.userId,
            type: 'job_complete',
            title: 'Job completed',
            body: `${body.type} job finished — ${result.molecules?.length ?? 0} molecule(s) saved`,
            entityId: body.jobId,
            read: false,
        });

        await writeLog(`[DONE] Job completed successfully — ${result.molecules?.length ?? 0} molecule(s) saved.`);

        return NextResponse.json({ ok: true });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        await writeLog(`[ERROR] ${message}`, 'error');

        await db.update(jobs).set({
            status: 'failed',
            errorMessage: message,
            completedAt: new Date(),
            updatedAt: new Date(),
        }).where(eq(jobs.id, body.jobId));

        await db.insert(notifications).values({
            userId: body.userId,
            type: 'job_failed',
            title: 'Job failed',
            body: message,
            entityId: body.jobId,
        });

        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}
