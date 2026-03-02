import { Check, Minus, X } from 'lucide-react';

type CellValue = 'yes' | 'no' | 'partial';

const ROWS: { feature: string; axion: CellValue; lightweight: CellValue; monolith: CellValue }[] = [
    { feature: 'Agentic Workflow Orchestration', axion: 'yes', lightweight: 'no', monolith: 'partial' },
    { feature: 'Molecular Dynamics (MD/FEP)', axion: 'yes', lightweight: 'no', monolith: 'partial' },
    { feature: 'Multi-Omics Data Lake Integration', axion: 'yes', lightweight: 'no', monolith: 'yes' },
    { feature: 'CRO & Cloud Lab API Bridge', axion: 'yes', lightweight: 'no', monolith: 'no' },
    { feature: 'Enterprise SSO / SAML 2.0', axion: 'yes', lightweight: 'no', monolith: 'yes' },
    { feature: 'Custom Model Fine-tuning', axion: 'yes', lightweight: 'no', monolith: 'partial' },
    { feature: 'External B2B SaaS Access', axion: 'yes', lightweight: 'yes', monolith: 'no' },
    { feature: 'SOC 2 / HIPAA Compliance', axion: 'yes', lightweight: 'partial', monolith: 'yes' },
];

const CELL: Record<CellValue, { icon: typeof Check; className: string; label: string }> = {
    yes: { icon: Check, className: 'text-success', label: 'Yes' },
    no: { icon: X, className: 'text-error', label: 'No' },
    partial: { icon: Minus, className: 'text-warning', label: 'Partial' },
};

export function DifferentiationTable() {
    return (
        <section
            className="bg-slate-50 py-20 lg:py-28"
            aria-labelledby="diff-heading"
        >
            <div className="mx-auto max-w-7xl px-6 xl:px-8">
                {/* Header */}
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
                        Why AxionBio
                    </p>
                    <h2
                        id="diff-heading"
                        className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
                    >
                        The market is split between extremes.{' '}
                        <span className="text-brand">We bridge the gap.</span>
                    </h2>
                    <p className="mt-4 text-lg text-slate-600">
                        Lightweight aggregators lack enterprise depth. Closed monoliths hoard their
                        technology. AxionBio is the first truly open, full-stack B2B Bio4AI OS.
                    </p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full min-w-[640px] border-collapse" aria-label="Platform comparison">
                        <thead>
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 w-[40%]">
                                    Capability
                                </th>
                                {/* AxionBio column — highlighted */}
                                <th className="px-6 py-4 text-center text-sm font-semibold text-brand bg-blue-50 border-x-2 border-blue-200">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="inline-flex items-center rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">
                                            AxionBio
                                        </span>
                                        <span className="text-xs font-normal text-slate-500">Full-Stack Bio4AI OS</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                                    <div className="flex flex-col items-center gap-1">
                                        <span>Lightweight Aggregator</span>
                                        <span className="text-xs font-normal text-slate-400">e.g., no-code bio SaaS</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                                    <div className="flex flex-col items-center gap-1">
                                        <span>Closed Monolith</span>
                                        <span className="text-xs font-normal text-slate-400">e.g., internal-only platform</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {ROWS.map((row, i) => (
                                <tr
                                    key={row.feature}
                                    className={i % 2 === 1 ? 'bg-slate-50/60' : ''}
                                >
                                    <td className="px-6 py-3.5 text-sm text-slate-700 font-medium">
                                        {row.feature}
                                    </td>
                                    {(['axion', 'lightweight', 'monolith'] as const).map((col) => {
                                        const val = row[col];
                                        const { icon: Icon, className, label } = CELL[val];
                                        return (
                                            <td
                                                key={col}
                                                className={`px-6 py-3.5 text-center ${col === 'axion' ? 'bg-blue-50/60 border-x-2 border-blue-200' : ''}`}
                                            >
                                                <span className="inline-flex items-center justify-center">
                                                    <Icon
                                                        className={`h-5 w-5 ${className}`}
                                                        strokeWidth={2.5}
                                                        aria-label={label}
                                                    />
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
