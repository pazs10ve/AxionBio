'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TESTIMONIALS = [
    {
        quote:
            "AxionBio collapsed what used to be a three-month wet-lab iteration cycle into four days of fully automated pipeline execution. We submitted six candidates to synthesis before our competitors had even completed their docking screens.",
        name: 'Dr. Sarah Chen',
        title: 'VP of Computational Biology',
        org: 'Series B TechBio',
        initials: 'SC',
        color: 'bg-violet-100 text-violet-700',
    },
    {
        quote:
            "The Agentic Copilot is genuinely the most impressive scientific software I have used in 15 years. It doesn't just run models; it reasons about which models to run and catches developability issues before we waste a synthesis budget.",
        name: 'Prof. Marcus Webb',
        title: 'Director, Structural Biology',
        org: 'Top-10 Research University',
        initials: 'MW',
        color: 'bg-blue-100 text-blue-700',
    },
    {
        quote:
            "We evaluated Tamarind, Insilico, and three internal tools before choosing AxionBio. Nothing else offered the combination of enterprise-grade data isolation, agentic orchestration, and direct CRO integration. It passed our SOC 2 audit on the first review.",
        name: 'Jia-Lin Park',
        title: 'CTO',
        org: 'Tier 2 Pharmaceutical Company',
        initials: 'JP',
        color: 'bg-teal-100 text-teal-700',
    },
];

export function Testimonials() {
    const [current, setCurrent] = useState(0);

    const prev = () => setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    const next = () => setCurrent((c) => (c + 1) % TESTIMONIALS.length);

    return (
        <section
            className="bg-white py-20 lg:py-28"
            aria-labelledby="testimonials-heading"
        >
            <div className="mx-auto max-w-7xl px-6 xl:px-8">
                {/* Header */}
                <div className="mx-auto mb-14 max-w-xl text-center">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
                        Customer Stories
                    </p>
                    <h2
                        id="testimonials-heading"
                        className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
                    >
                        Trusted by teams at the cutting edge
                    </h2>
                </div>

                {/* Desktop: 3 cards side by side */}
                <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
                    {TESTIMONIALS.map((t) => (
                        <TestimonialCard key={t.name} t={t} />
                    ))}
                </div>

                {/* Mobile/tablet: carousel */}
                <div className="lg:hidden">
                    <TestimonialCard t={TESTIMONIALS[current]} />
                    <div className="mt-6 flex items-center justify-center gap-4">
                        <button
                            onClick={prev}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-colors"
                            aria-label="Previous testimonial"
                        >
                            <ChevronLeft className="h-4 w-4 text-slate-600" />
                        </button>
                        <div className="flex gap-2" role="tablist" aria-label="Testimonial navigation">
                            {TESTIMONIALS.map((_, i) => (
                                <button
                                    key={i}
                                    role="tab"
                                    aria-selected={current === i}
                                    aria-label={`Testimonial ${i + 1}`}
                                    onClick={() => setCurrent(i)}
                                    className={`h-2 rounded-full transition-all duration-200 ${current === i ? 'bg-brand w-5' : 'bg-slate-300 w-2'
                                        }`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={next}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-colors"
                            aria-label="Next testimonial"
                        >
                            <ChevronRight className="h-4 w-4 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[number] }) {
    return (
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <Quote className="mb-4 h-6 w-6 text-brand/30" />
            <p className="flex-1 text-base leading-relaxed text-slate-700 italic">
                &ldquo;{t.quote}&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${t.color}`}
                    aria-hidden="true"
                >
                    {t.initials}
                </div>
                <div>
                    <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-500">
                        {t.title} · {t.org}
                    </div>
                </div>
            </div>
        </div>
    );
}
