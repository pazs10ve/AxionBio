import { db } from '@/lib/db';
import { projects, activityLogs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionUser, ok, apiError, ApiError } from '@/lib/api-utils';

// GET /api/projects/[id]
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user } = await getSessionUser();
        const workspaceId = user.memberships[0]?.workspace.id;
        if (!workspaceId) throw new ApiError(400, 'No workspace');

        const project = await db.query.projects.findFirst({
            where: eq(projects.id, id),
            with: {
                creator: { columns: { name: true, avatarUrl: true } },
                jobs: { columns: { id: true, status: true, type: true, name: true, createdAt: true } },
                molecules: { columns: { id: true, name: true, status: true, scores: true } },
            },
        });

        if (!project) throw new ApiError(404, 'Project not found');
        if (project.workspaceId !== workspaceId) throw new ApiError(403, 'Access denied');

        return ok({
            ...project,
            jobCount: project.jobs.length,
            moleculeCount: project.molecules.length,
            runningJobs: project.jobs.filter(j => j.status === 'running').length,
        });
    } catch (err) {
        return apiError(err);
    }
}

// PATCH /api/projects/[id]
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user } = await getSessionUser();
        const workspaceId = user.memberships[0]?.workspace.id;
        if (!workspaceId) throw new ApiError(400, 'No workspace');

        // Verify ownership
        const existing = await db.query.projects.findFirst({
            where: eq(projects.id, id),
            columns: { workspaceId: true },
        });
        if (!existing) throw new ApiError(404, 'Project not found');
        if (existing.workspaceId !== workspaceId) throw new ApiError(403, 'Access denied');

        const body = await req.json() as {
            name?: string;
            description?: string;
            status?: string;
            target?: string;
            indication?: string;
            modality?: string;
            phase?: string;
            program?: string;
            color?: string;
            tags?: string[];
        };

        const [updated] = await db.update(projects)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(projects.id, id))
            .returning();

        return ok(updated);
    } catch (err) {
        return apiError(err);
    }
}

// DELETE /api/projects/[id]  — soft delete (archive)
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user } = await getSessionUser();
        const workspaceId = user.memberships[0]?.workspace.id;
        if (!workspaceId) throw new ApiError(400, 'No workspace');

        const existing = await db.query.projects.findFirst({
            where: eq(projects.id, id),
            columns: { workspaceId: true },
        });
        if (!existing) throw new ApiError(404, 'Project not found');
        if (existing.workspaceId !== workspaceId) throw new ApiError(403, 'Access denied');

        const [archived] = await db.update(projects)
            .set({ status: 'archived', updatedAt: new Date() })
            .where(eq(projects.id, id))
            .returning();

        await db.insert(activityLogs).values({
            workspaceId,
            actorId: user.id,
            actionType: 'project_archived',
            entityId: id,
            entityType: 'project',
            metadata: { projectName: archived.name },
        });

        return ok({ archived: true });
    } catch (err) {
        return apiError(err);
    }
}
