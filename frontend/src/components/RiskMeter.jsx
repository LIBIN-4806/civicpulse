import React from 'react';
import RiskBadge from './RiskBadge';

export const RiskMeter = ({ score = 0, category = 'LOW', probability = 0, confidence = 0.95, disasterType = 'GENERAL' }) => {
  const clampedScore = Math.min(100, Math.max(0, score));
  
  // Calculate stroke dashoffset for circular gauge (radius = 70)
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const getColor = () => {
    if (category === 'CRITICAL') return '#ef4444';
    if (category === 'HIGH') return '#f97316';
    if (category === 'MODERATE') return '#f59e0b';
    return '#10b981';
  };

  const currentColor = getColor();

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-panel rounded-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div 
        className="absolute w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none -top-10 -right-10"
        style={{ backgroundColor: currentColor }}
      />

      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* SVG Circular Progress Gauge */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#1e293b"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Active Risk Meter Stroke */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={currentColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-4xl font-extrabold tracking-tight font-mono text-white">
            {Math.round(clampedScore)}
          </span>
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Score / 100
          </span>
        </div>
      </div>

      {/* Hazard Status and Category */}
      <div className="mt-4 flex flex-col items-center gap-2 text-center">
        <RiskBadge category={category} size="lg" />
        
        <div className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-3">
          <span>Hazard: <strong className="text-slate-200">{disasterType.replace('_', ' ')}</strong></span>
          <span>•</span>
          <span>Confidence: <strong className="text-slate-200">{Math.round(confidence * 100)}%</strong></span>
        </div>
      </div>
    </div>
  );
};

export default RiskMeter;
