import React from 'react';
import type { RiskLevel } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel | string;
  size?: number;
  strokeWidth?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  level,
  size = 200,
  strokeWidth = 14
}) => {
  const { theme } = useTheme();
  const center = size / 2;
  const radius = center - strokeWidth - 6;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (260 / 360);
  const strokeDashoffset = arcLength - (score / 100) * arcLength;

  let glowColor = 'rgba(16, 185, 129, 0.45)';
  let labelColor = 'text-emerald-500 dark:text-emerald-400';
  let gradientId = 'grad-emerald';

  const normLevel = level.toUpperCase();
  if (normLevel === 'HIGH' || normLevel === 'CRITICAL') {
    glowColor = 'rgba(239, 68, 68, 0.6)';
    labelColor = 'text-rose-600 dark:text-rose-400';
    gradientId = 'grad-red';
  } else if (normLevel === 'SUSPICIOUS') {
    glowColor = 'rgba(249, 115, 22, 0.5)';
    labelColor = 'text-orange-600 dark:text-orange-400';
    gradientId = 'grad-orange';
  } else if (normLevel === 'MODERATE') {
    glowColor = 'rgba(245, 158, 11, 0.45)';
    labelColor = 'text-amber-600 dark:text-amber-400';
    gradientId = 'grad-amber';
  }

  const trackStroke = theme === 'light' ? '#e2e8f0' : '#0f172a';

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform rotate-[140deg]">
        <defs>
          <linearGradient id="grad-red" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="grad-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="grad-amber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Track Background */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackStroke}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          fill="transparent"
        />

        {/* Active Animated Gauge Arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.5s ease',
            filter: `drop-shadow(0 0 12px ${glowColor})`
          }}
        />
      </svg>

      {/* Center Score Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-2">
        <span className="text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
          {score}
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">/100</span>
        </span>
        <span className={`text-[11px] font-extrabold uppercase tracking-widest mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 ${labelColor}`}>
          {level}
        </span>
        <span className="text-[9px] font-mono text-slate-500 dark:text-slate-500 mt-1 uppercase tracking-wider">
          Risk Index
        </span>
      </div>
    </div>
  );
};
