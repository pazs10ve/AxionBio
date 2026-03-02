'use client';

import { useState } from 'react';
import {
    BrainCircuit,
    Dna,
    Microscope,
    Database,
    FlaskConical,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PILLARS = [
    {
        id: 'copilot',
        icon: BrainCircuit,
        label: 'Agentic AI Copilot',
        subtitle: 'The Brain',
        description:
            'Command the entire platform in natural language. The Copilot parses your intent into reproducible computational graphs, selecting the right models, chaining simulations, and routing results automatically. No more manual pipeline assembly.',
        color: 'text-violet-600',
        bg: 'bg-violet-50',
        activeBorder: 'border-violet-400',
        visual: <CopilotVisual />,
    },
    {
        id: 'engine',
        icon: Dna,
        label: 'Generative Design Engine',
        subtitle: 'The Engine',
        description:
            'De novo protein and molecule design at scale. Access ESM-3, AlphaFold3, RFdiffusion, and specialized verticals for PROTACs, CRISPR systems, and spatial multi-omics, all within a unified hub.',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        activeBorder: 'border-blue-400',
        visual: <EngineVisual />,
    },
    {
        id: 'simulation',
        icon: Microscope,
        label: 'Simulation & Validation',
        subtitle: 'The Validator',
        description:
            'Go beyond static structure prediction. GPU-accelerated Molecular Dynamics (GROMACS, OpenMM), Free Energy Perturbation, and developability scoring prove dynamic stability before you spend a dollar on synthesis.',
        color: 'text-teal-600',
        bg: 'bg-teal-50',
        activeBorder: 'border-teal-400',
        visual: <SimulationVisual />,
    },
    {
        id: 'data',
        icon: Database,
        label: 'Multi-Omics Data Lake',
        subtitle: 'The Core',
        description:
            'Secure, VPC-peered connectors to Snowflake, AWS HealthOmics, and GCS. Fine-tune foundation models on your proprietary multi-omics datasets without your data ever leaving your firewall.',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        activeBorder: 'border-indigo-400',
        visual: <DataVisual />,
    },
    {
        id: 'lab',
        icon: FlaskConical,
        label: 'Lab-as-Code Bridge',
        subtitle: 'The Bridge',
        description:
            'One-click sequence synthesis orders to Twist and IDT. Automated assay jobs on Emerald Cloud Lab and Strateos. Wet-lab results stream back into the platform and trigger automatic model retraining.',
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        activeBorder: 'border-rose-400',
        visual: <LabVisual />,
    },
];

export function FeaturePillars() {
    const [active, setActive] = useState(PILLARS[0].id);
    const activePillar = PILLARS.find((p) => p.id === active)!;

    return (
        <section
            className="bg-slate-50 py-20 lg:py-28"
            aria-labelledby="pillars-heading"
        >
            <div className="mx-auto max-w-7xl px-6 xl:px-8">
                {/* Header */}
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
                        Platform Capabilities
                    </p>
                    <h2
                        id="pillars-heading"
                        className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
                    >
                        Five verticals. One unified platform.
                    </h2>
                </div>

                {/* Desktop: side by side */}
                <div className="hidden lg:grid lg:grid-cols-5 lg:gap-8">
                    {/* Pillar list */}
                    <div className="col-span-2 flex flex-col gap-2" role="tablist" aria-label="Platform features">
                        {PILLARS.map((p) => {
                            const Icon = p.icon;
                            const isActive = active === p.id;
                            return (
                                <button
                                    key={p.id}
                                    role="tab"
                                    aria-selected={isActive}
                                    aria-controls={`pillar-panel-${p.id}`}
                                    id={`pillar-tab-${p.id}`}
                                    onClick={() => setActive(p.id)}
                                    className={cn(
                                        'group flex items-start gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-150',
                                        isActive
                                            ? `border-l-4 ${p.activeBorder} border-t-transparent border-r-transparent border-b-transparent bg-white shadow-sm`
                                            : 'border-transparent hover:bg-white hover:border-slate-200',
                                    )}
                                >
                                    <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors', isActive ? p.bg : 'bg-slate-100 group-hover:' + p.bg)}>
                                        <Icon className={cn('h-5 w-5', isActive ? p.color : 'text-slate-400')} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <div className={cn('text-sm font-semibold transition-colors', isActive ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900')}>
                                            {p.label}
                                        </div>
                                        <div className="mt-0.5 text-xs text-slate-400">{p.subtitle}</div>
                                    </div>
                                    <ChevronRight className={cn('ml-auto mt-1.5 h-4 w-4 shrink-0 transition-colors', isActive ? p.color : 'text-slate-300')} />
                                </button>
                            );
                        })}
                    </div>

                    {/* Active pillar detail */}
                    <div
                        id={`pillar-panel-${activePillar.id}`}
                        role="tabpanel"
                        aria-labelledby={`pillar-tab-${activePillar.id}`}
                        className="col-span-3 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col gap-6"
                    >
                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                {activePillar.subtitle}
                            </p>
                            <h3 className="text-2xl font-bold text-slate-900">{activePillar.label}</h3>
                            <p className="mt-3 text-base leading-relaxed text-slate-600">
                                {activePillar.description}
                            </p>
                        </div>
                        {/* Visual */}
                        <div className="flex-1 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center min-h-48">
                            {activePillar.visual}
                        </div>
                    </div>
                </div>

                {/* Mobile/tablet: accordion */}
                <div className="lg:hidden space-y-3">
                    {PILLARS.map((p) => {
                        const Icon = p.icon;
                        const isOpen = active === p.id;
                        return (
                            <div key={p.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                                <button
                                    className="flex w-full items-center gap-4 px-5 py-4"
                                    onClick={() => setActive(isOpen ? '' : p.id)}
                                    aria-expanded={isOpen}
                                >
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${p.bg}`}>
                                        <Icon className={`h-5 w-5 ${p.color}`} strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="text-sm font-semibold text-slate-900">{p.label}</div>
                                        <div className="text-xs text-slate-400">{p.subtitle}</div>
                                    </div>
                                    <ChevronRight className={cn('h-4 w-4 text-slate-400 transition-transform', isOpen && 'rotate-90')} />
                                </button>
                                {isOpen && (
                                    <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                                        <p className="text-sm leading-relaxed text-slate-600">{p.description}</p>
                                        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center min-h-40">
                                            {p.visual}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/* ── Inline visuals for each pillar ───────────────────────────────── */

function CopilotVisual() {
    return (
        <div className="w-full p-5">
            {/* Chat-style prompt */}
            <div className="mb-3 flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                    <BrainCircuit className="h-3.5 w-3.5 text-violet-600" />
                </div>
                <div className="rounded-xl rounded-tl-sm bg-violet-50 border border-violet-200 px-3 py-2">
                    <p className="text-xs text-violet-800">&quot;Design binders for PDB 7OOO, simulate, and order top 3&quot;</p>
                </div>
            </div>
            {/* Mini pipeline */}
            <div className="space-y-1.5 ml-9">
                {[
                    { label: 'AlphaFold3', status: 'pLDDT 94.2', done: true },
                    { label: 'RFdiffusion', status: '500 sequences', done: true },
                    { label: 'GROMACS MD', status: '38% running', done: false },
                ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${s.done ? 'bg-green-500' : 'bg-violet-500 animate-pulse'}`} />
                        <span className="text-[11px] font-medium text-slate-700 flex-1">{s.label}</span>
                        <span className={`text-[10px] ${s.done ? 'text-green-600' : 'text-violet-600'}`}>{s.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EngineVisual() {
    return (
        <div className="w-full p-6 flex items-center justify-center">
            <svg viewBox="0 0 220 140" className="w-full max-w-[240px]" aria-label="Generative engine visualization">
                <circle cx="110" cy="70" r="40" fill="none" stroke="#dbeafe" strokeWidth="12" />
                <circle cx="110" cy="70" r="40" fill="none" stroke="#2563eb" strokeWidth="4" strokeDasharray="60 190" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 110 70" to="360 110 70" dur="4s" repeatCount="indefinite" />
                </circle>
                <text x="110" y="65" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f172a">ESM-3</text>
                <text x="110" y="79" textAnchor="middle" fontSize="9" fill="#64748b">AlphaFold3</text>
                {[[50, 25], [170, 25], [50, 115], [170, 115]].map(([cx, cy], i) => (
                    <g key={i}>
                        <circle cx={cx} cy={cy} r="14" fill={['#eff6ff', '#f0fdf4', '#fdf4ff', '#fff7ed'][i]} stroke={['#bfdbfe', '#bbf7d0', '#e9d5ff', '#fed7aa'][i]} strokeWidth="1.5" />
                        <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize="8" fill="#475569">{['RFdiff', 'FEP', 'PROTAC', 'CRISPR'][i]}</text>
                    </g>
                ))}
                {[[50, 25], [170, 25], [50, 115], [170, 115]].map(([cx, cy], i) => (
                    <line key={`l${i}`} x1={cx < 110 ? cx + 14 : cx - 14} y1={cy < 70 ? cy + 14 : cy - 14} x2={cx < 110 ? 75 : 145} y2={cy < 70 ? 44 : 96} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 2" />
                ))}
            </svg>
        </div>
    );
}

function SimulationVisual() {
    const points = [0, 8, 5, 15, 12, 22, 18, 28, 25, 32, 30, 35, 34, 36, 35, 35].map((y, x) => `${x * 14},${60 - y}`).join(' ');
    return (
        <div className="w-full p-6">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">RMSD over time</span>
                    <span className="text-xs text-teal-600 font-medium">Converged ✓</span>
                </div>
                <svg viewBox="0 0 210 70" className="w-full" aria-label="RMSD convergence chart">
                    <polyline points={points} fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="196" y1="0" x2="196" y2="70" stroke="#dc2626" strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
                    <text x="198" y="12" fontSize="7" fill="#dc2626">Converged</text>
                </svg>
                <div className="mt-2 flex gap-3">
                    {['ΔG -12.4 kcal/mol', 'Tm 74°C', 'Aggregation: Low'].map((m) => (
                        <div key={m} className="text-[10px] text-slate-500 bg-slate-50 rounded px-2 py-1">{m}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function DataVisual() {
    return (
        <div className="w-full p-6">
            <div className="space-y-2">
                {[
                    { label: 'Snowflake', status: 'Connected', icon: '❄', color: 'text-blue-600' },
                    { label: 'AWS HealthOmics', status: 'Synced 2h ago', icon: '☁', color: 'text-orange-500' },
                    { label: 'GCS Bucket (PDB)', status: '4.2 TB indexed', icon: '🗄', color: 'text-green-600' },
                ].map((src) => (
                    <div key={src.label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                        <span className="text-base">{src.icon}</span>
                        <div className="flex-1">
                            <div className="text-xs font-medium text-slate-900">{src.label}</div>
                            <div className={`text-[10px] ${src.color}`}>{src.status}</div>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-green-400" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function LabVisual() {
    return (
        <div className="w-full p-6">
            <div className="space-y-2">
                {[
                    { step: '1', label: 'Top 3 sequences selected', done: true },
                    { step: '2', label: 'Order submitted to Twist Bio', done: true },
                    { step: '3', label: 'Confirmed — In Production', done: false, active: true },
                    { step: '4', label: 'Expression assay → Emerald Lab', done: false },
                ].map((s) => (
                    <div key={s.step} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs ${s.active ? 'bg-rose-50 border border-rose-200' : s.done ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'}`}>
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${s.done ? 'bg-green-500 text-white' : s.active ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {s.done ? '✓' : s.step}
                        </span>
                        <span className={s.done ? 'text-slate-900' : s.active ? 'text-rose-700 font-medium' : 'text-slate-400'}>{s.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
