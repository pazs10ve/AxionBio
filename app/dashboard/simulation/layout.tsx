import { DashboardLayoutShell } from '@/components/layout/DashboardLayoutShell';

export default function SimulationLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayoutShell noPadding>{children}</DashboardLayoutShell>;
}
