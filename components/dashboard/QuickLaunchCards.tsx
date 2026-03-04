import Link from 'next/link';
import { Cpu, FlaskConical, Bot, ArrowRight } from 'lucide-react';

const cards = [
    {
        id: 'design-protein',
        icon: Cpu,
        label: 'Design a Protein',
        description: 'Run AlphaFold3, RFdiffusion, or ESM-3 on a target structure.',
        href: '/dashboard/generative',
        colorClass: 'text-brand',
        bgClass: 'bg-brand/5 hover:bg-brand/10 border-brand/15 hover:border-brand/30',
        iconBg: 'bg-brand/10',
    },
    {
        id: 'run-simulation',
        icon: FlaskConical,
        label: 'Run MD Simulation',
        description: 'GPU-accelerated GROMACS or OpenMM job with live RMSD streaming.',
        href: '/dashboard/simulation',
        colorClass: 'text-slate-600',
        bgClass: 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300',
        iconBg: 'bg-slate-100',
    },
    {
        id: 'ask-copilot',
        icon: Bot,
        label: 'Ask the AI Copilot',
        description: 'Describe a workflow in plain language and let the agent execute it.',
        href: '/dashboard/copilot',
        colorClass: 'text-accent',
        bgClass: 'bg-sky-50 hover:bg-sky-100 border-sky-100 hover:border-sky-200',
        iconBg: 'bg-sky-100',
    },
];

export function QuickLaunchCards() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <Link
                        key={card.id}
                        href={card.href}
                        className={`group flex flex-col p-5 rounded-xl border transition-all duration-200 cursor-pointer ${card.bgClass}`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`p-2 rounded-lg ${card.iconBg} transition-transform group-hover:scale-105`}>
                                <Icon className={`w-5 h-5 ${card.colorClass}`} />
                            </div>
                            <ArrowRight className={`w-4 h-4 ${card.colorClass} opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0`} />
                        </div>
                        <h3 className={`font-semibold text-sm mb-1 ${card.colorClass}`}>{card.label}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{card.description}</p>
                    </Link>
                );
            })}
        </div>
    );
}
