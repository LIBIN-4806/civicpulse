import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, Bell, Filter, ShieldCheck, MapPin, 
  Calendar, CheckCircle2, AlertTriangle, Radio, RefreshCw 
} from 'lucide-react';
import { alertsAPI } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [expandedAlertId, setExpandedAlertId] = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (severityFilter !== 'ALL') params.severity = severityFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await alertsAPI.getAlerts(params);
      setAlerts(res.data);
    } catch (err) {
      console.error("Failed to load alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse" /> Public Safety Warning Broadcast Feed
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Civic Early Warnings & Emergency Directives
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official alerts issued by disaster response authorities and automated AI early-warning triggers
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="ACTIVE">🟢 Active Warnings</option>
            <option value="RESOLVED">⚪ Resolved Archive</option>
            <option value="ALL">All Statuses</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">🔴 Critical Hazard</option>
            <option value="HIGH">🟠 High Warning</option>
            <option value="MODERATE">🟡 Moderate Watch</option>
          </select>

          <button
            onClick={fetchAlerts}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Refresh alerts"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isExpanded = expandedAlertId === alert.id;

          return (
            <div
              key={alert.id}
              className={`glass-panel p-6 rounded-3xl border transition-all ${
                isCritical 
                  ? 'border-rose-500/40 bg-rose-950/20 shadow-glow-crit' 
                  : 'border-orange-500/30 bg-orange-950/15'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      isCritical ? 'bg-rose-600 text-white' : 'bg-orange-600 text-white'
                    }`}>
                      {alert.severity} WARNING
                    </span>
                    <span className="text-xs text-sky-400 font-bold uppercase tracking-wider">
                      {alert.disaster_type}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      {alert.location_name} (Radius: {alert.affected_radius_km} km)
                    </span>
                    {alert.is_official ? (
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Official Authority Directive
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> AI Early Warning Trigger
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white">{alert.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">{alert.message}</p>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <strong className="text-amber-400 block mb-0.5">Underlying Environmental Cause:</strong>
                    {alert.reason}
                  </div>
                </div>

                <div className="flex md:flex-col items-end justify-between md:justify-start gap-2 shrink-0">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(alert.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    {isExpanded ? 'Hide Actions ▲' : 'View Safety Protocol ▼'}
                  </button>
                </div>
              </div>

              {/* Collapsible Action Checklist */}
              {isExpanded && alert.recommended_actions && (
                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Recommended Public Action Checklist:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {alert.recommended_actions.map((act, i) => (
                      <div key={i} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {alerts.length === 0 && !loading && (
          <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No Warnings Matching Filter</h3>
            <p className="text-xs text-slate-400">All environmental monitoring channels in selected filters are nominal.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
