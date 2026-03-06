'use client';

import { useState, useMemo, useEffect } from 'react';
import { useMolecules, useUpdateMolecule, type Molecule } from '@/lib/hooks/use-molecules';
import { cn } from '@/lib/utils';
import {
    Dna, Star, Search, Filter, LayoutGrid, List,
    Cpu, FlaskConical, CheckCircle2, XCircle, Archive,
    Clock, ArrowRight, Download, Copy, ChevronDown, BookMarked,
    Microscope, Layers, SlidersHorizontal, X, Check, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

// ── Helpers to extract scores from the generic `scores` JSON ──────────────────

function score(mol: Molecule, key: string): number | null {
    const v = mol.scores?.[key];
    if (typeof v === 'number') return v;
    if (typeof v === 'string') { const n = parseFloat(v); return isNaN(n) ? null : n; }
    return null;
}

// ── Status config ─────────────────────────────────────────────────────────────

type MoleculeStatusKey = 'candidate' | 'in_validation' | 'ordered' | 'failed' | 'archived' | 'lead';

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.FC<{ className?: string }> }> = {
    candidate: { label: 'Candidate', cls: 'text-slate-600 bg-slate-100 border-slate-200', icon: Clock },
    in_validation: { label: 'In Validation', cls: 'text-brand bg-brand/10 border-brand/20', icon: Microscope },
    lead: { label: 'Lead', cls: 'text-success bg-success/10 border-success/20', icon: CheckCircle2 },
    ordered: { label: 'Ordered', cls: 'text-success bg-success/10 border-success/20', icon: CheckCircle2 },
    failed: { label: 'Failed', cls: 'text-error bg-error/10 border-error/20', icon: XCircle },
    archived: { label: 'Archived', cls: 'text-slate-400 bg-slate-50 border-slate-200', icon: Archive },
};

const MODALITY_CONFIG: Record<string, { label: string; icon: React.FC<{ className?: string }>; color: string }> = {
    protein_binder: { label: 'Protein Binder', icon: Dna, color: 'text-brand' },
    protein: { label: 'Protein', icon: Dna, color: 'text-brand' },
    small_molecule: { label: 'Small Molecule', icon: Layers, color: 'text-violet-500' },
    crispr: { label: 'CRISPR', icon: Cpu, color: 'text-cyan-500' },
    antibody: { label: 'Antibody', icon: FlaskConical, color: 'text-amber-500' },
};

// ── Score badge ───────────────────────────────────────────────────────────────

function ScorePill({ value, label, good }: { value: number | null; label: string; good: boolean }) {
    if (value === null) return <span className="text-[10px] text-slate-300 font-mono">—</span>;
    return (
        <div className="flex flex-col items-center">
            <span className={cn('text-xs font-bold font-mono', good ? 'text-success' : 'text-warning')}>{value}</span>
            <span className="text-[9px] text-slate-400 leading-none">{label}</span>
        </div>
    );
}

// ── Molecule Card (grid view) ─────────────────────────────────────────────────

function MoleculeCard({ mol, onSelect, selected, onStar }: { mol: Molecule; onSelect: () => void; selected: boolean; onStar: () => void }) {
    const StatusIcon = STATUS_CONFIG[mol.status]?.icon ?? Clock;
    const modality = mol.modality ?? mol.moleculeType ?? 'protein';
    const ModalityIcon = MODALITY_CONFIG[modality]?.icon ?? Dna;
    const modalityColor = MODALITY_CONFIG[modality]?.color ?? 'text-brand';
    const modalityLabel = MODALITY_CONFIG[modality]?.label ?? modality;

    const pLDDT = score(mol, 'pLDDT');
    const pTM = score(mol, 'pTM');
    const bindingDG = score(mol, 'bindingDG');
    const Tm = score(mol, 'Tm');

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
                            {STATUS_CONFIG[mol.status] && (
                                <span className={cn(
                                    'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                                    STATUS_CONFIG[mol.status].cls
                                )}>
                                    <StatusIcon className="w-2.5 h-2.5" />
                                    {STATUS_CONFIG[mol.status].label}
                                </span>
                            )}
                        </div>
                        <p className="font-semibold text-slate-900 leading-snug">{mol.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{mol.project?.name ?? mol.moleculeType}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onStar(); }}
                        className="shrink-0 transition-transform hover:scale-110">
                        <Star className={cn('w-4 h-4 transition-colors', mol.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-300 group-hover:text-slate-400')} />
                    </button>
                </div>

                {/* Modality + origin */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ModalityIcon className={cn('w-3.5 h-3.5', modalityColor)} />
                    <span>{modalityLabel}</span>
                    {mol.sourceJob && (
                        <>
                            <span className="text-slate-200">·</span>
                            <Cpu className="w-3 h-3 text-slate-300" />
                            <span>{mol.sourceJob.type}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Score row */}
            <div className="px-4 py-3 grid grid-cols-4 gap-2 text-center">
                <ScorePill value={pLDDT} label="pLDDT" good={pLDDT !== null && pLDDT > 85} />
                <ScorePill value={pTM} label="pTM" good={pTM !== null && pTM > 0.8} />
                <ScorePill value={bindingDG} label="ΔG" good={bindingDG !== null && bindingDG < -9} />
                <ScorePill value={Tm} label="Tm °C" good={Tm !== null && Tm > 60} />
            </div>

            {/* Tags */}
            <div className="px-4 pb-3 flex flex-wrap gap-1">
                {mol.pdbFileKey && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 font-medium">3D</span>
                )}
                {mol.trajectoryKey && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-600 border border-cyan-200 font-medium">MD</span>
                )}
                {mol.tags?.slice(0, 2).map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-200">{t}</span>
                ))}
            </div>
        </div>
    );
}

// ── Molecule Row (list view) ──────────────────────────────────────────────────

function MoleculeRow({ mol, onSelect, selected, onStar }: { mol: Molecule; onSelect: () => void; selected: boolean; onStar: () => void }) {
    const StatusIcon = STATUS_CONFIG[mol.status]?.icon ?? Clock;
    const pLDDT = score(mol, 'pLDDT');
    const pTM = score(mol, 'pTM');
    const bindingDG = score(mol, 'bindingDG');

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
                <p className="text-xs text-slate-400">{mol.project?.name ?? '—'}</p>
            </td>
            <td className="px-5 py-3.5 text-xs text-slate-600">{mol.moleculeType}</td>
            <td className="px-5 py-3.5">
                <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border', STATUS_CONFIG[mol.status]?.cls ?? '')}>
                    <StatusIcon className="w-2.5 h-2.5" />
                    {STATUS_CONFIG[mol.status]?.label ?? mol.status}
                </span>
            </td>
            <td className="px-5 py-3.5 font-mono text-xs text-slate-700">{pLDDT ?? '—'}</td>
            <td className="px-5 py-3.5 font-mono text-xs text-slate-700">{pTM ?? '—'}</td>
            <td className={cn('px-5 py-3.5 font-mono text-xs font-bold', bindingDG !== null && bindingDG < -9 ? 'text-success' : 'text-warning')}>
                {bindingDG ?? '—'}
            </td>
            <td className="px-5 py-3.5 text-xs text-slate-500">{mol.immunogenicity ?? '—'}</td>
            <td className="px-5 py-3.5 text-xs text-slate-500">{mol.sourceJob?.type ?? mol.creator?.name ?? '—'}</td>
            <td className="px-5 py-3.5">
                <ArrowRight className="w-4 h-4 text-slate-300" />
            </td>
        </tr>
    );
}

import dynamic from 'next/dynamic';

const MolstarViewer = dynamic(() => import('@/components/workbench/molstar-viewer'), {
    ssr: false,
    loading: () => (
        <div className="h-64 bg-slate-50 flex items-center justify-center rounded-xl border border-slate-200">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 text-brand animate-spin" />
                <span className="text-[10px] text-slate-400 font-medium">Loading 3D Engine...</span>
            </div>
        </div>
    )
});

// ── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({ mol, onClose }: { mol: Molecule; onClose: () => void }) {
    const StatusIcon = STATUS_CONFIG[mol.status]?.icon ?? Clock;
    const pLDDT = score(mol, 'pLDDT');
    const pTM = score(mol, 'pTM');
    const bindingDG = score(mol, 'bindingDG');
    const Tm = score(mol, 'Tm');

    const [signedUrl, setSignedUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!mol.pdbFileKey) {
            setSignedUrl(null);
            return;
        }

        const fetchUrl = async () => {
            try {
                // Fetch a short-lived signed URL to securely download the PDB from R2
                const res = await fetch(`/api/data/download-url?key=${encodeURIComponent(mol.pdbFileKey!)}`);
                if (!res.ok) throw new Error("Failed to get signed URL");
                const { url } = await res.json();
                setSignedUrl(url);
            } catch (error) {
                console.error("Error fetching signed URL:", error);
            }
        };

        fetchUrl();
    }, [mol.pdbFileKey]);

    return (
        <div className="flex flex-col h-full bg-white border-l border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-slate-100 shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        {STATUS_CONFIG[mol.status] && (
                            <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border', STATUS_CONFIG[mol.status].cls)}>
                                <StatusIcon className="w-2.5 h-2.5" />{STATUS_CONFIG[mol.status].label}
                            </span>
                        )}
                    </div>
                    <h2 className="text-base font-bold text-slate-900">{mol.name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{mol.moleculeType} · {mol.project?.name ?? '—'}</p>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* 3D Molstar Viewer */}
                <div className="w-full">
                    {mol.pdbFileKey && signedUrl ? (
                        <div className="h-64 rounded-xl overflow-hidden shadow-sm relative group">
                            <MolstarViewer molecules={[{ id: mol.id, url: signedUrl, label: mol.name, format: 'pdb' }]} />
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl pointer-events-none" />

                            {/* Optional full-screen button hook could go here */}
                        </div>
                    ) : mol.pdbFileKey && !signedUrl ? (
                        <div className="h-64 bg-slate-50 flex flex-col justify-center items-center rounded-xl border border-slate-200">
                            <div className="relative w-10 h-10 mx-auto flex items-center justify-center mb-2">
                                <div className="w-10 h-10 rounded-full border-2 border-brand/20 animate-spin" style={{ animationDuration: '3s' }} />
                                <Dna className="absolute w-4 h-4 text-brand/60" />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">Fetching secure link...</p>
                        </div>
                    ) : (
                        <div className="h-32 bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-200 border-dashed">
                            <Layers className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                            <p className="text-[10px] text-slate-400 font-medium">No 3D structure available</p>
                        </div>
                    )}
                </div>

                {/* Scores */}
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Computational Scores</p>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'pLDDT', value: pLDDT, unit: '', good: pLDDT !== null && pLDDT > 85 },
                            { label: 'pTM', value: pTM, unit: '', good: pTM !== null && pTM > 0.8 },
                            { label: 'Binding ΔG', value: bindingDG, unit: 'kcal/mol', good: bindingDG !== null && bindingDG < -9 },
                            { label: 'Melting Tm', value: Tm, unit: '°C', good: Tm !== null && Tm > 60 },
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

                {/* Immunogenicity */}
                {mol.immunogenicity && (
                    <div className="flex justify-between py-2 border-b border-slate-50 text-xs">
                        <span className="text-slate-500">Immunogenicity</span>
                        <span className={cn('font-semibold', mol.immunogenicity === 'Low' ? 'text-success' : mol.immunogenicity === 'Medium' ? 'text-warning' : 'text-error')}>
                            {mol.immunogenicity}
                        </span>
                    </div>
                )}

                {/* Sequence */}
                {mol.sequence && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sequence</p>
                            <button
                                onClick={() => navigator.clipboard.writeText(mol.sequence ?? '')}
                                className="text-[10px] text-slate-400 hover:text-brand flex items-center gap-1 transition-colors">
                                <Copy className="w-3 h-3" /> Copy
                            </button>
                        </div>
                        <pre className="bg-slate-950 text-green-400 text-[11px] font-mono rounded-xl p-3 break-all whitespace-pre-wrap">
                            {mol.sequence}
                        </pre>
                    </div>
                )}

                {/* Tags */}
                {mol.tags && mol.tags.length > 0 && (
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tags</p>
                        <div className="flex flex-wrap gap-1.5">
                            {mol.tags.map(t => (
                                <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{t}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Meta */}
                <div className="space-y-2 text-xs">
                    {mol.sourceJob && (
                        <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-slate-500">Created by model</span>
                            <span className="font-semibold text-slate-700">{mol.sourceJob.type}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-slate-500">Date added</span>
                        <span className="text-slate-700">{formatDistanceToNow(new Date(mol.createdAt), { addSuffix: true })}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-slate-500">MD simulation</span>
                        <span className={mol.trajectoryKey ? 'text-success font-semibold' : 'text-slate-400'}>
                            {mol.trajectoryKey ? <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Available</span> : 'Not run'}
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

const ALL_STATUSES = ['candidate', 'in_validation', 'lead', 'ordered', 'failed', 'archived'];
const ALL_MODALITIES = ['protein', 'protein_binder', 'antibody', 'crispr', 'small_molecule'];

export default function MoleculesPage() {
    const { data: molecules = [], isLoading } = useMolecules();
    const updateMolecule = useUpdateMolecule();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [modalityFilter, setModalityFilter] = useState<string | null>(null);
    const [starredOnly, setStarredOnly] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selected, setSelected] = useState<Molecule | null>(null);
    const [sortBy, setSortBy] = useState<'pLDDT' | 'bindingDG' | 'createdAt'>('createdAt');

    const toggleStar = (mol: Molecule) => {
        updateMolecule.mutate({ id: mol.id, starred: !mol.starred });
        // Optimistic update for the detail drawer
        if (selected?.id === mol.id) setSelected({ ...mol, starred: !mol.starred });
    };

    const filtered = useMemo(() => {
        const modKey = (m: Molecule) => m.modality ?? m.moleculeType ?? '';
        return molecules
            .filter(m => !search ||
                m.name.toLowerCase().includes(search.toLowerCase()) ||
                m.moleculeType.toLowerCase().includes(search.toLowerCase()) ||
                m.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
            )
            .filter(m => !statusFilter || m.status === statusFilter)
            .filter(m => !modalityFilter || modKey(m) === modalityFilter)
            .filter(m => !starredOnly || m.starred)
            .sort((a, b) => {
                if (sortBy === 'pLDDT') return (score(b, 'pLDDT') ?? 0) - (score(a, 'pLDDT') ?? 0);
                if (sortBy === 'bindingDG') return (score(a, 'bindingDG') ?? 0) - (score(b, 'bindingDG') ?? 0);
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
    }, [molecules, search, statusFilter, modalityFilter, starredOnly, sortBy]);

    const starredCount = molecules.filter(m => m.starred).length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 text-brand animate-spin" />
            </div>
        );
    }

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
                            placeholder="Search by name, type, tag..."
                            className="h-9 pl-9 pr-4 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand w-72" />
                    </div>
                    {/* Sort */}
                    <div className="relative">
                        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                            className="h-9 pl-3 pr-8 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 appearance-none text-slate-700">
                            <option value="createdAt">Sort: Date</option>
                            <option value="pLDDT">Sort: pLDDT</option>
                            <option value="bindingDG">Sort: ΔG</option>
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
                    STATUS_CONFIG[s] ? (
                        <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(prev => prev === s ? null : s)}>
                            {STATUS_CONFIG[s].label}
                        </FilterPill>
                    ) : null
                ))}
                <span className="h-4 w-px bg-slate-200" />
                {ALL_MODALITIES.map(m => (
                    MODALITY_CONFIG[m] ? (
                        <FilterPill key={m} active={modalityFilter === m} onClick={() => setModalityFilter(prev => prev === m ? null : m)}>
                            {MODALITY_CONFIG[m].label}
                        </FilterPill>
                    ) : null
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
                                    onStar={() => toggleStar(mol)}
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
                                        <th className="px-5 py-3 text-left">Type</th>
                                        <th className="px-5 py-3 text-left">Status</th>
                                        <th className="px-5 py-3 text-center">pLDDT</th>
                                        <th className="px-5 py-3 text-center">pTM</th>
                                        <th className="px-5 py-3 text-center">ΔG</th>
                                        <th className="px-5 py-3 text-left">Immuno.</th>
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
                                            onStar={() => toggleStar(mol)}
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
