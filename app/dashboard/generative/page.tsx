'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { MODELS, MOCK_PDB_STRUCTURES } from '@/lib/mock-data';
import { useSubmitJob, useJob } from '@/lib/hooks/use-jobs';
import { useJobStream } from '@/lib/hooks/use-job-stream';
import { useProject } from '@/lib/project-context';
import { cn } from '@/lib/utils';
import {
    Dna, FlaskConical, Cpu, ChevronRight, ChevronDown, ChevronLeft,
    Upload, Search, Play, X, CheckCircle2, AlertCircle, Clock, Loader2,
    Download, ArrowRight, Star, StarOff, Beaker, Sparkles,
    Layers, Scissors, Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type ModelId = typeof MODELS[number]['id'];
type SortKey = 'rank' | 'pLDDT' | 'pTM' | 'bindingAffinity';
type SortDir = 'asc' | 'desc';
type GenMode = 'structure' | 'sequence' | 'protac' | 'crispr';

const GEN_MODES: { id: GenMode; label: string; description: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'structure', label: 'Structure Prediction', description: 'AlphaFold3, ESMFold — fold a sequence into 3D structure', icon: Layers },
    { id: 'sequence', label: 'Sequence Design', description: 'RFdiffusion, ProteinMPNN — design binders de novo', icon: Dna },
    { id: 'protac', label: 'PROTAC Designer', description: 'Generate ternary complex binders for targeted degradation', icon: Scissors },
    { id: 'crispr', label: 'CRISPR Designer', description: 'Compact Cas9/Cas12 variant design and guide optimization', icon: Wrench },
];

// ── Molstar Placeholder (lazy-loaded in production via dynamic import) ────────

function MolstarViewerPlaceholder({ pdbId }: { pdbId: string | null }) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 relative">
            {pdbId ? (
                <>
                    {/* Simulated Mol* viewer — replace with real Mol* dynamic import */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                            {/* Rotating ring to simulate 3D structure */}
                            <div className="w-64 h-64 rounded-full border-4 border-brand/20 animate-spin" style={{ animationDuration: '12s' }} />
                            <div className="absolute inset-4 rounded-full border-4 border-brand/30 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />
                            <div className="absolute inset-12 rounded-full border-4 border-brand/40 animate-spin" style={{ animationDuration: '5s' }} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <Dna className="w-8 h-8 text-brand mx-auto mb-2" />
                                    <span className="text-sm font-mono font-bold text-slate-600">{pdbId}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Viewer toolbar */}
                    <div className="absolute top-3 right-3 flex gap-2">
                        <button className="h-8 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition-colors flex items-center gap-1.5">
                            <Download className="w-3.5 h-3.5" /> PDB
                        </button>
                        <button className="h-8 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
                            ⛶ Full
                        </button>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-slate-600 font-mono border border-slate-100 shadow-sm">
                        PDB {pdbId} · {MOCK_PDB_STRUCTURES.find(s => s.id === pdbId)?.name ?? 'Structure'}
                    </div>
                </>
            ) : (
                <div className="text-center space-y-3 px-8">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto border border-slate-200">
                        <Dna className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500">No structure loaded</p>
                    <p className="text-xs text-slate-400 leading-relaxed">Enter a PDB ID or upload a structure file to begin. The 3D viewer will appear here.</p>
                </div>
            )}
        </div>
    );
}

// ── Model Selector ────────────────────────────────────────────────────────────

function ModelSelector({ selected, onChange, filter }: {
    selected: ModelId;
    onChange: (id: ModelId) => void;
    filter?: ModelId[];
}) {
    const visibleModels = filter ? MODELS.filter(m => filter.includes(m.id)) : MODELS;
    return (
        <div className="space-y-2">
            {visibleModels.map((m) => (
                <button
                    key={m.id}
                    onClick={() => onChange(m.id)}
                    className={cn(
                        'w-full text-left p-3.5 rounded-xl border transition-all duration-150 group',
                        selected === m.id
                            ? 'border-brand bg-brand/5 shadow-sm ring-1 ring-brand/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    )}
                >
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={cn('text-sm font-semibold', selected === m.id ? 'text-brand' : 'text-slate-900')}>
                                    {m.name}
                                </span>
                                <span className="text-xs text-slate-400">{m.org}</span>
                                {m.recommended && (
                                    <Badge className="bg-brand/10 text-brand border-brand/20 text-[10px] h-4 px-1.5 shadow-none">
                                        ★ Recommended
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{m.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                                {m.tags.map(t => (
                                    <span key={t} className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="shrink-0 text-right">
                            <span className="text-[10px] text-slate-400 font-medium">~{m.estimatedGpuHours}h GPU</span>
                            <div className={cn(
                                'w-4 h-4 rounded-full border-2 mt-1.5 ml-auto transition-all',
                                selected === m.id ? 'border-brand bg-brand' : 'border-slate-300'
                            )} />
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}

// ── Structure Input Panel ─────────────────────────────────────────────────────

function StructureInput({ onLoad }: { onLoad: (id: string) => void }) {
    const [tab, setTab] = useState<'rcsb' | 'upload'>('rcsb');
    const [pdbInput, setPdbInput] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [loaded, setLoaded] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleLoad = () => {
        const id = pdbInput.toUpperCase().trim();
        if (!id || id.length !== 4) return;
        setLoaded(id);
        onLoad(id);
    };

    const handleFile = () => {
        setLoaded('UPLOAD.pdb');
        onLoad('UPLOAD');
    };

    const quickLoad = (id: string) => {
        setPdbInput(id);
        setLoaded(id);
        onLoad(id);
    };

    return (
        <div className="space-y-3">
            {/* Tab row */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
                {(['rcsb', 'upload'] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                        className={cn('flex-1 py-1.5 text-xs font-semibold rounded-md transition-all',
                            tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                        {t === 'rcsb' ? '🔍 Fetch from RCSB' : '📁 Upload PDB / CIF'}
                    </button>
                ))}
            </div>

            {tab === 'rcsb' ? (
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <input
                            value={pdbInput}
                            onChange={(e) => setPdbInput(e.target.value.toUpperCase().slice(0, 4))}
                            onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
                            placeholder="e.g. 6OIM"
                            maxLength={4}
                            className="flex-1 h-9 px-3 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
                        />
                        <Button size="sm" onClick={handleLoad} disabled={pdbInput.length !== 4} className="bg-brand hover:bg-brand-hover text-white h-9 px-3">
                            Load
                        </Button>
                    </div>
                    {/* Quick picks */}
                    <div className="flex flex-wrap gap-1.5">
                        {MOCK_PDB_STRUCTURES.slice(0, 3).map((s) => (
                            <button key={s.id} onClick={() => quickLoad(s.id)}
                                className="text-[10px] font-mono px-2 py-1 bg-slate-100 hover:bg-brand/10 hover:text-brand border border-slate-200 rounded text-slate-600 transition-colors">
                                {s.id}
                            </button>
                        ))}
                    </div>
                    {loaded && (
                        <div className="flex items-center gap-2 text-xs text-success font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Structure loaded: {loaded}
                        </div>
                    )}
                </div>
            ) : (
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(); }}
                    onClick={() => fileRef.current?.click()}
                    className={cn(
                        'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
                        dragOver ? 'border-brand bg-brand/5' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    )}
                >
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-medium text-slate-600">Drop .pdb or .cif here</p>
                    <p className="text-xs text-slate-400 mt-1">or click to browse</p>
                    <input ref={fileRef} type="file" accept=".pdb,.cif" className="hidden" onChange={handleFile} />
                </div>
            )}
        </div>
    );
}

// ── Config Form ───────────────────────────────────────────────────────────────

function ConfigForm({
    numSeqs, onNumSeqsChange,
    advanced, onAdvancedToggle,
}: {
    numSeqs: number; onNumSeqsChange: (v: number) => void;
    advanced: boolean; onAdvancedToggle: () => void;
}) {
    return (
        <div className="space-y-4">
            <div>
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-2">
                    <span>Sequences to generate</span>
                    <span className="font-mono text-brand text-sm tabular-nums">{numSeqs.toLocaleString()}</span>
                </label>
                <input type="range" min={10} max={5000} step={10} value={numSeqs}
                    onChange={(e) => onNumSeqsChange(Number(e.target.value))}
                    className="w-full h-2 appearance-none rounded-full bg-slate-200 accent-brand cursor-pointer" />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>10</span><span>5,000</span>
                </div>
            </div>

            {/* Chain selector */}
            <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Target chain</label>
                <div className="flex gap-2">
                    {['A', 'B', 'AB'].map((c) => (
                        <button key={c}
                            className="px-3 py-1 text-xs font-mono border border-slate-200 rounded-lg hover:border-brand hover:text-brand hover:bg-brand/5 transition-colors text-slate-600 bg-white">
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Advanced toggle */}
            <button onClick={onAdvancedToggle}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors w-full">
                {advanced ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                Advanced settings
            </button>

            {advanced && (
                <div className="pl-3 border-l-2 border-slate-100 space-y-3">
                    {[
                        { label: 'Temperature', min: 0.1, max: 2, step: 0.1, defaultVal: 1.0 },
                        { label: 'Backbone noise σ', min: 0.05, max: 0.5, step: 0.05, defaultVal: 0.2 },
                    ].map(({ label, min, max, step, defaultVal }) => (
                        <div key={label}>
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">{label}</label>
                            <input type="range" min={min} max={max} step={step} defaultValue={defaultVal}
                                className="w-full h-1.5 appearance-none rounded-full bg-slate-200 accent-brand cursor-pointer" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Job Progress Panel ────────────────────────────────────────────────────────

const STEPS_DISPLAY = [
    { key: 'queued', label: 'Queued' },
    { key: 'initializing', label: 'Initializing' },
    { key: 'running', label: 'Running' },
    { key: 'postprocessing', label: 'Post-processing' },
    { key: 'complete', label: 'Complete' },
];

function JobProgress({ step, progress, logLines, onCancel }: {
    step: string; progress: number; logLines: { line: string }[]; onCancel: () => void;
}) {
    const logRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [logLines]);

    const activeIndex = STEPS_DISPLAY.findIndex(s => s.key === step);

    return (
        <div className="space-y-5">
            {/* Stepper */}
            <div className="flex items-center gap-0">
                {STEPS_DISPLAY.map((s, i) => {
                    const done = i < activeIndex;
                    const active = i === activeIndex;
                    return (
                        <div key={s.key} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center gap-1">
                                <div className={cn(
                                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all',
                                    done ? 'bg-success text-white' : active ? 'bg-brand text-white ring-4 ring-brand/20' : 'bg-slate-100 text-slate-400'
                                )}>
                                    {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                                </div>
                                <span className={cn('text-[9px] font-medium whitespace-nowrap', active ? 'text-brand' : done ? 'text-success' : 'text-slate-400')}>
                                    {s.label}
                                </span>
                            </div>
                            {i < STEPS_DISPLAY.length - 1 && (
                                <div className={cn('h-0.5 flex-1 mx-1 mb-4 transition-all', done ? 'bg-success' : 'bg-slate-200')} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress bar (during running) */}
            {step === 'running' && (
                <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                        <span className="flex items-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
                            Running inference...
                        </span>
                        <span className="font-mono tabular-nums">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-brand to-accent rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Log stream */}
            <div>
                <div className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-2">
                    <span className="font-mono">STDOUT</span>
                    <span className="h-px flex-1 bg-slate-100" />
                </div>
                <div
                    ref={logRef}
                    className="h-36 overflow-y-auto bg-slate-950 rounded-xl p-3 font-mono text-[11px] text-green-400 space-y-0.5 scrollbar-thin"
                >
                    {logLines.length === 0 ? (
                        <span className="text-slate-600">Waiting for worker...</span>
                    ) : (
                        logLines.map((l, i) => <div key={i}>{l.line}</div>)
                    )}
                    <div className="inline-block w-2 h-3 bg-green-400 animate-pulse ml-0.5" />
                </div>
            </div>

            <Button onClick={onCancel} variant="outline" size="sm" className="w-full text-error border-error/20 hover:bg-error/5 hover:text-error">
                <X className="w-4 h-4 mr-2" /> Cancel Job
            </Button>
        </div>
    );
}

// ── Results Table ─────────────────────────────────────────────────────────────

function scoreColor(value: number, min: number, max: number, invert = false) {
    const norm = (value - min) / (max - min);
    const good = invert ? norm < 0.33 : norm > 0.66;
    const medium = invert ? norm < 0.66 : norm > 0.33;
    if (good) return 'text-success bg-success/10';
    if (medium) return 'text-warning bg-warning/10';
    return 'text-error bg-error/10';
}

function ResultsTable({ results, onRowClick }: {
    results: any[];
    onRowClick?: (rank: number) => void;
}) {
    const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'rank', dir: 'asc' });
    const [favorites, setFavorites] = useState<Set<number>>(new Set());
    const [selected, setSelected] = useState<Set<number>>(new Set());

    // process results mapping from raw job.results.molecules
    const displayResults = results.map((r, i) => ({
        rank: i + 1,
        sequence: r.sequence,
        pLDDT: r.scores?.pLDDT ?? '-',
        pTM: r.scores?.pTM ?? '-',
        bindingAffinity: r.scores?.bindingDG ?? '-',
        immunogenicity: r.immunogenicity ?? 'Unknown',
        ...r
    }));

    const sorted = [...displayResults].sort((a, b) => {
        const av = a[sort.key] as number, bv = b[sort.key] as number;
        return sort.dir === 'asc' ? av - bv : bv - av;
    });

    const toggleFav = (rank: number) => {
        setFavorites(prev => {
            const next = new Set(prev);
            next.has(rank) ? next.delete(rank) : next.add(rank);
            return next;
        });
    };

    const toggleSelect = (rank: number) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(rank) ? next.delete(rank) : next.add(rank);
            return next;
        });
    };

    const cycleSort = (key: SortKey) => {
        setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' });
    };

    const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
        <button onClick={() => cycleSort(k)} className="flex items-center gap-1 hover:text-brand transition-colors">
            {label}
            {sort.key === k && <span className="text-brand">{sort.dir === 'asc' ? '↑' : '↓'}</span>}
        </button>
    );

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            {/* Header + batch actions */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">{results.length} Candidates Generated</h3>
                    <p className="text-xs text-slate-500">Ranked by composite score</p>
                </div>
                <div className="flex items-center gap-2">
                    {selected.size > 0 && (
                        <span className="text-xs text-slate-500">{selected.size} selected</span>
                    )}
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-slate-200">
                        <Download className="w-3.5 h-3.5" /> Export FASTA
                    </Button>
                    <Button size="sm" className="h-8 text-xs gap-1.5 bg-brand hover:bg-brand-hover text-white">
                        <Beaker className="w-3.5 h-3.5" /> Send to MD
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="px-4 py-3 text-left w-8"><input type="checkbox" className="rounded" /></th>
                            <th className="px-4 py-3 text-left"><SortBtn k="rank" label="Rank" /></th>
                            <th className="px-4 py-3 text-left">Sequence</th>
                            <th className="px-4 py-3 text-left"><SortBtn k="pLDDT" label="pLDDT" /></th>
                            <th className="px-4 py-3 text-left"><SortBtn k="pTM" label="pTM" /></th>
                            <th className="px-4 py-3 text-left"><SortBtn k="bindingAffinity" label="ΔG (kcal/mol)" /></th>
                            <th className="px-4 py-3 text-left">Immunogenicity</th>
                            <th className="px-4 py-3 text-left w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sorted.map((r) => (
                            <tr key={r.rank}
                                onClick={() => onRowClick?.(r.rank)}
                                className="hover:bg-brand/5 transition-colors cursor-pointer group">
                                <td className="px-4 py-3" onClick={(e) => { e.stopPropagation(); toggleSelect(r.rank); }}>
                                    <input type="checkbox" className="rounded" checked={selected.has(r.rank)} onChange={() => { }} />
                                </td>
                                <td className="px-4 py-3 font-mono font-bold text-slate-900">#{r.rank}</td>
                                <td className="px-4 py-3 font-mono text-slate-600 truncate max-w-[120px]" title={r.sequence}>
                                    {r.sequence.slice(0, 14)}…
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn('px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold', scoreColor(r.pLDDT, 70, 100))}>
                                        {r.pLDDT}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn('px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold', scoreColor(r.pTM, 0.6, 1))}>
                                        {r.pTM}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn('px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold', scoreColor(r.bindingAffinity, -12, -8, true))}>
                                        {r.bindingAffinity}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                                        r.immunogenicity === 'Low' ? 'text-success bg-success/10 border-success/20'
                                            : r.immunogenicity === 'Medium' ? 'text-warning bg-warning/10 border-warning/20'
                                                : 'text-error bg-error/10 border-error/20'
                                    )}>
                                        {r.immunogenicity}
                                    </span>
                                </td>
                                <td className="px-4 py-3" onClick={(e) => { e.stopPropagation(); toggleFav(r.rank); }}>
                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-yellow-500">
                                        {favorites.has(r.rank) ? <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> : <StarOff className="w-4 h-4" />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

// ── Mode-specific model filter ────────────────────────────────────────────────
const MODE_MODELS: Record<GenMode, ModelId[]> = {
    structure: ['alphafold3', 'esmfold'],
    sequence: ['rfdiffusion', 'esm3'],
    protac: ['rfdiffusion', 'alphafold3'],
    crispr: ['esm3', 'esmfold'],
};

export default function GenerativePage() {
    const { activeProject } = useProject();
    const [mode, setMode] = useState<GenMode>('structure');
    const [pdbId, setPdbId] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<ModelId>('alphafold3');
    const [numSeqs, setNumSeqs] = useState(500);
    const [advanced, setAdvanced] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [leftWidth, setLeftWidth] = useState(38); // percent
    const dragging = useRef(false);

    const [jobId, setJobId] = useState<string | null>(null);
    const submitJob = useSubmitJob();
    const { logs: logLines, progress, step, done: isDone, reset: resetStream } = useJobStream(jobId);
    const { data: jobData } = useJob(isDone ? jobId : null);

    const isRunning = !!jobId && !isDone && step !== 'failed';

    useEffect(() => {
        if (isDone) {
            setTimeout(() => setShowResults(true), 600);
        }
    }, [isDone]);

    const generatedMolecules = Array.isArray(jobData?.results?.molecules) ? (jobData.results.molecules as any[]) : [];
    const moleculesCount = generatedMolecules.length;

    const reset = useCallback(() => {
        setJobId(null);
        resetStream();
        setShowResults(false);
    }, [resetStream]);

    // When mode changes, auto-select the first compatible model and reset job
    const handleModeChange = useCallback((m: GenMode) => {
        setMode(m);
        setSelectedModel(MODE_MODELS[m][0]);
        reset();
        setPdbId(null);
    }, [reset]);

    const model = MODELS.find(m => m.id === selectedModel)!;

    const handleSubmit = () => {
        if (!pdbId) return;
        reset();
        submitJob.mutate(
            {
                name: `${model.name} generation`,
                type: model.id,
                projectId: activeProject?.id,
                parameters: { target: pdbId, num_seqs: numSeqs, advanced },
                estimatedGpuHours: model.estimatedGpuHours
            },
            {
                onSuccess: (data) => setJobId(data.jobId)
            }
        );
    };

    // ── Drag resize ───────────────────────────────────────────────────────────
    const handleMouseDown = () => { dragging.current = true; };
    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!dragging.current) return;
            const pct = (e.clientX / window.innerWidth) * 100;
            setLeftWidth(Math.max(28, Math.min(55, pct)));
        };
        const onUp = () => { dragging.current = false; };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    }, []);

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">

            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-brand/10 rounded-lg">
                        <Sparkles className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-slate-900">Generative Engine</h1>
                        <p className="text-xs text-slate-500">{GEN_MODES.find(m => m.id === mode)?.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    {pdbId && <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">{pdbId}</span>}
                    <span>·</span>
                    <span className="font-medium text-slate-700">{model.name}</span>
                    <span>·</span>
                    <span>~{model.estimatedGpuHours}h GPU</span>
                </div>
            </div>

            {/* Mode switcher tab bar */}
            <div className="bg-white border-b border-slate-200 px-6 shrink-0">
                <div className="flex gap-1">
                    {GEN_MODES.map((m) => {
                        const Icon = m.icon;
                        return (
                            <button key={m.id} onClick={() => handleModeChange(m.id)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap',
                                    mode === m.id
                                        ? 'border-brand text-brand'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {m.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Split panel body */}
            <div className="flex flex-1 overflow-hidden">

                {/* LEFT — Config / Progress panel */}
                <div
                    className="flex flex-col overflow-y-auto bg-white border-r border-slate-200 shrink-0"
                    style={{ width: `${leftWidth}%` }}
                >
                    <div className="flex-1 p-5 space-y-6">

                        {/* Section: Select Model */}
                        <section>
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">1. Select Model</h2>
                            <ModelSelector
                                selected={selectedModel}
                                onChange={setSelectedModel}
                                filter={MODE_MODELS[mode]}
                            />
                        </section>

                        {/* Section: Load Structure */}
                        <section>
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">2. Load Target Structure</h2>
                            <StructureInput onLoad={(id) => setPdbId(id)} />
                        </section>

                        {/* Section: Configure */}
                        <section>
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">3. Configure</h2>
                            {isRunning || isDone ? (
                                <JobProgress step={step || 'queued'} progress={progress} logLines={logLines} onCancel={reset} />
                            ) : (
                                <ConfigForm numSeqs={numSeqs} onNumSeqsChange={setNumSeqs} advanced={advanced} onAdvancedToggle={() => setAdvanced(!advanced)} />
                            )}
                        </section>

                    </div>

                    {/* Submit footer */}
                    {!isRunning && !isDone && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
                            <Button
                                onClick={handleSubmit}
                                disabled={!pdbId}
                                className="w-full bg-brand hover:bg-brand-hover text-white font-semibold h-10 disabled:opacity-40 gap-2"
                            >
                                <Play className="w-4 h-4" />
                                {pdbId ? `Run ${model.name} · ${numSeqs.toLocaleString()} seqs` : 'Load a structure to begin'}
                            </Button>
                            {pdbId && (
                                <p className="text-[10px] text-center text-slate-400 mt-2">
                                    Est. ~{model.estimatedGpuHours}h GPU · {(model.estimatedGpuHours * 0.9).toFixed(2)} credits
                                </p>
                            )}
                        </div>
                    )}

                    {isDone && (
                        <div className="p-4 border-t border-slate-100 bg-success/5 shrink-0">
                            <div className="flex items-center gap-2 text-sm font-semibold text-success mb-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Job complete — {moleculesCount} candidates
                            </div>
                            <Button onClick={reset} variant="outline" size="sm" className="w-full text-xs">
                                Run another job
                            </Button>
                        </div>
                    )}
                </div>

                {/* Drag handle */}
                <div
                    onMouseDown={handleMouseDown}
                    className="w-1 bg-slate-200 hover:bg-brand/40 cursor-col-resize transition-colors active:bg-brand shrink-0"
                />

                {/* RIGHT — Mol* viewer + results */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Mol* viewer */}
                    <div className={cn('transition-all duration-500 overflow-hidden', showResults ? 'h-[38%]' : 'flex-1')}>
                        <MolstarViewerPlaceholder pdbId={pdbId} />
                    </div>

                    {/* Results table (slides up after job completes) */}
                    {showResults && generatedMolecules.length > 0 && (
                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                            <ResultsTable results={generatedMolecules} onRowClick={(rank) => console.log('Highlight rank', rank)} />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
