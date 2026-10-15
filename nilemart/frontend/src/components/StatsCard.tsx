import { ReactNode } from 'react';

export default function StatsCard({
  icon,
  title,
  value,
  subtitle,
  trend,
  color = 'brand',
}: {
  icon: ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
  color?: 'brand' | 'success' | 'warning' | 'error' | 'navy';
}) {
  const colorClasses = {
    brand: 'bg-brand/10 text-brand',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    navy: 'bg-navy/10 text-navy',
  };

  return (
    <div className="card p-6 hover:shadow-large transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${trend.value >= 0 ? 'text-success' : 'text-error'}`}>
            <span>{trend.value >= 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="mb-1">
        <div className="text-3xl font-bold text-ink mb-1">{value}</div>
        <div className="text-sm font-semibold text-mute">{title}</div>
      </div>
      {subtitle && <div className="text-xs text-mute mt-2">{subtitle}</div>}
    </div>
  );
}
