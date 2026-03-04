import { DashboardLayoutShell } from '@/components/layout/DashboardLayoutShell';

export default function DataLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayoutShell noPadding>{children}</DashboardLayoutShell>;
}
