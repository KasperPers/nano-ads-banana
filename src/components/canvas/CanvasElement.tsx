'use client';

import { useState, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CanvasElement as CanvasElementType, UploadedImage } from '@/types';
import { cn } from '@/lib/utils';
import { Package, Type, Zap, MousePointer } from 'lucide-react';

interface CanvasElementProps {
  element: CanvasElementType;
  isSelected: boolean;
  onSelect: () => void;
  productImage?: UploadedImage;
  onResize?: (updates: { width: number; height: number; x: number; y: number }) => void;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ELEMENT_CONFIG = {
  product: {
    label: 'Product',
    color: 'bg-blue-500',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icon: Package,
  },
  headline: {
    label: 'Headline',
    color: 'bg-purple-500',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    icon: Type,
  },
  usp: {
    label: 'USP',
    color: 'bg-green-500',
    borderColor: 'border-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: Zap,
  },
  cta: {
    label: 'CTA',
    color: 'bg-orange-500',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    icon: MousePointer,
  },
};

export function CanvasElement({
  element,
  isSelected,
  onSelect,
  productImage,
  onResize,
  canvasWidth = 400,
  canvasHeight = 400,
}: CanvasElementProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: element.id,
  });
  const [isResizing, setIsResizing] = useState(false);

  const config = ELEMENT_CONFIG[element.type];
  const Icon = config.icon;

  // Calculate pixel dimensions from percentages
  const width = ((element.width || 30) / 100) * canvasWidth;
  const height = ((element.height || 20) / 100) * canvasHeight;

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        left: `${element.x || 0}%`,
        top: `${element.y || 0}%`,
        width: `${element.width || 30}%`,
        height: `${element.height || 20}%`,
      }
    : {
        left: `${element.x || 0}%`,
        top: `${element.y || 0}%`,
        width: `${element.width || 30}%`,
        height: `${element.height || 20}%`,
      };

  const handleResizeStart = useCallback((e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.width || 30;
    const startHeight = element.height || 20;
    const startLeft = element.x || 0;
    const startTop = element.y || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = ((moveEvent.clientX - startX) / canvasWidth) * 100;
      const deltaY = ((moveEvent.clientY - startY) / canvasHeight) * 100;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startLeft;
      let newY = startTop;

      if (corner.includes('e')) {
        newWidth = Math.max(10, Math.min(100 - startLeft, startWidth + deltaX));
      }
      if (corner.includes('w')) {
        const widthDelta = Math.min(startWidth - 10, deltaX);
        newWidth = Math.max(10, startWidth - widthDelta);
        newX = Math.max(0, startLeft + widthDelta);
      }
      if (corner.includes('s')) {
        newHeight = Math.max(10, Math.min(100 - startTop, startHeight + deltaY));
      }
      if (corner.includes('n')) {
        const heightDelta = Math.min(startHeight - 10, deltaY);
        newHeight = Math.max(10, startHeight - heightDelta);
        newY = Math.max(0, startTop + heightDelta);
      }

      if (onResize) {
        onResize({ width: newWidth, height: newHeight, x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [element, canvasWidth, canvasHeight, onResize]);

  const isProductWithImage = element.type === 'product' && productImage;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isResizing ? {} : listeners)}
      {...(isResizing ? {} : attributes)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      aria-label={`${config.label} element`}
      className={cn(
        'absolute rounded-lg border-2 transition-shadow overflow-hidden',
        !isResizing && 'cursor-move',
        isProductWithImage ? 'p-0' : 'p-2',
        config.bgColor,
        config.borderColor,
        isDragging && 'opacity-70 shadow-2xl z-50',
        isSelected && 'ring-2 ring-offset-2 ring-blue-500 shadow-lg',
        'hover:shadow-md'
      )}
    >
      {/* Product element with uploaded image */}
      {isProductWithImage ? (
        <div className="relative w-full h-full">
          <img
            src={productImage.base64}
            alt={productImage.name}
            className="w-full h-full object-contain bg-white pointer-events-none"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600/90 to-transparent px-2 py-1">
            <span className="text-xs font-medium text-white drop-shadow">Product</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-1 pointer-events-none">
          <Icon className={cn('w-5 h-5', config.textColor)} />
          <span className={cn('text-xs font-semibold', config.textColor)}>
            {config.label}
          </span>
        </div>
      )}

      {/* Resize handles - only show when selected */}
      {isSelected && (
        <>
          {/* Corner handles */}
          <div
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            className={cn(
              'absolute -right-1.5 -bottom-1.5 w-4 h-4 rounded-full cursor-se-resize z-10',
              config.color,
              'border-2 border-white shadow-md hover:scale-110 transition-transform'
            )}
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
            className={cn(
              'absolute -left-1.5 -bottom-1.5 w-4 h-4 rounded-full cursor-sw-resize z-10',
              config.color,
              'border-2 border-white shadow-md hover:scale-110 transition-transform'
            )}
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
            className={cn(
              'absolute -right-1.5 -top-1.5 w-4 h-4 rounded-full cursor-ne-resize z-10',
              config.color,
              'border-2 border-white shadow-md hover:scale-110 transition-transform'
            )}
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
            className={cn(
              'absolute -left-1.5 -top-1.5 w-4 h-4 rounded-full cursor-nw-resize z-10',
              config.color,
              'border-2 border-white shadow-md hover:scale-110 transition-transform'
            )}
          />
          {/* Edge handles */}
          <div
            onMouseDown={(e) => handleResizeStart(e, 'e')}
            className={cn(
              'absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-6 rounded-full cursor-e-resize z-10',
              config.color,
              'border border-white shadow-sm hover:scale-110 transition-transform'
            )}
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'w')}
            className={cn(
              'absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-6 rounded-full cursor-w-resize z-10',
              config.color,
              'border border-white shadow-sm hover:scale-110 transition-transform'
            )}
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 's')}
            className={cn(
              'absolute left-1/2 -bottom-1 -translate-x-1/2 w-6 h-2 rounded-full cursor-s-resize z-10',
              config.color,
              'border border-white shadow-sm hover:scale-110 transition-transform'
            )}
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'n')}
            className={cn(
              'absolute left-1/2 -top-1 -translate-x-1/2 w-6 h-2 rounded-full cursor-n-resize z-10',
              config.color,
              'border border-white shadow-sm hover:scale-110 transition-transform'
            )}
          />
        </>
      )}
    </div>
  );
}
