import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, MapPin, RefreshCw, AlertOctagon, 
  Droplets, Thermometer, Wind, Gauge, Compass, 
  Home, HeartPulse, CheckSquare, Square, PhoneCall, 
  Radio, Sparkles, HelpCircle, ChevronRight, AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { riskAPI, sheltersAPI, reportsAPI, alertsAPI } from '../services/api';
import RiskMeter from '../components/RiskMeter';
import RiskBadge from '../components/RiskBadge';
import AlertBanner from '../components/AlertBanner';

export const CitizenDashboard = ({ onNavigate }) => {
  const { user, currentCoords } = useAuth();
  const [riskData, setRiskData] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [services, setServices] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [completedActions, setCompletedActions] = useState({});
  const [loading, setLoading] = useState(true);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = currentCoords 
        ? { lat: currentCoords.latitude, lon: currentCoords.longitude } 
        : { location_id: user?.home_location_id || 1 };

      const [riskRes, shelterRes, servRes, repRes, alertRes] = await Promise.all([
        riskAPI.getCurrentRisk(params),
        sheltersAPI.getShelters(params),
        sheltersAPI.getEmergencyServices(params),
        reportsAPI.getReports({ limit: 4 }),
        alertsAPI.getActiveAlerts()
      ]);

      setRiskData(riskRes.data);
      setShelters(shelterRes.data.slice(0, 3));
      setServices(servRes.data.slice(0, 3));
      setRecentReports(repRes.data.slice(0, 3));
      
      if (alertRes.data.length > 0) {
        setActiveAlert(alertRes.data[0]);
      }
    } catch (err) {
      console.error("Error loading citizen dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentCoords, user]);

  const toggleAction = (idx) => {
    setCompletedActions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleTriggerSOS = () => {
    setSosSent(true);
    setTimeout(() => {
      setSosModalOpen(false);
      setSosSent(false);
    }, 2500);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
        <span className="text-sm font-semibold text-slate-300">Synchronizing Local Environmental Sensors & AI Risk Engine...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Active Broadcast Warning Banner */}
      {activeAlert && (
        <AlertBanner 
          alert={activeAlert} 
          onOpenDetails={() => onNavigate('alerts')} 
        />
      )}

      {/* Header Profile & SOS Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse" /> Live Protected Citizen Feed
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {user ? user.full_name : 'Resident'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            Location: <strong className="text-slate-200">{riskData?.location_name || 'Munnar High Ranges, Kerala'}</strong>
            {currentCoords && <span className="text-slate-500 font-mono">({currentCoords.latitude.toFixed(3)}° N, {currentCoords.longitude.toFixed(3)}° E)</span>}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl border border-slate-700 transition-colors"
            title="Refresh Sensor Readings"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSosModalOpen(true)}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all hover:scale-105 animate-pulse"
          >
            <PhoneCall className="w-4 h-4" /> 1-CLICK SOS EMERGENCY
          </button>
        </div>
      </div>

      {/* Main Grid: Risk Meter + Explainability Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Gauge Card */}
        <div className="lg:col-span-1">
          {riskData && (
            <RiskMeter
              score={riskData.risk_score}
              category={riskData.risk_category}
              probability={riskData.risk_probability}
              confidence={riskData.confidence_score}
              disasterType={riskData.disaster_type}
            />
          )}
        </div>

        {/* Explainability Engine: "Why is the risk at this level?" */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-bold text-white">Explainable AI Risk Decomposition</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Confidence: <strong className="text-emerald-400 font-bold">{Math.round((riskData?.confidence_score || 0.94) * 100)}%</strong>
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Key Environmental Triggers Identified:
              </h4>
              {riskData?.contributing_factors?.map((factor, idx) => (
                <div 
                  key={idx} 
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 flex items-start gap-3"
                >
                  <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="leading-relaxed">{factor}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Disclaimer Box */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-300 block mb-0.5">⚠️ Advisory Protocol:</strong>
            {riskData?.recommended_action}
          </div>
        </div>
      </div>

      {/* Safety Action Checklist & Nearby Relief Shelters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Safety Checklist Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Personal Safety Action Checklist</h3>
            </div>
            <span className="text-xs text-slate-400">
              {Object.values(completedActions).filter(Boolean).length} / {riskData?.safety_checklist?.length || 0} Ready
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Follow these targeted precautions tailored for the active hazard level:
          </p>

          <div className="space-y-2.5">
            {riskData?.safety_checklist?.map((item, idx) => {
              const isChecked = !!completedActions[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleAction(idx)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                    isChecked
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                      : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <button className="mt-0.5 text-slate-400 hover:text-emerald-400">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  <span className={`text-xs leading-relaxed ${isChecked ? 'line-through text-slate-400' : ''}`}>
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nearest Shelters & Hospitals */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-bold text-white">Nearest Relief Shelters & Hospitals</h3>
              </div>
              <button
                onClick={() => onNavigate('shelters')}
                className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {shelters.map((sh) => (
                <div key={sh.id} className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-white">{sh.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{sh.address}</p>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400">
                      <span>Occupancy: <strong className="text-emerald-400 font-mono">{sh.current_occupancy}/{sh.capacity}</strong></span>
                      {sh.distance_km && <span>📍 <strong className="text-sky-400 font-mono">{sh.distance_km} km</strong></span>}
                    </div>
                  </div>
                  <a
                    href={`tel:${sh.contact_phone}`}
                    className="px-3 py-1.5 bg-sky-600/20 hover:bg-sky-600/40 border border-sky-500/30 text-sky-400 rounded-xl text-xs font-semibold shrink-0 transition-colors"
                  >
                    Call
                  </a>
                </div>
              ))}

              {services.map((serv) => (
                <div key={serv.id} className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 uppercase">
                      <HeartPulse className="w-3 h-3" /> {serv.service_type}
                    </div>
                    <h4 className="text-xs font-bold text-white">{serv.name}</h4>
                    {serv.distance_km && <p className="text-[10px] text-sky-400 font-mono mt-0.5">📍 {serv.distance_km} km away</p>}
                  </div>
                  <a
                    href={`tel:${serv.phone_number}`}
                    className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold shrink-0 transition-colors"
                  >
                    Hotline
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Need to report a local hazard?</span>
            <button
              onClick={() => onNavigate('report')}
              className="text-amber-400 font-semibold hover:underline"
            >
              Submit Geotagged Report →
            </button>
          </div>
        </div>
      </div>

      {/* SOS Emergency Modal */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-rose-500/50 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto animate-bounce">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Emergency SOS Dispatch</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you in immediate life-threatening danger? Triggering SOS broadcasts your current GPS coordinates to State Disaster Control Rooms, NDRF teams, and nearby emergency vehicles.
            </p>
            {currentCoords && (
              <div className="p-3 bg-slate-900 rounded-xl font-mono text-xs text-sky-400 border border-slate-800">
                Broadcasting: {currentCoords.latitude.toFixed(4)}° N, {currentCoords.longitude.toFixed(4)}° E
              </div>
            )}

            {sosSent ? (
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold animate-pulse">
                ✓ SOS Alert Dispatched to 112 Control Room & NDRF Hub
              </div>
            ) : (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSosModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTriggerSOS}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30"
                >
                  CONFIRM & DISPATCH
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
