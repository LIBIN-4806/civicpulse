import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Radio, AlertOctagon, Users, Home, 
  FileText, Download, CheckCircle2, XCircle, Plus, 
  RefreshCw, MapPin, Eye, Filter, ArrowUpRight, Flame 
} from 'lucide-react';
import { adminAPI, alertsAPI, reportsAPI, riskAPI, analyticsAPI } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import IncidentCard from '../components/IncidentCard';

export const AdminDashboard = ({ onNavigate }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [locations, setLocations] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  // New Alert Form State
  const [newAlert, setNewAlert] = useState({
    title: '',
    disaster_type: 'FLOOD',
    severity: 'HIGH',
    location_id: '',
    affected_radius_km: 25.0,
    message: '',
    reason: '',
    recommended_actions: [
      'Avoid low-lying flood-prone roads',
      'Prepare emergency provisions',
      'Follow NDRF / District Collector orders'
    ]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, locRes, repRes, alertRes, auditRes] = await Promise.all([
        adminAPI.getDashboard(),
        riskAPI.getAllLocationsRisk(),
        reportsAPI.getReports({ status: 'PENDING' }),
        alertsAPI.getActiveAlerts(),
        adminAPI.getAuditLogs()
      ]);
      setDashboardData(dashRes.data);
      setLocations(locRes.data);
      setReports(repRes.data);
      setActiveAlerts(alertRes.data);
      setAuditLogs(auditRes.data);
      if (locRes.data.length > 0 && !newAlert.location_id) {
        setNewAlert(prev => ({ ...prev, location_id: locRes.data[0].location_id }));
      }
    } catch (err) {
      console.error("Failed to load admin dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyReport = async (reportId, status) => {
    try {
      await reportsAPI.verifyReport(reportId, {
        status: status,
        verification_notes: status === 'VERIFIED' ? 'Verified by Emergency Command Center. Dispatch units notified.' : 'Dismissed following drone/field verification.'
      });
      fetchData();
    } catch (err) {
      console.error("Error verifying report:", err);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      await alertsAPI.createAlert({
        ...newAlert,
        location_id: parseInt(newAlert.location_id)
      });
      setCreateModalOpen(false);
      setNewAlert({
        title: '',
        disaster_type: 'FLOOD',
        severity: 'HIGH',
        location_id: locations[0]?.location_id || 1,
        affected_radius_km: 25.0,
        message: '',
        reason: '',
        recommended_actions: ['Avoid exposed areas', 'Follow official shelter directives']
      });
      fetchData();
    } catch (err) {
      console.error("Error issuing alert:", err);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await alertsAPI.resolveAlert(alertId);
      fetchData();
    } catch (err) {
      console.error("Error resolving alert:", err);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
        <span className="text-sm font-semibold text-slate-300">Initializing Emergency Command Center...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-indigo-500/30">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse" /> Emergency Operations Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Disaster Authority Command Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Officer: <strong className="text-indigo-300">{dashboardData?.admin_name}</strong> • Role: <strong className="text-slate-200 uppercase">{dashboardData?.admin_role}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={adminAPI.getExportUrl()}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </a>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Broadcast Emergency Alert
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Monitored Zones</span>
          <div className="text-3xl font-extrabold text-white font-mono mt-1">{dashboardData?.total_monitored_locations}</div>
          <span className="text-[11px] text-sky-400 mt-1 block">Live IoT Sensor Sync</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-rose-950/10">
          <span className="text-xs text-rose-300 font-semibold uppercase">Active Warnings</span>
          <div className="text-3xl font-extrabold text-rose-400 font-mono mt-1">{activeAlerts.length}</div>
          <span className="text-[11px] text-rose-400/80 mt-1 block">High & Critical Priority</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10">
          <span className="text-xs text-amber-300 font-semibold uppercase">Pending Citizen Reports</span>
          <div className="text-3xl font-extrabold text-amber-400 font-mono mt-1">{reports.length}</div>
          <span className="text-[11px] text-amber-400/80 mt-1 block">Awaiting Verification</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10">
          <span className="text-xs text-emerald-300 font-semibold uppercase">Shelter Network Capacity</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
            {dashboardData?.shelters_summary?.total_occupancy} / {dashboardData?.shelters_summary?.total_capacity}
          </div>
          <span className="text-[11px] text-emerald-400/80 mt-1 block">
            {Math.round((dashboardData?.shelters_summary?.total_occupancy / Math.max(1, dashboardData?.shelters_summary?.total_capacity)) * 100)}% Current Occupancy
          </span>
        </div>
      </div>

      {/* Main Grid: Multi-Hazard Radar Matrix + Active Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regional Risk Radar Matrix */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white">Multi-Hazard Regional Risk Matrix</h3>
            <button
              onClick={() => onNavigate('map')}
              className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1"
            >
              Open Interactive Map <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase bg-slate-900/90 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="p-3">Region / District</th>
                  <th className="p-3">Active Hazard</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3">24h Rain</th>
                  <th className="p-3">River Level</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {locations.map((loc) => (
                  <tr key={loc.location_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      {loc.name}, {loc.state}
                    </td>
                    <td className="p-3 font-semibold text-slate-200">
                      {loc.disaster_type}
                    </td>
                    <td className="p-3 font-mono font-bold">
                      <span className={loc.risk_score > 70 ? 'text-rose-400' : loc.risk_score > 40 ? 'text-amber-400' : 'text-emerald-400'}>
                        {Math.round(loc.risk_score)}/100
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      {loc.latest_reading?.rainfall_24h || 0} mm
                    </td>
                    <td className="p-3 font-mono">
                      {loc.latest_reading?.river_water_level || 1.5}m
                    </td>
                    <td className="p-3">
                      <RiskBadge category={loc.risk_category} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Alerts Management */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-400" /> Active Alerts
              </h3>
              <span className="text-xs text-slate-400 font-mono">({activeAlerts.length} Active)</span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {activeAlerts.map((a) => (
                <div key={a.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{a.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white uppercase">
                      {a.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{a.message}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>📍 {a.location_name}</span>
                    <button
                      onClick={() => handleResolveAlert(a.id)}
                      className="text-xs text-emerald-400 hover:underline font-semibold"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
              {activeAlerts.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  No active high or critical emergency alerts.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Citizen Incident Verification Queue */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Crowdsourced Incident Verification Queue</h3>
            <p className="text-xs text-slate-400 mt-0.5">Validate citizen reports with AI-assisted hazard identification</p>
          </div>
          <span className="text-xs px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full font-bold">
            {reports.length} Pending Review
          </span>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            ✓ All citizen incident reports have been verified or resolved.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((rep) => (
              <IncidentCard
                key={rep.id}
                report={rep}
                isAdmin={true}
                onVerify={handleVerifyReport}
              />
            ))}
          </div>
        )}
      </div>

      {/* Audit Log Stream */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">Authority Audit Log Stream</h3>
          <span className="text-xs text-slate-400">Security & Operational Tracking</span>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto text-xs text-slate-300 font-mono">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/80 flex items-center justify-between gap-3">
              <div>
                <span className="text-sky-400 font-bold">[{log.action}]</span> {log.details}
              </div>
              <span className="text-[10px] text-slate-500 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Broadcast Alert Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-indigo-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertOctagon className="w-6 h-6 text-rose-400" /> Broadcast Emergency Directive
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Alert Headline / Title</label>
                <input
                  type="text"
                  required
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  placeholder="e.g. RED ALERT: Rapid River Basin Inundation"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Hazard Type</label>
                  <select
                    value={newAlert.disaster_type}
                    onChange={(e) => setNewAlert({ ...newAlert, disaster_type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="FLOOD">FLOOD</option>
                    <option value="LANDSLIDE">LANDSLIDE</option>
                    <option value="CYCLONE">CYCLONE</option>
                    <option value="HEATWAVE">HEATWAVE</option>
                    <option value="WILDFIRE">WILDFIRE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Severity Level</label>
                  <select
                    value={newAlert.severity}
                    onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="CRITICAL">CRITICAL (Red)</option>
                    <option value="HIGH">HIGH (Orange)</option>
                    <option value="MODERATE">MODERATE (Yellow)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Region</label>
                  <select
                    value={newAlert.location_id}
                    onChange={(e) => setNewAlert({ ...newAlert, location_id: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {locations.map((loc) => (
                      <option key={loc.location_id} value={loc.location_id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Emergency Advisory Message</label>
                <textarea
                  rows={2}
                  required
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                  placeholder="Mandatory evacuation advised for low-lying sectors along the riverbank..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Environmental Trigger Reason</label>
                <input
                  type="text"
                  required
                  value={newAlert.reason}
                  onChange={(e) => setNewAlert({ ...newAlert, reason: e.target.value })}
                  placeholder="24h precipitation reached 240mm with dam release..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30"
                >
                  Issue Public Warning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
