import { auth0 } from '@/lib/auth0';
import { db } from '@/lib/db';
import { users } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// ── Custom error class ────────────────────────────────────────────────────────

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

// ── Session + user resolver ───────────────────────────────────────────────────

/**
 * Resolves the Auth0 session and looks up the corresponding DB user row.
 * Throws ApiError(401) if not authenticated, ApiError(403) if user not synced yet.
 */
export async function getSessionUser() {
    const session = await auth0.getSession();
    if (!session) throw new ApiError(401, 'Not authenticated');

    const user = await db.query.users.findFirst({
        where: eq(users.auth0Id, session.user.sub),
        with: {
            memberships: { with: { workspace: true } },
        },
    });

    if (!user) throw new ApiError(403, 'User not synced — please log out and log in again');
    return { session, user };
}

// ── Standard API responses ────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200) {
    return NextResponse.json({ ok: true, data }, { status });
}

export function created<T>(data: T) {
    return ok(data, 201);
}

export function apiError(err: unknown) {
    if (err instanceof ApiError) {
        return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error('[API error]', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
}

// ── Route handler wrapper ─────────────────────────────────────────────────────

type Handler = (req: Request, ctx: { params: Record<string, string> }) => Promise<Response>;

/**
 * Wraps a route handler with automatic error handling.
 * Usage: export const GET = withErrorHandling(async (req, ctx) => { ... })
 */
export function withErrorHandling(handler: Handler): Handler {
    return async (req, ctx) => {
        try {
            return await handler(req, ctx);
        } catch (err) {
            return apiError(err);
        }
    };
}

// ── Workspace access check ────────────────────────────────────────────────────

/**
 * Verifies the current user is a member of the given workspace.
 * Returns the membership record.
 */
export async function requireWorkspaceMember(userId: string, workspaceId: string) {
    const { workspaceMembers } = await import('@/src/db/schema');
    const { and } = await import('drizzle-orm');

    const membership = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.userId, userId),
            eq(workspaceMembers.workspaceId, workspaceId),
        ),
    });

    if (!membership) throw new ApiError(403, 'Not a member of this workspace');
    return membership;
}

// ── Sleep helper ──────────────────────────────────────────────────────────────

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
