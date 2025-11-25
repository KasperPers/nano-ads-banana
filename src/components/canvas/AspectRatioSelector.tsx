'use client';

import { AspectRatio, ASPECT_RATIOS, CanvasElement } from '@/types';
import { Square, Smartphone, RectangleVertical, RectangleHorizontal, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type ElementsPerFormat = Record<AspectRatio, CanvasElement[]>;

// Single-select props
interface SingleSelectProps {
  mode?: 'single';
  value: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
  selectedFormats?: never;
  onToggleFormat?: never;
  elementsPerFormat?: never;
}

// Multi-select props
interface MultiSelectProps {
  mode: 'multi';
  value: AspectRatio; // Current preview ratio
  onChange: (ratio: AspectRatio) => void;
  selectedFormats: AspectRatio[];
  onToggleFormat: (ratio: AspectRatio) => void;
  elementsPerFormat?: ElementsPerFormat;
}

type AspectRatioSelectorProps = SingleSelectProps | MultiSelectProps;

const ASPECT_RATIO_ICONS = {
  '1:1': Square,
  '9:16': Smartphone,
  '4:5': RectangleVertical,
  '16:9': RectangleHorizontal,
};

export function AspectRatioSelector(props: AspectRatioSelectorProps) {
  const { mode = 'single', value, onChange } = props;
  const ratios: AspectRatio[] = ['1:1', '9:16', '4:5', '16:9'];
  const isMultiMode = mode === 'multi';
  const selectedFormats: AspectRatio[] = isMultiMode && props.selectedFormats ? props.selectedFormats : [value];
  const onToggleFormat = isMultiMode && props.onToggleFormat ? props.onToggleFormat : onChange;
  const elementsPerFormat = isMultiMode ? props.elementsPerFormat : undefined;

  return (
    <div className="space-y-3">
      {isMultiMode && (
        <p className="text-xs text-gray-500">
          Click to preview, use checkbox to select formats for generation
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {ratios.map((ratio) => {
          const config = ASPECT_RATIOS[ratio];
          const Icon = ASPECT_RATIO_ICONS[ratio];
          const isPreview = value === ratio;
          const isSelectedForGeneration = selectedFormats.includes(ratio);
          const elementCount = elementsPerFormat?.[ratio]?.length ?? 0;

          return (
            <div key={ratio} className="relative">
              <button
                onClick={() => onChange(ratio)}
                className={cn(
                  'flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all',
                  'hover:border-gray-400 hover:bg-gray-50',
                  isPreview
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700'
                )}
              >
                <Icon className={cn('w-6 h-6', isPreview && 'text-blue-500')} />
                <div className="text-center">
                  <div className="font-semibold text-sm">{config.label}</div>
                  <div className="text-xs text-gray-500">{ratio}</div>
                </div>
                {/* Element count badge */}
                {isMultiMode && elementCount > 0 && (
                  <div className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {elementCount} elem
                  </div>
                )}
              </button>

              {/* Multi-select checkbox overlay */}
              {isMultiMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFormat(ratio);
                  }}
                  className={cn(
                    'absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                    isSelectedForGeneration
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  )}
                  aria-label={isSelectedForGeneration ? `Deselect ${config.label}` : `Select ${config.label}`}
                >
                  {isSelectedForGeneration && <Check className="w-3 h-3" />}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {isMultiMode && selectedFormats.length > 1 && (
        <p className="text-xs text-green-600 font-medium">
          {selectedFormats.length} formats selected - will generate sequentially
        </p>
      )}
    </div>
  );
}
