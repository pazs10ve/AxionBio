import { Auth0Client } from '@auth0/nextjs-auth0/server';

/**
 * Auth0 v4 SDK client.
 *
 * Default routes provided by the middleware are:
 *   /auth/login     → initiates login
 *   /auth/logout    → logs the user out
 *   /auth/callback  → handles the OIDC callback
 *   /auth/profile   → returns the user profile (JSON)
 *
 * No custom route configuration is needed — the defaults match v4 conventions.
 * The middleware (middleware.ts) runs auth0.middleware() on every request
 * which sets up these routes automatically.
 */
export const auth0 = new Auth0Client();
