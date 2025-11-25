'use client';

import { ElementType } from '@/types';
import { Package, Type, Zap, MousePointer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ElementToolbarProps {
  onAddElement: (type: ElementType) => void;
}

const TOOLBAR_BUTTONS = [
  {
    type: 'product' as ElementType,
    label: 'Add Product Zone',
    icon: Package,
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    type: 'headline' as ElementType,
    label: 'Add Headline',
    icon: Type,
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  {
    type: 'usp' as ElementType,
    label: 'Add USP',
    icon: Zap,
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    type: 'cta' as ElementType,
    label: 'Add CTA',
    icon: MousePointer,
    color: 'bg-orange-500 hover:bg-orange-600',
  },
];

export function ElementToolbar({ onAddElement }: ElementToolbarProps) {
  return (
    <div className="flex gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {TOOLBAR_BUTTONS.map((button) => {
        const Icon = button.icon;

        return (
          <button
            key={button.type}
            onClick={() => onAddElement(button.type)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-white',
              'font-medium text-sm transition-colors',
              button.color
            )}
          >
            <Icon className="w-4 h-4" />
            {button.label}
          </button>
        );
      })}
    </div>
  );
}
