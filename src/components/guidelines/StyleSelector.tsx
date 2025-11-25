/**
 * StyleSelector Component
 * Allows users to select a visual style preset for their ad guidelines
 */
import { StylePreset } from '@/types';
import { cn } from '@/lib/utils';
import { Sparkles, Zap, Heart, Crown, Smile, Briefcase } from 'lucide-react';

interface StyleOption {
  value: StylePreset;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const styleOptions: StyleOption[] = [
  {
    value: 'minimalist',
    label: 'Minimalist',
    description: 'Clean lines, whitespace, simple',
    icon: Sparkles,
  },
  {
    value: 'bold',
    label: 'Bold',
    description: 'High contrast, strong typography',
    icon: Zap,
  },
  {
    value: 'lifestyle',
    label: 'Lifestyle',
    description: 'Natural, authentic, warm',
    icon: Heart,
  },
  {
    value: 'luxury',
    label: 'Luxury',
    description: 'Elegant, premium, sophisticated',
    icon: Crown,
  },
  {
    value: 'playful',
    label: 'Playful',
    description: 'Fun, colorful, energetic',
    icon: Smile,
  },
  {
    value: 'corporate',
    label: 'Corporate',
    description: 'Professional, trustworthy, clean',
    icon: Briefcase,
  },
];

interface StyleSelectorProps {
  value: StylePreset;
  onChange: (style: StylePreset) => void;
}

export function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-gray-900">Visual Style</h3>
        <p className="text-xs text-gray-500 mt-1">
          Choose the overall aesthetic for your ads
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {styleOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                'relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <Icon
                className={cn(
                  'w-8 h-8 transition-colors',
                  isSelected ? 'text-blue-600' : 'text-gray-400'
                )}
              />
              <div className="text-center">
                <div
                  className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  )}
                >
                  {option.label}
                </div>
                <div
                  className={cn(
                    'text-xs mt-1',
                    isSelected ? 'text-blue-700' : 'text-gray-500'
                  )}
                >
                  {option.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
