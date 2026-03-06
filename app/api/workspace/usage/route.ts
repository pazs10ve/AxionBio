import { db } from '@/lib/db';
import { jobs, molecules } from '@/src/db/schema';
import { eq, sum } from 'drizzle-orm';
import { getSessionUser, ok, apiError } from '@/lib/api-utils';

export async function GET(req: Request) {
    try {
        const { user } = await getSessionUser();
        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get('workspaceId');

        if (!workspaceId) {
            return Response.json({ ok: false, error: 'Missing workspaceId' }, { status: 400 });
        }

        const isMember = user.memberships.some(m => m.workspace.id === workspaceId);
        if (!isMember) return Response.json({ ok: false, error: 'Forbidden' }, { status: 403 });

        // 1. Total Molecule Count
        const molCount = await db.query.molecules.findMany({
            where: eq(molecules.workspaceId, workspaceId),
            columns: { id: true },
        });

        // 2. Total GPU Hours Used
        const gpuResult = await db
            .select({ total: sum(jobs.gpuHours) })
            .from(jobs)
            .where(eq(jobs.workspaceId, workspaceId));

        const totalGpuHours = Number(gpuResult[0]?.total || 0);

        // 3. Storage (Simple count of molecules for now as proxy, or scan GCS later)
        // For a true GCS scan, we'd need to iterate blobs, but usually we track size in DB.
        // We don't have sizeBytes in molecules table yet, so we'll return mock storage or count.

        return ok({
            moleculeCount: molCount.length,
            gpuHoursUsed: totalGpuHours,
            gpuHoursLimit: 50000,
            storageUsedGb: (molCount.length * 0.15).toFixed(2), // Mock logic: 150KB per molecule avg
            storageLimitGb: 500,
            synthesisCount: 0,
            synthesisLimit: 20
        });
    } catch (err) {
        return apiError(err);
    }
}
