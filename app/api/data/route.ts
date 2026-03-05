import { NextResponse } from 'next/server';
import { getSessionUser, requireWorkspaceMember } from '@/lib/api-utils';
import { db } from '@/src/db';
import { datasets, activityLogs } from '@/src/db/schema';
import { eq, desc } from 'drizzle-orm';

// ── LIST DATASETS ─────────────────────────────────────────────────────────────
// GET /api/data
export async function GET(req: Request) {
    try {
        const { user } = await getSessionUser();
        const workspaceId = user.memberships[0]?.workspaceId;
        if (!workspaceId) throw new Error('No workspace found');
        await requireWorkspaceMember(user.id, workspaceId);

        const results = await db.query.datasets.findMany({
            where: eq(datasets.workspaceId, workspaceId),
            orderBy: [desc(datasets.createdAt)],
            with: {
                uploader: {
                    columns: { name: true, avatarUrl: true }
                }
            }
        });

        return NextResponse.json({ data: results });
    } catch (error: any) {
        if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

// ── REGISTER A NEWLY UPLOADED DATASET ─────────────────────────────────────────
// POST /api/data
export async function POST(req: Request) {
    try {
        const { user } = await getSessionUser();
        const workspaceId = user.memberships[0]?.workspaceId;
        if (!workspaceId) throw new Error('No workspace found');
        await requireWorkspaceMember(user.id, workspaceId);

        const body = await req.json();
        const { name, fileType, sizeBytes, r2Key } = body;

        if (!name || !fileType || sizeBytes === undefined || !r2Key) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const [dataset] = await db
            .insert(datasets)
            .values({
                workspaceId,
                uploadedBy: user.id,
                name,
                fileType,
                sizeBytes,
                r2Key,
            })
            .returning();

        // Log the activity
        await db.insert(activityLogs).values({
            workspaceId,
            actorId: user.id,
            actionType: 'data_ingested',
            entityId: dataset.id,
            entityType: 'dataset',
            metadata: { fileName: dataset.name, size: dataset.sizeBytes },
        });

        return NextResponse.json({ data: dataset });
    } catch (error: any) {
        if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
        console.error('[API_DATA_POST]', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
