import { moleculeAnnotations } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSessionUser, ok, apiError, created } from '@/lib/api-utils';
import { db } from '@/src/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const moleculeId = searchParams.get('moleculeId');

        if (!moleculeId) throw new Error('Molecule ID required');

        const { user } = await getSessionUser();
        // Permission check: technically we should check if they can see the molecule
        // For now we'll assume they can if they are authenticated and we add a workspace check if needed

        const annotations = await db.query.moleculeAnnotations.findMany({
            where: eq(moleculeAnnotations.moleculeId, moleculeId as any),
            with: {
                user: {
                    columns: { id: true, name: true, avatarUrl: true }
                }
            }
        });

        return ok(annotations);
    } catch (err: any) {
        return apiError(err);
    }
}

export async function POST(req: Request) {
    try {
        const { user } = await getSessionUser();
        const { moleculeId, label, description, color, selection } = await req.json();

        if (!moleculeId || !label) {
            throw new Error('moleculeId and label are required');
        }

        const [newAnnotation] = await db.insert(moleculeAnnotations).values({
            moleculeId: moleculeId as any,
            userId: user.id,
            label,
            description,
            color,
            selection,
        }).returning();

        return created(newAnnotation);
    } catch (err: any) {
        return apiError(err);
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) throw new Error('Annotation ID required');

        const { user } = await getSessionUser();

        // Ensure the user owns the annotation or is an admin
        await db.delete(moleculeAnnotations).where(
            and(
                eq(moleculeAnnotations.id, id as any),
                eq(moleculeAnnotations.userId, user.id)
            )
        );

        return ok({ success: true });
    } catch (err: any) {
        return apiError(err);
    }
}
