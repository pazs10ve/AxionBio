'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    FolderSearch, Plus, MoreHorizontal, Dna, FlaskConical, Bot,
    BookMarked, Archive, Clock, CheckCircle2, X, ChevronRight,
    Cpu, Users, Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

// ── Mock data ──────────────────────────────────────────────────────────────────

type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';

type Project = {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    program: string;
    target: string;
    moleculeCount: number;
    jobCount: number;
    memberCount: number;
    lastActivity: string;
    createdAt: string;
    tags: string[];
    color: string;
};

const MOCK_PROJECTS: Project[] = [
    {
        id: 'proj-1', name: 'ABL1 Binder Campaign', status: 'active',
        description: 'De novo protein binder design targeting ABL1 kinase for CML therapy. Running RFdiffusion + ProteinMPNN pipeline.',
        program: 'Oncology', target: 'ABL1', moleculeCount: 24, jobCount: 12, memberCount: 3,
        lastActivity: '2 hours ago', createdAt: '2026-02-10', tags: ['protein-binder', 'kinase', 'rfdiffusion'],
        color: 'bg-brand',
    },
    {
        id: 'proj-2', name: 'CompactCas9 Engineering', status: 'active',
        description: 'Engineering smaller Cas9 variants for AAV packaging. Uses ESM-3 for variant scoring and structure prediction.',
        program: 'Gene Therapy', target: 'Cas9', moleculeCount: 8, jobCount: 6, memberCount: 2,
        lastActivity: '1 day ago', createdAt: '2026-02-20', tags: ['crispr', 'esm3', 'gene-therapy'],
        color: 'bg-cyan-500',
    },
    {
        id: 'proj-3', name: 'EGFR PROTAC Library', status: 'paused',
        description: 'PROTAC linker design for EGFR targeted degradation. Awaiting synthesis results from Twist Bioscience.',
        program: 'Oncology', target: 'EGFR', moleculeCount: 15, jobCount: 4, memberCount: 2,
        lastActivity: '3 days ago', createdAt: '2026-01-28', tags: ['protac', 'degrader', 'egfr'],
        color: 'bg-violet-500',
    },
    {
        id: 'proj-4', name: 'IL-6 Nanobody Screen', status: 'completed',
        description: 'AlphaFold3-guided nanobody affinity maturation against IL-6. Hit compounds progressed to SPR validation.',
        program: 'Immunology', target: 'IL-6', moleculeCount: 42, jobCount: 28, memberCount: 4,
        lastActivity: '2 weeks ago', createdAt: '2025-12-01', tags: ['nanobody', 'immunology', 'alphafold3'],
        color: 'bg-success',
    },
    {
        id: 'proj-5', name: 'BRAF V600E Degrader', status: 'archived',
        description: 'Early-stage binder campaign for BRAF V600E. Deprioritized after competitive intelligence update.',
        program: 'Oncology', target: 'BRAF V600E', moleculeCount: 6, jobCount: 3, memberCount: 1,
        lastActivity: '1 month ago', createdAt: '2025-11-10', tags: ['protac', 'braf', 'archived'],
        color: 'bg-slate-400',
    },
];

const STATUS_CONFIG: Record<ProjectStatus, { label: string; cls: string; icon: React.FC<{ className?: string }> }> = {
    active: { label: 'Active', cls: 'text-success bg-success/10 border-success/20', icon: CheckCircle2 },
    paused: { label: 'Paused', cls: 'text-warning bg-warning/10 border-warning/20', icon: Clock },
    completed: { label: 'Completed', cls: 'text-brand bg-brand/10 border-brand/20', icon: CheckCircle2 },
    archived: { label: 'Archived', cls: 'text-slate-400 bg-slate-50 border-slate-200', icon: Archive },
};

// ── Create Project Modal ───────────────────────────────────────────────────────

function CreateProjectModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [program, setProgram] = useState('Oncology');

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
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Primary target</label>
                        <input value={target} onChange={e => setTarget(e.target.value)}
                            placeholder="e.g. ABL1, EGFR, Cas9"
                            className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Program area</label>
                        <div className="flex flex-wrap gap-2">
                            {['Oncology', 'Immunology', 'Gene Therapy', 'CNS', 'Rare Disease'].map(p => (
                                <button key={p} onClick={() => setProgram(p)}
                                    className={cn(
                                        'px-3 py-1.5 text-xs font-semibold rounded-full border transition-all',
                                        program === p
                                            ? 'bg-brand text-white border-brand'
                                            : 'border-slate-200 text-slate-600 hover:border-brand/30 bg-white'
                                    )}>{p}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
                    <Button variant="outline" size="sm" onClick={onClose} className="border-slate-200 text-xs">Cancel</Button>
                    <Button onClick={() => { if (name.trim()) { onCreate(name.trim()); onClose(); } }}
                        disabled={!name.trim()}
                        className="bg-brand hover:bg-brand-hover text-white text-xs h-9 gap-2">
                        <Plus className="w-3.5 h-3.5" /> Create Project
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ── Project Card ───────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
    const StatusIcon = STATUS_CONFIG[project.status].icon;
    return (
        <div className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group overflow-hidden">
            {/* Color bar */}
            <div className={cn('h-1 w-full', project.color)} />
            <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={cn(
                                'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                                STATUS_CONFIG[project.status].cls
                            )}>
                                <StatusIcon className="w-2.5 h-2.5" />
                                {STATUS_CONFIG[project.status].label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{project.program}</span>
                        </div>
                        <h3 className="font-semibold text-slate-900 leading-snug group-hover:text-brand transition-colors">{project.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">Target: {project.target}</p>
                    </div>
                    <button className="text-slate-300 hover:text-slate-500 shrink-0 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{project.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    {[
                        { label: 'Molecules', value: project.moleculeCount, icon: BookMarked },
                        { label: 'Jobs run', value: project.jobCount, icon: Cpu },
                        { label: 'Members', value: project.memberCount, icon: Users },
                    ].map(s => (
                        <div key={s.label} className="bg-slate-50 rounded-lg py-2 px-1">
                            <p className="text-base font-bold text-slate-800 font-mono">{s.value}</p>
                            <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                    {project.tags.map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">{t}</span>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Created {project.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{project.lastActivity}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

const STATUS_FILTERS: { label: string; value: ProjectStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Paused', value: 'paused' },
    { label: 'Completed', value: 'completed' },
    { label: 'Archived', value: 'archived' },
];

export default function ProjectsPage() {
    const [projects, setProjects] = useState(MOCK_PROJECTS);
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
    const [showCreate, setShowCreate] = useState(false);
    const { success } = useToast();

    const filtered = projects.filter(p => statusFilter === 'all' || p.status === statusFilter);

    const handleCreate = (name: string) => {
        const newProject: Project = {
            id: `proj-${Date.now()}`, name, description: 'No description yet.',
            status: 'active', program: 'Oncology', target: 'TBD',
            moleculeCount: 0, jobCount: 0, memberCount: 1,
            lastActivity: 'just now', createdAt: new Date().toISOString().split('T')[0],
            tags: [], color: 'bg-brand',
        };
        setProjects(prev => [newProject, ...prev]);
        success(`Project "${name}" created`);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand/10 rounded-xl">
                        <FolderSearch className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Projects</h1>
                        <p className="text-sm text-slate-500">{projects.length} projects across {new Set(projects.map(p => p.program)).size} programs</p>
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

            {/* Grid */}
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
                    {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
                </div>
            )}
        </div>
    );
}
