import React, { useState, useEffect } from 'react';
import { MapPin, Search, Filter, RefreshCw, Radio, Droplets, Thermometer, Wind, AlertTriangle, ShieldCheck } from 'lucide-react';
import { riskAPI, sheltersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LiveMap from '../components/LiveMap';
import RiskBadge from '../components/RiskBadge';

export const RiskMapPage = () => {
  const { currentCoords } = useAuth();
  const [locations, setLocations] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHazard, setFilterHazard] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const [locRes, shelterRes, servRes] = await Promise.all([
        riskAPI.getAllLocationsRisk(),
        sheltersAPI.getShelters(),
        sheltersAPI.getEmergencyServices()
      ]);
      setLocations(locRes.data);
      setShelters(shelterRes.data);
      setServices(servRes.data);
      if (locRes.data.length > 0) {
        setSelectedLoc(locRes.data[0]);
      }
    } catch (err) {
      console.error("Failed to load map data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || loc.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHazard = filterHazard === 'ALL' || loc.disaster_type === filterHazard || loc.risk_category === filterHazard;
    return matchesSearch && matchesHazard;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Search & Filter Strip */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search region or city..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
          <select
            value={filterHazard}
            onChange={(e) => setFilterHazard(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="CRITICAL">🔴 Critical Risk</option>
            <option value="HIGH">🟠 High Risk</option>
            <option value="MODERATE">🟡 Moderate</option>
            <option value="LOW">🟢 Low / Safe</option>
            <option value="FLOOD">🌊 Floods</option>
            <option value="LANDSLIDE">⛰️ Landslides</option>
            <option value="CYCLONE">🌪️ Cyclones</option>
            <option value="HEATWAVE">☀️ Heatwaves</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Showing <strong className="text-white">{filteredLocations.length}</strong> monitored regions</span>
          </div>
          <button
            onClick={fetchMapData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Refresh map layers"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split: Map Container + Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[680px]">
        {/* Full-size Leaflet Map */}
        <div className="lg:col-span-2 h-full rounded-2xl overflow-hidden">
          <LiveMap
            locations={filteredLocations}
            shelters={shelters}
            services={services}
            userCoords={currentCoords}
            selectedLocation={selectedLoc}
            onSelectLocation={(loc) => setSelectedLoc(loc)}
          />
        </div>

        {/* Selected Zone Telemetry & Risk Inspector */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 h-full flex flex-col justify-between overflow-y-auto">
          {selectedLoc ? (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    Regional Inspector
                  </span>
                  <RiskBadge category={selectedLoc.risk_category} score={selectedLoc.risk_score} size="sm" />
                </div>
                <h3 className="text-xl font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-5 h-5 text-rose-400" />
                  {selectedLoc.name}, {selectedLoc.state}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Elevation: {selectedLoc.elevation}m ASL • Terrain: {selectedLoc.flood_prone ? 'Floodplain' : selectedLoc.landslide_prone ? 'Steep Mountain' : 'Highland'}
                </p>
              </div>

              {/* Real-time Telemetry Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-sky-400" /> 24h Rain</span>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    {selectedLoc.latest_reading?.rainfall_24h || 0} mm
                  </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-amber-400" /> Temperature</span>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    {selectedLoc.latest_reading?.temperature || 28}°C
                  </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-teal-400" /> Wind Velocity</span>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    {selectedLoc.latest_reading?.wind_speed || 12} km/h
                  </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400">River Stage</span>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    {selectedLoc.latest_reading?.river_water_level || 1.8}m <span className="text-xs text-slate-500 font-sans">/ {selectedLoc.latest_reading?.river_danger_level || 4.5}m</span>
                  </div>
                </div>
              </div>

              {/* Contributing factors */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">AI Risk Decomposition</h4>
                <div className="space-y-2">
                  {selectedLoc.contributing_factors?.map((f, i) => (
                    <div key={i} className="p-2.5 bg-slate-900/90 rounded-lg text-xs text-slate-300 border border-slate-800/80 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advisory Box */}
              <div className="p-3 bg-sky-950/30 border border-sky-500/20 rounded-xl text-xs text-slate-300">
                <strong className="text-sky-400 block mb-1">Safety Instruction:</strong>
                {selectedLoc.recommended_action}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-xs text-slate-500">
              Click any pin or circle on the map to inspect live telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskMapPage;
