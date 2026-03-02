import Link from 'next/link';
import { ArrowRight, Dna, Check } from 'lucide-react';

export const metadata = {
    title: 'Get Started — AxionBio',
    description: 'Start your free 14-day trial of AxionBio, the enterprise Bio4AI operating system.',
};

const PLAN_FEATURES = [
    'AlphaFold3 & RFdiffusion access',
    'Up to 5 generative design jobs/month',
    'GROMACS MD simulation (10ns limit)',
    '100 GB multi-omics data lake',
    'Agentic AI Copilot (beta)',
    'Community support',
];

export default function SignUpPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 flex flex-col items-center text-center">
                    <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand">
                            <Dna className="h-5 w-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-bold text-slate-900">
                            Axion<span className="text-brand">Bio</span>
                        </span>
                    </Link>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                        Start your free trial
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        14 days free · No credit card required
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8">
                    {/* What's included */}
                    <div className="mb-6 rounded-xl bg-slate-50 border border-slate-200 p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Included in your trial
                        </p>
                        <ul className="space-y-1.5">
                            {PLAN_FEATURES.map((f) => (
                                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                                    <Check className="h-4 w-4 shrink-0 text-green-500" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Form */}
                    <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="first-name" className="block text-xs font-medium text-slate-700 mb-1.5">
                                    First name
                                </label>
                                <input
                                    id="first-name"
                                    type="text"
                                    autoComplete="given-name"
                                    placeholder="Ada"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                                />
                            </div>
                            <div>
                                <label htmlFor="last-name" className="block text-xs font-medium text-slate-700 mb-1.5">
                                    Last name
                                </label>
                                <input
                                    id="last-name"
                                    type="text"
                                    autoComplete="family-name"
                                    placeholder="Lovelace"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="work-email" className="block text-xs font-medium text-slate-700 mb-1.5">
                                Work email
                            </label>
                            <input
                                id="work-email"
                                type="email"
                                autoComplete="email"
                                placeholder="ada@biotech.com"
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="org" className="block text-xs font-medium text-slate-700 mb-1.5">
                                Organisation
                            </label>
                            <input
                                id="org"
                                type="text"
                                autoComplete="organization"
                                placeholder="Broad Institute"
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-medium text-slate-700 mb-1.5">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Min. 8 characters"
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
                            />
                        </div>

                        <button
                            type="submit"
                            id="signup-submit"
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                        >
                            Create free account
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>

                    <p className="mt-5 text-center text-xs text-slate-500">
                        By signing up you agree to our{' '}
                        <Link href="/terms" className="text-brand hover:underline">Terms</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="text-brand hover:underline">Privacy Policy</Link>.
                    </p>
                </div>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link href="/sign-in" className="font-semibold text-brand hover:underline">
                        Sign in
                    </Link>
                </p>

                <p className="mt-2 text-center text-sm text-slate-500">
                    Need enterprise / custom pricing?{' '}
                    <Link href="#demo" className="font-semibold text-brand hover:underline">
                        Talk to sales
                    </Link>
                </p>
            </div>
        </main>
    );
}
