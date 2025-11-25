'use client';

import { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Image as ImageIcon } from 'lucide-react';
import type { UploadedImage } from '@/types';
import { ImagePreview } from './ImagePreview';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: UploadedImage[];
  onRemove: (id: string) => void;
  onReorder: (images: UploadedImage[]) => void;
}

interface SortableImageProps {
  image: UploadedImage;
  onRemove: (id: string) => void;
}

function SortableImage({ image, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'touch-none',
        isDragging && 'opacity-50 z-50'
      )}
      {...attributes}
      {...listeners}
    >
      <ImagePreview image={image} onRemove={onRemove} />
    </div>
  );
}

export function ImageGallery({ images, onRemove, onReorder }: ImageGalleryProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const imageIds = useMemo(() => images.map((img) => img.id), [images]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      const newOrder = arrayMove(images, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No images uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Uploaded Images</h3>
        <span className="text-sm text-gray-500">
          {images.length}/5 images
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={imageIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <SortableImage
                key={image.id}
                image={image}
                onRemove={onRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <p className="text-xs text-gray-500 text-center">
        Drag and drop to reorder images
      </p>
    </div>
  );
}
