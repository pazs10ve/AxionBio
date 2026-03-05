import { db } from '@/lib/db';
import { notifications } from '@/src/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getSessionUser, ok, apiError } from '@/lib/api-utils';

// GET /api/notifications
export async function GET() {
    try {
        const { user } = await getSessionUser();

        const rows = await db.query.notifications.findMany({
            where: eq(notifications.userId, user.id),
            orderBy: [desc(notifications.createdAt)],
            limit: 30,
        });

        return ok({
            items: rows,
            unreadCount: rows.filter(n => !n.read).length,
        });
    } catch (err) {
        return apiError(err);
    }
}

// POST /api/notifications/read  — mark all notifications as read
// Body: { ids?: string[] }  — if omitted, marks all as read
export async function POST(req: Request) {
    try {
        const { user } = await getSessionUser();
        const { ids } = await req.json().catch(() => ({ ids: undefined })) as { ids?: string[] };

        if (ids && ids.length > 0) {
            // Mark specific IDs
            for (const id of ids) {
                await db.update(notifications)
                    .set({ read: true })
                    .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));
            }
        } else {
            // Mark all
            await db.update(notifications)
                .set({ read: true })
                .where(eq(notifications.userId, user.id));
        }

        return ok({ marked: true });
    } catch (err) {
        return apiError(err);
    }
}
