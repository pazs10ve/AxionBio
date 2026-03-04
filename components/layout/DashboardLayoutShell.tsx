import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function DashboardLayoutShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-bg-surface overflow-hidden fixed inset-0 font-sans text-text-primary">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#FAFAFA]">
                <TopBar />
                <main className="flex-1 overflow-y-auto w-full relative">
                    <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
