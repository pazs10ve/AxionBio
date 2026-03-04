'use client';

import { useState, useMemo } from 'react';
import { MOCK_MOLECULES, MoleculeStatus, MoleculeModality } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import {
    Dna, Star, Search, Filter, LayoutGrid, List,
    Cpu, FlaskConical, CheckCircle2, XCircle, Archive,
    Clock, ArrowRight, Download, Copy, ChevronDown, BookMarked,
    Microscope, Layers, SlidersHorizontal, X, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<MoleculeStatus, { label: string; cls: string; icon: React.FC<{ className?: string }> }> = {
    candidate: { label: 'Candidate', cls: 'text-slate-600 bg-slate-100 border-slate-200', icon: Clock },
    in_validation: { label: 'In Validation', cls: 'text-brand bg-brand/10 border-brand/20', icon: Microscope },
    ordered: { label: 'Ordered', cls: 'text-success bg-success/10 border-success/20', icon: CheckCircle2 },
    failed: { label: 'Failed', cls: 'text-error bg-error/10 border-error/20', icon: XCircle },
    archived: { label: 'Archived', cls: 'text-slate-400 bg-slate-50 border-slate-200', icon: Archive },
};

const MODALITY_CONFIG: Record<MoleculeModality, { label: string; icon: React.FC<{ className?: string }>; color: string }> = {
    protein_binder: { label: 'Protein Binder', icon: Dna, color: 'text-brand' },
    small_molecule: { label: 'Small Molecule', icon: Layers, color: 'text-violet-500' },
    crispr: { label: 'CRISPR', icon: Cpu, color: 'text-cyan-500' },
    antibody: { label: 'Antibody', icon: FlaskConical, color: 'text-amber-500' },
};

type Mol = typeof MOCK_MOLECULES[0];

// ── Score badge ───────────────────────────────────────────────────────────────

function ScorePill({ value, label, good, reverse = false }: { value: number | null; label: string; good: boolean; reverse?: boolean }) {
    if (value === null) return <span className="text-[10px] text-slate-300 font-mono">—</span>;
    return (
        <div className="flex flex-col items-center">
            <span className={cn(
                'text-xs font-bold font-mono',
                good ? (reverse ? 'text-success' : 'text-success') : 'text-warning'
            )}>{value}</span>
            <span className="text-[9px] text-slate-400 leading-none">{label}</span>
        </div>
    );
}

// ── Molecule Card (grid view) ─────────────────────────────────────────────────

function MoleculeCard({ mol, onSelect, selected, onStar }: { mol: Mol; onSelect: () => void; selected: boolean; onStar: () => void }) {
    const StatusIcon = STATUS_CONFIG[mol.status].icon;
    const ModalityIcon = MODALITY_CONFIG[mol.modality].icon;

    return (
        <div
            onClick={onSelect}
            className={cn(
                'bg-white rounded-2xl border transition-all duration-200 cursor-pointer group hover:shadow-sm',
                selected ? 'border-brand/40 ring-2 ring-brand/10 shadow-sm' : 'border-slate-200 hover:border-slate-300'
            )}
        >
            {/* Card header */}
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={cn(
                                'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                                STATUS_CONFIG[mol.status].cls
                            )}>
                                <StatusIcon className="w-2.5 h-2.5" />
                                {STATUS_CONFIG[mol.status].label}
                            </span>
                        </div>
                        <p className="font-semibold text-slate-900 leading-snug">{mol.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{mol.target}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onStar(); }}
                        className="shrink-0 transition-transform hover:scale-110">
                        <Star className={cn('w-4 h-4 transition-colors', mol.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-300 group-hover:text-slate-400')} />
                    </button>
                </div>

                {/* Modality + origin */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ModalityIcon className={cn('w-3.5 h-3.5', MODALITY_CONFIG[mol.modality].color)} />
                    <span>{MODALITY_CONFIG[mol.modality].label}</span>
                    <span className="text-slate-200">·</span>
                    <Cpu className="w-3 h-3 text-slate-300" />
                    <span>{mol.createdBy}</span>
                </div>
            </div>

            {/* Score row */}
            <div className="px-4 py-3 grid grid-cols-4 gap-2 text-center">
                <ScorePill value={mol.pLDDT} label="pLDDT" good={mol.pLDDT > 85} />
                <ScorePill value={mol.pTM} label="pTM" good={mol.pTM > 0.8} />
                <ScorePill value={mol.bindingDG} label="ΔG" good={mol.bindingDG < -9} />
                <ScorePill value={mol.Tm} label="Tm °C" good={mol.Tm !== null && mol.Tm > 60} />
            </div>

            {/* Tags + badges */}
            <div className="px-4 pb-3 flex flex-wrap gap-1">
                {mol.hasStructure && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 font-medium">3D</span>
                )}
                {mol.hasMD && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-600 border border-cyan-200 font-medium">MD</span>
                )}
                {mol.Kd && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/20 font-mono">Kd {mol.Kd}</span>
                )}
                {mol.tags.slice(0, 2).map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-200">{t}</span>
                ))}
            </div>
        </div>
    );
}

// ── Molecule Row (list view) ──────────────────────────────────────────────────

function MoleculeRow({ mol, onSelect, selected, onStar }: { mol: Mol; onSelect: () => void; selected: boolean; onStar: () => void }) {
    const StatusIcon = STATUS_CONFIG[mol.status].icon;

    return (
        <tr onClick={onSelect}
            className={cn(
                'cursor-pointer transition-colors border-b border-slate-50 last:border-0',
                selected ? 'bg-brand/5' : 'hover:bg-slate-50'
            )}>
            <td className="px-5 py-3.5">
                <button onClick={(e) => { e.stopPropagation(); onStar(); }} className="group">
                    <Star className={cn('w-4 h-4 transition-colors', mol.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-200 group-hover:text-slate-400')} />
                </button>
            </td>
            <td className="px-5 py-3.5">
                <p className="font-semibold text-slate-900 text-sm">{mol.name}</p>
                <p className="text-xs text-slate-400">{mol.project}</p>
            </td>
            <td className="px-5 py-3.5 text-xs text-slate-600">{mol.target}</td>
            <td className="px-5 py-3.5">
                <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border', STATUS_CONFIG[mol.status].cls)}>
                    <StatusIcon className="w-2.5 h-2.5" />
                    {STATUS_CONFIG[mol.status].label}
                </span>
            </td>
            <td className="px-5 py-3.5 font-mono text-xs text-slate-700">{mol.pLDDT}</td>
            <td className="px-5 py-3.5 font-mono text-xs text-slate-700">{mol.pTM}</td>
            <td className={cn('px-5 py-3.5 font-mono text-xs font-bold', mol.bindingDG < -9 ? 'text-success' : 'text-warning')}>
                {mol.bindingDG}
            </td>
            <td className="px-5 py-3.5 text-xs text-slate-500">{mol.Kd ?? '—'}</td>
            <td className="px-5 py-3.5 text-xs text-slate-500">{mol.createdBy}</td>
            <td className="px-5 py-3.5">
                <ArrowRight className="w-4 h-4 text-slate-300" />
            </td>
        </tr>
    );
}

// ── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({ mol, onClose }: { mol: Mol; onClose: () => void }) {
    const StatusIcon = STATUS_CONFIG[mol.status].icon;

    return (
        <div className="flex flex-col h-full bg-white border-l border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-slate-100 shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border', STATUS_CONFIG[mol.status].cls)}>
                            <StatusIcon className="w-2.5 h-2.5" />{STATUS_CONFIG[mol.status].label}
                        </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">{mol.name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{mol.target} · {mol.project}</p>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* 3D viewer placeholder */}
                <div className="h-36 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl flex items-center justify-center">
                    {mol.hasStructure ? (
                        <div className="text-center">
                            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full border-4 border-brand/20 animate-spin" style={{ animationDuration: '12s' }} />
                                <div className="absolute inset-3 rounded-full border-4 border-cyan-200/50 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />
                                <Dna className="absolute w-5 h-5 text-brand/60" />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2">3D structure available</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Layers className="w-8 h-8 text-slate-200 mx-auto" />
                            <p className="text-[10px] text-slate-400 mt-2">No structure computed</p>
                        </div>
                    )}
                </div>

                {/* Scores */}
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Computational Scores</p>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'pLDDT', value: mol.pLDDT, unit: '', good: mol.pLDDT > 85 },
                            { label: 'pTM', value: mol.pTM, unit: '', good: mol.pTM > 0.8 },
                            { label: 'Binding ΔG', value: mol.bindingDG, unit: 'kcal/mol', good: mol.bindingDG < -9 },
                            { label: 'Melting Tm', value: mol.Tm, unit: '°C', good: mol.Tm !== null && mol.Tm > 60 },
                        ].map(s => (
                            <div key={s.label} className={cn(
                                'p-3 rounded-xl border text-center',
                                s.value === null ? 'bg-slate-50 border-slate-100' :
                                    s.good ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'
                            )}>
                                <p className="text-[10px] text-slate-500 mb-1">{s.label}</p>
                                <p className={cn('text-lg font-bold font-mono', s.value === null ? 'text-slate-300' : s.good ? 'text-success' : 'text-warning')}>
                                    {s.value ?? '—'}
                                </p>
                                {s.unit && <p className="text-[10px] text-slate-400">{s.unit}</p>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Experimental */}
                {(mol.Kd || mol.Tm) && (
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Experimental Data</p>
                        <div className="space-y-2">
                            {mol.Kd && (
                                <div className="flex justify-between py-2 border-b border-slate-50 text-xs">
                                    <span className="text-slate-500">Kd (SPR)</span>
                                    <span className="font-mono font-bold text-success">{mol.Kd}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div className="flex justify-between py-2 border-b border-slate-50 text-xs">
                    <span className="text-slate-500">Immunogenicity</span>
                    <span className={cn('font-semibold', mol.immunogenicity === 'Low' ? 'text-success' : mol.immunogenicity === 'Medium' ? 'text-warning' : 'text-error')}>
                        {mol.immunogenicity}
                    </span>
                </div>


                {/* Sequence */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sequence</p>
                        <button className="text-[10px] text-slate-400 hover:text-brand flex items-center gap-1 transition-colors">
                            <Copy className="w-3 h-3" /> Copy
                        </button>
                    </div>
                    <pre className="bg-slate-950 text-green-400 text-[11px] font-mono rounded-xl p-3 break-all whitespace-pre-wrap">
                        {mol.sequence}
                    </pre>
                </div>

                {/* Tags */}
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                        {mol.tags.map(t => (
                            <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{t}</span>
                        ))}
                    </div>
                </div>

                {/* Meta */}
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-slate-500">Created by model</span>
                        <span className="font-semibold text-slate-700">{mol.createdBy}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-slate-500">Date added</span>
                        <span className="text-slate-700">{mol.createdAt}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-slate-500">MD simulation</span>
                        <span className={mol.hasMD ? 'text-success font-semibold' : 'text-slate-400'}>
                            {mol.hasMD ? <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Available</span> : 'Not run'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-100 space-y-2 shrink-0">
                <Button className="w-full bg-brand hover:bg-brand-hover text-white h-9 text-sm gap-2">
                    <FlaskConical className="w-4 h-4" /> Order Synthesis
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs border-slate-200 gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5" /> Send to MD
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs border-slate-200 gap-1.5">
                        <Download className="w-3.5 h-3.5" /> FASTA
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ── Filter pill ───────────────────────────────────────────────────────────────

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick}
            className={cn(
                'text-xs font-semibold px-3 py-1.5 rounded-full border transition-all',
                active ? 'bg-brand text-white border-brand' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800'
            )}>
            {children}
        </button>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const ALL_STATUSES: MoleculeStatus[] = ['candidate', 'in_validation', 'ordered', 'failed', 'archived'];
const ALL_MODALITIES: MoleculeModality[] = ['protein_binder', 'antibody', 'crispr', 'small_molecule'];

export default function MoleculesPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<MoleculeStatus | null>(null);
    const [modalityFilter, setModalityFilter] = useState<MoleculeModality | null>(null);
    const [starredOnly, setStarredOnly] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selected, setSelected] = useState<Mol | null>(null);
    const [molecules, setMolecules] = useState(MOCK_MOLECULES);
    const [sortBy, setSortBy] = useState<'pLDDT' | 'bindingDG' | 'createdAt'>('pLDDT');

    const toggleStar = (id: string) => {
        setMolecules(prev => prev.map(m => m.id === id ? { ...m, starred: !m.starred } : m));
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, starred: !prev.starred } : null);
    };

    const filtered = useMemo(() => {
        return molecules
            .filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.target.toLowerCase().includes(search.toLowerCase()) || m.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
            .filter(m => !statusFilter || m.status === statusFilter)
            .filter(m => !modalityFilter || m.modality === modalityFilter)
            .filter(m => !starredOnly || m.starred)
            .sort((a, b) => {
                if (sortBy === 'pLDDT') return b.pLDDT - a.pLDDT;
                if (sortBy === 'bindingDG') return a.bindingDG - b.bindingDG;
                return b.createdAt.localeCompare(a.createdAt);
            });
    }, [molecules, search, statusFilter, modalityFilter, starredOnly, sortBy]);

    const starredCount = molecules.filter(m => m.starred).length;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">

            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-brand/10 rounded-lg">
                        <BookMarked className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-slate-900">Molecules Library</h1>
                        <p className="text-xs text-slate-500">{molecules.length} candidates · {starredCount} starred</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, target, tag..."
                            className="h-9 pl-9 pr-4 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand w-72" />
                    </div>
                    {/* Sort */}
                    <div className="relative">
                        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                            className="h-9 pl-3 pr-8 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 appearance-none text-slate-700">
                            <option value="pLDDT">Sort: pLDDT</option>
                            <option value="bindingDG">Sort: ΔG</option>
                            <option value="createdAt">Sort: Date</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {/* View toggle */}
                    <div className="flex bg-slate-100 rounded-lg p-0.5">
                        <button onClick={() => setViewMode('grid')}
                            className={cn('p-1.5 rounded transition-colors', viewMode === 'grid' ? 'bg-white shadow-sm text-brand' : 'text-slate-400 hover:text-slate-600')}>
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')}
                            className={cn('p-1.5 rounded transition-colors', viewMode === 'list' ? 'bg-white shadow-sm text-brand' : 'text-slate-400 hover:text-slate-600')}>
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter strip */}
            <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 shrink-0 flex-wrap">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <FilterPill active={starredOnly} onClick={() => setStarredOnly(v => !v)}>
                    <Star className={cn('w-3 h-3 inline mr-1', starredOnly ? 'fill-current' : '')} />
                    Starred
                </FilterPill>
                <span className="h-4 w-px bg-slate-200" />
                {ALL_STATUSES.map(s => (
                    <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(prev => prev === s ? null : s)}>
                        {STATUS_CONFIG[s].label}
                    </FilterPill>
                ))}
                <span className="h-4 w-px bg-slate-200" />
                {ALL_MODALITIES.map(m => (
                    <FilterPill key={m} active={modalityFilter === m} onClick={() => setModalityFilter(prev => prev === m ? null : m)}>
                        {MODALITY_CONFIG[m].label}
                    </FilterPill>
                ))}
                {(statusFilter || modalityFilter || starredOnly || search) && (
                    <button onClick={() => { setStatusFilter(null); setModalityFilter(null); setStarredOnly(false); setSearch(''); }}
                        className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-3.5 h-3.5" /> Clear filters
                    </button>
                )}
            </div>

            {/* Body */}
            <div className={cn('flex flex-1 overflow-hidden', selected ? 'gap-0' : '')}>
                {/* Main content */}
                <div className={cn('flex-1 overflow-y-auto p-5 transition-all', selected ? 'max-w-[calc(100%-340px)]' : '')}>
                    {filtered.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center space-y-2">
                                <SlidersHorizontal className="w-8 h-8 text-slate-200 mx-auto" />
                                <p className="text-sm font-semibold text-slate-400">No molecules match your filters</p>
                                <p className="text-xs text-slate-300">Try adjusting your search or filter criteria</p>
                            </div>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map(mol => (
                                <MoleculeCard
                                    key={mol.id} mol={mol}
                                    onSelect={() => setSelected(prev => prev?.id === mol.id ? null : mol)}
                                    selected={selected?.id === mol.id}
                                    onStar={() => toggleStar(mol.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                                    <tr>
                                        <th className="px-5 py-3 w-8"></th>
                                        <th className="px-5 py-3 text-left">Molecule</th>
                                        <th className="px-5 py-3 text-left">Target</th>
                                        <th className="px-5 py-3 text-left">Status</th>
                                        <th className="px-5 py-3 text-center">pLDDT</th>
                                        <th className="px-5 py-3 text-center">pTM</th>
                                        <th className="px-5 py-3 text-center">ΔG</th>
                                        <th className="px-5 py-3 text-left">Kd</th>
                                        <th className="px-5 py-3 text-left">Origin</th>
                                        <th className="px-5 py-3 w-8"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(mol => (
                                        <MoleculeRow
                                            key={mol.id} mol={mol}
                                            onSelect={() => setSelected(prev => prev?.id === mol.id ? null : mol)}
                                            selected={selected?.id === mol.id}
                                            onStar={() => toggleStar(mol.id)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Detail drawer */}
                {selected && (
                    <div className="w-[340px] shrink-0 border-l border-slate-200 h-full overflow-hidden">
                        <DetailDrawer mol={selected} onClose={() => setSelected(null)} />
                    </div>
                )}
            </div>
        </div>
    );
}
