'use client';

import Image from 'next/image';
import { useState } from 'react';
import { CategoryIcon } from './CategoryIcon';
import type { Product } from '@/lib/types';

export default function ProductArtwork({
  product,
  className,
  iconClassName,
}: {
  product: Pick<Product, 'images' | 'category' | 'name'>;
  className: string;
  iconClassName?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const positionClass = className.split(/\s+/).includes('absolute') ? '' : 'relative';

  return (
    <div className={`${positionClass} grid place-items-center overflow-hidden ${className}`}>
      {product.images?.[0] && !imageFailed ? (
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <CategoryIcon
          category={product.category}
          className={iconClassName || 'h-14 w-14 text-brand/60'}
        />
      )}
    </div>
  );
}
