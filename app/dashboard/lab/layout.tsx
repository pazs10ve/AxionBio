import { DashboardLayoutShell } from '@/components/layout/DashboardLayoutShell';

export default function LabLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayoutShell noPadding>{children}</DashboardLayoutShell>;
}
