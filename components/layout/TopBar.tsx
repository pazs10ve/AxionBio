'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { Bell, Search, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function TopBar() {
    const { user, isLoading } = useUser();
    const pathname = usePathname();

    // Generate simple breadcrumbs from pathname
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = segments.map((s) => s.charAt(0).toUpperCase() + s.slice(1));

    return (
        <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">

            {/* Mobile Menu & Breadcrumbs */}
            <div className="flex items-center gap-4">
                <button className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md">
                    <Menu className="w-5 h-5" />
                </button>

                <nav className="hidden sm:flex items-center text-sm font-medium text-slate-500">
                    {breadcrumbs.map((crumb, idx) => (
                        <div key={crumb} className="flex items-center">
                            {idx > 0 && <span className="mx-2 text-slate-300">/</span>}
                            <span className={idx === breadcrumbs.length - 1 ? "text-slate-900" : ""}>
                                {crumb}
                            </span>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Global Actions */}
            <div className="flex items-center gap-4">

                {/* Command Palette Trigger */}
                <button className="hidden md:flex items-center text-sm text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 hover:bg-slate-100 hover:text-slate-600 transition-colors w-64 justify-between focus:outline-none focus:ring-2 focus:ring-brand/20">
                    <span className="flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        <span>Search...</span>
                    </span>
                    <kbd className="font-sans font-semibold text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
                        ⌘K
                    </kbd>
                </button>

                <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

                {/* Live Active Jobs Indicator */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-light/50 border border-brand/20 rounded-full text-brand text-xs font-semibold cursor-pointer hover:bg-brand-light transition-colors">
                    <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                    <span>2 Running</span>
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-white" />
                </button>

                {/* User Profile */}
                <button className="ml-2 focus:outline-none focus:ring-2 focus:ring-brand rounded-full">
                    <Avatar className="w-9 h-9 border border-slate-200">
                        <AvatarImage src={user?.picture || ''} alt={user?.name || 'User'} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
                            {isLoading ? '...' : (user?.name?.[0] || 'U')}
                        </AvatarFallback>
                    </Avatar>
                </button>

            </div>
        </header>
    );
}
