import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Sector, PieChart, Pie, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Analytics = () => {
    const [hourlyData, setHourlyData] = useState([]);
    const [applianceData, setApplianceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                const [hourlyRes, applianceRes] = await Promise.all([
                    analyticsAPI.getHourly(),
                    analyticsAPI.getAppliances(),
                ]);
                setHourlyData(hourlyRes.data);

                // Format appliance data for pie chart
                const formattedAppliances = applianceRes.data.map(item => ({
                    name: item.appliance,
                    value: item.energy_consumed_kwh,
                    cost: item.cost
                }));
                // Sort by value descending
                formattedAppliances.sort((a, b) => b.value - a.value);
                setApplianceData(formattedAppliances);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching analytics data", error);
                setLoading(false);
            }
        };
        fetchAnalyticsData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Advanced Analytics</h1>
                <p className="text-slate-500 mt-1">Deep dive into historical hourly trends and categorical appliance breakdowns.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hourly Usage Bar Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Hourly Usage Profile</h3>
                    <p className="text-sm text-slate-500 mb-6">Average kilowatt-hour (kWh) consumption distributed across 24 hours.</p>
                    <div className="h-80 flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="hour" tickFormatter={(tick) => `${tick}:00`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`${value.toFixed(2)} kWh`, 'Usage']}
                                    labelFormatter={(label) => `Time: ${label}:00`}
                                />
                                <Bar dataKey="energy_consumed_kwh" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                    {hourlyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.hour >= 17 && entry.hour <= 21 ? '#ef4444' : '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-4 text-xs font-medium text-slate-500">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-blue-500"></div> Standard Hours</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-500"></div> Peak Hours</div>
                    </div>
                </div>

                {/* Appliance Breakdown Pie Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-slate-800">Consumption by Appliance</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-6">Total historical distribution of power draw across devices.</p>
                    <div className="h-80 flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={applianceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {applianceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name, props) => [
                                        `${value.toFixed(1)} kWh ($${props.payload.cost.toFixed(2)})`,
                                        name
                                    ]}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">Appliance Lifetime Cost Summary</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 uppercase text-slate-500 text-xs font-bold tracking-wider">
                            <tr>
                                <th scope="col" className="px-6 py-4">Appliance</th>
                                <th scope="col" className="px-6 py-4 text-right">Total Energy (kWh)</th>
                                <th scope="col" className="px-6 py-4 text-right">Lifetime Cost</th>
                                <th scope="col" className="px-6 py-4 pl-8">Percentage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {applianceData.map((app, idx) => {
                                const totalValue = applianceData.reduce((acc, curr) => acc + curr.value, 0);
                                const percentage = ((app.value / totalValue) * 100).toFixed(1);
                                return (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                            {app.name}
                                        </td>
                                        <td className="px-6 py-4 text-right tabular-nums">{app.value.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right text-emerald-600 font-medium tabular-nums">${app.cost.toFixed(2)}</td>
                                        <td className="px-6 py-4 pl-8">
                                            <div className="flex items-center gap-3">
                                                <span className="w-10 text-right font-medium text-slate-500">{percentage}%</span>
                                                <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
