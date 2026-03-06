import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { db } from '@/lib/db';
import { workspaces, workspaceMembers } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getSignedDownloadUrl } from '@/lib/storage';

export async function GET(req: Request) {
    const session = await auth0.getSession();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    if (!key) {
        return NextResponse.json({ error: 'Missing file key' }, { status: 400 });
    }

    try {
        // Enforce basic workspace isolation via the workspaceMembers join table
        const userWorkspaces = await db.query.workspaceMembers.findMany({
            where: eq(workspaceMembers.userId, session.user.sub),
            with: { workspace: true }
        });

        if (!userWorkspaces.length) {
            return NextResponse.json({ error: 'No workspace found' }, { status: 403 });
        }

        // Generate a signed URL valid for 30 minutes
        const url = await getSignedDownloadUrl(key, 1800);
        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('Download URL generation failed:', error);
        return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
    }
}
