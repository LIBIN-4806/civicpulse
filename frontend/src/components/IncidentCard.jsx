import React from 'react';
import { MapPin, Calendar, CheckCircle2, Clock, XCircle, AlertTriangle, Eye, Sparkles } from 'lucide-react';

export const IncidentCard = ({ report, onVerify, isAdmin = false }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified by Authority
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Action Resolved
          </span>
        );
      case 'DISMISSED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/30">
            <XCircle className="w-3.5 h-3.5" /> Dismissed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Pending Verification
          </span>
        );
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                {report.incident_type}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(report.created_at).toLocaleDateString()} {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h4 className="text-base font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              {report.location_name || 'Geotagged Incident'}
            </h4>
          </div>
          {getStatusBadge(report.status)}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          {report.description}
        </p>

        {/* AI Hazard Tagging Badge */}
        {report.ai_detected_hazard && (
          <div className="mb-4 p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/25 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-sky-300 font-medium">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>AI Classifier: <strong className="text-white">{report.ai_detected_hazard}</strong></span>
            </div>
            <span className="font-mono text-sky-400 font-semibold">
              {Math.round((report.ai_confidence || 0.85) * 100)}% Match
            </span>
          </div>
        )}

        {/* Image Attachment Preview */}
        {report.image_url && (
          <div className="relative mb-4 rounded-xl overflow-hidden border border-slate-700/60 max-h-48 group">
            <img 
              src={report.image_url.startsWith('http') ? report.image_url : `http://localhost:8000${report.image_url}`} 
              alt="Incident Proof" 
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Verification notes if present */}
        {report.verification_notes && (
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-3">
            <strong className="text-emerald-400 block mb-0.5">Authority Dispatch Note:</strong>
            {report.verification_notes}
          </div>
        )}
      </div>

      {/* Admin Action Buttons */}
      {isAdmin && report.status === 'PENDING' && onVerify && (
        <div className="pt-3 border-t border-slate-800 flex gap-2">
          <button
            onClick={() => onVerify(report.id, 'VERIFIED')}
            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Verify & Dispatch
          </button>
          <button
            onClick={() => onVerify(report.id, 'DISMISSED')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default IncidentCard;
