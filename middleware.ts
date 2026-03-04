import type { NextRequest } from 'next/server';
import { auth0 } from './lib/auth0';

/**
 * Auth0 v4 middleware.
 *
 * Running auth0.middleware() on every request lets the SDK:
 * - Handle /auth/login, /auth/logout, /auth/callback, /auth/profile routes
 * - Set and refresh session cookies transparently
 * - Protect routes configured below
 */
export async function middleware(request: NextRequest) {
    return await auth0.middleware(request);
}

export const config = {
    matcher: [
        /*
         * Match all paths except Next.js internals and static files.
         * The SDK will guard /dashboard routes if no valid session exists.
         */
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icon.svg).*)',
    ],
};
