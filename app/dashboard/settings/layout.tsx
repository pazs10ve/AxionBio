import { DashboardLayoutShell } from '@/components/layout/DashboardLayoutShell';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayoutShell noPadding>{children}</DashboardLayoutShell>;
}
