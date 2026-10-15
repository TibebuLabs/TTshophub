import {
  Coffee,
  Dumbbell,
  Gift,
  House,
  Package,
  Shirt,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Coffee & Food': Coffee,
  Fashion: Shirt,
  Electronics: Smartphone,
  Home: House,
  Beauty: Sparkles,
  Sports: Dumbbell,
  'Gift Finds': Gift,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[category] || Package;
  return <Icon aria-hidden="true" className={className} strokeWidth={1.7} />;
}
