import React, { useState } from 'react';
import { AlertOctagon, X, ChevronRight, ShieldCheck, MapPin } from 'lucide-react';

export const AlertBanner = ({ alert, onOpenDetails }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!alert || dismissed) return null;

  const isCritical = alert.severity === 'CRITICAL';

  return (
    <div className={`w-full px-4 py-3 border-b flex items-center justify-between transition-all ${
      isCritical 
        ? 'bg-rose-950/80 border-rose-500/40 text-rose-100 shadow-glow-crit'
        : 'bg-orange-950/70 border-orange-500/30 text-orange-100'
    }`}>
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg shrink-0 ${isCritical ? 'bg-rose-500/20 text-rose-400 animate-bounce' : 'bg-orange-500/20 text-orange-400'}`}>
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded ${isCritical ? 'bg-rose-600 text-white' : 'bg-orange-600 text-white'}`}>
                {alert.severity} ALERT
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-400" />
                {alert.location_name} (Radius: {alert.affected_radius_km} km)
              </span>
              {alert.is_official && (
                <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Official Authority Directive
                </span>
              )}
            </div>
            <p className="text-sm font-medium mt-0.5 line-clamp-1">{alert.title}: {alert.message}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {onOpenDetails && (
            <button
              onClick={() => onOpenDetails(alert)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
            >
              Safety Actions <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;
