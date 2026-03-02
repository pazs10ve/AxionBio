import Link from 'next/link';
import { Check } from 'lucide-react';

const TIERS = [
    {
        name: 'Researcher',
        tagline: 'For individual scientists and small labs',
        price: '$299',
        period: '/month',
        cta: 'Start Free Trial',
        ctaHref: '#trial',
        highlight: false,
        features: [
            '5 generative design jobs/month',
            'AlphaFold3 & ESMFold access',
            '10ns MD simulation limit',
            '100 GB data lake storage',
            'Community support',
        ],
    },
    {
        name: 'Team',
        tagline: 'For growing biotech teams',
        price: '$1,299',
        period: '/month',
        cta: 'Start Free Trial',
        ctaHref: '#trial',
        highlight: true,
        badge: 'Most Popular',
        features: [
            'Unlimited generative design jobs',
            'Full model suite incl. RFdiffusion',
            '500ns MD + FEP simulations',
            '5 TB data lake with Snowflake connector',
            'Agentic Copilot full access',
            'Lab Bridge API (Twist, IDT)',
            'SSO / SAML 2.0',
            'Priority support (4h SLA)',
        ],
    },
    {
        name: 'Enterprise',
        tagline: 'For Tier 1 pharma and large institutes',
        price: null,
        period: null,
        cta: 'Contact Sales',
        ctaHref: '#demo',
        highlight: false,
        features: [
            'Everything in Team',
            'Dedicated single-tenant VPC deployment',
            'Custom model fine-tuning on proprietary data',
            'Unlimited compute with GPU auto-scaling',
            'Cloud Lab orchestration (Emerald, Strateos)',
            'SOC 2 Type II, HIPAA, GDPR compliance',
            'Dedicated customer success manager',
            '99.99% SLA uptime guarantee',
        ],
    },
];

export function PricingTeaser() {
    return (
        <section
            className="bg-slate-50 py-20 lg:py-28"
            aria-labelledby="pricing-heading"
        >
            <div className="mx-auto max-w-7xl px-6 xl:px-8">
                {/* Header */}
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
                        Pricing
                    </p>
                    <h2
                        id="pricing-heading"
                        className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
                    >
                        Start small. Scale to petaFLOP.
                    </h2>
                    <p className="mt-4 text-lg text-slate-600">
                        All plans include a 14-day free trial. No credit card required.
                    </p>
                </div>

                {/* Tier cards */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {TIERS.map((tier) => (
                        <div
                            key={tier.name}
                            className={`relative flex flex-col rounded-2xl border p-8 shadow-sm ${tier.highlight
                                    ? 'border-brand border-2 bg-white shadow-md'
                                    : 'border-slate-200 bg-white'
                                }`}
                        >
                            {/* Popular badge */}
                            {tier.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center rounded-full bg-brand px-4 py-1 text-xs font-semibold text-white shadow">
                                        {tier.badge}
                                    </span>
                                </div>
                            )}

                            {/* Tier header */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                                <p className="mt-1 text-sm text-slate-500">{tier.tagline}</p>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                {tier.price ? (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-extrabold text-slate-900">{tier.price}</span>
                                        <span className="text-sm text-slate-500">{tier.period}</span>
                                    </div>
                                ) : (
                                    <div className="text-2xl font-bold text-slate-900">Custom pricing</div>
                                )}
                            </div>

                            {/* CTA */}
                            <Link
                                href={tier.ctaHref}
                                className={`mb-8 block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors ${tier.highlight
                                        ? 'bg-brand text-white hover:bg-brand-hover'
                                        : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                {tier.cta}
                            </Link>

                            {/* Feature list */}
                            <ul className="space-y-2.5" role="list">
                                {tier.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2.5">
                                        <Check
                                            className={`mt-0.5 h-4 w-4 shrink-0 ${tier.highlight ? 'text-brand' : 'text-success'}`}
                                            strokeWidth={2.5}
                                            aria-hidden="true"
                                        />
                                        <span className="text-sm text-slate-600">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Compare all link */}
                <div className="mt-8 text-center">
                    <Link
                        href="#pricing-full"
                        className="text-sm font-medium text-brand hover:text-brand-hover hover:underline underline-offset-4 transition-colors"
                    >
                        Compare all features →
                    </Link>
                </div>
            </div>
        </section>
    );
}
