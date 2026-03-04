'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { Bell, Search, Cpu, Database, Bot, FlaskConical, BookMarked, Home, Settings, ActivitySquare } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

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
};

// ── Command Palette ────────────────────────────────────────────────────────────

type Command = { label: string; path: string; icon: React.FC<{ className?: string }>; group: string };

const COMMANDS: Command[] = [
    { label: 'Dashboard', path: '/dashboard', icon: Home, group: 'Navigate' },
    { label: 'Generative Models', path: '/dashboard/generative', icon: Cpu, group: 'Navigate' },
    { label: 'Agentic Copilot', path: '/dashboard/copilot', icon: Bot, group: 'Navigate' },
    { label: 'Simulation Console', path: '/dashboard/simulation', icon: ActivitySquare, group: 'Navigate' },
    { label: 'Data Lake', path: '/dashboard/data', icon: Database, group: 'Navigate' },
    { label: 'Molecules Library', path: '/dashboard/molecules', icon: BookMarked, group: 'Navigate' },
    { label: 'Lab Bridge', path: '/dashboard/lab', icon: FlaskConical, group: 'Navigate' },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings, group: 'Navigate' },
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

                    {/* User avatar */}
                    <button className="focus:outline-none focus:ring-2 focus:ring-brand rounded-full">
                        <Avatar className="w-9 h-9 border border-slate-200">
                            <AvatarImage src={user?.picture ?? ''} alt={user?.name ?? 'User'} />
                            <AvatarFallback className="bg-slate-100 text-slate-600 font-medium text-sm">
                                {isLoading ? '…' : (user?.name?.[0] ?? 'U')}
                            </AvatarFallback>
                        </Avatar>
                    </button>
                </div>
            </header>
        </>
    );
}
