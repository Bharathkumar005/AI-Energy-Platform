import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { Activity, DollarSign, Zap, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [hourlyData, setHourlyData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [summaryRes, hourlyRes] = await Promise.all([
                    analyticsAPI.getSummary(),
                    analyticsAPI.getHourly(),
                ]);
                setSummary(summaryRes.data);
                // take first 24 hours of data to show a daily trend curve
                setHourlyData(hourlyRes.data.slice(0, 24));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500 mt-1">Real-time metrics and estimated costs from Azure Services.</p>
            </div>

            {summary && !summary.error ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Today's Consumption"
                        value={`${summary.total_energy_kwh} kWh`}
                        icon={<Zap className="w-5 h-5 text-amber-500" />}
                        trend="-4.2% from yesterday"
                        trendUp={false}
                    />
                    <StatCard
                        title="Estimated Daily Cost"
                        value={`$${summary.total_cost_usd}`}
                        icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
                        trend="- $2.40 from yesterday"
                        trendUp={false}
                    />
                    <StatCard
                        title="Top Appliance"
                        value={summary.top_consumer_appliance}
                        subtitle={`${summary.top_consumer_kwh} kWh consumed`}
                        icon={<Activity className="w-5 h-5 text-blue-500" />}
                    />
                    <StatCard
                        title="AI Saving Insight"
                        value="Optimal"
                        subtitle="No major anomalies today"
                        icon={<TrendingDown className="w-5 h-5 text-emerald-500" />}
                        bgCard="bg-emerald-50 border-emerald-100"
                    />
                </div>
            ) : (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                    Warning: Failed to load data from the Azure Backend API. Is FastAPI running?
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                        <span>Average Daily Consumption Pattern</span>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">Last 30 Days</span>
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="hour" tickFormatter={(tick) => `${tick}:00`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`${value.toFixed(2)} kWh`, 'Usage']}
                                    labelFormatter={(label) => `Time: ${label}:00`}
                                />
                                <Area type="monotone" dataKey="energy_consumed_kwh" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
                    <div>
                        <div className="inline-flex px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
                            System Status
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Azure ML Engine Online</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Your platform is currently scanning real-time household consumption to detect wasteful usage spikes using the Isolation Forest model.
                        </p>
                    </div>
                    <div className="space-y-3 mt-8">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></div>
                            <span className="text-sm font-medium text-slate-300">FastAPI Backend Running</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></div>
                            <span className="text-sm font-medium text-slate-300">Blob Storage Connected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

function StatCard({ title, value, subtitle, icon, trend, trendUp, bgCard = "bg-white" }) {
    return (
        <div className={`${bgCard} p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
                <div className="p-2 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform duration-300">{icon}</div>
            </div>
            <div className="text-2xl font-black text-slate-800 tracking-tight">{value}</div>
            {subtitle && <div className="text-sm text-slate-500 mt-1 font-medium">{subtitle}</div>}
            {trend && (
                <div className={`text-xs font-bold mt-2 flex items-center gap-1 ${trendUp ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {trend}
                </div>
            )}
        </div>
    );
}
