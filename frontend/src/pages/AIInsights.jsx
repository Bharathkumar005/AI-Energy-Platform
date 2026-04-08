import { useState } from 'react';
import { mlAPI } from '../services/api';
import { Bot, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

const AIInsights = () => {
    const [predictAppliance, setPredictAppliance] = useState('AC');
    const [predictDate, setPredictDate] = useState(new Date().toISOString().slice(0, 16));
    const [predictionResult, setPredictionResult] = useState(null);
    const [predictLoading, setPredictLoading] = useState(false);

    const [anomalyAppliance, setAnomalyAppliance] = useState('AC');
    const [anomalyKwh, setAnomalyKwh] = useState(2.5);
    const [anomalyHour, setAnomalyHour] = useState(14);
    const [anomalyResult, setAnomalyResult] = useState(null);
    const [anomalyLoading, setAnomalyLoading] = useState(false);

    const handlePredict = async (e) => {
        e.preventDefault();
        setPredictLoading(true);
        try {
            // Append seconds/timezone for API
            const formattedDate = new Date(predictDate).toISOString();
            const res = await mlAPI.predictEnergy(predictAppliance, formattedDate);
            setPredictionResult(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to get prediction from Random Forest model.");
        } finally {
            setPredictLoading(false);
        }
    };

    const handleAnomalyCheck = async (e) => {
        e.preventDefault();
        setAnomalyLoading(true);
        try {
            const res = await mlAPI.checkAnomaly(anomalyAppliance, parseFloat(anomalyKwh), parseInt(anomalyHour));
            setAnomalyResult(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to analyze data via Isolation Forest model.");
        } finally {
            setAnomalyLoading(false);
        }
    };

    const APPLIANCES = ['AC', 'Fridge', 'Washing Machine', 'Lights', 'TV', 'Oven'];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                    <Bot className="w-8 h-8 text-indigo-500" />
                    AI Platform Optimizer
                </h1>
                <p className="text-slate-500 mt-1">
                    Powered by scikit-learn Machine Learning models computing dynamically via FastAPI.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Random Forest Predictor Component */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-slate-50 p-6 border-b border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-md">Regressive Model</span>
                            <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-md">Random Forest</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Future Consumption Forecaster</h3>
                        <p className="text-sm text-slate-500 mt-1">Predict how much energy a device will consume at a specific future date and time.</p>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handlePredict} className="space-y-4">
                            <div>
                                <label className="block tracking-wide text-xs font-bold text-slate-600 mb-2 uppercase">Target Appliance</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-colors"
                                    value={predictAppliance} onChange={e => setPredictAppliance(e.target.value)}
                                >
                                    {APPLIANCES.map(app => <option key={app} value={app}>{app}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block tracking-wide text-xs font-bold text-slate-600 mb-2 uppercase">Target Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-colors"
                                    value={predictDate} onChange={e => setPredictDate(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={predictLoading}
                                className="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-bold rounded-xl text-sm px-5 py-4 text-center transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {predictLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Zap className="w-4 h-4" /> Predict Usage</>}
                            </button>
                        </form>

                        {predictionResult && (
                            <div className="mt-6 p-5 bg-indigo-50 rounded-xl border border-indigo-100 animate-in zoom-in-95 duration-200">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-3">Model Output</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-slate-500">Predicted Energy</div>
                                        <div className="text-2xl font-black text-slate-800">{predictionResult.predicted_kwh.toFixed(2)} <span className="text-lg font-medium text-slate-500">kWh</span></div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500">Estimated Cost</div>
                                        <div className="text-2xl font-black text-slate-800">${predictionResult.estimated_cost.toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Isolation Forest Anomaly Component */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-slate-50 p-6 border-b border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider rounded-md">Unsupervised Model</span>
                            <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-md">Isolation Forest</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Real-Time Anomaly Detection</h3>
                        <p className="text-sm text-slate-500 mt-1">Cross-reference live consumption data to detect energy waste or faulty appliances immediately.</p>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleAnomalyCheck} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block tracking-wide text-xs font-bold text-slate-600 mb-2 uppercase">Appliance Under Test</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 block p-3 transition-colors"
                                        value={anomalyAppliance} onChange={e => setAnomalyAppliance(e.target.value)}
                                    >
                                        {APPLIANCES.map(app => <option key={app} value={app}>{app}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block tracking-wide text-xs font-bold text-slate-600 mb-2 uppercase">Hour of Day (0-23)</label>
                                    <input
                                        type="number" min="0" max="23"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 block p-3 transition-colors"
                                        value={anomalyHour} onChange={e => setAnomalyHour(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block tracking-wide text-xs font-bold text-slate-600 mb-2 uppercase">Current Draw (kWh)</label>
                                    <input
                                        type="number" step="0.1" min="0"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 block p-3 transition-colors"
                                        value={anomalyKwh} onChange={e => setAnomalyKwh(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={anomalyLoading}
                                className="w-full mt-2 text-white bg-rose-600 hover:bg-rose-700 focus:ring-4 focus:ring-rose-300 font-bold rounded-xl text-sm px-5 py-4 text-center transition-all shadow-lg shadow-rose-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {anomalyLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><AlertTriangle className="w-4 h-4" /> Scan for Abnormalities</>}
                            </button>
                        </form>

                        {anomalyResult && (
                            <div className={`mt-6 p-5 rounded-xl border flex gap-4 animate-in zoom-in-95 duration-200 ${anomalyResult.is_anomaly ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                                <div className="shrink-0 mt-1">
                                    {anomalyResult.is_anomaly ? <AlertTriangle className="w-6 h-6 text-rose-500" /> : <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                                </div>
                                <div>
                                    <h4 className="text-base font-bold">
                                        {anomalyResult.is_anomaly ? 'Wastage / Spike Detected!' : 'Normal Operations'}
                                    </h4>
                                    <p className="text-sm mt-1 opacity-90">
                                        {anomalyResult.is_anomaly
                                            ? `The AI has determined that consuming ${anomalyResult.kwh_usage} kWh at hour ${anomalyHour} for '${anomalyResult.appliance}' is highly anomalous and likely wasting electricity.`
                                            : `A consumption of ${anomalyResult.kwh_usage} kWh falls strictly within standard usage distributions for this appliance.`}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AIInsights;
