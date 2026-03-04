'use client';

import { useState } from 'react';
import {
    MOCK_TEAM_MEMBERS, MOCK_API_KEYS, MOCK_AUDIT_LOGS,
} from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import {
    Building2, Users, Key, FileText, CreditCard,
    Plus, Copy, Trash2, Check, ChevronDown, Shield,
    Eye, EyeOff, Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type SettingsTab = 'workspace' | 'team' | 'apikeys' | 'audit' | 'billing';

const ROLE_COLORS: Record<string, string> = {
    Admin: 'text-brand bg-brand/10 border-brand/20',
    Editor: 'text-success bg-success/10 border-success/20',
    Viewer: 'text-slate-500 bg-slate-50 border-slate-200',
};

// ── Workspace Tab ────────────────────────────────────────────────────────────

function WorkspaceTab() {
    return (
        <div className="max-w-2xl space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                <h2 className="text-sm font-semibold text-slate-900">Workspace Settings</h2>
                <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">Workspace Name</label>
                    <input defaultValue="Smith Lab" className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">Slug</label>
                    <div className="flex items-center">
                        <span className="h-9 px-3 text-sm border border-r-0 border-slate-200 rounded-l-lg bg-slate-50 flex items-center text-slate-400">
                            axionbio.com/
                        </span>
                        <input defaultValue="smith-lab" className="flex-1 h-9 px-3 text-sm border border-slate-200 rounded-r-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-mono" />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">Plan</label>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-brand/5 border border-brand/20">
                        <div>
                            <p className="text-sm font-semibold text-brand">Pro Plan</p>
                            <p className="text-xs text-slate-500">50,000 GPU-hours / month · 25 team members</p>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs border-slate-200 h-8">Upgrade</Button>
                    </div>
                </div>
                <Button className="bg-brand hover:bg-brand-hover text-white h-9 text-sm">Save changes</Button>
            </section>

            {/* Danger zone */}
            <section className="bg-white rounded-2xl border border-error/20 shadow-sm p-6 space-y-3">
                <h2 className="text-sm font-semibold text-error">Danger Zone</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-800">Delete workspace</p>
                        <p className="text-xs text-slate-500">All data, jobs, and molecules will be permanently deleted.</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-error border-error/20 hover:bg-error/5 h-8 text-xs">
                        Delete workspace
                    </Button>
                </div>
            </section>
        </div>
    );
}

// ── Team Tab ──────────────────────────────────────────────────────────────────

function TeamTab() {
    const [inviting, setInviting] = useState(false);
    const [email, setEmail] = useState('');
    const [copied, setCopied] = useState<string | null>(null);

    const copyInviteLink = (id: string) => {
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-slate-800">Team Members</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{MOCK_TEAM_MEMBERS.length} members · 25 max on Pro</p>
                </div>
                <Button onClick={() => setInviting(!inviting)} className="bg-brand hover:bg-brand-hover text-white h-9 text-sm gap-2">
                    <Plus className="w-4 h-4" /> Invite member
                </Button>
            </div>

            {inviting && (
                <div className="bg-brand/5 border border-brand/20 rounded-2xl p-5 flex gap-3 items-end">
                    <div className="flex-1">
                        <label className="text-xs font-semibold text-slate-500 block mb-1.5">Email address</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="name@organization.com"
                                className="w-full pl-9 pr-4 h-9 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1.5">Role</label>
                        <select className="h-9 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 bg-white">
                            <option>Editor</option>
                            <option>Admin</option>
                            <option>Viewer</option>
                        </select>
                    </div>
                    <Button className="bg-brand hover:bg-brand-hover text-white h-9 text-sm shrink-0">Send invite</Button>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="px-5 py-3 text-left">Member</th>
                            <th className="px-5 py-3 text-left">Role</th>
                            <th className="px-5 py-3 text-left">Status</th>
                            <th className="px-5 py-3 text-left">Joined</th>
                            <th className="px-5 py-3 text-left"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {MOCK_TEAM_MEMBERS.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{m.name}</p>
                                            <p className="text-xs text-slate-400">{m.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border', ROLE_COLORS[m.role])}>
                                        {m.role}
                                    </span>
                                </td>
                                <td className="px-5 py-4">
                                    <span className={cn(
                                        'text-xs font-semibold px-2.5 py-1 rounded-full border',
                                        m.status === 'active'
                                            ? 'text-success bg-success/10 border-success/20'
                                            : 'text-slate-400 bg-slate-50 border-slate-200'
                                    )}>
                                        {m.status === 'active' ? 'Active' : 'Invited'}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-slate-500">{m.joined}</td>
                                <td className="px-5 py-4">
                                    {m.status === 'invited' ? (
                                        <button onClick={() => copyInviteLink(m.id)}
                                            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand transition-colors">
                                            {copied === m.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copied === m.id ? 'Copied!' : 'Copy link'}
                                        </button>
                                    ) : (
                                        <button className="text-slate-300 hover:text-error transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── API Keys Tab ──────────────────────────────────────────────────────────────

function ApiKeysTab() {
    const [revealed, setRevealed] = useState<Set<string>>(new Set());
    const [copied, setCopied] = useState<string | null>(null);

    const toggleReveal = (id: string) => {
        setRevealed(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const copyKey = (id: string) => {
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-slate-800">API Keys</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Manage programmatic access to your workspace</p>
                </div>
                <Button className="bg-brand hover:bg-brand-hover text-white h-9 text-sm gap-2">
                    <Plus className="w-4 h-4" /> Generate key
                </Button>
            </div>

            <div className="space-y-3">
                {MOCK_API_KEYS.map((k) => (
                    <div key={k.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{k.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">Last used: {k.lastUsed} · Created {k.created}</p>
                            </div>
                            <button className="text-slate-300 hover:text-error transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600">
                                {revealed.has(k.id) ? `${k.prefix}••••••••••••••••••••••••` : `${k.prefix}${'•'.repeat(24)}`}
                            </div>
                            <button onClick={() => toggleReveal(k.id)}
                                className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                                {revealed.has(k.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button onClick={() => copyKey(k.id)}
                                className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-brand hover:border-brand/30 hover:bg-brand/5 transition-colors">
                                {copied === k.id ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {k.scopes.map(s => (
                                <span key={s} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Audit Log Tab ─────────────────────────────────────────────────────────────

function AuditLogTab() {
    const [filter, setFilter] = useState('');
    const filtered = filter
        ? MOCK_AUDIT_LOGS.filter(l => l.action.toLowerCase().includes(filter.toLowerCase()) || l.actor.toLowerCase().includes(filter.toLowerCase()))
        : MOCK_AUDIT_LOGS;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">Audit Log</h2>
                <input
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    placeholder="Filter by action or actor..."
                    className="h-9 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand w-64"
                />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="px-5 py-3 text-left">Actor</th>
                            <th className="px-5 py-3 text-left">Action</th>
                            <th className="px-5 py-3 text-left">Target</th>
                            <th className="px-5 py-3 text-left">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.map((l) => (
                            <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                            {l.actor.split(' ').map(n => n[0]).join('').slice(-2)}
                                        </div>
                                        <span className="font-medium text-slate-800">{l.actor}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 text-slate-600">{l.action}</td>
                                <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{l.target}</td>
                                <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{l.timestamp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Billing Tab ───────────────────────────────────────────────────────────────

function BillingTab() {
    const usage = [
        { label: 'GPU Hours', used: 3280, limit: 50000, unit: 'h' },
        { label: 'Storage', used: 42, limit: 500, unit: 'GB' },
        { label: 'Synthesis Orders', used: 3, limit: 20, unit: '' },
    ];

    return (
        <div className="max-w-2xl space-y-6">
            {/* Plan card */}
            <div className="bg-gradient-to-br from-brand to-accent p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-sm font-semibold opacity-80">Current Plan</p>
                        <h2 className="text-2xl font-bold mt-0.5">Pro</h2>
                    </div>
                    <Shield className="w-8 h-8 opacity-60" />
                </div>
                <p className="text-sm opacity-80 mb-4">Renews on April 1, 2026 · $1,200/month</p>
                <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-none h-8 text-xs">
                    Manage subscription
                </Button>
            </div>

            {/* Usage */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">Usage this month</h2>
                <div className="space-y-4">
                    {usage.map((u) => {
                        const pct = Math.round((u.used / u.limit) * 100);
                        return (
                            <div key={u.label}>
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="font-semibold text-slate-700">{u.label}</span>
                                    <span className="text-slate-500 font-mono">
                                        {u.used.toLocaleString()}{u.unit} / {u.limit.toLocaleString()}{u.unit}
                                    </span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            'h-full rounded-full transition-all',
                                            pct > 85 ? 'bg-error' : pct > 60 ? 'bg-warning' : 'bg-brand'
                                        )}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">{pct}% used</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Invoice history */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-900">Invoice history</h2>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="px-5 py-3 text-left">Period</th>
                            <th className="px-5 py-3 text-left">Amount</th>
                            <th className="px-5 py-3 text-left">Status</th>
                            <th className="px-5 py-3 text-left"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {[
                            { period: 'March 2026', amount: '$1,200.00', status: 'Open' },
                            { period: 'February 2026', amount: '$1,200.00', status: 'Paid' },
                            { period: 'January 2026', amount: '$1,200.00', status: 'Paid' },
                        ].map((inv) => (
                            <tr key={inv.period} className="hover:bg-slate-50">
                                <td className="px-5 py-3.5 font-semibold text-slate-800">{inv.period}</td>
                                <td className="px-5 py-3.5 font-mono text-slate-700">{inv.amount}</td>
                                <td className="px-5 py-3.5">
                                    <span className={cn(
                                        'text-xs font-semibold px-2 py-0.5 rounded-full border',
                                        inv.status === 'Paid' ? 'text-success bg-success/10 border-success/20' : 'text-brand bg-brand/10 border-brand/20'
                                    )}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <button className="text-xs text-slate-400 hover:text-brand transition-colors flex items-center gap-1">
                                        PDF <ChevronDown className="w-3 h-3 -rotate-90" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS: { id: SettingsTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'workspace', label: 'Workspace', icon: Building2 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'apikeys', label: 'API Keys', icon: Key },
    { id: 'audit', label: 'Audit Log', icon: FileText },
    { id: 'billing', label: 'Billing', icon: CreditCard },
];

export default function SettingsPage() {
    const [tab, setTab] = useState<SettingsTab>('workspace');

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
            {/* Top bar */}
            <div className="flex items-center gap-3 px-6 py-3.5 bg-white border-b border-slate-200 shrink-0">
                <div className="p-1.5 bg-slate-100 rounded-lg">
                    <Building2 className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                    <h1 className="text-base font-semibold text-slate-900">Settings</h1>
                    <p className="text-xs text-slate-500">Workspace, team, API, billing</p>
                </div>
            </div>

            {/* Tab bar */}
            <div className="bg-white border-b border-slate-200 px-6 shrink-0">
                <div className="flex gap-1">
                    {TABS.map((t) => {
                        const Icon = t.icon;
                        return (
                            <button key={t.id} onClick={() => setTab(t.id)}
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
                {tab === 'workspace' && <WorkspaceTab />}
                {tab === 'team' && <TeamTab />}
                {tab === 'apikeys' && <ApiKeysTab />}
                {tab === 'audit' && <AuditLogTab />}
                {tab === 'billing' && <BillingTab />}
            </div>
        </div>
    );
}
