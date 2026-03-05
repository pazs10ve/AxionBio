'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    FolderSearch, Plus, X, Calendar, Cpu,
    ChevronRight, Loader2, Activity, Dna, Beaker,
    Target, Tag, Users, FlaskConical, Bot, Archive,
    Clock, CheckCircle2, BookMarked, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useProject } from '@/lib/project-context';
import { useCreateProject, type Project } from '@/lib/hooks/use-projects';
import { useJobs, type Job } from '@/lib/hooks/use-jobs';
import { useMolecules, type Molecule } from '@/lib/hooks/use-molecules';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { DashboardLayoutShell } from '@/components/layout/DashboardLayoutShell';

// ── Status config ──────────────────────────────────────────────────────────────

type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.FC<{ className?: string }> }> = {
    active: { label: 'Active', cls: 'text-success bg-success/10 border-success/20', icon: CheckCircle2 },
    paused: { label: 'Paused', cls: 'text-warning bg-warning/10 border-warning/20', icon: Clock },
    completed: { label: 'Completed', cls: 'text-brand bg-brand/10 border-brand/20', icon: CheckCircle2 },
    archived: { label: 'Archived', cls: 'text-slate-400 bg-slate-50 border-slate-200', icon: Archive },
    Discovery: { label: 'Discovery', cls: 'text-slate-400 bg-slate-50 border-slate-200', icon: Activity },
};

const PHASE_COLORS: Record<string, string> = {
    Discovery: 'bg-slate-100 text-slate-600 border-slate-200',
    'Hit ID': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Lead Opt': 'bg-brand/10 text-brand border-brand/20',
    Preclinical: 'bg-success/10 text-success border-success/20',
};

const JOB_STATUS_CLS: Record<string, string> = {
    success: 'text-success bg-success/10 border-success/20',
    running: 'text-brand bg-brand/10 border-brand/20',
    failed: 'text-error bg-error/10 border-error/20',
    queued: 'text-slate-500 bg-slate-100 border-slate-200',
};

// ── Create Project Modal ───────────────────────────────────────────────────────

function CreateProjectModal({ onClose }: { onClose: () => void }) {
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [indication, setIndication] = useState('');
    const [program, setProgram] = useState('Oncology');
    const createProject = useCreateProject();
    const { success, error } = useToast();

    const handleCreate = () => {
        if (!name.trim()) return;
        createProject.mutate(
            { name: name.trim(), target, indication, program },
            {
                onSuccess: () => {
                    success(`Project "${name.trim()}" created — start adding molecules via the Generative Engine`);
                    onClose();
                },
                onError: (err) => error(err.message),
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-900">New Project</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Project name</label>
                        <input value={name} onChange={e => setName(e.target.value)} autoFocus
                            placeholder="e.g. ABL1 Binder Campaign"
                            className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Target</label>
                            <input value={target} onChange={e => setTarget(e.target.value)} placeholder="ABL1, EGFR…"
                                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Indication</label>
                            <input value={indication} onChange={e => setIndication(e.target.value)} placeholder="e.g. CML"
                                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Therapeutic area</label>
                        <div className="flex flex-wrap gap-2">
                            {['Oncology', 'Immunology', 'Gene Therapy', 'CNS', 'Rare Disease'].map(p => (
                                <button key={p} onClick={() => setProgram(p)}
                                    className={cn(
                                        'px-3 py-1.5 text-xs font-semibold rounded-full border transition-all',
                                        program === p ? 'bg-brand text-white border-brand' : 'border-slate-200 text-slate-600 hover:border-brand/30 bg-white'
                                    )}>{p}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
                    <Button variant="outline" size="sm" onClick={onClose} className="border-slate-200 text-xs">Cancel</Button>
                    <Button onClick={handleCreate}
                        disabled={!name.trim() || createProject.isPending}
                        className="bg-brand hover:bg-brand-hover text-white text-xs h-9 gap-2">
                        {createProject.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Create Project
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ── Project Detail Drawer ─────────────────────────────────────────────────────

type DrawerTab = 'overview' | 'molecules' | 'jobs';

function ProjectDrawer({ project, onClose, onSetActive }: {
    project: Project;
    onClose: () => void;
    onSetActive: (p: Project) => void;
}) {
    const [tab, setTab] = useState<DrawerTab>('overview');
    const { activeProject } = useProject();
    const isActive = activeProject?.id === project.id;

    // Fetch molecules & jobs for this project via React Query
    const { data: projectMolecules = [] } = useMolecules({ projectId: project.id });
    const { data: projectJobs = [] } = useJobs({ projectId: project.id });

    const TABS: { id: DrawerTab; label: string; icon: React.FC<{ className?: string }> }[] = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'molecules', label: `Molecules (${projectMolecules.length})`, icon: Dna },
        { id: 'jobs', label: `Jobs (${projectJobs.length})`, icon: Cpu },
    ];

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full z-50 w-[520px] max-w-full bg-white border-l border-slate-200 shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className={cn('h-1.5 w-full shrink-0', project.color ?? 'bg-brand')} />
                <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {STATUS_CONFIG[project.status ?? 'active'] && (
                                <span className={cn(
                                    'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                    STATUS_CONFIG[project.status ?? 'active'].cls
                                )}>
                                    {(project.status ?? 'active').charAt(0).toUpperCase() + (project.status ?? 'active').slice(1)}
                                </span>
                            )}
                            {project.phase && (
                                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', PHASE_COLORS[project.phase] ?? 'bg-slate-100 text-slate-600 border-slate-200')}>
                                    {project.phase}
                                </span>
                            )}
                            {project.program && <span className="text-[10px] text-slate-400 font-medium">{project.program}</span>}
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 leading-snug">{project.name}</h2>
                        {(project.target || project.modality) && (
                            <p className="text-xs text-slate-500 mt-0.5 font-mono">
                                {[project.target, project.modality].filter(Boolean).join(' · ')}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {!isActive && (
                            <Button onClick={() => onSetActive(project)} size="sm"
                                className="bg-brand hover:bg-brand-hover text-white text-xs h-8 gap-1.5">
                                Set Active
                            </Button>
                        )}
                        {isActive && (
                            <span className="text-xs font-bold text-brand bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" /> Active
                            </span>
                        )}
                        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="flex border-b border-slate-100 px-2 shrink-0">
                    {TABS.map(t => {
                        const Icon = t.icon;
                        return (
                            <button key={t.id} onClick={() => setTab(t.id)}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap',
                                    tab === t.id ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-slate-700'
                                )}>
                                <Icon className="w-3.5 h-3.5" />
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto">

                    {/* Overview */}
                    {tab === 'overview' && (
                        <div className="p-6 space-y-6">
                            {project.description && (
                                <p className="text-sm text-slate-600 leading-relaxed">{project.description}</p>
                            )}

                            {/* Key fields */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Indication', value: project.indication, icon: Target },
                                    { label: 'Modality', value: project.modality, icon: Dna },
                                    { label: 'Phase', value: project.phase, icon: Activity },
                                    { label: 'Program', value: project.program, icon: FolderSearch },
                                ].filter(f => f.value).map(f => {
                                    const Icon = f.icon;
                                    return (
                                        <div key={f.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Icon className="w-3 h-3 text-slate-400" />
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{f.label}</p>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-800">{f.value}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                {[
                                    { label: 'Molecules', value: project.moleculeCount, icon: BookMarked },
                                    { label: 'Jobs run', value: project.jobCount, icon: Cpu },
                                    { label: 'Running', value: project.runningJobs, icon: Activity },
                                ].map(s => (
                                    <div key={s.label} className="bg-white border border-slate-200 rounded-xl py-3">
                                        <p className="text-xl font-bold text-slate-800 font-mono">{s.value}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Tags */}
                            {project.tags && project.tags.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Tag className="w-3 h-3" /> Tags</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {project.tags.map(t => (
                                            <span key={t} className="text-[11px] px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200 font-medium">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Dates */}
                            <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-100 pt-4">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</span>
                                </div>
                                {project.updatedAt && (
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
                                    </div>
                                )}
                            </div>

                            {/* Quick links */}
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { href: '/dashboard/generative', label: 'Run AI Model', icon: Cpu, color: 'text-brand' },
                                    { href: '/dashboard/simulation', label: 'Simulate', icon: Activity, color: 'text-cyan-600' },
                                    { href: '/dashboard/copilot', label: 'Ask Copilot', icon: Bot, color: 'text-violet-600' },
                                    { href: '/dashboard/lab', label: 'Order Synthesis', icon: FlaskConical, color: 'text-success' },
                                ].map(l => {
                                    const Icon = l.icon;
                                    return (
                                        <Link key={l.href} href={l.href} onClick={onClose}
                                            className="flex items-center gap-2.5 p-3 bg-white border border-slate-200 rounded-xl hover:border-brand/20 hover:bg-brand/5 transition-all group">
                                            <Icon className={cn('w-4 h-4 shrink-0', l.color)} />
                                            <span className="text-xs font-semibold text-slate-700 group-hover:text-brand transition-colors">{l.label}</span>
                                            <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-300 group-hover:text-brand transition-colors" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Molecules */}
                    {tab === 'molecules' && (
                        <div className="p-6">
                            {projectMolecules.length === 0 ? (
                                <div className="text-center py-16 space-y-2">
                                    <Dna className="w-8 h-8 text-slate-200 mx-auto" />
                                    <p className="text-sm text-slate-400 font-medium">No molecules yet</p>
                                    <Link href="/dashboard/generative" onClick={onClose}>
                                        <Button size="sm" variant="outline" className="text-xs gap-2 border-slate-200 mt-2">
                                            <Cpu className="w-3.5 h-3.5" /> Run Generative Engine
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {projectMolecules.map(mol => (
                                        <div key={mol.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                                            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                                                <Dna className="w-4 h-4 text-brand" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{mol.name}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">
                                                    {mol.scores ? Object.entries(mol.scores).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' · ') : mol.moleculeType}
                                                </p>
                                            </div>
                                            <span className={cn(
                                                'text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 capitalize',
                                                mol.status === 'lead' ? 'text-success bg-success/10 border-success/20' :
                                                    mol.status === 'candidate' ? 'text-brand bg-brand/10 border-brand/20' :
                                                        'text-slate-400 bg-slate-50 border-slate-200'
                                            )}>{mol.status}</span>
                                        </div>
                                    ))}
                                    <Link href="/dashboard/molecules" onClick={onClose}
                                        className="flex items-center justify-center gap-2 text-xs text-brand font-semibold py-2 hover:underline">
                                        View all in Molecules Library <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Jobs */}
                    {tab === 'jobs' && (
                        <div className="p-6">
                            {projectJobs.length === 0 ? (
                                <div className="text-center py-16 space-y-2">
                                    <Cpu className="w-8 h-8 text-slate-200 mx-auto" />
                                    <p className="text-sm text-slate-400 font-medium">No jobs run yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {projectJobs.map(job => (
                                        <div key={job.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                {job.status === 'running'
                                                    ? <Loader2 className="w-4 h-4 text-brand animate-spin" />
                                                    : <Cpu className="w-4 h-4 text-slate-500" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800">{job.name}</p>
                                                <p className="text-[10px] text-slate-400">
                                                    {job.type} · {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                            <span className={cn(
                                                'text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize shrink-0',
                                                JOB_STATUS_CLS[job.status] ?? 'text-slate-400 bg-slate-50 border-slate-200'
                                            )}>{job.status}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// ── Project Card ───────────────────────────────────────────────────────────────

function ProjectCard({ project, onOpen, isActive }: { project: Project; onOpen: () => void; isActive: boolean }) {
    const StatusIcon = STATUS_CONFIG[project.status ?? 'active']?.icon ?? Activity;
    return (
        <div
            onClick={onOpen}
            className={cn(
                'bg-white rounded-2xl border hover:shadow-sm transition-all cursor-pointer group overflow-hidden',
                isActive ? 'border-brand/40 ring-2 ring-brand/10' : 'border-slate-200 hover:border-slate-300'
            )}>
            <div className={cn('h-1 w-full', project.color ?? 'bg-brand')} />
            <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            {STATUS_CONFIG[project.status ?? 'active'] && (
                                <span className={cn(
                                    'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                                    STATUS_CONFIG[project.status ?? 'active'].cls
                                )}>
                                    <StatusIcon className="w-2.5 h-2.5" />
                                    {STATUS_CONFIG[project.status ?? 'active'].label}
                                </span>
                            )}
                            {project.phase && (
                                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', PHASE_COLORS[project.phase] ?? '')}>
                                    {project.phase}
                                </span>
                            )}
                            {isActive && (
                                <span className="text-[9px] font-bold text-brand">● Active</span>
                            )}
                        </div>
                        <h3 className="font-semibold text-slate-900 leading-snug group-hover:text-brand transition-colors">{project.name}</h3>
                        {(project.target || project.modality) && (
                            <p className="text-xs text-slate-500 mt-0.5 font-mono">
                                {[project.target, project.modality].filter(Boolean).join(' · ')}
                            </p>
                        )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand shrink-0 mt-1 transition-colors" />
                </div>

                {project.description && (
                    <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{project.description}</p>
                )}

                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    {[
                        { label: 'Molecules', value: project.moleculeCount },
                        { label: 'Jobs', value: project.jobCount },
                        { label: 'Running', value: project.runningJobs },
                    ].map(s => (
                        <div key={s.label} className="bg-slate-50 rounded-lg py-2 px-1">
                            <p className="text-base font-bold text-slate-800 font-mono">{s.value}</p>
                            <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {project.indication && (
                    <p className="text-[10px] text-slate-400 truncate">
                        <span className="font-medium text-slate-500">{project.indication}</span>
                    </p>
                )}
            </div>
        </div>
    );
}

// ── Filter strip ───────────────────────────────────────────────────────────────

const STATUS_FILTERS: { label: string; value: ProjectStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Paused', value: 'paused' },
    { label: 'Completed', value: 'completed' },
    { label: 'Archived', value: 'archived' },
];

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
    const { projects, activeProject, setActiveProject, isLoading } = useProject();
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
    const [showCreate, setShowCreate] = useState(false);
    const [drawerProject, setDrawerProject] = useState<Project | null>(null);
    const { success } = useToast();

    const filtered = projects.filter(p => statusFilter === 'all' || p.status === statusFilter);

    if (isLoading) {
        return (
            <DashboardLayoutShell>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-6 h-6 text-brand animate-spin" />
                </div>
            </DashboardLayoutShell>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
            {drawerProject && (
                <ProjectDrawer
                    project={drawerProject}
                    onClose={() => setDrawerProject(null)}
                    onSetActive={(p) => { setActiveProject(p); success(`"${p.name}" is now the active project`); }}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand/10 rounded-xl">
                        <FolderSearch className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Projects</h1>
                        <p className="text-sm text-slate-500">{projects.length} projects · {activeProject ? `Active: ${activeProject.name}` : 'No active project'}</p>
                    </div>
                </div>
                <Button onClick={() => setShowCreate(true)} className="bg-brand hover:bg-brand-hover text-white gap-2">
                    <Plus className="w-4 h-4" /> New Project
                </Button>
            </div>

            {/* Filter strip */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
                {STATUS_FILTERS.map(f => (
                    <button key={f.value} onClick={() => setStatusFilter(f.value)}
                        className={cn(
                            'text-xs font-semibold px-3 py-1.5 rounded-full border transition-all',
                            statusFilter === f.value
                                ? 'bg-brand text-white border-brand'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        )}>
                        {f.label}
                        <span className={cn('ml-1.5 text-[10px] font-bold', statusFilter === f.value ? 'text-white/70' : 'text-slate-400')}>
                            {f.value === 'all' ? projects.length : projects.filter(p => p.status === f.value).length}
                        </span>
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="flex items-center justify-center h-64 rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="text-center space-y-3">
                        <FolderSearch className="w-10 h-10 text-slate-200 mx-auto" />
                        <p className="text-sm font-semibold text-slate-400">No projects with this status</p>
                        <Button onClick={() => setShowCreate(true)} variant="outline" size="sm" className="text-xs gap-2 border-slate-200">
                            <Plus className="w-3.5 h-3.5" /> Create your first project
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(p => (
                        <ProjectCard
                            key={p.id}
                            project={p}
                            isActive={activeProject?.id === p.id}
                            onOpen={() => setDrawerProject(p)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
