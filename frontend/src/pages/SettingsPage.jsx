import React, { useState, useEffect } from 'react';
import { 
  Settings, User, MapPin, Bell, Shield, 
  Smartphone, Mail, CheckCircle2, Cpu, Database, Save, LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI, riskAPI } from '../services/api';

export const SettingsPage = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    home_location_id: user?.home_location_id || 1,
    address: user?.address || ''
  });

  const [notifSettings, setNotifSettings] = useState({
    criticalSiren: true,
    smsAlerts: true,
    emailBroadcasts: true,
    sensorSurgeNotice: true,
    shelterCapacityAlerts: false
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await riskAPI.getAllLocationsRisk();
        setLocations(res.data);
      } catch (err) {
        console.error("Failed to load locations:", err);
      }
    };
    fetchLocations();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateProfile(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" /> System & User Configuration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            CivicPulse Settings & Preferences
          </h1>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-rose-600/15 hover:bg-rose-600/30 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> Profile settings and early warning zone updated successfully.
        </div>
      )}

      {/* User Profile Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <User className="w-5 h-5 text-sky-400" />
          <h3 className="text-lg font-bold text-white">Citizen Profile & Home District</h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Phone (For Emergency SMS)</label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Home Hazard Monitoring Zone</label>
              <select
                value={formData.home_location_id}
                onChange={(e) => setFormData({ ...formData, home_location_id: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                {locations.map((loc) => (
                  <option key={loc.location_id} value={loc.location_id}>
                    {loc.name}, {loc.state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Residential Street Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-600/30 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" /> Save Profile Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Early Warning Notification Preferences */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Bell className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Warning Delivery Channels</h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 cursor-pointer">
            <div>
              <strong className="text-xs text-white block">🚨 High-Decibel Critical Emergency Siren Mode</strong>
              <span className="text-[11px] text-slate-400">Override silent/DND settings during Red/Critical evacuation alerts.</span>
            </div>
            <input
              type="checkbox"
              checked={notifSettings.criticalSiren}
              onChange={(e) => setNotifSettings({ ...notifSettings, criticalSiren: e.target.checked })}
              className="rounded text-rose-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 cursor-pointer">
            <div>
              <strong className="text-xs text-white block">📱 SMS Broadcast Simulator</strong>
              <span className="text-[11px] text-slate-400">Receive instant offline cellular broadcasts when cell tower data is low.</span>
            </div>
            <input
              type="checkbox"
              checked={notifSettings.smsAlerts}
              onChange={(e) => setNotifSettings({ ...notifSettings, smsAlerts: e.target.checked })}
              className="rounded text-sky-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 cursor-pointer">
            <div>
              <strong className="text-xs text-white block">⚡ Sensor Spike Anomaly Alerts</strong>
              <span className="text-[11px] text-slate-400">Receive alerts when river stage or rainfall spikes exceed 95th percentile.</span>
            </div>
            <input
              type="checkbox"
              checked={notifSettings.sensorSurgeNotice}
              onChange={(e) => setNotifSettings({ ...notifSettings, sensorSurgeNotice: e.target.checked })}
              className="rounded text-amber-500 w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* System Diagnostic Status */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">System Diagnostics & AI Architecture</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">API Gateway</span>
            <strong className="text-emerald-400 font-mono text-sm">200 OK (12ms)</strong>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Database Sync</span>
            <strong className="text-emerald-400 font-mono text-sm">SQLite / Relational</strong>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">ML Engine</span>
            <strong className="text-sky-400 font-mono text-sm">Ensemble v2.0 Active</strong>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Sensor Telemetry</span>
            <strong className="text-emerald-400 font-mono text-sm">12 Streams Live</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
