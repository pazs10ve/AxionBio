import { db } from '@/lib/db';
import { projects, activityLogs } from '@/src/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getSessionUser, ok, created, apiError, ApiError } from '@/lib/api-utils';

// GET /api/projects
// Returns all projects for the user's current workspace.
export async function GET() {
    try {
        const { user } = await getSessionUser();
        const workspaceId = user.memberships[0]?.workspace.id;
        if (!workspaceId) throw new ApiError(400, 'No workspace found');

        const rows = await db.query.projects.findMany({
            where: eq(projects.workspaceId, workspaceId),
            orderBy: [desc(projects.updatedAt)],
            with: {
                creator: { columns: { name: true, avatarUrl: true } },
                jobs: { columns: { id: true, status: true } },
                molecules: { columns: { id: true } },
            },
        });

        return ok(rows.map(p => ({
            ...p,
            jobCount: p.jobs.length,
            moleculeCount: p.molecules.length,
            runningJobs: p.jobs.filter(j => j.status === 'running').length,
        })));
    } catch (err) {
        return apiError(err);
    }
}

// POST /api/projects
export async function POST(req: Request) {
    try {
        const { user } = await getSessionUser();
        const workspaceId = user.memberships[0]?.workspace.id;
        if (!workspaceId) throw new ApiError(400, 'No workspace found');

        const body = await req.json() as {
            name: string;
            description?: string;
            target?: string;
            indication?: string;
            modality?: string;
            phase?: string;
            program?: string;
            color?: string;
            tags?: string[];
        };

        if (!body.name?.trim()) throw new ApiError(400, 'Project name is required');

        const [project] = await db.insert(projects).values({
            workspaceId,
            createdBy: user.id,
            name: body.name.trim(),
            description: body.description,
            target: body.target,
            indication: body.indication,
            modality: body.modality,
            phase: body.phase ?? 'Discovery',
            program: body.program,
            color: body.color ?? 'bg-brand',
            tags: body.tags ?? [],
        }).returning();

        await db.insert(activityLogs).values({
            workspaceId,
            actorId: user.id,
            actionType: 'project_created',
            entityId: project.id,
            entityType: 'project',
            metadata: { projectName: project.name },
        });

        return created(project);
    } catch (err) {
        return apiError(err);
    }
}
