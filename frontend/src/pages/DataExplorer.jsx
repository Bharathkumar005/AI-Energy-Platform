import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { Database, Search } from 'lucide-react';

const DataExplorer = () => {
    const [applianceData, setApplianceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                // For simplicity we just use the grouped dataset, but ideally this would hit a raw pagination API
                const applianceRes = await analyticsAPI.getAppliances();
                setApplianceData(applianceRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data", error);
                setLoading(false);
            }
        };
        fetchAnalyticsData();
    }, []);

    const filteredData = applianceData.filter(item =>
        item.appliance.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8"><div className="animate-pulse bg-slate-200 h-12 w-12 rounded-full"></div></div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                    <Database className="w-8 h-8 text-sky-500" />
                    Data Explorer
                </h1>
                <p className="text-slate-500 mt-1">Explore raw dataset aggregations pulled directly from Azure Blob Storage.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="mb-6 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-all"
                        placeholder="Search by appliance name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Index ID</th>
                                <th className="px-6 py-4">Appliance Category</th>
                                <th className="px-6 py-4 text-right">Sum Energy (kWh)</th>
                                <th className="px-6 py-4 text-right">Sum Cost ($)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.length > 0 ? filteredData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">#{idx.toString().padStart(4, '0')}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{row.appliance}</td>
                                    <td className="px-6 py-4 text-right tabular-nums">{row.energy_consumed_kwh.toFixed(4)}</td>
                                    <td className="px-6 py-4 text-right text-emerald-600 font-medium tabular-nums px-2 py-1 bg-emerald-50 rounded inline-block ml-auto mt-2">${row.cost.toFixed(4)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No appliances found matching "{searchTerm}"</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DataExplorer;
