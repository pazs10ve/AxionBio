import { DashboardLayoutShell } from '@/components/layout/DashboardLayoutShell';

/**
 * Next.js route-level loading UI for /dashboard and all sub-routes.
 *
 * This file is automatically picked up by the App Router and streamed
 * to the browser INSTANTLY while the Server Component (page.tsx) is
 * still fetching data from the DB. The user sees skeletons immediately
 * instead of a blank/frozen screen.
 */
export default function DashboardLoading() {
    return (
        <DashboardLayoutShell>
            {/* Page header skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="space-y-2">
                    <div className="h-8 w-56 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="h-4 w-80 bg-slate-100 rounded-md animate-pulse" />
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-36 bg-slate-100 rounded-lg animate-pulse" />
                    <div className="h-10 w-28 bg-slate-200 rounded-lg animate-pulse" />
                </div>
            </div>

            {/* KPI row skeleton — 4 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
                            <div className="h-9 w-9 bg-slate-100 rounded-lg animate-pulse" />
                        </div>
                        <div className="h-9 w-20 bg-slate-200 rounded animate-pulse" />
                        <div className="h-3 w-36 bg-slate-100 rounded animate-pulse" />
                    </div>
                ))}
            </div>

            {/* Bottom grid skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Jobs area (takes 2/3) */}
                <div className="xl:col-span-2 flex flex-col gap-6">

                    {/* Quick launch cards skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
                        ))}
                    </div>

                    {/* Jobs table skeleton */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        {/* Table header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <div className="space-y-2">
                                <div className="h-5 w-44 bg-slate-200 rounded animate-pulse" />
                                <div className="h-3 w-60 bg-slate-100 rounded animate-pulse" />
                            </div>
                            <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                        </div>
                        {/* Table rows */}
                        <div className="divide-y divide-slate-100">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 px-6 py-4">
                                    <div className="h-8 w-8 bg-slate-100 rounded shrink-0 animate-pulse" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
                                    </div>
                                    <div className="h-5 w-20 bg-slate-100 rounded-full animate-pulse" />
                                    <div className="h-5 w-16 bg-slate-100 rounded-full animate-pulse" />
                                    <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Activity feed skeleton (takes 1/3) */}
                <div className="xl:col-span-1">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <div className="h-5 w-28 bg-slate-200 rounded animate-pulse" />
                            <div className="h-7 w-32 bg-slate-100 rounded-lg animate-pulse" />
                        </div>
                        <div className="p-5 space-y-6">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="h-5 w-5 rounded-full bg-slate-200 shrink-0 animate-pulse mt-1" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
                                        <div className="h-3 w-48 bg-slate-100 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayoutShell>
    );
}
