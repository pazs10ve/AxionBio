'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Dna,
    Home,
    FolderSearch,
    Cpu,
    FlaskConical,
    Bot,
    ActivitySquare,
    ChevronsLeft,
    Settings,
    Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navGroups = [
    {
        title: 'Platform',
        items: [
            { label: 'Dashboard', icon: Home, href: '/dashboard' },
            { label: 'Data Lake', icon: Database, href: '/dashboard/data' },
            { label: 'Projects', icon: FolderSearch, href: '/dashboard/projects' },
        ]
    },
    {
        title: 'The Engine',
        items: [
            { label: 'Generative Models', icon: Cpu, href: '/dashboard/generative' },
            { label: 'Simulation View', icon: ActivitySquare, href: '/dashboard/simulation' },
            { label: 'Lab Bridge', icon: FlaskConical, href: '/dashboard/lab' },
        ]
    },
    {
        title: 'Copilot',
        items: [
            { label: 'Agentic Chat', icon: Bot, href: '/dashboard/copilot' },
        ]
    }
];

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "relative flex flex-col border-r border-slate-200 bg-slate-50 transition-all duration-300 z-20",
                isCollapsed ? "w-[68px]" : "w-64"
            )}
        >
            {/* Header & Logo */}
            <div className="flex items-center h-16 shrink-0 px-4 border-b border-slate-200 justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                    <Dna className="w-8 h-8 text-brand shrink-0" />
                    {!isCollapsed && <span className="font-bold text-lg text-slate-900 tracking-tight">AxionBio</span>}
                </div>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-5 p-1 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-500"
                >
                    <ChevronsLeft className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} />
                </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6 px-3">
                {navGroups.map((group, i) => (
                    <div key={i} className="flex flex-col gap-1">
                        {!isCollapsed && (
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
                                {group.title}
                            </span>
                        )}
                        {group.items.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors group relative",
                                        isActive
                                            ? "bg-brand/10 text-brand"
                                            : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                                    )}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-brand" : "text-slate-500 group-hover:text-slate-700")} />
                                    {!isCollapsed && <span>{item.label}</span>}

                                    {isCollapsed && isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand rounded-r-full -ml-3" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* User / Settings anchor at bottom */}
            <div className="p-4 border-t border-slate-200">
                <Link
                    href="/dashboard/settings"
                    className={cn(
                        "flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors group",
                        pathname.includes('/settings')
                            ? "bg-brand/10 text-brand"
                            : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    )}
                    title={isCollapsed ? "Settings" : undefined}
                >
                    <Settings className="w-5 h-5 shrink-0 text-slate-500 group-hover:text-slate-700" />
                    {!isCollapsed && <span>Settings</span>}
                </Link>
            </div>
        </aside>
    );
}
