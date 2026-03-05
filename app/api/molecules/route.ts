import { db } from '@/lib/db';
import { molecules } from '@/src/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getSessionUser, ok, created, apiError, ApiError } from '@/lib/api-utils';

// GET /api/molecules
// Query params: ?projectId=...&status=...&starred=true
export async function GET(req: Request) {
    try {
        const { user } = await getSessionUser();
        const workspaceId = user.memberships[0]?.workspace.id;
        if (!workspaceId) throw new ApiError(400, 'No workspace');

        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get('projectId');
        const status = searchParams.get('status');
        const starred = searchParams.get('starred');

        const conditions = [eq(molecules.workspaceId, workspaceId)];
        if (projectId) conditions.push(eq(molecules.projectId, projectId));
        if (status) conditions.push(eq(molecules.status, status));
        if (starred === 'true') conditions.push(eq(molecules.starred, true));

        const rows = await db.query.molecules.findMany({
            where: and(...conditions),
            orderBy: [desc(molecules.createdAt)],
            with: {
                project: { columns: { id: true, name: true } },
                sourceJob: { columns: { id: true, type: true } },
                creator: { columns: { name: true } },
            },
        });

        return ok(rows);
    } catch (err) {
        return apiError(err);
    }
}

// POST /api/molecules  — manually save a molecule (not from a job)
export async function POST(req: Request) {
    try {
        const { user } = await getSessionUser();
        const workspaceId = user.memberships[0]?.workspace.id;
        if (!workspaceId) throw new ApiError(400, 'No workspace');

        const body = await req.json() as {
            name: string;
            moleculeType: string;
            sequence?: string;
            pdbId?: string;
            projectId?: string;
            scores?: Record<string, unknown>;
            modality?: string;
            immunogenicity?: string;
            tags?: string[];
        };

        if (!body.name?.trim()) throw new ApiError(400, 'Name required');
        if (!body.moleculeType?.trim()) throw new ApiError(400, 'Molecule type required');

        const [mol] = await db.insert(molecules).values({
            workspaceId,
            createdBy: user.id,
            projectId: body.projectId ?? null,
            name: body.name.trim(),
            moleculeType: body.moleculeType,
            sequence: body.sequence ?? null,
            pdbId: body.pdbId ?? null,
            scores: body.scores ?? null,
            modality: body.modality ?? null,
            immunogenicity: body.immunogenicity ?? null,
            tags: body.tags ?? [],
            status: 'candidate',
            starred: false,
        }).returning();

        return created(mol);
    } catch (err) {
        return apiError(err);
    }
}
