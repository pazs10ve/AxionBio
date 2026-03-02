import { auth0 } from '@/lib/auth0';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await auth0.getSession();

    if (!session) {
        redirect('/api/auth/login');
    }

    const { user } = session;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">User Dashboard</h1>

                    <div className="flex items-center gap-6 mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                        {user.picture && (
                            <img
                                src={user.picture}
                                alt={user.name || 'User'}
                                className="w-20 h-20 rounded-full border-2 border-brand"
                            />
                        )}
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800">{user.name}</h2>
                            <p className="text-slate-500">{user.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 rounded-xl border border-slate-200 hover:border-brand transition-colors cursor-pointer group">
                            <h3 className="font-semibold text-slate-800 group-hover:text-brand">Profile Settings</h3>
                            <p className="text-sm text-slate-500">Manage your account and preferences</p>
                        </div>
                        <div className="p-6 rounded-xl border border-slate-200 hover:border-brand transition-colors cursor-pointer group">
                            <h3 className="font-semibold text-slate-800 group-hover:text-brand">API Access</h3>
                            <p className="text-sm text-slate-500">Manage your developer keys</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-200">
                        <Link
                            href="/api/auth/logout"
                            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Sign Out
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
