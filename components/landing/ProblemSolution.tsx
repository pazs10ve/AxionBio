import { Puzzle, FlaskConical, BrainCircuit } from 'lucide-react';

const PAINS = [
    {
        icon: Puzzle,
        title: 'Fragmented Scientific Tools',
        description:
            'AlphaFold, RFdiffusion, GROMACS, and HMMER all live in separate silos. Your scientists waste weeks stitching pipelines together instead of doing science.',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
    },
    {
        icon: FlaskConical,
        title: 'Manual Wet-Lab Handoff',
        description:
            'The bridge from a digital design to a physical synthesis order is a string of emails, spreadsheets, and CRO portal logins. Every handoff is a failure mode.',
        color: 'text-violet-600',
        bg: 'bg-violet-50',
    },
    {
        icon: BrainCircuit,
        title: 'No Agentic Orchestration',
        description:
            'Existing platforms make you manually sequence every step. There is no OS-level intelligence that selects the right model, runs the right simulation, and routes results automatically.',
        color: 'text-rose-600',
        bg: 'bg-rose-50',
    },
];

export function ProblemSolution() {
    return (
        <section
            className="bg-white py-20 lg:py-28"
            aria-labelledby="problem-heading"
        >
            <div className="mx-auto max-w-7xl px-6 xl:px-8">

                {/* Section header */}
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
                        The Problem
                    </p>
                    <h2
                        id="problem-heading"
                        className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
                    >
                        The biotech industry is bottlenecked by fragmentation
                    </h2>
                    <p className="mt-4 text-lg text-slate-600">
                        Data lives in isolated silos. Computational tools require PhD-level engineers to
                        orchestrate. The translation from digital design to wet-lab reality is plagued by
                        manual logistics.
                    </p>
                </div>

                {/* Pain cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {PAINS.map((pain) => {
                        const Icon = pain.icon;
                        return (
                            <div
                                key={pain.title}
                                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${pain.bg}`}>
                                    <Icon className={`h-5 w-5 ${pain.color}`} strokeWidth={2} />
                                </div>
                                <h3 className="mb-2 text-base font-semibold text-slate-900">
                                    {pain.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    {pain.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Divider → Solution */}
                <div className="relative my-16 flex items-center justify-center" aria-hidden="true">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                    </div>
                    <span className="relative bg-white px-6 text-sm font-semibold uppercase tracking-widest text-slate-400">
                        The AxionBio Solution
                    </span>
                </div>

                {/* Solution statement */}
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        One unified operating system for your entire drug discovery pipeline
                    </h2>
                    <p className="mt-5 text-lg leading-relaxed text-slate-600">
                        AxionBio is not another point tool. It is the{' '}
                        <strong className="font-semibold text-brand">central nervous system</strong> for
                        modern biopharma, orchestrating generative design, deep physics simulation, and
                        physical lab synthesis through a single agentic platform. From the scientist&apos;s
                        screen to the automated lab&apos;s sequencer, without a single email.
                    </p>
                </div>
            </div>
        </section>
    );
}
