'use client';

import { cn } from '@/lib/utils';

interface GridOverlayProps {
  visible: boolean;
}

const GRID_ZONES = [
  { label: 'Top Left', row: 0, col: 0 },
  { label: 'Top Center', row: 0, col: 1 },
  { label: 'Top Right', row: 0, col: 2 },
  { label: 'Middle Left', row: 1, col: 0 },
  { label: 'Middle Center', row: 1, col: 1 },
  { label: 'Middle Right', row: 1, col: 2 },
  { label: 'Bottom Left', row: 2, col: 0 },
  { label: 'Bottom Center', row: 2, col: 1 },
  { label: 'Bottom Right', row: 2, col: 2 },
];

export function GridOverlay({ visible }: GridOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Grid lines */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
        {GRID_ZONES.map((zone, index) => (
          <div
            key={index}
            className={cn(
              'border border-dashed border-blue-300/50',
              'flex items-center justify-center'
            )}
          >
            <span className="text-xs text-blue-400/70 font-medium bg-white/80 px-2 py-1 rounded">
              {zone.label}
            </span>
          </div>
        ))}
      </div>

      {/* Horizontal lines */}
      <div className="absolute left-0 right-0 top-1/3 border-t-2 border-dashed border-blue-400/40" />
      <div className="absolute left-0 right-0 top-2/3 border-t-2 border-dashed border-blue-400/40" />

      {/* Vertical lines */}
      <div className="absolute top-0 bottom-0 left-1/3 border-l-2 border-dashed border-blue-400/40" />
      <div className="absolute top-0 bottom-0 left-2/3 border-l-2 border-dashed border-blue-400/40" />
    </div>
  );
}
