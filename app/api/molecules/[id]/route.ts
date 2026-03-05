import { db } from '@/lib/db';
import { molecules, activityLogs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionUser, ok, apiError, ApiError } from '@/lib/api-utils';

// GET /api/molecules/[id]
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user } = await getSessionUser();

        const mol = await db.query.molecules.findFirst({
            where: eq(molecules.id, id),
            with: {
                project: { columns: { id: true, name: true } },
                sourceJob: { columns: { id: true, type: true, name: true } },
                creator: { columns: { name: true, avatarUrl: true } },
            },
        });

        if (!mol) throw new ApiError(404, 'Molecule not found');

        const hasAccess = user.memberships.some(m => m.workspace.id === mol.workspaceId);
        if (!hasAccess) throw new ApiError(403, 'Access denied');

        return ok(mol);
    } catch (err) {
        return apiError(err);
    }
}

// PATCH /api/molecules/[id]
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user } = await getSessionUser();

        const existing = await db.query.molecules.findFirst({
            where: eq(molecules.id, id),
            columns: { workspaceId: true },
        });
        if (!existing) throw new ApiError(404, 'Molecule not found');

        const hasAccess = user.memberships.some(m => m.workspace.id === existing.workspaceId);
        if (!hasAccess) throw new ApiError(403, 'Access denied');

        const body = await req.json() as {
            starred?: boolean;
            status?: string;
            tags?: string[];
            name?: string;
            immunogenicity?: string;
        };

        const [updated] = await db.update(molecules)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(molecules.id, id))
            .returning();

        return ok(updated);
    } catch (err) {
        return apiError(err);
    }
}

// DELETE /api/molecules/[id]  — archive (soft delete)
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user } = await getSessionUser();
        const workspaceId = user.memberships[0]?.workspace.id;
        if (!workspaceId) throw new ApiError(400, 'No workspace');

        const existing = await db.query.molecules.findFirst({
            where: eq(molecules.id, id),
            columns: { workspaceId: true, name: true },
        });
        if (!existing) throw new ApiError(404, 'Molecule not found');
        if (existing.workspaceId !== workspaceId) throw new ApiError(403, 'Access denied');

        const [archived] = await db.update(molecules)
            .set({ status: 'archived', updatedAt: new Date() })
            .where(eq(molecules.id, id))
            .returning();

        await db.insert(activityLogs).values({
            workspaceId,
            actorId: user.id,
            actionType: 'molecule_archived',
            entityId: id,
            entityType: 'molecule',
            metadata: { moleculeName: existing.name },
        });

        return ok({ archived: true });
    } catch (err) {
        return apiError(err);
    }
}
