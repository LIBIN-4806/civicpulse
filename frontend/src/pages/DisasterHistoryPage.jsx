import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Calendar, MapPin, AlertTriangle, 
  DollarSign, Users, RefreshCw, Filter, Waves, Mountain, Wind 
} from 'lucide-react';
import { analyticsAPI } from '../services/api';

export const DisasterHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter !== 'ALL') params.disaster_type = typeFilter;
      const res = await analyticsAPI.getHistoricalDisasters(params);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to load historical disasters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [typeFilter]);

  const filteredHistory = history.filter(h =>
    h.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.location_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.year.toString().includes(searchQuery)
  );

  const totalCasualties = history.reduce((sum, h) => sum + (h.casualties || 0), 0);
  const totalDisplaced = history.reduce((sum, h) => sum + (h.displaced_people || 0), 0);
  const totalLossBillion = history.reduce((sum, h) => sum + (h.damage_estimate_usd || 0), 0) / 1000000000;

  const getHazardIcon = (type) => {
    switch (type) {
      case 'FLOOD': return <Waves className="w-5 h-5 text-sky-400" />;
      case 'LANDSLIDE': return <Mountain className="w-5 h-5 text-amber-400" />;
      case 'CYCLONE': return <Wind className="w-5 h-5 text-teal-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-rose-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" /> Disaster Memory & Calamity Archives
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Historical Disaster Knowledge Base
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Archival records of major floods, landslides, and cyclones used to calibrate CivicPulse AI risk indices
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search year, calamity, area..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Calamities</option>
            <option value="FLOOD">🌊 Floods</option>
            <option value="LANDSLIDE">⛰️ Landslides</option>
            <option value="CYCLONE">🌪️ Cyclones</option>
          </select>
        </div>
      </div>

      {/* Aggregate Historical Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Historical Lives Lost</span>
            <div className="text-2xl font-extrabold text-white font-mono">{totalCasualties.toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Citizens Displaced / Sheltered</span>
            <div className="text-2xl font-extrabold text-white font-mono">{totalDisplaced.toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Estimated Economic Loss</span>
            <div className="text-2xl font-extrabold text-white font-mono">${totalLossBillion.toFixed(2)} Billion</div>
          </div>
        </div>
      </div>

      {/* History Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredHistory.map((h) => (
          <div key={h.id} className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    {getHazardIcon(h.disaster_type)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{h.disaster_type} — {h.location_name}</h3>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Month {h.month}, {h.year}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-600 text-white uppercase">
                  {h.severity}
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed my-3">
                {h.description}
              </p>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center text-xs my-3 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Peak Rain</span>
                  <strong className="text-sky-400 font-bold">{h.peak_rainfall_mm} mm</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Casualties</span>
                  <strong className="text-rose-400 font-bold">{h.casualties}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Displaced</span>
                  <strong className="text-amber-400 font-bold">{(h.displaced_people / 1000).toFixed(0)}k</strong>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-800/80">
              * Archival record verified for ML historical vulnerability training.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisasterHistoryPage;
