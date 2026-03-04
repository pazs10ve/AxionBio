'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dna, CheckCircle2, UserPlus, Database, PlayCircle, XCircle, FolderPlus, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

type ActivityTab = 'my-activity' | 'workspace';

export type ActivityItem = {
    id: string;
    actionType: string;
    entityId: string | null;
    entityType: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date | string;
    actor: { name: string; email: string; avatarUrl: string | null };
    isMine: boolean;
};

const ActivityIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'job_completed': return <CheckCircle2 className="w-4 h-4 text-success" />;
        case 'job_started': return <PlayCircle className="w-4 h-4 text-running" />;
        case 'job_failed': return <XCircle className="w-4 h-4 text-error" />;
        case 'molecule_saved': return <Dna className="w-4 h-4 text-brand" />;
        case 'data_ingested': return <Database className="w-4 h-4 text-slate-500" />;
        case 'member_joined': return <UserPlus className="w-4 h-4 text-slate-500" />;
        case 'project_created': return <FolderPlus className="w-4 h-4 text-accent" />;
        default: return <Activity className="w-4 h-4 text-slate-500" />;
    }
};

/** Convert action_type enum to a human-readable sentence fragment */
function actionSentence(actionType: string, metadata: Record<string, unknown> | null): string {
    const name = (metadata?.jobName ?? metadata?.moleculeName ?? metadata?.projectName ?? metadata?.entityName ?? '') as string;
    switch (actionType) {
        case 'job_started': return `started job${name ? ` ${name}` : ''}`;
        case 'job_completed': return `completed job${name ? ` ${name}` : ''}`;
        case 'job_failed': return `job ${name || 'unknown'} failed`;
        case 'molecule_saved': return `saved molecule${name ? ` ${name}` : ''}`;
        case 'data_ingested': return `ingested data into ${name || 'the Data Lake'}`;
        case 'member_joined': return 'joined the workspace';
        case 'project_created': return `created project${name ? ` ${name}` : ''}`;
        default: return actionType.replace(/_/g, ' ');
    }
}

export function ActivityFeed({
    activities,
    currentUserId,
}: {
    activities: ActivityItem[];
    currentUserId: string;
}) {
    const [activeTab, setActiveTab] = useState<ActivityTab>('workspace');

    const filtered = activities.filter((a) => activeTab === 'workspace' || a.isMine);

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Activity Feed</h2>

                {/* Segmented Control */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('workspace')}
                        className={cn(
                            "px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200",
                            activeTab === 'workspace'
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Workspace
                    </button>
                    <button
                        onClick={() => setActiveTab('my-activity')}
                        className={cn(
                            "px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200",
                            activeTab === 'my-activity'
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Mine
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <div className="p-4 bg-slate-50 rounded-full mb-4 border border-slate-100">
                            <Activity className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-500">No activity yet</p>
                        <p className="text-xs text-slate-400 mt-1">Actions taken in this workspace will appear here.</p>
                    </div>
                ) : (
                    <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
                        {filtered.map((activity) => (
                            <div
                                key={activity.id}
                                className="relative flex items-start gap-4 p-2 rounded-xl transition-colors hover:bg-slate-50/80 -ml-[21px] pl-4"
                            >
                                {/* Timeline dot */}
                                <div className="absolute left-[-5px] top-3 w-[10px] h-[10px] rounded-full bg-slate-200 ring-4 ring-white" />

                                <div className="flex flex-col flex-1 pl-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Avatar className="w-5 h-5 border border-slate-200">
                                            <AvatarImage src={activity.actor.avatarUrl ?? ''} />
                                            <AvatarFallback className="text-[10px] bg-slate-100">
                                                {activity.actor.name[0]?.toUpperCase() ?? '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-semibold text-slate-900">{activity.actor.name}</span>
                                        <span className="text-xs text-slate-400 font-medium">
                                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>

                                    <div className="flex items-start gap-2 text-sm text-slate-600 pl-7 mt-1">
                                        <div className="mt-0.5 bg-slate-50 p-1 rounded-md border border-slate-100">
                                            <ActivityIcon type={activity.actionType} />
                                        </div>
                                        <p className="leading-relaxed">
                                            {actionSentence(activity.actionType, activity.metadata)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
