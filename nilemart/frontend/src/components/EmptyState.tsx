import { PackageOpen } from 'lucide-react';
import type { ReactNode } from 'react';

export default function EmptyState({
  icon = <PackageOpen className="h-12 w-12" />,
  title,
  description,
  action,
  actionLabel,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fadeIn">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand">{icon}</div>
      <h3 className="text-xl font-bold text-ink mb-2">{title}</h3>
      {description && <p className="text-mute max-w-md mb-6">{description}</p>}
      {action && actionLabel && (
        <button onClick={action} className="btn btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
