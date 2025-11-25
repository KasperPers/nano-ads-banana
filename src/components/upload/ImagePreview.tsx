'use client';

import { X } from 'lucide-react';
import type { UploadedImage } from '@/types';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  image: UploadedImage;
  onRemove: (id: string) => void;
}

export function ImagePreview({ image, onRemove }: ImagePreviewProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const truncateFilename = (name: string, maxLength: number = 20): string => {
    if (name.length <= maxLength) return name;
    const extension = name.split('.').pop() || '';
    const nameWithoutExt = name.slice(0, name.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.slice(0, maxLength - extension.length - 4);
    return `${truncatedName}...${extension}`;
  };

  return (
    <div className="relative group rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
      <div className="aspect-square relative">
        <img
          src={image.base64}
          alt={image.name}
          className="w-full h-full object-cover"
        />
      </div>

      <button
        onClick={() => onRemove(image.id)}
        className={cn(
          'absolute top-1 right-1 bg-red-500 text-white rounded-full p-1',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'hover:bg-red-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
        )}
        aria-label={`Remove ${image.name}`}
      >
        <X className="w-4 h-4" />
      </button>

      <div className="p-2 bg-white">
        <p className="text-xs font-medium text-gray-700 truncate" title={image.name}>
          {truncateFilename(image.name)}
        </p>
        <p className="text-xs text-gray-500">
          {formatFileSize(image.size)}
        </p>
      </div>
    </div>
  );
}
