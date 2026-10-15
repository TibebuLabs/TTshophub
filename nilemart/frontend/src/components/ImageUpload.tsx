'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { LoaderCircle, Plus, X } from 'lucide-react';
import { api } from '@/lib/api';

export default function ImageUpload({
  images = [],
  onChange,
  onUploadingChange,
  maxImages = 5,
  required = false,
  disabled = false,
}: {
  images?: string[];
  onChange: (images: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  maxImages?: number;
  required?: boolean;
  disabled?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed.`);
      e.target.value = '';
      return;
    }
    const invalid = files.find((file) =>
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024,
    );
    if (invalid) {
      setError(invalid.size > 5 * 1024 * 1024
        ? 'Each image must be 5 MB or smaller.'
        : 'Choose a JPEG, PNG, or WebP image.');
      e.target.value = '';
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    setError('');

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      const result = await api<{ images: string[] }>('/products/images', {
        method: 'POST',
        formData,
      });
      onChange([...images, ...result.images]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload images.');
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <p className="label">Product images</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-4">
        {images.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-line group">
            <Image src={url} alt={`Upload ${i + 1}`} fill className="object-cover" />
            <button
              onClick={() => removeImage(i)}
              disabled={disabled || uploading}
              className="absolute top-2 right-2 bg-error text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-line hover:border-brand hover:bg-brand-50 transition-colors flex flex-col items-center justify-center gap-2 text-mute hover:text-brand disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <LoaderCircle aria-hidden="true" className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <Plus aria-hidden="true" className="h-8 w-8" />
                <span className="text-xs font-semibold">Add Image</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      <p className="text-xs text-mute">
        {images.length}/{maxImages} images. JPEG, PNG, or WebP; maximum 5 MB each.
      </p>
      {required && images.length === 0 && (
        <p className="mt-1 text-xs font-semibold text-warning">Upload at least one image before adding this product.</p>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
