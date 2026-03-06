'use client';

import { useState } from 'react';
import {
    MOCK_SYNTHESIS_ORDERS, MOCK_ASSAY_RESULTS,
    MOCK_IC50_CURVE,
} from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import {
    FlaskConical, BeakerIcon, Inbox, Plus, CheckCircle2,
    Clock, Truck, AlertCircle, Download, ChevronRight, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    LineChart, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid,
} from 'recharts';

// ── Status helpers ─────────────────────────────────────────────────────────────

const ORDER_STATUS: Record<string, { label: string; icon: React.FC<{ className?: string }>; cls: string }> = {
    delivered: { label: 'Delivered', icon: CheckCircle2, cls: 'text-success bg-success/10 border-success/20' },
    in_synthesis: { label: 'In Synthesis', icon: Clock, cls: 'text-brand bg-brand/10 border-brand/20' },
    quote_sent: { label: 'Quote Sent', icon: Truck, cls: 'text-warning bg-warning/10 border-warning/20' },
};

const ASSAY_STATUS: Record<string, string> = {
    pass: 'text-success bg-success/10 border-success/20',
    marginal: 'text-warning bg-warning/10 border-warning/20',
    fail: 'text-error bg-error/10 border-error/20',
};

type Tab = 'synthesis' | 'cloudlab' | 'inbox';

// ── Synthesis Orders Tab ───────────────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

export type LabOrder = {
    id: string;
    title: string;
    vendor: string;
    status: string;
    type: string;
    createdAt: string;
    orderedBy?: { name: string; avatarUrl: string | null };
};

function SynthesisTab() {
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('Synthesis Request #1024');
    const [provider, setProvider] = useState('Twist Bioscience');
    const queryClient = useQueryClient();

    const { data: orders = [], isLoading } = useQuery<LabOrder[]>({
        queryKey: ['lab-orders'],
        queryFn: async () => {
            const res = await fetch('/api/lab/orders');
            if (!res.ok) throw new Error('Failed to fetch orders');
            return res.json();
        }
    });

    const createOrder = useMutation({
        mutationFn: async (newOrder: any) => {
            const res = await fetch('/api/lab/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrder),
            });
            if (!res.ok) throw new Error('Failed to submit order');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
            setShowForm(false);
        }
    });

    const handlePlaceOrder = () => {
        createOrder.mutate({
            title,
            vendor: provider,
            type: 'DNA Synthesis',
            estimatedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            metadata: { sequenceCount: 1, costEstimate: 240 }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-slate-800">Synthesis Orders</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Manage gene and protein synthesis requests</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="bg-brand hover:bg-brand-hover text-white h-9 text-sm gap-2">
                    <Plus className="w-4 h-4" /> New Order
                </Button>
            </div>

            {/* New order form */}
            {showForm && (
                <div className="bg-brand/5 border border-brand/20 rounded-2xl p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-800">Configure Synthesis Order</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Request Title</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
                                placeholder="e.g. ABL1 Variants Batch 4"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Provider</label>
                            <div className="flex gap-2">
                                {['Twist Bioscience', 'IDT', 'Ginkgo'].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setProvider(p)}
                                        className={cn(
                                            "flex-1 py-2 text-xs font-semibold border rounded-lg transition-colors",
                                            provider === p ? "border-brand bg-brand/10 text-brand" : "border-slate-200 hover:border-brand/30 hover:text-brand hover:bg-brand/5 text-slate-600 bg-white"
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-500">Sequence type</span>
                            <span className="font-mono font-semibold text-slate-700">DNA</span>
                        </div>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-500">Estimated cost</span>
                            <span className="font-mono font-semibold text-slate-700">$240 USD</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Lead time</span>
                            <span className="font-mono font-semibold text-slate-700">10–14 business days</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            disabled={createOrder.isPending}
                            onClick={handlePlaceOrder}
                            className="bg-brand hover:bg-brand-hover text-white flex-1 h-9 text-sm"
                        >
                            {createOrder.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Place Order'}
                        </Button>
                        <Button variant="outline" onClick={() => setShowForm(false)} className="h-9 text-sm border-slate-200">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Orders table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="px-5 py-3 text-left">Request</th>
                            <th className="px-5 py-3 text-left">Provider</th>
                            <th className="px-5 py-3 text-left">Status</th>
                            <th className="px-5 py-3 text-left">Added By</th>
                            <th className="px-5 py-3 text-left">Ordered On</th>
                            <th className="px-5 py-3 text-left"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="py-10 text-center text-slate-400">
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                                    Loading orders...
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-10 text-center text-slate-500 text-xs">
                                    No lab synthesis orders yet.
                                </td>
                            </tr>
                        ) : orders.map((o) => {
                            const s = ORDER_STATUS[o.status] || { label: o.status, icon: Clock, cls: 'text-slate-500 bg-slate-100 border-slate-200' };
                            const Icon = s.icon;
                            return (
                                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-4 font-semibold text-slate-800">{o.title}</td>
                                    <td className="px-5 py-4 text-slate-600">{o.vendor}</td>
                                    <td className="px-5 py-4">
                                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize', s.cls)}>
                                            <Icon className="w-3 h-3" />{s.label}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-slate-600">
                                        {o.orderedBy?.name || 'System'}
                                    </td>
                                    <td className="px-5 py-4 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                                    <td className="px-5 py-4">
                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Cloud Lab Tab ──────────────────────────────────────────────────────────────

function CloudLabTab() {
    return (
        <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Cloud Lab Jobs</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                    { label: 'Emerald Cloud Lab', status: 'Connected', color: 'success' },
                    { label: 'Strateos', status: 'Not configured', color: 'slate' },
                    { label: 'Arcus Biosciences', status: 'Beta', color: 'warning' },
                ].map(lab => (
                    <div key={lab.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                            <p className="text-sm font-semibold text-slate-800">{lab.label}</p>
                            <span className={cn(
                                'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                                lab.color === 'success' ? 'text-success bg-success/10 border-success/20' :
                                    lab.color === 'warning' ? 'text-warning bg-warning/10 border-warning/20' :
                                        'text-slate-400 bg-slate-50 border-slate-200'
                            )}>{lab.status}</span>
                        </div>
                        <Button size="sm" variant="outline" className="w-full text-xs border-slate-200 h-8">
                            {lab.status === 'Connected' ? 'Launch Job' : 'Configure'}
                        </Button>
                    </div>
                ))}
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
                <BeakerIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-500">No active cloud lab jobs</p>
                <p className="text-xs text-slate-400 mt-1">Configure a CRO connection above to dispatch automated assays</p>
            </div>
        </div>
    );
}

// ── Assay Inbox Tab ───────────────────────────────────────────────────────────

function AssayInboxTab() {
    const [selected, setSelected] = useState(MOCK_ASSAY_RESULTS[0]);
    return (
        <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Assay Inbox</h2>
            <div className="grid grid-cols-2 gap-4">
                {/* Result cards */}
                <div className="space-y-2.5">
                    {MOCK_ASSAY_RESULTS.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => setSelected(r)}
                            className={cn(
                                'w-full text-left p-4 rounded-xl border transition-all',
                                selected.id === r.id ? 'border-brand/30 bg-brand/5' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                            )}
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="text-sm font-semibold text-slate-800">{r.molecule}</p>
                                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize', ASSAY_STATUS[r.result])}>
                                    {r.result}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">{r.assay}</p>
                            <p className="text-xs font-mono text-slate-700 mt-1">{r.Kd ?? r.IC50}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{r.date}</p>
                        </button>
                    ))}
                </div>

                {/* Detail: IC50 chart or binding data */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">{selected.molecule}</h3>
                    <p className="text-xs text-slate-500 mb-4">{selected.assay}</p>
                    {selected.assay.includes('SPR') ? (
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Kd (equilibrium)</span>
                                <span className="font-mono font-bold text-brand">{selected.Kd}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Result</span>
                                <span className={cn('font-semibold capitalize', selected.result === 'pass' ? 'text-success' : 'text-warning')}>
                                    {selected.result}
                                </span>
                            </div>
                            {/* Simulated sensorgram */}
                            <div className="mt-4">
                                <p className="text-[10px] text-slate-400 mb-2 font-semibold uppercase tracking-wider">SPR Sensorgram</p>
                                <ResponsiveContainer width="100%" height={140}>
                                    <LineChart data={MOCK_IC50_CURVE.map((d, i) => ({ time: i * 5, response: Math.max(0, Math.min(300, 300 * (1 - Math.exp(-i * 0.4)) + (Math.random() - 0.5) * 8)) }))}>
                                        <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={v => `${v}s`} />
                                        <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} width={30} />
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <Tooltip contentStyle={{ fontSize: 11 }} />
                                        <Line type="monotone" dataKey="response" stroke="#6366f1" strokeWidth={2} dot={false} name="RU" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Melting temperature (Tm)</span>
                                <span className="font-mono font-bold text-brand">68.4 °C</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Result</span>
                                <span className="font-semibold text-success capitalize">pass</span>
                            </div>
                            <div className="mt-4">
                                <p className="text-[10px] text-slate-400 mb-2 font-semibold uppercase tracking-wider">DSF Melt Curve</p>
                                <ResponsiveContainer width="100%" height={140}>
                                    <LineChart data={Array.from({ length: 30 }, (_, i) => ({ temp: 40 + i * 2, signal: 100 / (1 + Math.exp(-(40 + i * 2 - 68.4) * 0.8)) + (Math.random() - 0.5) * 3 }))}>
                                        <XAxis dataKey="temp" tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={v => `${v}°C`} />
                                        <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} width={30} />
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <Tooltip contentStyle={{ fontSize: 11 }} />
                                        <Line type="monotone" dataKey="signal" stroke="#22c55e" strokeWidth={2} dot={false} name="dF/dT" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                    <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1 text-xs border-slate-200 gap-1.5">
                            <Download className="w-3.5 h-3.5" /> Export
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'synthesis', label: 'Synthesis Orders', icon: FlaskConical },
    { id: 'cloudlab', label: 'Cloud Lab', icon: BeakerIcon },
    { id: 'inbox', label: 'Assay Inbox', icon: Inbox },
];

export default function LabBridgePage() {
    const [tab, setTab] = useState<Tab>('synthesis');

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
            {/* Top bar */}
            <div className="flex items-center gap-3 px-6 py-3.5 bg-white border-b border-slate-200 shrink-0">
                <div className="p-1.5 bg-rose-100 rounded-lg">
                    <FlaskConical className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                    <h1 className="text-base font-semibold text-slate-900">Lab Bridge</h1>
                    <p className="text-xs text-slate-500">Synthesis orders, cloud lab, assay inbox</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-slate-200 px-6 shrink-0">
                <div className="flex gap-1">
                    {TABS.map((t) => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors',
                                    tab === t.id
                                        ? 'border-brand text-brand'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {t.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {tab === 'synthesis' && <SynthesisTab />}
                {tab === 'cloudlab' && <CloudLabTab />}
                {tab === 'inbox' && <AssayInboxTab />}
            </div>
        </div>
    );
}
