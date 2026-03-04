'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { Bell, Search, Cpu, Database, Bot, FlaskConical, BookMarked, Home, Settings, ActivitySquare, User, LogOut, FolderSearch, ChevronDown, Circle } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useProject } from '@/lib/project-context';

// ── Breadcrumb route map ────────────────────────────────────────────────────────

const ROUTE_LABELS: Record<string, string> = {
    dashboard: 'Dashboard',
    generative: 'Generative Models',
    copilot: 'Agentic Copilot',
    simulation: 'Simulation Console',
    data: 'Data Lake',
    lab: 'Lab Bridge',
    settings: 'Settings',
    molecules: 'Molecules Library',
    projects: 'Projects',
    profile: 'Profile',
};

// ── Project Switcher ───────────────────────────────────────────────────────────

function ProjectSwitcher() {
    const { activeProject, projects, setActiveProject } = useProject();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const activeProjects = projects.filter(p => p.status === 'active');
    const otherProjects = projects.filter(p => p.status !== 'active');

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all',
                    activeProject
                        ? 'bg-brand/5 border-brand/20 text-brand hover:bg-brand/10'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                )}
            >
                <span className={cn('w-2 h-2 rounded-full shrink-0', activeProject ? 'bg-brand animate-pulse' : 'bg-slate-300')} />
                <span className="max-w-[140px] truncate">{activeProject?.name ?? 'No project'}</span>
                <ChevronDown className="w-3 h-3 shrink-0" />
            </button>

            {open && (
                <div className="absolute left-0 top-9 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Project</p>
                    </div>
                    <div className="py-1 max-h-64 overflow-y-auto">
                        {/* No project option */}
                        <button
                            onClick={() => { setActiveProject(null); setOpen(false); }}
                            className={cn(
                                'flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors hover:bg-slate-50',
                                !activeProject ? 'text-brand' : 'text-slate-600'
                            )}
                        >
                            <Circle className="w-3.5 h-3.5 text-slate-300" />
                            <span className="text-sm font-medium">No project</span>
                        </button>

                        {activeProjects.length > 0 && (
                            <>
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wider px-4 pt-2 pb-1">Active</p>
                                {activeProjects.map(p => (
                                    <button key={p.id}
                                        onClick={() => { setActiveProject(p); setOpen(false); }}
                                        className={cn(
                                            'flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors hover:bg-slate-50',
                                            activeProject?.id === p.id ? 'text-brand bg-brand/5' : 'text-slate-600'
                                        )}
                                    >
                                        <span className={cn('w-2 h-2 rounded-full shrink-0', p.color.replace('bg-', 'bg-'))} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">{p.name}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{p.target} · {p.indication}</p>
                                        </div>
                                        {activeProject?.id === p.id && <span className="text-[9px] font-bold text-brand">Active</span>}
                                    </button>
                                ))}
                            </>
                        )}

                        {otherProjects.length > 0 && (
                            <>
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wider px-4 pt-2 pb-1">Other</p>
                                {otherProjects.map(p => (
                                    <button key={p.id}
                                        onClick={() => { setActiveProject(p); setOpen(false); }}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors hover:bg-slate-50 text-slate-400"
                                    >
                                        <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                                        <p className="text-sm font-medium truncate">{p.name}</p>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                    <div className="border-t border-slate-100 p-2">
                        <Link href="/dashboard/projects" onClick={() => setOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-brand hover:bg-brand/5 rounded-xl transition-colors">
                            <FolderSearch className="w-3.5 h-3.5" /> Manage projects
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Command Palette ────────────────────────────────────────────────────────────

type Command = { label: string; path: string; icon: React.FC<{ className?: string }>; group: string };

const COMMANDS: Command[] = [
    { label: 'Dashboard', path: '/dashboard', icon: Home, group: 'Navigate' },
    { label: 'Generative Models', path: '/dashboard/generative', icon: Cpu, group: 'Navigate' },
    { label: 'Agentic Copilot', path: '/dashboard/copilot', icon: Bot, group: 'Navigate' },
    { label: 'Simulation Console', path: '/dashboard/simulation', icon: ActivitySquare, group: 'Navigate' },
    { label: 'Data Lake', path: '/dashboard/data', icon: Database, group: 'Navigate' },
    { label: 'Molecules Library', path: '/dashboard/molecules', icon: BookMarked, group: 'Navigate' },
    { label: 'Projects', path: '/dashboard/projects', icon: FolderSearch, group: 'Navigate' },
    { label: 'Lab Bridge', path: '/dashboard/lab', icon: FlaskConical, group: 'Navigate' },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings, group: 'Navigate' },
    { label: 'My Profile', path: '/dashboard/profile', icon: User, group: 'Account' },
];

function CommandPalette({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [activeIdx, setActiveIdx] = useState(0);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const results = query.trim()
        ? COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
        : COMMANDS;

    useEffect(() => { setActiveIdx(0); }, [query]);

    const run = (cmd: Command) => {
        router.push(cmd.path);
        onClose();
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
        if (e.key === 'Enter' && results[activeIdx]) { run(results[activeIdx]); }
        if (e.key === 'Escape') { onClose(); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" onClick={onClose}>
            <div
                className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Search pages, actions..."
                        className="flex-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                    />
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-400">Esc</kbd>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto py-2">
                    {results.length === 0 ? (
                        <p className="text-center text-sm text-slate-400 py-8">No results for &ldquo;{query}&rdquo;</p>
                    ) : (
                        results.map((cmd, i) => {
                            const Icon = cmd.icon;
                            return (
                                <button key={cmd.path} onClick={() => run(cmd)}
                                    className={cn(
                                        'flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors',
                                        i === activeIdx ? 'bg-brand/10 text-brand' : 'hover:bg-slate-50 text-slate-700'
                                    )}>
                                    <div className={cn(
                                        'p-1.5 rounded-lg shrink-0',
                                        i === activeIdx ? 'bg-brand/10' : 'bg-slate-100'
                                    )}>
                                        <Icon className={cn('w-3.5 h-3.5', i === activeIdx ? 'text-brand' : 'text-slate-500')} />
                                    </div>
                                    <span className="text-sm font-medium">{cmd.label}</span>
                                    <span className="ml-auto text-[10px] text-slate-400">{cmd.group}</span>
                                </button>
                            );
                        })
                    )}
                </div>

                <div className="px-4 py-2 border-t border-slate-100 flex items-center gap-3 text-[10px] text-slate-400">
                    <span><kbd className="font-mono px-1 py-0.5 rounded border border-slate-200 bg-slate-50">↑↓</kbd> navigate</span>
                    <span><kbd className="font-mono px-1 py-0.5 rounded border border-slate-200 bg-slate-50">↵</kbd> open</span>
                    <span><kbd className="font-mono px-1 py-0.5 rounded border border-slate-200 bg-slate-50">Esc</kbd> close</span>
                </div>
            </div>
        </div>
    );
}

// ── Avatar Dropdown ────────────────────────────────────────────────────────────

function AvatarDropdown({ user, isLoading }: { user: ReturnType<typeof useUser>['user']; isLoading: boolean }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className="focus:outline-none focus:ring-2 focus:ring-brand rounded-full"
            >
                <Avatar className="w-9 h-9 border border-slate-200">
                    <AvatarImage src={user?.picture ?? ''} alt={user?.name ?? 'User'} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 font-medium text-sm">
                        {isLoading ? '…' : (user?.name?.[0] ?? 'U')}
                    </AvatarFallback>
                </Avatar>
            </button>

            {open && (
                <div className="absolute right-0 top-11 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.name ?? 'User'}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                    </div>
                    {/* Links */}
                    <div className="py-1">
                        <Link href="/dashboard/profile" onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                            <User className="w-4 h-4 text-slate-400" /> View Profile
                        </Link>
                        <Link href="/dashboard/settings" onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                            <Settings className="w-4 h-4 text-slate-400" /> Settings
                        </Link>
                    </div>
                    <div className="border-t border-slate-100 py-1">
                        <a href="/auth/logout"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors">
                            <LogOut className="w-4 h-4" /> Sign out
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── TopBar ────────────────────────────────────────────────────────────────────

export function TopBar() {
    const { user, isLoading } = useUser();
    const pathname = usePathname();
    const [cmdOpen, setCmdOpen] = useState(false);

    // Keyboard shortcut: Cmd+K / Ctrl+K
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCmdOpen(v => !v);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Build breadcrumbs from pathname
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = segments.map(s => ROUTE_LABELS[s] ?? (s.charAt(0).toUpperCase() + s.slice(1)));

    return (
        <>
            {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}

            <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">

                {/* Breadcrumb */}
                <div className="flex items-center gap-3">
                    <nav className="flex items-center text-sm font-medium text-slate-500">
                        {breadcrumbs.map((crumb, idx) => (
                            <div key={`${crumb}-${idx}`} className="flex items-center">
                                {idx > 0 && <span className="mx-2 text-slate-300">/</span>}
                                <span className={cn(
                                    'transition-colors',
                                    idx === breadcrumbs.length - 1 ? 'text-slate-900 font-semibold' : 'hover:text-slate-700'
                                )}>
                                    {crumb}
                                </span>
                            </div>
                        ))}
                    </nav>
                    <div className="h-4 w-px bg-slate-200" />
                    <ProjectSwitcher />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">

                    {/* Cmd+K trigger */}
                    <button
                        onClick={() => setCmdOpen(true)}
                        className="hidden md:flex items-center text-sm text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 hover:bg-slate-100 hover:text-slate-600 transition-colors w-56 justify-between focus:outline-none focus:ring-2 focus:ring-brand/20"
                    >
                        <span className="flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            <span>Search...</span>
                        </span>
                        <kbd className="font-sans font-semibold text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">⌘K</kbd>
                    </button>

                    <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                    {/* Running jobs pill */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand/5 border border-brand/20 rounded-full text-brand text-xs font-semibold cursor-pointer hover:bg-brand/10 transition-colors">
                        <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                        <span>2 Running</span>
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-white" />
                    </button>

                    {/* User avatar dropdown */}
                    <AvatarDropdown user={user} isLoading={isLoading} />
                </div>
            </header>
        </>
    );
}
