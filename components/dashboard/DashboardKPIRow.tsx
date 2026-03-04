'use client';

import { Activity, Beaker, Clock, Cuboid } from 'lucide-react';

type KPIs = {
    activeJobs: number;
    candidatesGenerated30d: number;
    gpuHoursConsumed30d: number;
    labOrdersPending: number;
};

export function DashboardKPIRow({ kpis }: { kpis: KPIs }) {
    const cards = [
        {
            title: 'Active Compute Jobs',
            value: kpis.activeJobs.toString(),
            trend: kpis.activeJobs === 1 ? '1 job running' : `${kpis.activeJobs} running or queued`,
            icon: Activity,
            color: 'text-running',
            bg: 'bg-running/10',
            description: 'Running or queued on cluster',
        },
        {
            title: 'Candidates Generated',
            value: kpis.candidatesGenerated30d.toLocaleString(),
            trend: 'Last 30 days',
            icon: Cuboid,
            color: 'text-brand',
            bg: 'bg-brand/10',
            description: 'Across all active projects',
        },
        {
            title: 'Lab Orders Pending',
            value: kpis.labOrdersPending.toString(),
            trend: kpis.labOrdersPending > 0 ? 'Awaiting synthesis' : 'No pending orders',
            icon: Beaker,
            color: 'text-warning',
            bg: 'bg-warning/10',
            description: 'Sequences sent to Twist/IDT',
        },
        {
            title: 'GPU Hours Consumed',
            value: `${kpis.gpuHoursConsumed30d}h`,
            trend: 'Last 30 days',
            icon: Clock,
            color: 'text-success',
            bg: 'bg-success/10',
            description: 'Completed jobs only',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {cards.map((kpi, i) => (
                <div
                    key={i}
                    className="relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-6 shadow-sm group hover:shadow-md transition-all duration-200"
                >
                    {/* Subtle blurred blob for premium feel */}
                    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-40 transition-opacity group-hover:opacity-60 ${kpi.bg}`} />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-slate-500">{kpi.title}</h3>
                            <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color}`}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
                                {kpi.value}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-600">{kpi.trend}</span>
                            <span className="text-slate-400">{kpi.description}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
