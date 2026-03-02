import Link from 'next/link';
import { Dna } from 'lucide-react';

const FOOTER_LINKS = {
    Product: [
        { label: 'Agentic Copilot', href: '#copilot' },
        { label: 'Generative Engine', href: '#engine' },
        { label: 'Simulation Layer', href: '#simulation' },
        { label: 'Lab Bridge', href: '#lab' },
        { label: 'Data Lake', href: '#data' },
        { label: 'Pricing', href: '#pricing' },
    ],
    Solutions: [
        { label: 'Tier 1 Pharma', href: '#pharma' },
        { label: 'TechBio Startups', href: '#techbio' },
        { label: 'Research Institutes', href: '#academic' },
    ],
    Company: [
        { label: 'About', href: '#about' },
        { label: 'Careers', href: '#careers' },
        { label: 'Blog', href: '#blog' },
        { label: 'Contact', href: '#contact' },
    ],
    Resources: [
        { label: 'Documentation', href: '/docs' },
        { label: 'API Reference', href: '/docs/api' },
        { label: 'Status', href: '#status' },
        { label: 'Changelog', href: '#changelog' },
    ],
    Legal: [
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Terms of Service', href: '#terms' },
        { label: 'Security', href: '#security' },
        { label: 'DPA', href: '#dpa' },
    ],
};

const COMPLIANCE_BADGES = ['SOC 2 Type II', 'HIPAA', 'GDPR', 'ISO 27001'];

export function Footer() {
    return (
        <footer className="bg-slate-950" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">Footer</h2>

            <div className="mx-auto max-w-7xl px-6 xl:px-8 py-16">
                {/* Top row: logo + links */}
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
                    {/* Brand column */}
                    <div className="col-span-2 sm:col-span-3 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5" aria-label="AxionBio home">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
                                <Dna className="h-4 w-4 text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-base font-bold text-white">
                                Axion<span className="text-brand">Bio</span>
                            </span>
                        </Link>
                        <p className="mt-4 text-sm leading-relaxed text-slate-400 max-w-xs">
                            The definitive enterprise Bio4AI operating system for drug discovery and protein
                            engineering.
                        </p>
                    </div>

                    {/* Link columns */}
                    {Object.entries(FOOTER_LINKS).map(([group, links]) => (
                        <div key={group}>
                            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                                {group}
                            </h3>
                            <ul className="space-y-2.5" role="list">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-slate-400 hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="mt-12 border-t border-slate-800 pt-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Copyright */}
                        <p className="text-xs text-slate-500">
                            © {new Date().getFullYear()} AxionBio, Inc. All rights reserved.
                        </p>

                        {/* Compliance badges */}
                        <div className="flex flex-wrap gap-2">
                            {COMPLIANCE_BADGES.map((badge) => (
                                <span
                                    key={badge}
                                    className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400"
                                >
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
