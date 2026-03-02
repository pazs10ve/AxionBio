import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Mail, Dna, ArrowRight } from 'lucide-react';

export default async function VerifyEmailPage() {
    const session = await auth0.getSession();

    if (!session) {
        redirect('/api/auth/login');
    }

    if (session.user.email_verified) {
        redirect('/dashboard');
    }

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 mb-6">
                    <Mail className="h-8 w-8 text-brand" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your inbox</h1>

                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                    We've sent a verification link to <br />
                    <span className="font-semibold text-slate-900">{session.user.email}</span>. <br />
                    Please click the link to verify your account and access the dashboard.
                </p>

                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 mb-8">
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Already clicked the link?</h3>
                    <p className="text-xs text-slate-500 mb-4">
                        If you have verified your email, click the button below to refresh your session.
                    </p>
                    <Link
                        href="/api/auth/login?returnTo=/dashboard"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    >
                        I've verified my email
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col space-y-3">
                    <Link
                        href="/api/auth/logout"
                        className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        Sign out and try another account
                    </Link>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 opacity-50">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-brand">
                    <Dna className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-bold tracking-tight text-slate-900">
                    Axion<span className="text-brand">Bio</span>
                </span>
            </div>
        </main>
    );
}
