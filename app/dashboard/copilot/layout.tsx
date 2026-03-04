import { DashboardLayoutShell } from '@/components/layout/DashboardLayoutShell';

export default function CopilotLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayoutShell noPadding>{children}</DashboardLayoutShell>;
}
