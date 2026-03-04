import { DashboardLayoutShell } from '@/components/layout/DashboardLayoutShell';

export default function MoleculesLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayoutShell noPadding>{children}</DashboardLayoutShell>;
}
