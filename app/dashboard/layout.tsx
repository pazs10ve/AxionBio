import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { ToastProvider } from '@/components/ui/toast';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth0.getSession();

    if (!session) {
        redirect('/auth/login?returnTo=/dashboard');
    }

    if (!session.user.email_verified) {
        redirect('/verify-email');
    }

    return <ToastProvider>{children}</ToastProvider>;
}
