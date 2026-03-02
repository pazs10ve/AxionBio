import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';

const STATS = [
    { icon: Zap, value: '10×', label: 'Faster pipeline iterations' },
    { icon: Users, value: '500+', label: 'Research teams worldwide' },
    { icon: ShieldCheck, value: 'SOC 2', label: 'Type II certified' },
];

export function CTABanner() {
    return (
        <section
            className="relative overflow-hidden bg-slate-900 py-24 lg:py-32"
            aria-labelledby="cta-heading"
        >
            {/* Decorative gradient orbs */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full opacity-20"
                style={{
                    background:
                        'radial-gradient(ellipse at center, #3b82f6 0%, #6366f1 40%, transparent 70%)',
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 translate-x-1/3 translate-y-1/3 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }}
            />

            {/* Subtle dot-grid texture */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />

            <div className="relative mx-auto max-w-7xl px-6 xl:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    {/* Eyebrow */}
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                        <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">
                            Now in Early Access
                        </span>
                    </div>

                    <h2
                        id="cta-heading"
                        className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
                    >
                        Ready to accelerate
                        <br />
                        <span
                            className="bg-clip-text text-transparent"
                            style={{
                                backgroundImage: 'linear-gradient(90deg, #60a5fa 0%, #818cf8 50%, #38bdf8 100%)',
                            }}
                        >
                            your discovery pipeline?
                        </span>
                    </h2>

                    <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
                        Join forward-thinking biopharma teams already running end-to-end drug discovery on
                        AxionBio. Setup takes minutes. Your first agentic run, hours.
                    </p>

                    {/* CTAs */}
                    <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
                        <Link
                            href="#demo"
                            id="cta-banner-demo"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-brand-hover transition-all duration-200 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                        >
                            Request a Demo
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/docs"
                            id="cta-banner-docs"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/25 transition-all duration-200"
                        >
                            Explore the Docs
                        </Link>
                    </div>

                    {/* Trust line */}
                    <p className="mt-5 text-xs text-slate-500">
                        No credit card required · 14-day free trial · Cancel anytime
                    </p>
                </div>

                {/* Stats row */}
                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                    {STATS.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.value}
                                className="flex flex-col items-center gap-2 bg-slate-900/80 px-6 py-6 text-center"
                            >
                                <Icon className="h-5 w-5 text-brand" strokeWidth={2} />
                                <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                                <div className="text-xs text-slate-400">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
