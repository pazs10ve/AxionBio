'use client';

import { useState, useEffect, useRef } from 'react';
import { generateMockRMSDData, MOCK_MD_RESULT } from '@/lib/mock-data';
import { useJobPoller } from '@/lib/use-job-poller';
import { cn } from '@/lib/utils';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import {
    FlaskConical, Play, Download, ArrowRight, CheckCircle2,
    Loader2, Cpu, Thermometer, Waves, Layers, X, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Config Form ────────────────────────────────────────────────────────────────

const FORCE_FIELDS = ['AMBER99SB-ILDN', 'CHARMM36m', 'OPLS-AA/L'];
const WATER_MODELS = ['TIP3P', 'SPC/E', 'TIP4P'];
const SIM_PRESETS = [
    { label: '10ns', ns: 10, gpu: 1.2 },
    { label: '50ns', ns: 50, gpu: 6.2 },
    { label: '100ns', ns: 100, gpu: 12.4 },
    { label: '500ns', ns: 500, gpu: 62 },
];

function MDConfigForm({ onSubmit }: { onSubmit: () => void }) {
    const [receptor, setReceptor] = useState('ABL1-Binder-Rank1');
    const [forceField, setForceField] = useState(FORCE_FIELDS[0]);
    const [water, setWater] = useState(WATER_MODELS[0]);
    const [ns, setNs] = useState(50);
    const [temp, setTemp] = useState(310);
    const selectedPreset = SIM_PRESETS.find(p => p.ns === ns);

    return (
        <div className="space-y-5">
            {/* Receptor */}
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Receptor / Molecule
                </label>
                <select
                    value={receptor}
                    onChange={e => setReceptor(e.target.value)}
                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-slate-700"
                >
                    {['ABL1-Binder-Rank1', 'ABL1-Binder-Rank2', 'CompactCas-Variant-7'].map(r => (
                        <option key={r}>{r}</option>
                    ))}
                </select>
            </div>

            {/* Simulation length presets */}
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Simulation Length
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                    {SIM_PRESETS.map((p) => (
                        <button key={p.label} onClick={() => setNs(p.ns)}
                            className={cn(
                                'py-2 text-sm font-semibold rounded-lg border transition-all',
                                ns === p.ns
                                    ? 'bg-brand text-white border-brand'
                                    : 'border-slate-200 text-slate-600 hover:border-brand/30 hover:text-brand bg-white'
                            )}>
                            {p.label}
                        </button>
                    ))}
                </div>
                {selectedPreset && (
                    <p className="text-[11px] text-slate-400">Estimated GPU time: ~{selectedPreset.gpu}h</p>
                )}
            </div>

            {/* Force field */}
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Force Field</label>
                <div className="flex flex-wrap gap-2">
                    {FORCE_FIELDS.map(f => (
                        <button key={f} onClick={() => setForceField(f)}
                            className={cn(
                                'px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all',
                                forceField === f
                                    ? 'bg-brand/10 text-brand border-brand/30'
                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                            )}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Temperature */}
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between mb-2">
                    <span>Temperature</span>
                    <span className="font-mono text-brand normal-case">{temp} K ({(temp - 273).toFixed(0)} °C)</span>
                </label>
                <input type="range" min={280} max={370} step={5} value={temp}
                    onChange={e => setTemp(Number(e.target.value))}
                    className="w-full h-2 appearance-none rounded-full bg-slate-200 accent-brand cursor-pointer" />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>280K (7°C)</span><span>310K (37°C, physiological)</span><span>370K</span>
                </div>
            </div>

            {/* Water model */}
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Water Model</label>
                <div className="flex gap-2">
                    {WATER_MODELS.map(w => (
                        <button key={w} onClick={() => setWater(w)}
                            className={cn(
                                'px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all',
                                water === w
                                    ? 'bg-brand/10 text-brand border-brand/30'
                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                            )}>
                            {w}
                        </button>
                    ))}
                </div>
            </div>

            <Button onClick={onSubmit} className="w-full bg-brand hover:bg-brand-hover text-white font-semibold h-10 gap-2">
                <Play className="w-4 h-4" />
                Run {ns}ns GROMACS Simulation
            </Button>
            <p className="text-[10px] text-center text-slate-400">
                Uses A100 SXM4 80GB · {selectedPreset?.gpu ?? '?'}h estimated
            </p>
        </div>
    );
}

// ── Custom RMSD Tooltip ───────────────────────────────────────────────────────

function RMSDTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: number }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs space-y-1">
            <p className="font-semibold text-slate-600">{label?.toFixed(1)} ns</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }} className="font-mono font-semibold">
                    {p.name}: {p.value.toFixed(3)} Å
                </p>
            ))}
        </div>
    );
}

// ── RMSD Chart ────────────────────────────────────────────────────────────────

function RMSDChart({ data, showFull }: { data: ReturnType<typeof generateMockRMSDData>; showFull: boolean }) {
    const displayData = showFull ? data : data.slice(0, Math.ceil(data.length * 0.4));

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayData} margin={{ top: 8, right: 20, bottom: 8, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        tickFormatter={(v) => `${v}ns`}
                        label={{ value: 'Time (ns)', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#94a3b8' }}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        tickFormatter={(v) => `${v}Å`}
                        width={40}
                    />
                    <Tooltip content={<RMSDTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    {showFull && (
                        <ReferenceLine
                            x={displayData[Math.floor(displayData.length * 0.6)]?.time}
                            stroke="#22c55e"
                            strokeDasharray="4 2"
                            label={{ value: 'Converged', position: 'top', fontSize: 10, fill: '#22c55e' }}
                        />
                    )}
                    <Line
                        type="monotone"
                        dataKey="rmsd"
                        name="Backbone RMSD"
                        stroke="#6366f1"
                        strokeWidth={1.5}
                        dot={false}
                        strokeLinecap="round"
                        animationDuration={400}
                    />
                    <Line
                        type="monotone"
                        dataKey="rmsf"
                        name="RMSF"
                        stroke="#06b6d4"
                        strokeWidth={1.5}
                        dot={false}
                        strokeDasharray="4 2"
                        animationDuration={400}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

// ── Results Summary ────────────────────────────────────────────────────────────

function ResultsSummary() {
    const r = MOCK_MD_RESULT;

    const stats = [
        { label: 'Avg Backbone RMSD', value: `${r.avgRMSD} Å`, icon: Waves, good: r.avgRMSD < 2 },
        { label: 'Max RMSD', value: `${r.maxRMSD} Å`, icon: Waves, good: r.maxRMSD < 2.5 },
        { label: 'Binding ΔG', value: `${r.bindingDG} kcal/mol`, icon: Layers, good: r.bindingDG < -8 },
        { label: 'Melting Temp (Tm)', value: `${r.Tm} °C`, icon: Thermometer, good: r.Tm > 60 },
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">Simulation Results</h3>
                <p className="text-xs text-slate-500 mt-0.5">ABL1-Binder-Rank1 · 50ns · AMBER99SB</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 flex-1">
                {stats.map((s) => (
                    <div key={s.label} className={cn(
                        'p-3 rounded-xl border text-center',
                        s.good ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'
                    )}>
                        <p className="text-[10px] text-slate-500 font-medium mb-1">{s.label}</p>
                        <p className={cn('text-xl font-bold font-mono', s.good ? 'text-success' : 'text-warning')}>
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs border-slate-200 gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Trajectory
                </Button>
                <Button size="sm" className="flex-1 text-xs bg-brand hover:bg-brand-hover text-white gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Send to Engine
                </Button>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SimulationPage() {
    const [allData] = useState(() => generateMockRMSDData(100));
    const [liveData, setLiveData] = useState<ReturnType<typeof generateMockRMSDData>>([]);
    const liveIndexRef = useRef(0);

    const { step, progress, logLines, start, reset, isDone, isRunning } = useJobPoller(() => {
        // Show all data when complete
        setLiveData(allData);
    });

    // Stream data points into the chart as the job "runs"
    useEffect(() => {
        if (!isRunning) return;
        const id = setInterval(() => {
            if (liveIndexRef.current < allData.length * 0.9) {
                liveIndexRef.current += 1;
                setLiveData(allData.slice(0, liveIndexRef.current));
            }
        }, 100);
        return () => clearInterval(id);
    }, [isRunning, allData]);

    const handleStart = () => {
        liveIndexRef.current = 0;
        setLiveData([]);
        start([]);
    };

    const handleReset = () => {
        reset();
        setLiveData([]);
        liveIndexRef.current = 0;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">

            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-cyan-100 rounded-lg">
                        <FlaskConical className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-slate-900">Simulation Console</h1>
                        <p className="text-xs text-slate-500">MD · FEP · Developability</p>
                    </div>
                </div>
                {isDone && (
                    <div className="flex items-center gap-2 text-xs text-success font-semibold bg-success/5 px-3 py-1.5 rounded-full border border-success/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Simulation complete
                    </div>
                )}
                {isRunning && (
                    <div className="flex items-center gap-2 text-xs text-brand font-semibold bg-brand/5 px-3 py-1.5 rounded-full border border-brand/20">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Running · {Math.round(progress)}%
                    </div>
                )}
            </div>

            {/* 2×2 quadrant body */}
            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 p-4 overflow-hidden">

                {/* Q1: Config */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-y-auto p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <Cpu className="w-4 h-4 text-slate-500" />
                        <h2 className="text-sm font-semibold text-slate-700">MD Configuration</h2>
                    </div>
                    {isRunning || isDone ? (
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-600 font-medium capitalize">{step.replace('postprocessing', 'Post-processing')}</span>
                                <span className="font-mono text-brand tabular-nums">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-brand to-cyan-400 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }} />
                            </div>
                            <div className="bg-slate-950 rounded-xl p-3 font-mono text-[11px] text-green-400 h-36 overflow-y-auto">
                                {logLines.length === 0
                                    ? <span className="text-slate-600">Initializing GROMACS...</span>
                                    : logLines.slice(-8).map((l, i) => <div key={i}>{l}</div>)
                                }
                            </div>
                            {isDone && (
                                <Button onClick={handleReset} variant="outline" size="sm" className="w-full">
                                    Run another simulation
                                </Button>
                            )}
                            {isRunning && (
                                <Button onClick={handleReset} variant="outline" size="sm" className="w-full text-error border-error/20 hover:bg-error/5">
                                    <X className="w-3.5 h-3.5 mr-2" /> Cancel
                                </Button>
                            )}
                        </div>
                    ) : (
                        <MDConfigForm onSubmit={handleStart} />
                    )}
                </div>

                {/* Q2: RMSD Chart */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-4 shrink-0">
                        <div className="flex items-center gap-2">
                            <Waves className="w-4 h-4 text-slate-500" />
                            <h2 className="text-sm font-semibold text-slate-700">Backbone RMSD</h2>
                        </div>
                        {liveData.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                                {liveData.length > 0 && `${liveData[liveData.length - 1].time.toFixed(1)} / ${allData[allData.length - 1].time.toFixed(0)} ns`}
                            </div>
                        )}
                    </div>

                    {liveData.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center space-y-2">
                                <Waves className="w-8 h-8 text-slate-200 mx-auto" />
                                <p className="text-sm text-slate-400 font-medium">RMSD chart will appear here</p>
                                <p className="text-xs text-slate-300">Start a simulation to stream live data</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 min-h-0">
                            <RMSDChart data={liveData} showFull={isDone} />
                        </div>
                    )}
                </div>

                {/* Q3: Structure Viewer Placeholder */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-4 shrink-0">
                        <Layers className="w-4 h-4 text-slate-500" />
                        <h2 className="text-sm font-semibold text-slate-700">3D Trajectory Viewer</h2>
                    </div>
                    <div className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl flex items-center justify-center">
                        {isDone ? (
                            <div className="text-center space-y-3">
                                <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                                    <div className="w-32 h-32 rounded-full border-4 border-cyan-200/50 animate-spin" style={{ animationDuration: '14s' }} />
                                    <div className="absolute inset-4 rounded-full border-4 border-brand/30 animate-spin" style={{ animationDuration: '9s', animationDirection: 'reverse' }} />
                                    <FlaskConical className="absolute w-8 h-8 text-cyan-500" />
                                </div>
                                <p className="text-xs font-medium text-slate-600">ABL1-Binder-Rank1 equilibrated</p>
                                <p className="text-[10px] text-slate-400">50ns trajectory · RMSD converged at 62%</p>
                            </div>
                        ) : (
                            <div className="text-center space-y-2">
                                <Layers className="w-8 h-8 text-slate-200 mx-auto" />
                                <p className="text-sm text-slate-400 font-medium">Trajectory viewer</p>
                                <p className="text-xs text-slate-300">Loads after simulation completes</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Q4: Results */}
                <div className="overflow-hidden">
                    {isDone ? (
                        <ResultsSummary />
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex items-center justify-center">
                            <div className="text-center space-y-2">
                                <CheckCircle2 className="w-8 h-8 text-slate-200 mx-auto" />
                                <p className="text-sm text-slate-400 font-medium">Results summary</p>
                                <p className="text-xs text-slate-300">Appears after job completes</p>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
