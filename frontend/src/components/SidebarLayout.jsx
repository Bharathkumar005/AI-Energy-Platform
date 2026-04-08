import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Lightbulb, Database, Menu, X, Zap } from 'lucide-react';

const SidebarLayout = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Analytics', href: '/analytics', icon: TrendingUp },
        { name: 'AI Optimizer', href: '/ai-insights', icon: Lightbulb },
        { name: 'Data Explorer', href: '/explorer', icon: Database },
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
            {/* Mobile sidebar overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-800/50 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-white/5">
                    <div className="flex items-center gap-2 font-bold text-lg text-emerald-400">
                        <Zap className="w-5 h-5" />
                        <span>EcoFlow AI</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`
                            }
                            onClick={() => setIsOpen(false)}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium tracking-wide text-sm">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 bg-slate-950/50 mt-auto">
                    <div className="flex flex-col gap-1 text-xs text-slate-500">
                        <span className="font-medium text-slate-400">System Status</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Azure Connected</span>
                        <span className="flex items-center gap-1 mt-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> ML Models Active</span>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile header */}
                <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200">
                    <div className="flex items-center gap-2 font-bold text-emerald-600">
                        <Zap className="w-5 h-5" />
                        <span>EcoFlow AI</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SidebarLayout;
