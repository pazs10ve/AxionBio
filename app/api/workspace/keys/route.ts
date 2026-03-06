import { db } from '@/lib/db';
import { apiKeys } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSessionUser, ok, apiError, created } from '@/lib/api-utils';
import { randomBytes, createHash } from 'node:crypto';

// Helper to generate a random key and its hash
function generateKey(prefix = 'ax_') {
    const randomKey = randomBytes(24).toString('hex');
    const key = `${prefix}${randomKey}`;
    const hash = createHash('sha256').update(key).digest('hex');
    return { key, hash };
}

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

        const keys = await db.query.apiKeys.findMany({
            where: eq(apiKeys.workspaceId, workspaceId),
            orderBy: (t, { desc }) => [desc(t.createdAt)],
        });

        return ok(keys.map(k => ({
            id: k.id,
            name: k.name,
            prefix: k.prefix,
            scopes: k.scopes,
            lastUsedAt: k.lastUsedAt,
            createdAt: k.createdAt,
        })));
    } catch (err) {
        return apiError(err);
    }
}

export async function POST(req: Request) {
    try {
        const { user } = await getSessionUser();
        const body = await req.json();
        const { workspaceId, name } = body;

        if (!workspaceId || !name) {
            return Response.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
        }

        const isMember = user.memberships.some(m => m.workspace.id === workspaceId && m.role === 'admin');
        if (!isMember) return Response.json({ ok: false, error: 'Admin role required' }, { status: 403 });

        const { key, hash } = generateKey();

        const [newKey] = await db.insert(apiKeys).values({
            workspaceId,
            userId: user.id,
            name,
            prefix: key.split('_')[0] + '_',
            keyHash: hash,
            scopes: ['read', 'write'],
        }).returning();

        return created({
            ...newKey,
            cleartextKey: key, // Return ONLY ONCE
        });
    } catch (err) {
        return apiError(err);
    }
}

export async function DELETE(req: Request) {
    try {
        const { user } = await getSessionUser();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return Response.json({ ok: false, error: 'Missing key id' }, { status: 400 });

        const key = await db.query.apiKeys.findFirst({
            where: eq(apiKeys.id, id),
        });

        if (!key) return Response.json({ ok: false, error: 'Not found' }, { status: 404 });

        const isMember = user.memberships.some(m => m.workspace.id === key.workspaceId && m.role === 'admin');
        if (!isMember) return Response.json({ ok: false, error: 'Admin role required' }, { status: 403 });

        await db.delete(apiKeys).where(eq(apiKeys.id, id));

        return ok({ deleted: true });
    } catch (err) {
        return apiError(err);
    }
}
