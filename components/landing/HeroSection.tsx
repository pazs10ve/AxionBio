'use client';

import Link from 'next/link';
import { useRef, useState, useEffect, useCallback } from 'react';
import {
    ArrowRight, Play, Sparkles, Users, BarChart2,
    Dna, Send, CheckCircle2, Circle, User, Bot, FlaskConical, Clock
} from 'lucide-react';

/* ═══════════════════════════════════════════════════
   PANEL 1 – Real Protein Structure via 3Dmol.js
═══════════════════════════════════════════════════ */
function MoleculePanel() {
    const viewerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !viewerRef.current) return;

        let viewer: any = null;

        const init = async () => {
            try {
                // Load 3Dmol.js from CDN if not already present
                if (!(window as any).$3Dmol) {
                    await new Promise<void>((resolve, reject) => {
                        const s = document.createElement('script');
                        s.src = 'https://3Dmol.org/build/3Dmol-min.js';
                        s.async = true;
                        s.onload = () => resolve();
                        s.onerror = () => reject(new Error('3Dmol load failed'));
                        document.head.appendChild(s);
                    });
                }

                const $3Dmol = (window as any).$3Dmol;
                if (!viewerRef.current) return;

                // Create viewer — light slate background to match the page
                viewer = $3Dmol.createViewer(viewerRef.current, {
                    backgroundColor: '#f8fafc',
                    antialias: true,
                });

                // Fetch KRAS G12C with AMG-510 (sotorasib) — PDB 6OIM
                // It's the binding-site poster child for KRAS drug discovery
                $3Dmol.download('pdb:6OIM', viewer, { multimodel: false, frames: false }, () => {
                    // Protein cartoon coloured by spectrum (N→C: blue→red)
                    viewer.setStyle(
                        { hetflag: false },
                        { cartoon: { colorscheme: 'spectrum', thickness: 0.4 } }
                    );
                    // Ligand (AMG-510) as sticks with element coloring
                    viewer.setStyle(
                        { hetflag: true, resn: 'J3K' },
                        { stick: { colorscheme: 'Jmol', radius: 0.25 }, sphere: { colorscheme: 'Jmol', scale: 0.35 } }
                    );
                    // Semi-transparent surface around the binding pocket only
                    viewer.addSurface(
                        $3Dmol.SurfaceType.VDW,
                        { opacity: 0.55, colorscheme: { gradient: 'sinebow', min: 0, max: 1 } },
                        { hetflag: true }
                    );

                    viewer.zoomTo({ hetflag: true }); // focus on the ligand / pocket
                    viewer.render();
                    viewer.spin('y', 0.8); // slow Y-axis spin
                    setLoading(false);
                });
            } catch {
                setError(true);
                setLoading(false);
            }
        };

        init();

        return () => {
            try { viewer?.clear(); } catch { /* ignore */ }
        };
    }, []);

    return (
        <div className="p-5 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Dna className="h-3.5 w-3.5 text-sky-500" />
                        <span className="text-xs font-semibold text-slate-700">
                            Structure Viewer: KRAS G12C · AMG-510 (Sotorasib)
                        </span>
                    </div>
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 border border-sky-200">
                        PDB 6OIM
                    </span>
                </div>

                {/* 3Dmol viewport */}
                <div className="relative overflow-hidden" style={{ height: 220, background: '#f8fafc' }}>
                    <div ref={viewerRef} style={{ width: '100%', height: '100%', position: 'relative', opacity: loading ? 0 : 1, transition: 'opacity 0.6s ease' }} />

                    {/* Skeleton shimmer — only shows while loading, fades out gracefully */}
                    {loading && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-50">
                            {/* Simulated ribbon skeleton */}
                            <div className="relative flex items-center justify-center" style={{ width: 180, height: 120 }}>
                                {/* Horizontal shimmer bands suggesting a protein ribbon */}
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <div key={i} className="absolute rounded-full animate-pulse"
                                        style={{
                                            width: [140, 110, 130, 90, 120][i],
                                            height: 10,
                                            top: 15 + i * 22,
                                            left: [20, 35, 25, 45, 30][i],
                                            background: `rgba(148,163,184,${0.15 + i * 0.04})`,
                                            animationDelay: `${i * 120}ms`,
                                        }}
                                    />
                                ))}
                                {/* Central glow suggesting the binding site */}
                                <div className="absolute rounded-full animate-pulse"
                                    style={{ width: 44, height: 44, background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', animationDuration: '2s' }}
                                />
                            </div>
                            <span className="text-[11px] text-slate-400 tracking-wide">Loading structure…</span>
                        </div>
                    )}
                    {/* Error state */}
                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 gap-2">
                            <span className="text-xs text-slate-400">⚠ Structure viewer unavailable</span>
                            <span className="text-[10px] text-slate-500">Check network connection</span>
                        </div>
                    )}

                    {/* Pocket label badge — on light bg, use a light branded pill */}
                    {!loading && !error && (
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-1 border border-violet-200 shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                            <span className="text-[10px] font-semibold text-violet-700">P2 pocket · sotorasib</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-2">
                {[
                    { label: 'pLDDT', value: '94.2', color: 'text-sky-600', bg: 'bg-sky-50    border-sky-200' },
                    { label: 'pTM', value: '0.91', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
                    { label: 'ΔG', value: '−12.4', color: 'text-teal-600', bg: 'bg-teal-50   border-teal-200' },
                    { label: 'RMSD', value: '0.38Å', color: 'text-amber-600', bg: 'bg-amber-50  border-amber-200' },
                ].map((m) => (
                    <div key={m.label} className={`rounded-lg border ${m.bg} p-2 text-center`}>
                        <div className={`text-sm font-extrabold ${m.color}`}>{m.value}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{m.label}</div>
                    </div>
                ))}
            </div>

            {/* Residue chips */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Key binding residues</div>
                <div className="flex flex-wrap gap-1.5">
                    {[
                        ['HIS-95', 'bg-violet-50 border-violet-200 text-violet-700'],
                        ['TYR-96', 'bg-sky-50    border-sky-200    text-sky-700'],
                        ['GLN-61', 'bg-teal-50   border-teal-200   text-teal-700'],
                        ['GLY-12', 'bg-rose-50   border-rose-200   text-rose-700'],
                        ['LYS-16', 'bg-amber-50  border-amber-200  text-amber-700'],
                    ].map(([r, cls]) => (
                        <span key={r} className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border ${cls}`}>{r}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   PANEL 2 – Copilot Chat (unchanged, working well)
═══════════════════════════════════════════════════ */
const MESSAGES = [
    { role: 'user', text: 'Design 500 novel binders for the KRAS G12D mutation, focus on cell-permeability.', delay: 0 },
    {
        role: 'ai', text: null, delay: 900,
        plan: [
            { step: 'Retrieve KRAS G12D structure from PDB', done: true },
            { step: 'Run RFdiffusion: 500 binder sequences', done: true },
            { step: 'Score with ESM-3 + developability filter', done: false },
            { step: 'Route top 10 to GROMACS MD simulation', done: false },
        ],
    },
];

function CopilotChatPanel() {
    const [shown, setShown] = useState(0);
    useEffect(() => {
        if (shown >= MESSAGES.length) return;
        const t = setTimeout(() => setShown((s) => s + 1), MESSAGES[shown]?.delay ?? 900);
        return () => clearTimeout(t);
    }, [shown]);

    return (
        <div className="p-5 space-y-3">
            <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                    <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                    <div className="text-xs font-semibold text-slate-800">AxionBio Copilot</div>
                    <div className="flex items-center gap-1 text-[10px] text-green-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />Online
                    </div>
                </div>
            </div>
            <div className="space-y-3 min-h-[200px]">
                {MESSAGES.slice(0, shown).map((msg, i) => (
                    <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'ai' && (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100">
                                <Bot className="h-3.5 w-3.5 text-violet-600" />
                            </div>
                        )}
                        <div className={`max-w-[80%] rounded-xl px-3 py-2.5 text-xs ${msg.role === 'user'
                            ? 'bg-brand text-white rounded-tr-sm'
                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
                            }`}>
                            {msg.text && <p>{msg.text}</p>}
                            {msg.plan && (
                                <div className="space-y-1.5">
                                    <p className="font-semibold text-slate-800 mb-2">Here&apos;s my plan:</p>
                                    {msg.plan.map((s, j) => (
                                        <div key={j} className="flex items-center gap-2">
                                            {s.done
                                                ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                                : <Circle className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
                                            <span className={s.done ? 'text-slate-700' : 'text-slate-400'}>{s.step}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {msg.role === 'user' && (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200">
                                <User className="h-3.5 w-3.5 text-slate-500" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <input readOnly placeholder="Ask Copilot anything…"
                    className="flex-1 text-xs text-slate-500 bg-transparent outline-none placeholder-slate-400" />
                <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand hover:bg-brand-hover transition-colors">
                    <Send className="h-3 w-3 text-white" />
                </button>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   PANEL 3 – Experiment Board (Kanban-style)
═══════════════════════════════════════════════════ */
const EXP_COLUMNS = [
    {
        label: 'In Progress',
        color: 'text-violet-700',
        dot: 'bg-violet-500',
        cards: [
            { name: 'KRAS G12D Binders', model: 'RFdiffusion', progress: 62, assignees: ['K', 'P'], tag: 'Design', tagCls: 'bg-violet-50 text-violet-700 border-violet-200' },
            { name: 'PD-L1 Inhibitors', model: 'GROMACS MD', progress: 41, assignees: ['M'], tag: 'Simulation', tagCls: 'bg-teal-50 text-teal-700 border-teal-200' },
        ],
    },
    {
        label: 'Review',
        color: 'text-amber-700',
        dot: 'bg-amber-500',
        cards: [
            { name: 'BCL-2 PROTAC', model: 'ESM-3', progress: 88, assignees: ['A', 'K'], tag: 'Scoring', tagCls: 'bg-amber-50 text-amber-700 border-amber-200' },
        ],
    },
    {
        label: 'Done',
        color: 'text-green-700',
        dot: 'bg-green-500',
        cards: [
            { name: 'ALK Fusion Screen', model: 'AlphaFold3', progress: 100, assignees: ['P'], tag: 'Structure', tagCls: 'bg-sky-50 text-sky-700 border-sky-200' },
        ],
    },
];

const AVATAR_COLORS: Record<string, string> = { K: 'bg-violet-500', P: 'bg-sky-500', M: 'bg-amber-500', A: 'bg-green-500' };

function ExperimentBoardPanel() {
    return (
        <div className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-700">Experiment Board</span>
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Updated just now
                </span>
            </div>

            {/* Kanban columns */}
            <div className="grid grid-cols-3 gap-2">
                {EXP_COLUMNS.map((col) => (
                    <div key={col.label} className="space-y-2">
                        {/* Column header */}
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                            <span className={`text-[10px] font-semibold ${col.color}`}>{col.label}</span>
                            <span className="ml-auto rounded-full bg-slate-200 px-1.5 text-[9px] font-bold text-slate-500">{col.cards.length}</span>
                        </div>
                        {/* Cards */}
                        {col.cards.map((card) => (
                            <div key={card.name} className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm space-y-2">
                                <div>
                                    <div className="text-[11px] font-semibold text-slate-800 leading-tight">{card.name}</div>
                                    <div className="text-[9px] text-slate-400 mt-0.5">{card.model}</div>
                                </div>
                                {/* Progress bar */}
                                <div>
                                    <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                                        <span>Progress</span><span className="font-semibold text-slate-600">{card.progress}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${card.progress}%`, backgroundColor: card.progress === 100 ? '#22c55e' : undefined }} />
                                    </div>
                                </div>
                                {/* Footer */}
                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-1">
                                        {card.assignees.map((a) => (
                                            <div key={a} className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border border-white text-[8px] font-bold text-white ${AVATAR_COLORS[a] ?? 'bg-slate-400'}`}
                                                style={{ height: '1.125rem', width: '1.125rem' }}>
                                                {a}
                                            </div>
                                        ))}
                                    </div>
                                    <span className={`rounded border px-1 py-0.5 text-[8px] font-semibold ${card.tagCls}`}>{card.tag}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                    { label: 'Experiments', value: '4', color: 'text-violet-600' },
                    { label: 'GPU hrs used', value: '384', color: 'text-sky-600' },
                    { label: 'Hits found', value: '12', color: 'text-green-600' },
                ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-slate-200 bg-white px-2 py-2 shadow-sm text-center">
                        <div className={`text-base font-extrabold ${s.color}`}>{s.value}</div>
                        <div className="text-[9px] text-slate-400">{s.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   PANEL 4 – Hit Analysis (unchanged, working well)
═══════════════════════════════════════════════════ */
const HITS_DATA = [
    { x: 72, y: 55, hi: false }, { x: 58, y: 40, hi: false }, { x: 82, y: 68, hi: false },
    { x: 91, y: 78, hi: true }, { x: 65, y: 50, hi: false }, { x: 77, y: 62, hi: false },
    { x: 88, y: 72, hi: true }, { x: 50, y: 35, hi: false }, { x: 85, y: 70, hi: true },
    { x: 60, y: 45, hi: false }, { x: 94, y: 82, hi: true }, { x: 70, y: 58, hi: false },
];

function HitAnalysisPanel() {
    return (
        <div className="p-5 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <BarChart2 className="h-3.5 w-3.5 text-brand" />
                        <span className="text-xs font-semibold text-slate-700">Candidate Space: ΔG vs pLDDT</span>
                    </div>
                    <span className="text-[10px] text-slate-400">500 candidates</span>
                </div>
                <div className="p-4 bg-slate-50">
                    <svg viewBox="0 0 240 150" className="w-full" aria-label="ΔG vs pLDDT scatter plot">
                        {[30, 70, 110].map(y => <line key={y} x1="20" y1={y} x2="230" y2={y} stroke="#e2e8f0" strokeWidth="1" />)}
                        {[50, 110, 170].map(x => <line key={x} x1={x} y1="10" x2={x} y2="130" stroke="#e2e8f0" strokeWidth="1" />)}
                        <line x1="20" y1="130" x2="230" y2="130" stroke="#cbd5e1" strokeWidth="1.5" />
                        <line x1="20" y1="10" x2="20" y2="130" stroke="#cbd5e1" strokeWidth="1.5" />
                        <text x="125" y="146" textAnchor="middle" fontSize="8" fill="#94a3b8">pLDDT →</text>
                        <text x="8" y="70" textAnchor="middle" fontSize="8" fill="#94a3b8" transform="rotate(-90,8,70)">ΔG →</text>
                        {HITS_DATA.map((h, idx) => {
                            const cx = 20 + (h.x / 100) * 210, cy = 130 - (h.y / 100) * 120;
                            return h.hi ? (
                                <g key={idx}>
                                    <circle cx={cx} cy={cy} r="7" fill="#2563eb" opacity="0.15" />
                                    <circle cx={cx} cy={cy} r="4" fill="#2563eb" opacity="0.9" />
                                    {idx === 10 && <>
                                        <circle cx={cx} cy={cy} r="10" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6">
                                            <animate attributeName="r" values="10;13;10" dur="2s" repeatCount="indefinite" />
                                            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
                                        </circle>
                                        <text x={cx + 7} y={cy - 5} fontSize="7" fontWeight="700" fill="#1d4ed8">SEQ-11</text>
                                        <text x={cx + 7} y={cy + 4} fontSize="6" fill="#3b82f6">Best hit</text>
                                    </>}
                                </g>
                            ) : <circle key={idx} cx={cx} cy={cy} r="2.5" fill="#94a3b8" opacity="0.5" />;
                        })}
                        <text x="185" y="22" fontSize="7" fill="#2563eb" fontWeight="600" opacity="0.6">High pLDDT</text>
                        <text x="185" y="30" fontSize="7" fill="#2563eb" opacity="0.6">High ΔG</text>
                    </svg>
                </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Top Hits</div>
                <div className="divide-y divide-slate-50">
                    {[
                        { id: 'SEQ-11', plddt: '96.1', dg: '−14.2', tm: '81°C', badge: 'bg-green-500' },
                        { id: 'SEQ-09', plddt: '94.8', dg: '−13.6', tm: '78°C', badge: 'bg-blue-500' },
                        { id: 'SEQ-07', plddt: '92.3', dg: '−12.9', tm: '74°C', badge: 'bg-blue-400' },
                    ].map((h, i) => (
                        <div key={h.id} className="flex items-center gap-3 px-3.5 py-2">
                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${h.badge}`}>{i + 1}</div>
                            <span className="text-xs font-semibold text-slate-700 w-14">{h.id}</span>
                            <div className="flex-1 flex gap-2 text-[10px] text-slate-500">
                                <span>pLDDT <b className="text-slate-700">{h.plddt}</b></span>
                                <span>ΔG <b className="text-slate-700">{h.dg}</b></span>
                                <span>Tm <b className="text-slate-700">{h.tm}</b></span>
                            </div>
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   CAROUSEL with swipe support
═══════════════════════════════════════════════════ */
const PANELS = [
    { id: 'structure', label: 'Structure', icon: Dna, component: MoleculePanel },
    { id: 'copilot', label: 'Copilot', icon: Sparkles, component: CopilotChatPanel },
    { id: 'workspace', label: 'Projects', icon: Users, component: ExperimentBoardPanel },
    { id: 'hits', label: 'Hit Analysis', icon: BarChart2, component: HitAnalysisPanel },
];

function HeroVisual() {
    const [active, setActive] = useState(0);
    const [fading, setFading] = useState(false);
    const dragStart = useRef<number | null>(null);
    const isDragging = useRef(false);
    const SWIPE_THRESHOLD = 50;

    const goTo = useCallback((idx: number) => {
        if (idx === active) return;
        setFading(true);
        setTimeout(() => { setActive(idx); setFading(false); }, 220);
    }, [active]);

    const next = useCallback(() => goTo((active + 1) % PANELS.length), [active, goTo]);
    const prev = useCallback(() => goTo((active - 1 + PANELS.length) % PANELS.length), [active, goTo]);

    // Auto-rotate
    useEffect(() => {
        const t = setInterval(next, 5000);
        return () => clearInterval(t);
    }, [next]);

    // Mouse swipe
    const onMouseDown = (e: React.MouseEvent) => { dragStart.current = e.clientX; isDragging.current = true; };
    const onMouseMove = (e: React.MouseEvent) => { if (!isDragging.current) return; e.preventDefault(); };
    const onMouseUp = (e: React.MouseEvent) => {
        if (!isDragging.current || dragStart.current === null) return;
        const delta = e.clientX - dragStart.current;
        if (Math.abs(delta) > SWIPE_THRESHOLD) { delta < 0 ? next() : prev(); }
        isDragging.current = false; dragStart.current = null;
    };
    const onMouseLeave = () => { isDragging.current = false; dragStart.current = null; };

    // Touch swipe
    const onTouchStart = (e: React.TouchEvent) => { dragStart.current = e.touches[0].clientX; };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (dragStart.current === null) return;
        const delta = e.changedTouches[0].clientX - dragStart.current;
        if (Math.abs(delta) > SWIPE_THRESHOLD) { delta < 0 ? next() : prev(); }
        dragStart.current = null;
    };

    const Panel = PANELS[active].component;

    return (
        <div
            className="relative rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden select-none"
            onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
            style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
        >
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-3 flex-1 rounded-md bg-slate-200/70 px-3 py-1 text-xs text-slate-500 font-mono truncate">
                    app.axionbio.com/{PANELS[active].id}
                </span>
            </div>

            {/* Tab strip */}
            <div className="flex items-center gap-0.5 border-b border-slate-100 bg-slate-50 px-3 py-1.5">
                {PANELS.map((p, idx) => {
                    const Icon = p.icon;
                    return (
                        <button key={p.id} onClick={() => goTo(idx)}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${idx === active
                                ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/60'
                                }`}>
                            <Icon className="h-3 w-3" />{p.label}
                        </button>
                    );
                })}
            </div>

            {/* Content — fixed height so all panels are identical size, no layout shift */}
            <div
                className="bg-slate-50 transition-opacity duration-200 overflow-hidden"
                style={{ opacity: fading ? 0 : 1, height: 460, overflowY: 'hidden' }}
            >
                <Panel />
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-1.5 pb-3 pt-1 bg-slate-50">
                {PANELS.map((_, idx) => (
                    <button key={idx} onClick={() => goTo(idx)} aria-label={`View ${PANELS[idx].label}`}
                        className={`rounded-full transition-all duration-300 ${idx === active ? 'w-4 h-1.5 bg-brand' : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                            }`} />
                ))}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   Main export
═══════════════════════════════════════════════════ */
export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-white pt-28 pb-20 lg:pt-36 lg:pb-28" aria-label="Hero">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true"
                style={{ background: 'radial-gradient(ellipse 80% 60% at 10% -10%, rgba(37,99,235,0.06) 0%, transparent 70%)' }} />
            <div className="relative mx-auto max-w-7xl px-6 xl:px-8">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

                    {/* Left */}
                    <div className="flex flex-col items-start">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-light px-3.5 py-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-brand">The Enterprise Bio4AI Operating System</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                            From Multi-Omics Data{' '}
                            <span className="relative">
                                <span className="relative z-10 text-brand">to Synthesized</span>
                                <span className="absolute bottom-1 left-0 right-0 h-px bg-brand/30 -z-0" aria-hidden="true" />
                            </span>{' '}
                            Drug Candidates.{' '}
                            <em className="not-italic text-slate-500">Automated.</em>
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                            AxionBio is the definitive full-stack B2B SaaS for AI-driven drug discovery, orchestrating
                            generative protein design, molecular dynamics, and physical lab synthesis in a single unified operating system.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Link href="/sign-up" id="hero-cta-signup" className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover transition-colors">
                                Get Started Free <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link href="#demo" id="hero-cta-demo" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                                Request a Demo
                            </Link>
                            <Link href="#demo-video" id="hero-cta-video" className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white shadow-sm">
                                    <Play className="h-3 w-3 fill-slate-600 text-slate-600 ml-0.5" />
                                </span>
                                See it in Action
                            </Link>
                        </div>
                        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
                            {['SOC 2 Type II', 'HIPAA Compliant', 'GDPR Ready', 'SSO / SAML 2.0'].map((badge) => (
                                <div key={badge} className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <svg className="h-3.5 w-3.5 text-success shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7 7a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06L6.25 10.69l6.47-6.47a.75.75 0 0 1 1.06 0z" />
                                    </svg>
                                    <span>{badge}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right */}
                    <div className="relative lg:pl-4">
                        <div className="absolute -inset-4 rounded-3xl opacity-50" aria-hidden="true"
                            style={{ background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.10) 0%, transparent 70%)' }} />
                        <HeroVisual />
                    </div>
                </div>
            </div>
        </section>
    );
}
