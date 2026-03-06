import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { db } from '@/lib/db';
import { labOrders, workspaceMembers } from '@/src/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET: List lab orders for the user's active workspaces
export async function GET(req: Request) {
    const session = await auth0.getSession();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

        const workspaceId = userWorkspaces[0].workspaceId; // Simplification: assume first active workspace for now

        const orders = await db.query.labOrders.findMany({
            where: eq(labOrders.workspaceId, workspaceId),
            orderBy: [desc(labOrders.createdAt)],
            with: { orderer: { columns: { name: true, avatarUrl: true } } }
        });

        return NextResponse.json(orders);
    } catch (error: any) {
        console.error('Failed to fetch lab orders:', error);
        return NextResponse.json({ error: 'Failed to fetch tracking data' }, { status: 500 });
    }
}

// POST: Create a new synthesis / assay order
export async function POST(req: Request) {
    const session = await auth0.getSession();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, vendor, type, trackingId, estimatedDeliveryDate, projectId, metadata } = await req.json();

    try {
        const userWorkspaces = await db.query.workspaceMembers.findMany({
            where: eq(workspaceMembers.userId, session.user.sub),
        });

        if (!userWorkspaces.length) {
            return NextResponse.json({ error: 'No workspace found' }, { status: 403 });
        }

        const workspaceId = userWorkspaces[0].workspaceId;

        const newOrder = await db.insert(labOrders).values({
            workspaceId,
            projectId,
            orderedBy: userWorkspaces[0].userId,
            title,
            vendor,
            type,
            status: 'submitted', // initial status
            trackingId,
            metadata,
            estimatedDeliveryDate: new Date(estimatedDeliveryDate),
        }).returning();

        return NextResponse.json(newOrder[0]);
    } catch (error: any) {
        console.error('Failed to create lab order:', error);
        return NextResponse.json({ error: 'Failed to create synthesis order' }, { status: 500 });
    }
}
