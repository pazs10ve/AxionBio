'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Dna, Home, Database, FolderSearch, Cpu, FlaskConical,
    Bot, ChevronsLeft, Settings, BookMarked, ChevronRight,
    ActivitySquare, User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

type NavItem = {
    label: string;
    icon: React.FC<{ className?: string }>;
    href: string;
    children?: NavItem[];
};

const navGroups: { title: string; items: NavItem[] }[] = [
    {
        title: 'Workspace',
        items: [
            { label: 'Dashboard', icon: Home, href: '/dashboard' },
            { label: 'Data Lake', icon: Database, href: '/dashboard/data' },
            { label: 'Molecules', icon: BookMarked, href: '/dashboard/molecules' },
            { label: 'Projects', icon: FolderSearch, href: '/dashboard/projects' },
        ],
    },
    {
        title: 'The Engine',
        items: [
            { label: 'Generative Models', icon: Cpu, href: '/dashboard/generative' },
            { label: 'Simulation', icon: ActivitySquare, href: '/dashboard/simulation' },
            { label: 'Lab Bridge', icon: FlaskConical, href: '/dashboard/lab' },
        ],
    },
    {
        title: 'Copilot',
        items: [
            { label: 'Agentic Chat', icon: Bot, href: '/dashboard/copilot' },
        ],
    },
];

// ── Recursive nav item ─────────────────────────────────────────────────────────

function NavItemRow({
    item, isCollapsed, depth = 0,
}: {
    item: NavItem;
    isCollapsed: boolean;
    depth?: number;
}) {
    const pathname = usePathname();
    const isExactActive = pathname === item.href;
    const isPrefixActive = item.href !== '/dashboard' && pathname.startsWith(item.href);
    const isActive = isExactActive || (isPrefixActive && depth === 0);
    const hasChildren = item.children && item.children.length > 0;

    // Auto-expand when on a child route
    const [open, setOpen] = useState(() =>
        hasChildren && item.children!.some(c => pathname.startsWith(c.href))
    );

    // Keep in sync with navigation
    useEffect(() => {
        if (hasChildren && item.children!.some(c => pathname.startsWith(c.href))) {
            setOpen(true);
        }
    }, [pathname, hasChildren, item.children]);

    const Icon = item.icon;

    if (hasChildren && !isCollapsed) {
        return (
            <div>
                <button
                    onClick={() => setOpen(v => !v)}
                    className={cn(
                        'flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm font-medium transition-colors group',
                        isActive
                            ? 'bg-brand/10 text-brand'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    )}
                >
                    <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-brand' : 'text-slate-500 group-hover:text-slate-700')} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronRight className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', open && 'rotate-90')} />
                </button>
                {open && (
                    <div className="ml-7 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2.5 mb-1">
                        {item.children!.map(child => (
                            <NavItemRow key={child.href + child.label} item={child} isCollapsed={false} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={item.href}
            className={cn(
                'flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors group relative',
                depth > 0 && 'py-1.5 text-xs',
                isActive
                    ? 'bg-brand/10 text-brand'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
            )}
            title={isCollapsed ? item.label : undefined}
        >
            <Icon className={cn(
                'shrink-0',
                depth > 0 ? 'w-3.5 h-3.5' : 'w-5 h-5',
                isActive ? 'text-brand' : 'text-slate-400 group-hover:text-slate-600'
            )} />
            {!isCollapsed && <span>{item.label}</span>}

            {/* Active indicator for collapsed state */}
            {isCollapsed && isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand rounded-r-full -ml-3" />
            )}
        </Link>
    );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebar-collapsed') === 'true';
        }
        return false;
    });

    const toggle = () => {
        const next = !isCollapsed;
        setIsCollapsed(next);
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebar-collapsed', String(next));
        }
    };

    const pathname = usePathname();

    return (
        <aside
            className={cn(
                'relative flex flex-col border-r border-slate-200 bg-slate-50 transition-all duration-300 z-20 shrink-0',
                isCollapsed ? 'w-[68px]' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="flex items-center h-16 shrink-0 px-4 border-b border-slate-200 justify-between overflow-hidden">
                <div className="flex items-center gap-3 min-w-0">
                    <Dna className="w-8 h-8 text-brand shrink-0" />
                    {!isCollapsed && (
                        <span className="font-bold text-lg text-slate-900 tracking-tight whitespace-nowrap">AxionBio</span>
                    )}
                </div>
                <button
                    onClick={toggle}
                    className="absolute -right-3 top-5 p-1 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-500 z-10"
                >
                    <ChevronsLeft className={cn('w-4 h-4 transition-transform', isCollapsed && 'rotate-180')} />
                </button>
            </div>

            {/* Nav groups */}
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-5 px-3">
                {navGroups.map((group, i) => (
                    <div key={i} className="flex flex-col gap-0.5">
                        {!isCollapsed && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                                {group.title}
                            </span>
                        )}
                        {group.items.map((item) => (
                            <NavItemRow key={item.href + item.label} item={item} isCollapsed={isCollapsed} />
                        ))}
                    </div>
                ))}
            </div>

            {/* Settings + Profile */}
            <div className="p-3 border-t border-slate-200 space-y-0.5">
                <Link
                    href="/dashboard/settings"
                    className={cn(
                        'flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors group',
                        pathname.startsWith('/dashboard/settings')
                            ? 'bg-brand/10 text-brand'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    )}
                    title={isCollapsed ? 'Settings' : undefined}
                >
                    <Settings className={cn('shrink-0 w-5 h-5', pathname.startsWith('/dashboard/settings') ? 'text-brand' : 'text-slate-500 group-hover:text-slate-700')} />
                    {!isCollapsed && <span>Settings</span>}
                </Link>
                <Link
                    href="/dashboard/profile"
                    className={cn(
                        'flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors group',
                        pathname.startsWith('/dashboard/profile')
                            ? 'bg-brand/10 text-brand'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    )}
                    title={isCollapsed ? 'Profile' : undefined}
                >
                    <User className={cn('shrink-0 w-5 h-5', pathname.startsWith('/dashboard/profile') ? 'text-brand' : 'text-slate-500 group-hover:text-slate-700')} />
                    {!isCollapsed && <span>Profile</span>}
                </Link>
            </div>
        </aside>
    );
}
