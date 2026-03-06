'use client';

import { useState } from 'react';
import { useMe } from '@/lib/hooks/use-me';
import { useActivity } from '@/lib/hooks/use-activity';
import { useMembers } from '@/lib/hooks/use-members';
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '@/lib/hooks/use-api-keys';
import { useUsage } from '@/lib/hooks/use-usage';
import { cn } from '@/lib/utils';
import {
    Building2, Users, Key, FileText, CreditCard,
    Plus, Copy, Trash2, Check, ChevronDown, Shield,
    Eye, EyeOff, Mail, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type SettingsTab = 'workspace' | 'team' | 'apikeys' | 'audit' | 'billing';

const ROLE_COLORS: Record<string, string> = {
    Admin: 'text-brand bg-brand/10 border-brand/20',
    Editor: 'text-success bg-success/10 border-success/20',
    Viewer: 'text-slate-500 bg-slate-50 border-slate-200',
    admin: 'text-brand bg-brand/10 border-brand/20',
    editor: 'text-success bg-success/10 border-success/20',
    viewer: 'text-slate-500 bg-slate-50 border-slate-200',
};

// ── Workspace Tab ────────────────────────────────────────────────────────────

function WorkspaceTab() {
    const { data: me } = useMe();
    const activeWorkspace = me?.workspaces?.[0];

    return (
        <div className="max-w-2xl space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                <h2 className="text-sm font-semibold text-slate-900">Workspace Settings</h2>
                <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">Workspace Name</label>
                    <input
                        key={activeWorkspace?.id}
                        defaultValue={activeWorkspace?.name ?? ''}
                        className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">Slug</label>
                    <div className="flex items-center">
                        <span className="h-9 px-3 text-sm border border-r-0 border-slate-200 rounded-l-lg bg-slate-50 flex items-center text-slate-400">
                            axionbio.com/
                        </span>
                        <input
                            key={`slug-${activeWorkspace?.id}`}
                            defaultValue={activeWorkspace?.slug ?? ''}
                            className="flex-1 h-9 px-3 text-sm border border-slate-200 rounded-r-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-mono"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">Plan</label>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-brand/5 border border-brand/20">
                        <div>
                            <p className="text-sm font-semibold text-brand capitalize">{activeWorkspace?.plan ?? 'trial'} Plan</p>
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
    const { data: me } = useMe();
    const ws = me?.workspaces?.[0];
    const { data: members = [], isLoading } = useMembers(ws?.id);
    const [inviting, setInviting] = useState(false);
    const [email, setEmail] = useState('');

    if (isLoading) return <div className="flex py-12 justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-slate-800">Team Members</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{members.length} members · 25 max on Pro</p>
                </div>
                <Button onClick={() => setInviting(!inviting)} className="bg-brand hover:bg-brand-hover text-white h-9 text-sm gap-2">
                    <Plus className="w-4 h-4" /> Invite member
                </Button>
            </div>

            {inviting && (
                <div className="bg-brand/5 border border-brand/20 rounded-2xl p-5 flex gap-3 items-end animate-in fade-in slide-in-from-top-2">
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
                            <th className="px-5 py-3 text-left">Joined</th>
                            <th className="px-5 py-3 text-left"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {members.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            {m.user.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || m.user.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{m.user.name || 'Invited User'}</p>
                                            <p className="text-xs text-slate-400">{m.user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border capitalize', ROLE_COLORS[m.role])}>
                                        {m.role}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{new Date(m.joinedAt).toLocaleDateString()}</td>
                                <td className="px-5 py-4 text-right">
                                    <button className="text-slate-300 hover:text-error transition-colors">
                                        <Trash2 className="w-4 h-4" />
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

// ── API Keys Tab ──────────────────────────────────────────────────────────────

function ApiKeysTab() {
    const { data: me } = useMe();
    const wsId = me?.workspaces?.[0]?.id;
    const { data: apiKeys = [], isLoading } = useApiKeys(wsId);
    const createKey = useCreateApiKey();
    const revokeKey = useRevokeApiKey();

    const [revealed, setRevealed] = useState<Set<string>>(new Set());
    const [copied, setCopied] = useState<string | null>(null);
    const [newKeyCleartext, setNewKeyCleartext] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [keyName, setKeyName] = useState('');

    const toggleReveal = (id: string) => {
        setRevealed(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleCreate = async () => {
        if (!keyName || !wsId) return;
        const res = await createKey.mutateAsync({ workspaceId: wsId, name: keyName });
        setNewKeyCleartext(res.cleartextKey!);
        setKeyName('');
    };

    if (isLoading) return <div className="flex py-12 justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-slate-800">API Keys</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Manage programmatic access to your workspace</p>
                </div>
                <Button onClick={() => setModalOpen(true)} className="bg-brand hover:bg-brand-hover text-white h-9 text-sm gap-2">
                    <Plus className="w-4 h-4" /> Generate key
                </Button>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        {!newKeyCleartext ? (
                            <>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Generate New API Key</h3>
                                <p className="text-sm text-slate-500 mb-6">Give your key a name to identify it later.</p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 block mb-1.5">Key Name</label>
                                        <input
                                            value={keyName}
                                            onChange={e => setKeyName(e.target.value)}
                                            placeholder="e.g. Production Adapter"
                                            className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end pt-2">
                                        <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                                        <Button onClick={handleCreate} disabled={createKey.isPending} className="bg-brand text-white">
                                            {createKey.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Key'}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
                                    <Shield className="w-6 h-6 text-success" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Key Generated Successfully</h3>
                                <p className="text-sm text-slate-500 mb-4 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                                    <span className="font-bold text-amber-800">Important:</span> Copy this key now. You won't be able to see it again for security reasons.
                                </p>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="flex-1 font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-600 break-all">
                                        {newKeyCleartext}
                                    </div>
                                    <Button onClick={() => copyToClipboard(newKeyCleartext, 'new')} variant="outline" className="shrink-0 h-10 w-10 p-0">
                                        {copied === 'new' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                                <Button className="w-full bg-slate-900 text-white" onClick={() => { setModalOpen(false); setNewKeyCleartext(null); }}>
                                    I've saved my key
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {apiKeys.length === 0 && (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center">
                        <Key className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 font-medium">No API keys generated yet</p>
                    </div>
                )}
                {apiKeys.map((k) => (
                    <div key={k.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{k.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Last used: {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'} · Created {new Date(k.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={() => revokeKey.mutate({ workspaceId: wsId!, id: k.id })}
                                disabled={revokeKey.isPending}
                                className="text-slate-300 hover:text-error transition-colors disabled:opacity-50"
                            >
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
    const { data: activities = [], isLoading } = useActivity();

    const auditLogs = activities.map(a => ({
        id: a.id,
        actor: a.actor.name ?? 'System',
        action: a.actionType.replace(/_/g, ' '),
        target: a.entityId ?? (a.metadata ? JSON.stringify(a.metadata) : 'N/A'),
        timestamp: new Date(a.createdAt).toLocaleString()
    }));

    const filtered = filter
        ? auditLogs.filter(l => l.action.toLowerCase().includes(filter.toLowerCase()) || l.actor.toLowerCase().includes(filter.toLowerCase()))
        : auditLogs;

    if (isLoading) return <div className="flex py-12 justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>;

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
                                <td className="px-5 py-3.5 whitespace-nowrap">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                            {l.actor.split(' ').map(n => n[0]).join('').slice(-2)}
                                        </div>
                                        <span className="font-medium text-slate-800">{l.actor}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 text-slate-600 capitalize">{l.action}</td>
                                <td className="px-5 py-3.5 text-slate-500 font-mono text-xs truncate max-w-[200px]">{l.target}</td>
                                <td className="px-5 py-3.5 text-slate-400 font-mono text-xs whitespace-nowrap">{l.timestamp}</td>
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
    const { data: me } = useMe();
    const wsId = me?.workspaces?.[0]?.id;
    const { data: usage, isLoading } = useUsage(wsId);

    if (isLoading) return <div className="flex py-12 justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>;

    const items = [
        { label: 'GPU Hours', used: usage?.gpuHoursUsed ?? 0, limit: usage?.gpuHoursLimit ?? 50000, unit: 'h' },
        { label: 'Storage', used: usage?.storageUsedGb ?? 0, limit: usage?.storageLimitGb ?? 500, unit: ' GB' },
        { label: 'Molecules', used: usage?.moleculeCount ?? 0, limit: 10000, unit: '' },
    ];

    return (
        <div className="max-w-2xl space-y-6">
            {/* Plan card */}
            <div className="bg-gradient-to-br from-brand to-accent p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-sm font-semibold opacity-80">Current Plan</p>
                        <h2 className="text-2xl font-bold mt-0.5">Enterprise (Trial)</h2>
                    </div>
                    <Shield className="w-8 h-8 opacity-60" />
                </div>
                <p className="text-sm opacity-80 mb-4">Renews on April 1, 2026 · $0.00 (Trial Credits)</p>
                <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-none h-8 text-xs">
                    Manage subscription
                </Button>
            </div>

            {/* Usage */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">Usage this month</h2>
                <div className="space-y-4">
                    {items.map((u) => {
                        const pct = Math.round(((Number(u.used)) / u.limit) * 100);
                        return (
                            <div key={u.label}>
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="font-semibold text-slate-700">{u.label}</span>
                                    <span className="text-slate-500 font-mono">
                                        {u.used}{u.unit} / {u.limit}{u.unit}
                                    </span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            'h-full rounded-full transition-all',
                                            pct > 85 ? 'bg-error' : pct > 60 ? 'bg-warning' : 'bg-brand'
                                        )}
                                        style={{ width: `${Math.min(100, pct)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">{pct}% used</p>
                            </div>
                        );
                    })}
                </div>
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
