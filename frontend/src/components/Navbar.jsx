import React, { useState } from 'react';
import { 
  ShieldAlert, MapPin, Bell, Radio, Activity, 
  LifeBuoy, FileText, BarChart3, User, LogOut, 
  Menu, X, Sparkles, AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, isAdmin, logout, loginAsDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: isAdmin ? 'Command Center' : 'Citizen Pulse', icon: Activity },
    { id: 'map', label: 'Disaster Map', icon: MapPin },
    { id: 'alerts', label: 'Early Warnings', icon: Bell },
    { id: 'report', label: 'Report Hazard', icon: AlertTriangle },
    { id: 'shelters', label: 'Shelters & Services', icon: LifeBuoy },
    { id: 'analytics', label: 'AI/ML Analytics', icon: BarChart3 },
    { id: 'history', label: 'Disaster Archive', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800">
      {/* Live Calamity Ticker */}
      <div className="bg-slate-900/90 border-b border-slate-800/60 px-4 py-1 text-xs text-slate-300 flex items-center overflow-hidden">
        <div className="flex items-center gap-1.5 font-semibold text-rose-400 shrink-0 mr-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          LIVE PULSE:
        </div>
        <div className="overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-6 text-[11px] text-slate-300">
          <span className="inline-flex items-center gap-1"><span className="text-rose-400 font-bold">🔴 Wayanad:</span> CRITICAL Landslide & Rain Threat (240mm)</span>
          <span className="inline-flex items-center gap-1"><span className="text-orange-400 font-bold">🟠 Munnar:</span> High Slope Saturation (88% Soil Moisture)</span>
          <span className="inline-flex items-center gap-1"><span className="text-amber-400 font-bold">🟡 Puri:</span> Cyclone Wind Watch (88 km/h)</span>
          <span className="inline-flex items-center gap-1"><span className="text-emerald-400 font-bold">🟢 Pune & Bengaluru:</span> Nominal Baseline Stable</span>
          <span className="inline-flex items-center gap-1 text-sky-400 font-mono">⚡ 12 IoT Environmental Telemetry Feeds Synchronized</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('landing')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-sky-400 group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white font-sans">Civic<span className="text-sky-400">Pulse</span></span>
                <span className="text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.2 rounded-full uppercase tracking-wider">AI 2.0</span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Early Calamity Detection & Public Safety</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Role Switching & User Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Demo Switchers */}
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-lg flex items-center text-xs">
              <button
                onClick={() => loginAsDemo('citizen')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  user && !isAdmin ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Citizen View"
              >
                Citizen
              </button>
              <button
                onClick={() => loginAsDemo('admin')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  isAdmin ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Authority Admin Command Center"
              >
                Authority
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('settings')}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-xs text-slate-200 font-medium transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user.full_name?.split(' ')[0]}</span>
                </button>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-sky-600/25 transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0e1526] border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => { loginAsDemo('citizen'); setMobileMenuOpen(false); }}
                className="px-3 py-1 bg-slate-800 text-xs font-semibold rounded text-sky-400"
              >
                Demo Citizen
              </button>
              <button
                onClick={() => { loginAsDemo('admin'); setMobileMenuOpen(false); }}
                className="px-3 py-1 bg-indigo-900/60 text-xs font-semibold rounded text-indigo-300"
              >
                Demo Admin
              </button>
            </div>
            {user && (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="text-xs text-rose-400 hover:underline"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
