import { DashboardLayoutShell } from '@/components/layout/DashboardLayoutShell';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
}
