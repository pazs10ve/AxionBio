'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Sparkles,
    Dna,
    FlaskConical,
    Microscope,
    Truck,
    CheckCircle2,
    Loader2,
    ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PipelineStep = {
    icon: typeof Dna;
    label: string;
    tool: string;
    metric: string;
    metricValue: string;
    color: string;
    bgColor: string;
    ringColor: string;
};

const STEPS: PipelineStep[] = [
    {
        icon: Dna,
        label: 'Structure Prediction',
        tool: 'AlphaFold3',
        metric: 'pLDDT',
        metricValue: '94.2',
        color: 'text-sky-600',
        bgColor: 'bg-sky-50',
        ringColor: 'ring-sky-200',
    },
    {
        icon: Sparkles,
        label: 'Generative Design',
        tool: 'RFdiffusion',
        metric: 'Sequences',
        metricValue: '500',
        color: 'text-violet-600',
        bgColor: 'bg-violet-50',
        ringColor: 'ring-violet-200',
    },
    {
        icon: Microscope,
        label: 'MD Simulation',
        tool: 'GROMACS',
        metric: 'ΔG',
        metricValue: '-12.4 kcal/mol',
        color: 'text-teal-600',
        bgColor: 'bg-teal-50',
        ringColor: 'ring-teal-200',
    },
    {
        icon: FlaskConical,
        label: 'Expression Scoring',
        tool: 'ESM-3',
        metric: 'Top Hits',
        metricValue: '20',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        ringColor: 'ring-amber-200',
    },
    {
        icon: Truck,
        label: 'Synthesis Order',
        tool: 'Twist Bioscience',
        metric: 'Sequences',
        metricValue: '3 ordered',
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
        ringColor: 'ring-rose-200',
    },
];

export function CopilotDemo() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [started, setStarted] = useState(false);
    const [activeStep, setActiveStep] = useState(-1);

    // Start animation when section enters viewport
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started) setStarted(true);
            },
            { threshold: 0.25 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [started]);

    // Reveal steps sequentially, then loop forever
    useEffect(() => {
        if (!started) return;
        let cancelled = false;

        const runCycle = () => {
            setActiveStep(-1);
            let current = 0;
            const tick = () => {
                if (cancelled) return;
                setActiveStep(current);
                current++;
                if (current < STEPS.length) {
                    // Next step after 800ms
                    setTimeout(tick, 800);
                } else {
                    // All done — show "Pipeline complete" for 2.5s then restart
                    setTimeout(() => {
                        if (!cancelled) runCycle();
                    }, 2500);
                }
            };
            // Short pause before first step so reset is visible
            setTimeout(tick, 400);
        };

        runCycle();
        return () => { cancelled = true; };
    }, [started]);

    return (
        <section
            ref={sectionRef}
            className="bg-white py-20 lg:py-28"
            aria-labelledby="copilot-demo-heading"
        >
            <div className="mx-auto max-w-7xl px-6 xl:px-8">
                {/* Header */}
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
                        Agentic AI Copilot
                    </p>
                    <h2
                        id="copilot-demo-heading"
                        className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
                    >
                        Describe what you need.{' '}
                        <span className="text-brand">The platform does the rest.</span>
                    </h2>
                    <p className="mt-4 text-lg text-slate-600">
                        One natural language prompt triggers an end-to-end pipeline, from structure
                        prediction all the way to a physical synthesis order.
                    </p>
                </div>

                {/* App-style UI mock */}
                <div className="mx-auto max-w-4xl">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                        {/* Window chrome */}
                        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3">
                            <span className="h-3 w-3 rounded-full bg-slate-200" />
                            <span className="h-3 w-3 rounded-full bg-slate-200" />
                            <span className="h-3 w-3 rounded-full bg-slate-200" />
                            <span className="ml-3 text-xs font-medium text-slate-400">
                                AxionBio Copilot
                            </span>
                        </div>

                        <div className="p-6 sm:p-8">
                            {/* Prompt bar */}
                            <div className="mb-8 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand">
                                    <Sparkles className="h-4 w-4 text-white" />
                                </div>
                                <p className="flex-1 text-sm text-slate-700">
                                    <span className="font-medium text-slate-900">
                                        &quot;Run AlphaFold on PDB 7OOO, design 500 binders, simulate top 20 with
                                        50ns MD, and order top 3 to Twist.&quot;
                                    </span>
                                </p>
                            </div>

                            {/* Pipeline visualization */}
                            <div className="space-y-3">
                                {STEPS.map((step, idx) => {
                                    const Icon = step.icon;
                                    const isActive = idx <= activeStep;
                                    const isCurrent = idx === activeStep && activeStep < STEPS.length - 1;
                                    const isDone = idx < activeStep || (idx === activeStep && activeStep === STEPS.length - 1);

                                    return (
                                        <div key={step.label} className="flex items-start gap-4">
                                            {/* Timeline connector */}
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={cn(
                                                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-2 transition-all duration-500',
                                                        isActive
                                                            ? `${step.bgColor} ${step.ringColor}`
                                                            : 'bg-slate-50 ring-slate-200',
                                                    )}
                                                >
                                                    {isDone ? (
                                                        <CheckCircle2 className={`h-5 w-5 ${step.color}`} />
                                                    ) : isCurrent ? (
                                                        <Loader2
                                                            className={`h-5 w-5 ${step.color} animate-spin`}
                                                        />
                                                    ) : (
                                                        <Icon
                                                            className={cn(
                                                                'h-5 w-5 transition-colors duration-500',
                                                                isActive ? step.color : 'text-slate-300',
                                                            )}
                                                        />
                                                    )}
                                                </div>
                                                {idx < STEPS.length - 1 && (
                                                    <div
                                                        className={cn(
                                                            'mt-1 h-4 w-0.5 rounded-full transition-colors duration-500',
                                                            idx < activeStep ? 'bg-slate-300' : 'bg-slate-100',
                                                        )}
                                                    />
                                                )}
                                            </div>

                                            {/* Step card */}
                                            <div
                                                className={cn(
                                                    'flex flex-1 items-center justify-between rounded-xl border px-4 py-3 transition-all duration-500',
                                                    isActive
                                                        ? 'border-slate-200 bg-white shadow-sm'
                                                        : 'border-transparent bg-slate-50/50',
                                                )}
                                            >
                                                <div>
                                                    <div
                                                        className={cn(
                                                            'text-sm font-semibold transition-colors duration-500',
                                                            isActive ? 'text-slate-900' : 'text-slate-400',
                                                        )}
                                                    >
                                                        {step.label}
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            'text-xs transition-colors duration-500',
                                                            isActive ? 'text-slate-500' : 'text-slate-300',
                                                        )}
                                                    >
                                                        {step.tool}
                                                    </div>
                                                </div>

                                                {isActive && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-medium text-slate-400">
                                                            {step.metric}
                                                        </span>
                                                        <span
                                                            className={cn(
                                                                'rounded-md px-2 py-0.5 text-xs font-semibold',
                                                                step.bgColor,
                                                                step.color,
                                                            )}
                                                        >
                                                            {step.metricValue}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Result summary — shows after all steps complete */}
                            {activeStep >= STEPS.length - 1 && (
                                <div className="mt-6 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-5 py-3.5 animate-fade-in-up">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        <div>
                                            <div className="text-sm font-semibold text-green-900">
                                                Pipeline complete: 3 sequences ordered
                                            </div>
                                            <div className="text-xs text-green-600">
                                                5 steps · 9m 44s wall time · Delivery: 5 business days
                                            </div>
                                        </div>
                                    </div>
                                    <button className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors">
                                        View Results
                                        <ArrowRight className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
