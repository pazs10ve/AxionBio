'use client';

import { useState, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { cn } from '@/lib/utils';
import {
    User, Camera, Save, Trash2, Shield, Bell,
    LogOut, ChevronRight, Check, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/toast';

const ROLES = ['Research Scientist', 'Computational Biologist', 'ML Engineer', 'Principal Investigator', 'CTO / CSO', 'Other'];
const TIMEZONES = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Kolkata', 'Asia/Tokyo'];

type Tab = 'profile' | 'notifications' | 'security';

const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
];

// ── Profile Tab ────────────────────────────────────────────────────────────────

function ProfileTab() {
    const { user } = useUser();
    const { success } = useToast();
    const fileRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(user?.name ?? '');
    const [bio, setBio] = useState('Computational drug discovery researcher. Building the future of AI-accelerated therapeutics.');
    const [role, setRole] = useState('Research Scientist');
    const [timezone, setTimezone] = useState('Asia/Kolkata');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setAvatarPreview(url);
    };

    const handleSave = () => {
        setSaved(true);
        success('Profile updated successfully');
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-8 max-w-xl">
            {/* Avatar */}
            <div className="flex items-center gap-6">
                <div className="relative">
                    <Avatar className="w-20 h-20 border-2 border-slate-200">
                        <AvatarImage src={avatarPreview ?? user?.picture ?? ''} alt={name} />
                        <AvatarFallback className="bg-brand/10 text-brand text-xl font-bold">
                            {name?.[0] ?? 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors">
                        <Camera className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-900">{name || 'Your Name'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                    <button onClick={() => fileRef.current?.click()}
                        className="text-xs text-brand font-semibold mt-1.5 hover:underline">
                        Change photo
                    </button>
                </div>
            </div>

            {/* Fields */}
            <div className="space-y-5">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Full name</label>
                    <input value={name} onChange={e => setName(e.target.value)}
                        className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" />
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Email</label>
                    <input value={user?.email ?? ''} disabled
                        className="w-full h-10 px-3 text-sm border border-slate-100 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed" />
                    <p className="text-[10px] text-slate-400 mt-1">Managed by Auth0 — change via your identity provider.</p>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Role</label>
                    <div className="flex flex-wrap gap-2">
                        {ROLES.map(r => (
                            <button key={r} onClick={() => setRole(r)}
                                className={cn(
                                    'text-xs font-semibold px-3 py-1.5 rounded-full border transition-all',
                                    role === r
                                        ? 'bg-brand text-white border-brand'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-brand/30'
                                )}>{r}</button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Bio</label>
                    <textarea
                        value={bio} onChange={e => setBio(e.target.value)} rows={3}
                        placeholder="Tell your team a bit about yourself..."
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none" />
                    <p className="text-[10px] text-slate-400 text-right mt-1">{bio.length}/200</p>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Timezone</label>
                    <select value={timezone} onChange={e => setTimezone(e.target.value)}
                        className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white text-slate-700">
                        {TIMEZONES.map(tz => <option key={tz}>{tz}</option>)}
                    </select>
                </div>
            </div>

            <Button onClick={handleSave} className={cn(
                'gap-2 transition-all',
                saved ? 'bg-success hover:bg-success text-white' : 'bg-brand hover:bg-brand-hover text-white'
            )}>
                {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save changes</>}
            </Button>
        </div>
    );
}

// ── Notifications Tab ──────────────────────────────────────────────────────────

const NOTIF_PREFS = [
    { id: 'job_complete', label: 'Job completed', desc: 'When a generative or simulation job finishes' },
    { id: 'job_failed', label: 'Job failed', desc: 'When a job encounters an error or times out' },
    { id: 'synthesis_update', label: 'Synthesis order update', desc: 'Status updates from CRO partners' },
    { id: 'team_invite', label: 'Team invitations', desc: 'When someone invites you to a workspace' },
    { id: 'weekly_digest', label: 'Weekly digest', desc: 'Summary of your workspace activity every Monday' },
];

function NotificationsTab() {
    const [prefs, setPrefs] = useState<Record<string, boolean>>({
        job_complete: true, job_failed: true, synthesis_update: true, team_invite: true, weekly_digest: false,
    });
    const { success } = useToast();

    return (
        <div className="space-y-3 max-w-xl">
            <p className="text-sm text-slate-500 mb-5">Choose which events trigger email and in-app notifications.</p>
            {NOTIF_PREFS.map(p => (
                <div key={p.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">{p.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{p.desc}</p>
                    </div>
                    <button
                        onClick={() => {
                            setPrefs(prev => ({ ...prev, [p.id]: !prev[p.id] }));
                            success(`Notification preference updated`);
                        }}
                        className={cn(
                            'w-10 h-6 rounded-full transition-colors relative shrink-0 ml-4',
                            prefs[p.id] ? 'bg-brand' : 'bg-slate-200'
                        )}>
                        <div className={cn(
                            'w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm',
                            prefs[p.id] ? 'left-5' : 'left-1'
                        )} />
                    </button>
                </div>
            ))}
        </div>
    );
}

// ── Security Tab ───────────────────────────────────────────────────────────────

function SecurityTab() {
    const [showDanger, setShowDanger] = useState(false);
    const { success, error } = useToast();

    return (
        <div className="space-y-8 max-w-xl">
            {/* Password */}
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Password</p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-700">Managed by Auth0</p>
                        <p className="text-xs text-slate-400 mt-0.5">Change your password through your Auth0 account portal.</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs border-slate-200 gap-1.5 shrink-0"
                        onClick={() => success('Redirecting to Auth0 account portal…')}>
                        Change <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* Sessions */}
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Active sessions</p>
                <div className="space-y-2">
                    {[
                        { device: 'Chrome on Windows', location: 'New Delhi, India', current: true, time: 'Now' },
                        { device: 'Safari on iPhone 16', location: 'New Delhi, India', current: false, time: '2 days ago' },
                    ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-slate-800">{s.device}</p>
                                    {s.current && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-success/10 text-success rounded border border-success/20">Current</span>}
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">{s.location} · {s.time}</p>
                            </div>
                            {!s.current && (
                                <button onClick={() => success('Session revoked')}
                                    className="text-slate-300 hover:text-error transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Danger zone */}
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Danger zone</p>
                <div className="border border-error/20 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-error/5">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Delete account</p>
                            <p className="text-xs text-slate-400 mt-0.5">Permanently delete your account and all workspace data.</p>
                        </div>
                        <Button variant="outline" size="sm"
                            onClick={() => setShowDanger(true)}
                            className="text-xs text-error border-error/20 hover:bg-error/5 shrink-0 gap-1.5">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                    </div>
                    {showDanger && (
                        <div className="border-t border-error/20 p-4 bg-error/5 space-y-3">
                            <p className="text-xs text-error font-semibold">This action is irreversible. All your molecules, jobs, and data will be permanently deleted.</p>
                            <div className="flex gap-2">
                                <Button onClick={() => setShowDanger(false)} variant="outline" size="sm" className="text-xs border-slate-200">Cancel</Button>
                                <Button onClick={() => { setShowDanger(false); error('Account deletion is disabled in demo mode'); }}
                                    size="sm" className="text-xs bg-error hover:bg-error/90 text-white gap-1.5">
                                    <Trash2 className="w-3.5 h-3.5" /> Confirm delete
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ProfilePage() {
    const { user } = useUser();
    const [tab, setTab] = useState<Tab>('profile');

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Avatar className="w-14 h-14 border-2 border-slate-200">
                    <AvatarImage src={user?.picture ?? ''} alt={user?.name ?? 'User'} />
                    <AvatarFallback className="bg-brand/10 text-brand text-lg font-bold">{user?.name?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">{user?.name ?? 'Your Profile'}</h1>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
                <a href="/auth/logout" className="ml-auto flex items-center gap-2 text-sm text-slate-500 hover:text-error transition-colors font-medium">
                    <LogOut className="w-4 h-4" /> Sign out
                </a>
            </div>

            <div className="flex gap-8">
                {/* Sidebar tabs */}
                <nav className="w-44 shrink-0 space-y-1">
                    {TABS.map(t => {
                        const Icon = t.icon;
                        return (
                            <button key={t.id} onClick={() => setTab(t.id)}
                                className={cn(
                                    'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                                    tab === t.id
                                        ? 'bg-brand/10 text-brand'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                )}>
                                <Icon className="w-4 h-4" />
                                {t.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {tab === 'profile' && <ProfileTab />}
                    {tab === 'notifications' && <NotificationsTab />}
                    {tab === 'security' && <SecurityTab />}
                </div>
            </div>
        </div>
    );
}
