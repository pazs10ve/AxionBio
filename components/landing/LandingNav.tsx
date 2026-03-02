'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, Dna } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
    {
        label: 'Product',
        href: '#product',
        dropdown: [
            { label: 'Agentic AI Copilot', href: '#copilot', desc: 'Natural language workflow orchestration' },
            { label: 'Generative Engine', href: '#engine', desc: 'De novo protein and molecule design' },
            { label: 'Simulation Layer', href: '#simulation', desc: 'MD, FEP, and developability scoring' },
            { label: 'Lab Bridge', href: '#lab', desc: 'One-click synthesis and assay ordering' },
            { label: 'Multi-Omics Data Lake', href: '#data', desc: 'Secure enterprise data integration' },
        ],
    },
    {
        label: 'Solutions',
        href: '#solutions',
        dropdown: [
            { label: 'Tier 1 Pharma', href: '#pharma', desc: 'Scalable OS for legacy pipeline modernization' },
            { label: 'TechBio Startups', href: '#techbio', desc: 'Cloud-native infrastructure without the overhead' },
            { label: 'Research Institutes', href: '#academic', desc: 'Enterprise tools for academic mega-labs' },
        ],
    },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Docs', href: '/docs' },
    { label: 'Company', href: '#company' },
];

export function LandingNav() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // Track scroll position to apply frosted glass
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 72);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile drawer on route changes / resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setMobileOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    return (
        <>
            <header
                className={cn(
                    'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
                    scrolled
                        ? 'bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-sm'
                        : 'bg-transparent',
                )}
            >
                <nav
                    className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 xl:px-8"
                    aria-label="Main navigation"
                >
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 shrink-0"
                        aria-label="AxionBio home"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
                            <Dna className="h-5 w-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span
                            className={cn(
                                'text-[17px] font-bold tracking-tight transition-colors duration-200',
                                scrolled ? 'text-slate-900' : 'text-slate-900',
                            )}
                        >
                            Axion<span className="text-brand">Bio</span>
                        </span>
                    </Link>

                    {/* Desktop nav links */}
                    <ul className="hidden lg:flex items-center gap-1" role="list">
                        {NAV_LINKS.map((link) => (
                            <li key={link.label} className="relative">
                                {link.dropdown ? (
                                    <div
                                        onMouseEnter={() => setOpenDropdown(link.label)}
                                        onMouseLeave={() => setOpenDropdown(null)}
                                    >
                                        <button
                                            className={cn(
                                                'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                                'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70',
                                            )}
                                            aria-expanded={openDropdown === link.label}
                                            aria-haspopup="true"
                                        >
                                            {link.label}
                                            <ChevronDown
                                                className={cn(
                                                    'h-3.5 w-3.5 text-slate-400 transition-transform duration-150',
                                                    openDropdown === link.label && 'rotate-180',
                                                )}
                                            />
                                        </button>

                                        {/* Dropdown panel */}
                                        <div
                                            className={cn(
                                                'absolute left-0 top-full pt-2 transition-all duration-150',
                                                openDropdown === link.label
                                                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                                                    : 'opacity-0 -translate-y-1 pointer-events-none',
                                            )}
                                            role="menu"
                                        >
                                            <div className="w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-md">
                                                {link.dropdown.map((item) => (
                                                    <Link
                                                        key={item.label}
                                                        href={item.href}
                                                        role="menuitem"
                                                        className="block rounded-lg px-3 py-2.5 hover:bg-slate-50 transition-colors group"
                                                    >
                                                        <div className="text-sm font-medium text-slate-900 group-hover:text-brand transition-colors">
                                                            {item.label}
                                                        </div>
                                                        <div className="mt-0.5 text-xs text-slate-500">
                                                            {item.desc}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        href={link.href}
                                        className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Desktop CTA buttons */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Link
                            href="/sign-in"
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2 rounded-md hover:bg-slate-100/70"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/sign-up"
                            id="nav-signup"
                            className="inline-flex items-center justify-center rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-light transition-colors"
                        >
                            Get Started
                        </Link>
                        <Link
                            href="#demo"
                            id="nav-demo"
                            className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                        >
                            Request a Demo
                        </Link>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="lg:hidden flex items-center justify-center rounded-md p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-drawer"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </nav>
            </header>

            {/* Mobile drawer */}
            <>
                {/* Overlay */}
                <div
                    className={cn(
                        'fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity duration-200',
                        mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
                    )}
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />

                {/* Drawer panel */}
                <div
                    id="mobile-drawer"
                    role="dialog"
                    aria-label="Mobile navigation"
                    aria-modal="true"
                    className={cn(
                        'fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-xl lg:hidden',
                        'flex flex-col transition-transform duration-200 ease-out',
                        mobileOpen ? 'translate-x-0' : 'translate-x-full',
                    )}
                >
                    {/* Drawer header */}
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2.5"
                            onClick={() => setMobileOpen(false)}
                        >
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand">
                                <Dna className="h-4 w-4 text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-base font-bold text-slate-900">
                                Axion<span className="text-brand">Bio</span>
                            </span>
                        </Link>
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="rounded-md p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            aria-label="Close menu"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Drawer links */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                        <ul className="space-y-1" role="list">
                            {NAV_LINKS.map((link) => (
                                <li key={link.label}>
                                    {link.dropdown ? (
                                        <div>
                                            <button
                                                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                                onClick={() =>
                                                    setOpenDropdown(
                                                        openDropdown === link.label ? null : link.label,
                                                    )
                                                }
                                                aria-expanded={openDropdown === link.label}
                                            >
                                                {link.label}
                                                <ChevronDown
                                                    className={cn(
                                                        'h-4 w-4 text-slate-400 transition-transform duration-150',
                                                        openDropdown === link.label && 'rotate-180',
                                                    )}
                                                />
                                            </button>
                                            {openDropdown === link.label && (
                                                <ul className="ml-3 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
                                                    {link.dropdown.map((item) => (
                                                        <li key={item.label}>
                                                            <Link
                                                                href={item.href}
                                                                className="block rounded-md px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                                                                onClick={() => setMobileOpen(false)}
                                                            >
                                                                {item.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ) : (
                                        <Link
                                            href={link.href}
                                            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            {link.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Drawer CTAs */}
                    <div className="border-t border-slate-200 px-4 py-4 space-y-3">
                        <Link
                            href="/sign-in"
                            className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/sign-up"
                            className="block w-full rounded-lg border border-brand px-4 py-2.5 text-center text-sm font-semibold text-brand hover:bg-brand-light transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            Get Started
                        </Link>
                        <Link
                            href="#demo"
                            className="block w-full rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-hover transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            Request a Demo
                        </Link>
                    </div>
                </div>
            </>
        </>
    );
}
