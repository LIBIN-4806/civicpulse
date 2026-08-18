import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Flame } from 'lucide-react';

export const RiskBadge = ({ category = 'LOW', score = null, size = 'md' }) => {
  const cat = (category || 'LOW').toUpperCase();

  const configs = {
    LOW: {
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      glow: 'shadow-glow-low',
      icon: ShieldCheck,
      label: 'LOW RISK'
    },
    MODERATE: {
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      glow: 'shadow-glow-mod',
      icon: AlertTriangle,
      label: 'MODERATE RISK'
    },
    HIGH: {
      bg: 'bg-orange-500/20',
      border: 'border-orange-500/40',
      text: 'text-orange-400',
      glow: 'shadow-glow-high',
      icon: Flame,
      label: 'HIGH RISK'
    },
    CRITICAL: {
      bg: 'bg-rose-500/25',
      border: 'border-rose-500/50',
      text: 'text-rose-400',
      glow: 'shadow-glow-crit animate-pulse',
      icon: AlertOctagon,
      label: 'CRITICAL HAZARD'
    }
  };

  const config = configs[cat] || configs.LOW;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base font-semibold gap-2'
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.border} ${config.text} ${config.glow} ${sizeClasses[size]}`}>
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>{config.label}</span>
      {score !== null && (
        <span className="opacity-90 font-mono font-bold ml-1">({Math.round(score)}/100)</span>
      )}
    </span>
  );
};

export default RiskBadge;
