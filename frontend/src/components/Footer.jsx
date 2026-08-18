import React from 'react';
import { Shield, PhoneCall, HeartPulse, AlertCircle, Radio } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#080c14] border-t border-slate-800/80 pt-12 pb-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Emergency Helpline Strip */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-sky-950/40 border border-rose-500/20 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide">24/7 Citizen Emergency Hotlines (India)</h4>
              <p className="text-[11px] text-slate-300">Toll-free national emergency response and disaster control rooms</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs text-slate-200">
              <strong className="text-rose-400">112</strong> All Emergency
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs text-slate-200">
              <strong className="text-amber-400">1077</strong> Disaster Control Room
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs text-slate-200">
              <strong className="text-emerald-400">108</strong> Ambulance
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs text-slate-200">
              <strong className="text-sky-400">101</strong> Fire & Rescue
            </div>
          </div>
        </div>

        {/* Core Disclaimer Box */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-200 block mb-0.5">⚠️ Mandatory AI Safety & Predictive Risk Notice:</strong>
            CivicPulse provides AI-assisted risk assessment and early-warning support based on real-time sensor streams and historical disaster patterns. 
            All generated predictions are probabilistic risk assessments, not guaranteed disaster forecasts. 
            Citizens must always prioritize official emergency instructions and evacuation orders issued by State Disaster Management Authorities (SDMA), NDRF, and local administration.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/60 pt-6 gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-slate-300 font-sans">CivicPulse</span>
            <span className="text-slate-500">—</span>
            <span className="text-slate-400 font-medium">“Predict Early. Act Early. Protect Communities.”</span>
          </div>
          <div className="text-slate-500 text-[11px]">
            Academic & Public Safety Prototype • Developed for Intelligent Civic Resilience
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
