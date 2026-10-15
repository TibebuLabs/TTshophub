import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}) {
  const variantClasses: Record<BadgeVariant, string> = {
    default: 'pill',
    success: 'pill-green',
    warning: 'pill-yellow',
    error: 'pill-red',
    info: 'pill-blue',
  };

  const sizeClasses: Record<BadgeSize, string> = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-[11px] px-2.5 py-0.5',
    lg: 'text-xs px-3 py-1',
  };

  return (
    <span className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}
