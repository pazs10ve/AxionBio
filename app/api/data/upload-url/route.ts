import { NextResponse } from 'next/server';
import { getSessionUser, requireWorkspaceMember } from '@/lib/api-utils';
import { getSignedUploadUrl, storageKeys } from '@/lib/storage';

// ── GET PRE-SIGNED R2 URL FOR CLIENT UPLOADS ──────────────────────────────────
// POST /api/data/upload-url
export async function POST(req: Request) {
    try {
        const { user } = await getSessionUser();
        const body = await req.json();
        const { filename, contentType = 'application/octet-stream' } = body;

        if (!filename) {
            return NextResponse.json({ error: 'filename is required' }, { status: 400 });
        }

        // Ensure user is part of a workspace
        const workspaceId = user.memberships[0]?.workspaceId;
        if (!workspaceId) throw new Error('No workspace context found');

        await requireWorkspaceMember(user.id, workspaceId);

        // Generate a unique location in the workspace's R2 prefix
        const datasetId = `ds_${Date.now()}`;
        const key = storageKeys.dataset(workspaceId, datasetId, filename.replace(/[^a-zA-Z0-9.-]/g, '_'));

        // Generate pre-signed URL from R2
        const uploadUrl = await getSignedUploadUrl(key, contentType);

        return NextResponse.json({
            data: {
                uploadUrl,
                key
            }
        });
    } catch (error: any) {
        if (error.status) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error('[API_DATA_UPLOAD_URL]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
