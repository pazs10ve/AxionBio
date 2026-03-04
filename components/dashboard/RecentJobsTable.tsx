'use client';

import { Badge } from '@/components/ui/badge';
import { PlayCircle, CheckCircle2, XCircle, Clock, ChevronRight, Dna, Ban } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export type JobStatus = 'running' | 'success' | 'failed' | 'queued' | 'cancelled';

export type Job = {
    id: string;
    name: string;
    type: string;
    status: JobStatus;
    gpuHours: number | null;
    startedAt: Date | string | null;
    completedAt: Date | string | null;
    createdAt: Date | string;
    createdBy: { name: string; avatarUrl: string | null };
};

const StatusIcon = ({ status }: { status: JobStatus }) => {
    switch (status) {
        case 'running': return <PlayCircle className="w-4 h-4 text-running animate-pulse" />;
        case 'success': return <CheckCircle2 className="w-4 h-4 text-success" />;
        case 'failed': return <XCircle className="w-4 h-4 text-error" />;
        case 'queued': return <Clock className="w-4 h-4 text-slate-400" />;
        case 'cancelled': return <Ban className="w-4 h-4 text-slate-400" />;
    }
};

const StatusBadge = ({ status }: { status: JobStatus }) => {
    const styles: Record<JobStatus, string> = {
        running: 'bg-running/10 text-running border-running/20',
        success: 'bg-success/10 text-success border-success/20',
        failed: 'bg-error/10 text-error border-error/20',
        queued: 'bg-slate-100 text-slate-600 border-slate-200',
        cancelled: 'bg-slate-100 text-slate-400 border-slate-200',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
            <StatusIcon status={status} />
            <span className="capitalize">{status}</span>
        </span>
    );
};

/** Prettify camelCase/snake_case type strings for display */
function formatJobType(type: string) {
    const map: Record<string, string> = {
        alphafold3: 'AlphaFold3',
        rfdiffusion: 'RFdiffusion',
        esm3: 'ESM-3',
        esm_fold: 'ESMFold',
        gromacs: 'GROMACS',
        openmm: 'OpenMM',
        fep: 'FEP',
        synthesis_order: 'Synthesis',
        cloud_lab: 'Cloud Lab',
    };
    return map[type.toLowerCase()] ?? type;
}

export function RecentJobsTable({ jobs }: { jobs: Job[] }) {
    const isEmpty = jobs.length === 0;

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">

            <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Recent Compute Jobs</h2>
                    <p className="text-sm text-slate-500">Your latest generative inference and simulation tasks.</p>
                </div>
                <button className="text-sm font-medium text-brand hover:text-brand-hover transition-colors flex items-center">
                    View all <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>

            {isEmpty ? (
                <div className="flex flex-col items-center justify-center flex-1 py-16 text-center">
                    <div className="p-4 bg-slate-50 rounded-full mb-4 border border-slate-100">
                        <Dna className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500">No jobs yet</p>
                    <p className="text-xs text-slate-400 mt-1">Launch a generative or simulation job to get started.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4 font-medium">Job Name</th>
                                <th className="px-6 py-4 font-medium">Model / Type</th>
                                <th className="px-6 py-4 font-medium">Created By</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium min-w-[140px]">Started</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {jobs.map((job) => (
                                <tr
                                    key={job.id}
                                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded bg-slate-100 group-hover:bg-white transition-colors border border-transparent ${job.status === 'running' ? 'group-hover:border-running/20' : 'group-hover:border-slate-200'}`}>
                                                <Dna className={`w-4 h-4 ${job.status === 'running' ? 'text-running' : 'text-slate-400'}`} />
                                            </div>
                                            <span className="truncate max-w-[200px]">{job.name}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-none font-medium text-xs">
                                            {formatJobType(job.type)}
                                        </Badge>
                                    </td>

                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        {job.createdBy.name}
                                    </td>

                                    <td className="px-6 py-4">
                                        <StatusBadge status={job.status} />
                                    </td>

                                    <td className="px-6 py-4 text-slate-500">
                                        {job.startedAt
                                            ? formatDistanceToNow(new Date(job.startedAt), { addSuffix: true })
                                            : <span className="text-slate-300">Not started</span>
                                        }
                                    </td>

                                    <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-brand font-medium hover:text-brand-hover hover:underline text-xs">
                                            {job.status === 'success' ? 'View Results' : job.status === 'running' ? 'View Logs' : 'Details'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
