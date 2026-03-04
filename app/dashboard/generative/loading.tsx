import { DashboardLayoutShell } from '@/components/layout/DashboardLayoutShell';

export default function GenerativeLoading() {
    return (
        <DashboardLayoutShell>
            {/* Generative Engine loading skeleton */}
            <div className="flex gap-0 h-[calc(100vh-128px)] animate-pulse">
                {/* Left config panel */}
                <div className="w-[38%] bg-white border-r border-slate-200 p-5 space-y-8">
                    <div className="space-y-3">
                        <div className="h-3 w-24 bg-slate-200 rounded" />
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-20 bg-slate-100 rounded-xl" />
                        ))}
                    </div>
                    <div className="space-y-3">
                        <div className="h-3 w-32 bg-slate-200 rounded" />
                        <div className="h-10 bg-slate-100 rounded-lg" />
                        <div className="h-20 bg-slate-100 rounded-xl" />
                    </div>
                </div>
                {/* Right viewer */}
                <div className="flex-1 bg-slate-50 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-slate-200 animate-pulse" />
                </div>
            </div>
        </DashboardLayoutShell>
    );
}
