import React, { useState, useEffect } from 'react';
import { 
  Home, HeartPulse, Shield, PhoneCall, MapPin, 
  Search, Users, CheckCircle2, Navigation, LifeBuoy, Filter 
} from 'lucide-react';
import { sheltersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SheltersPage = () => {
  const { currentCoords } = useAuth();
  const [shelters, setShelters] = useState([]);
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState('SHELTERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = currentCoords ? { lat: currentCoords.latitude, lon: currentCoords.longitude } : {};
        const [shelterRes, servRes] = await Promise.all([
          sheltersAPI.getShelters(params),
          sheltersAPI.getEmergencyServices(params)
        ]);
        setShelters(shelterRes.data);
        setServices(servRes.data);
      } catch (err) {
        console.error("Failed to load shelters and services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentCoords]);

  const filteredShelters = shelters.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.service_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <LifeBuoy className="w-4 h-4" /> Relief Network & Emergency Response Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Emergency Shelters & Vital Services
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Verified relief centers, trauma hospitals, and disaster management units with live distance and occupancy metrics
          </p>
        </div>

        {/* Tab Switcher & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shelter, hospital, area..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setActiveTab('SHELTERS')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'SHELTERS' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏠 Shelters ({filteredShelters.length})
            </button>
            <button
              onClick={() => setActiveTab('SERVICES')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'SERVICES' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏥 Emergency Services ({filteredServices.length})
            </button>
          </div>
        </div>
      </div>

      {/* Shelters Grid */}
      {activeTab === 'SHELTERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShelters.map((sh) => {
            const occupancyPct = Math.round((sh.current_occupancy / Math.max(1, sh.capacity)) * 100);
            return (
              <div key={sh.id} className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Home className="w-3.5 h-3.5" /> Relief Camp
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      sh.is_open ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {sh.is_open ? '🟢 Open for Admission' : '🔴 Closed'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{sh.name}</h3>
                  <p className="text-xs text-slate-300 mb-3 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{sh.address}</span>
                  </p>

                  {/* Occupancy Progress */}
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-4 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Current Occupancy:</span>
                      <strong className="text-white font-mono">{sh.current_occupancy} / {sh.capacity}</strong>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          occupancyPct > 85 ? 'bg-rose-500' : occupancyPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>{occupancyPct}% Full</span>
                      {sh.distance_km && <span className="text-sky-400 font-mono font-semibold">📍 {sh.distance_km} km away</span>}
                    </div>
                  </div>

                  {/* Facilities list */}
                  {sh.facilities_json && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {sh.facilities_json.map((f, i) => (
                        <span key={i} className="text-[10px] bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Contact: <strong className="text-slate-200">{sh.contact_person || 'Camp Desk'}</strong>
                  </span>
                  <a
                    href={`tel:${sh.contact_phone}`}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Call Hotline
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Emergency Services Grid */}
      {activeTab === 'SERVICES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((serv) => (
            <div key={serv.id} className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5" /> {serv.service_type}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    24/7 ACTIVE
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{serv.name}</h3>
                <p className="text-xs text-slate-300 mb-3 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{serv.address}</span>
                </p>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-4 text-xs space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Emergency Hotline:</span>
                    <strong className="text-rose-400 font-mono">{serv.emergency_hotline}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Available Rescue Units:</span>
                    <strong className="text-white font-mono">{serv.available_units} Vehicles</strong>
                  </div>
                  {serv.distance_km && (
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/80">
                      <span>Proximity:</span>
                      <strong className="text-sky-400 font-mono">{serv.distance_km} km away</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <a
                  href={`tel:${serv.emergency_hotline}`}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Dial Emergency Hotline
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SheltersPage;
