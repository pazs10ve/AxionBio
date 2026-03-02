// Trusted-by logo data — greyscale with hover to color
const PARTNERS = [
    { name: 'Broad Institute', abbr: 'BROAD' },
    { name: 'Genentech', abbr: 'GENENTECH' },
    { name: 'Pfizer', abbr: 'PFIZER' },
    { name: 'Sanofi', abbr: 'SANOFI' },
    { name: 'Twist Bioscience', abbr: 'TWIST' },
    { name: 'Emerald Cloud Lab', abbr: 'EMERALD' },
    { name: 'AstraZeneca', abbr: 'AZ' },
    { name: 'Weizmann Institute', abbr: 'WEIZMANN' },
];

// Duplicate the list for seamless marquee loop
const MARQUEE_ITEMS = [...PARTNERS, ...PARTNERS];

export function TrustedBy() {
    return (
        <section
            className="border-y border-slate-100 bg-slate-50 py-12"
            aria-label="Trusted by"
        >
            <div className="mx-auto max-w-7xl px-6 xl:px-8">
                {/* Label */}
                <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Trusted by leading research institutions and biopharma
                </p>

                {/* Marquee container */}
                <div
                    className="relative overflow-hidden"
                    aria-label="Partner logos"
                >
                    {/* Fade masks on left/right edges */}
                    <div
                        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24"
                        style={{ background: 'linear-gradient(to right, #f8fafc, transparent)' }}
                        aria-hidden="true"
                    />
                    <div
                        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24"
                        style={{ background: 'linear-gradient(to left, #f8fafc, transparent)' }}
                        aria-hidden="true"
                    />

                    {/* Scrolling track */}
                    <div className="flex animate-marquee gap-12" aria-hidden="true">
                        {MARQUEE_ITEMS.map((p, i) => (
                            <LogoPlaceholder key={`${p.abbr}-${i}`} name={p.name} abbr={p.abbr} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function LogoPlaceholder({ name, abbr }: { name: string; abbr: string }) {
    return (
        <div
            className="flex shrink-0 items-center justify-center"
            title={name}
            aria-label={name}
        >
            {/* Pill-style logo stand-in — swap for real SVG logos later */}
            <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-white px-5 shadow-sm grayscale hover:grayscale-0 transition-all duration-300 cursor-default">
                <span className="whitespace-nowrap text-sm font-semibold tracking-tight text-slate-400 hover:text-slate-700 transition-colors">
                    {abbr}
                </span>
            </div>
        </div>
    );
}
