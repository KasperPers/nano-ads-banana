'use client';

import { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { AspectRatio, CanvasElement as CanvasElementType, ASPECT_RATIOS, UploadedImage } from '@/types';
import { CanvasElement } from './CanvasElement';
import { GridOverlay } from './GridOverlay';
import { cn } from '@/lib/utils';

interface AdCanvasProps {
  aspectRatio: AspectRatio;
  elements: CanvasElementType[];
  selectedId: string | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElementType>) => void;
  onSelectElement: (id: string | null) => void;
  gridVisible?: boolean;
  productImages?: UploadedImage[];
}

export function AdCanvas({
  aspectRatio,
  elements,
  selectedId,
  onUpdateElement,
  onSelectElement,
  gridVisible = true,
  productImages = [],
}: AdCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const [activeId, setActiveId] = useState<string | null>(null);

  // Require 5px movement before drag starts - allows clicks for selection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const config = ASPECT_RATIOS[aspectRatio];
  const aspectRatioValue = config.width / config.height;

  // Calculate canvas dimensions based on aspect ratio
  useEffect(() => {
    const updateDimensions = () => {
      if (!canvasRef.current) return;

      const container = canvasRef.current.parentElement;
      if (!container) return;

      const maxWidth = container.clientWidth;
      // Responsive max height: smaller on mobile, larger on desktop
      const maxHeight = Math.min(
        window.innerWidth < 640 ? 400 : 600,
        container.clientHeight || 600
      );

      let width = maxWidth;
      let height = width / aspectRatioValue;

      // If height exceeds max, recalculate based on height
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatioValue;
      }

      setCanvasDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [aspectRatioValue]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    setActiveId(null);

    if (!canvasRef.current) return;

    const element = elements.find((el) => el.id === active.id);
    if (!element) return;

    // Convert pixel delta to percentage
    const deltaXPercent = (delta.x / canvasDimensions.width) * 100;
    const deltaYPercent = (delta.y / canvasDimensions.height) * 100;

    const currentX = element.x || 0;
    const currentY = element.y || 0;

    let newX = currentX + deltaXPercent;
    let newY = currentY + deltaYPercent;

    // Clamp to canvas boundaries (0-100%)
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    onUpdateElement(active.id as string, {
      x: newX,
      y: newY,
    });
  };

  const handleCanvasClick = () => {
    onSelectElement(null);
  };

  const activeElement = activeId ? elements.find((el) => el.id === activeId) : null;
  const hasElements = elements.length > 0;

  return (
    <div className="flex items-center justify-center p-3 sm:p-6 md:p-8 bg-gray-100 rounded-lg touch-none">
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          className={cn(
            'relative bg-white shadow-xl rounded-lg overflow-hidden min-h-0',
            hasElements ? 'border-2 border-gray-300' : 'border-2 border-dashed border-gray-300'
          )}
          style={{
            width: canvasDimensions.width || 400,
            height: canvasDimensions.height || 400,
            maxWidth: '100%',
          }}
        >
          {/* Grid overlay */}
          <GridOverlay visible={gridVisible} />

          {/* Empty state */}
          {!hasElements && (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Empty Canvas
                  </h3>
                  <p className="text-xs text-gray-500 max-w-xs">
                    Add elements from the Layout tab to start designing your ad
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <span>Click Generate to create your ad automatically</span>
                </div>
              </div>
            </div>
          )}

          {/* Canvas elements */}
          {elements.map((element) => (
            <CanvasElement
              key={element.id}
              element={element}
              isSelected={selectedId === element.id}
              onSelect={() => onSelectElement(element.id)}
              productImage={element.type === 'product' && productImages.length > 0 ? productImages[0] : undefined}
              onResize={(updates) => onUpdateElement(element.id, updates)}
              canvasWidth={canvasDimensions.width}
              canvasHeight={canvasDimensions.height}
            />
          ))}

          {/* Drag overlay */}
          <DragOverlay>
            {activeElement ? (
              <div className="opacity-70">
                <CanvasElement
                  element={activeElement}
                  isSelected={false}
                  onSelect={() => {}}
                  productImage={activeElement.type === 'product' && productImages.length > 0 ? productImages[0] : undefined}
                  canvasWidth={canvasDimensions.width}
                  canvasHeight={canvasDimensions.height}
                />
              </div>
            ) : null}
          </DragOverlay>
        </div>
      </DndContext>
    </div>
  );
}
