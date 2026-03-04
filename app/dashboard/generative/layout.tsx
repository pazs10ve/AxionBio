import { DashboardLayoutShell } from '@/components/layout/DashboardLayoutShell';

/**
 * Shared layout for the /dashboard/generative/* sub-routes.
 * Wraps children in the app shell so each sub-page doesn't need to import it.
 */
export default function GenerativeLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayoutShell noPadding>{children}</DashboardLayoutShell>;
}
