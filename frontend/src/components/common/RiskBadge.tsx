import React from 'react';
import type { RiskLevel } from '../../types';
import { ShieldAlert, ShieldCheck, AlertTriangle, ShieldX } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel | string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  size = 'md',
  showScore = true
}) => {
  const normLevel = level.toUpperCase();

  let colorClasses = 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40 shadow-neon-emerald';
  let Icon = ShieldCheck;
  let label = 'LOW RISK';

  if (normLevel === 'HIGH' || normLevel === 'CRITICAL') {
    colorClasses = 'bg-rose-950/80 text-rose-400 border-rose-500/50 shadow-neon-red animate-pulse-slow';
    Icon = ShieldX;
    label = 'HIGH RISK';
  } else if (normLevel === 'SUSPICIOUS') {
    colorClasses = 'bg-amber-950/80 text-amber-400 border-amber-500/50 shadow-neon-amber';
    Icon = AlertTriangle;
    label = 'SUSPICIOUS';
  } else if (normLevel === 'MODERATE') {
    colorClasses = 'bg-yellow-950/70 text-yellow-400 border-yellow-500/40';
    Icon = ShieldAlert;
    label = 'MODERATE';
  }

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
    lg: 'text-base px-5 py-2.5 gap-2.5 font-bold'
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md transition-all duration-300 ${colorClasses} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>{label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-80 pl-1 font-mono">({score}/100)</span>
      )}
    </span>
  );
};
