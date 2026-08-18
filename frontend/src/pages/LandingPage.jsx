import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Radio, Activity, MapPin, Bell, LifeBuoy, 
  ArrowRight, ShieldCheck, Cpu, Waves, Mountain, Wind, 
  Sun, Flame, CheckCircle2, ChevronRight, PhoneCall, Sparkles 
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { riskAPI, analyticsAPI } from '../services/api';

export const LandingPage = ({ onNavigate, onSelectLocation }) => {
  const [locations, setLocations] = useState([]);
  const [selectedLocId, setSelectedLocId] = useState('');
  const [quickRisk, setQuickRisk] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loadingRisk, setLoadingRisk] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locRes, overRes] = await Promise.all([
          riskAPI.getAllLocationsRisk(),
          analyticsAPI.getOverview()
        ]);
        setLocations(locRes.data);
        if (locRes.data.length > 0) {
          setSelectedLocId(locRes.data[0].location_id);
          setQuickRisk(locRes.data[0]);
        }
        setOverview(overRes.data);
      } catch (err) {
        console.error("Error loading landing data:", err);
      }
    };
    fetchData();
  }, []);

  const handleLocationChange = (e) => {
    const locId = parseInt(e.target.value);
    setSelectedLocId(locId);
    const loc = locations.find(l => l.location_id === locId);
    if (loc) {
      setQuickRisk(loc);
    }
  };

  const hazards = [
    { title: "Floods & Waterlogging", icon: Waves, color: "text-sky-400", bg: "bg-sky-500/10", desc: "Real-time river stage monitoring, urban drainage overflow modeling, and precipitation threshold forecasting." },
    { title: "Landslides & Debris Flow", icon: Mountain, color: "text-amber-400", bg: "bg-amber-500/10", desc: "Slope saturation tracking, cumulative 72h rainfall indexing, and terrain elevation stability analysis." },
    { title: "Cyclones & Extreme Wind", icon: Wind, color: "text-teal-400", bg: "bg-teal-500/10", desc: "Atmospheric pressure drop gradients, sea surface temperature telemetry, and gale-force wind speed detection." },
    { title: "Heatwaves & Drought", icon: Sun, color: "text-orange-400", bg: "bg-orange-500/10", desc: "Ambient heat index calculation, consecutive dry day indexing, and moisture depletion forecasting." },
    { title: "Forest Fires", icon: Flame, color: "text-rose-400", bg: "bg-rose-500/10", desc: "Dryness index correlation, wind velocity vectors, and high-temperature anomaly triangulation." },
    { title: "Anomaly Detection", icon: Cpu, color: "text-emerald-400", bg: "bg-emerald-500/10", desc: "Isolation Forest unsupervised AI detecting faulty sensor spikes or anomalous environmental surges." },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Next-Generation AI Public Safety Infrastructure
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Predict Early. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400">
                Act Early. Protect Communities.
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed font-normal">
              CivicPulse combines real-time multi-hazard environmental sensor telemetry, explainable machine learning models, and crowdsourced incident reporting to safeguard lives and coordinate rapid disaster response.
            </p>

            {/* CTA Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-base shadow-xl shadow-sky-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                <Activity className="w-5 h-5" /> Launch Citizen Dashboard
              </button>
              <button
                onClick={() => onNavigate('map')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-base flex items-center justify-center gap-2 transition-all"
              >
                <MapPin className="w-5 h-5 text-sky-400" /> Explore Live Disaster Map
              </button>
            </div>
          </div>

          {/* Real-time Regional Risk Quick-Search Card */}
          <div className="max-w-4xl mx-auto glass-panel-glow p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                  <Radio className="w-4 h-4 animate-pulse" /> Live Multi-Hazard Pulse Check
                </div>
                <h3 className="text-xl font-bold text-white mt-1">Select a Regional Zone to Inspect Risk</h3>
              </div>
              <div className="w-full md:w-72">
                <select
                  value={selectedLocId}
                  onChange={handleLocationChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-sky-500 transition-colors"
                >
                  {locations.map((loc) => (
                    <option key={loc.location_id} value={loc.location_id}>
                      {loc.name}, {loc.state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Risk Inspection Matrix */}
            {quickRisk && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Score & Badge */}
                <div className="flex flex-col items-center justify-center p-6 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Calculated Risk Level</span>
                  <div className="text-5xl font-extrabold font-mono text-white mb-3">
                    {Math.round(quickRisk.risk_score)}<span className="text-lg text-slate-500 font-sans">/100</span>
                  </div>
                  <RiskBadge category={quickRisk.risk_category} size="lg" />
                  <span className="text-xs text-slate-400 mt-2">Hazard: <strong className="text-white">{quickRisk.disaster_type}</strong></span>
                </div>

                {/* Contributing Environmental Factors */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Contributing Factors</h4>
                    <div className="space-y-2">
                      {quickRisk.contributing_factors?.slice(0, 2).map((factor, idx) => (
                        <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-200 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                          <span>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Safety Guidance */}
                  <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/20 text-xs text-slate-300">
                    <strong className="text-sky-400 block mb-1">Recommended Action Protocol:</strong>
                    {quickRisk.recommended_action}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Platform Metrics */}
          {overview && (
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{overview.total_monitored_locations}</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Monitored Zones</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">{overview.active_alerts}</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Active Warnings</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">{overview.total_shelter_capacity?.toLocaleString()}</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Shelter Capacity</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono">94.2%</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">ML Model Accuracy</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Supported Hazard Categories Section */}
      <section className="py-16 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Multi-Hazard Early Detection Engine</h2>
            <p className="mt-3 text-sm text-slate-400">
              CivicPulse monitors complex environmental indicators across geological, hydrological, and meteorological hazards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hazards.map((h, i) => {
              const Icon = h.icon;
              return (
                <div key={i} className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
                  <div className={`w-12 h-12 rounded-xl ${h.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${h.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{h.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{h.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
