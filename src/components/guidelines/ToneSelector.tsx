/**
 * ToneSelector Component
 * Allows users to select the brand tone for their ad guidelines
 */
import { ToneType } from '@/types';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ToneOption {
  value: ToneType;
  label: string;
  description: string;
}

const toneOptions: ToneOption[] = [
  {
    value: 'professional',
    label: 'Professional',
    description: 'Formal, credible, and business-focused',
  },
  {
    value: 'friendly',
    label: 'Friendly',
    description: 'Warm, approachable, and conversational',
  },
  {
    value: 'luxurious',
    label: 'Luxurious',
    description: 'Refined, exclusive, and premium',
  },
  {
    value: 'playful',
    label: 'Playful',
    description: 'Fun, casual, and light-hearted',
  },
  {
    value: 'urgent',
    label: 'Urgent',
    description: 'Action-oriented, time-sensitive',
  },
  {
    value: 'inspirational',
    label: 'Inspirational',
    description: 'Motivating, uplifting, and aspirational',
  },
];

interface ToneSelectorProps {
  value: ToneType;
  onChange: (tone: ToneType) => void;
}

export function ToneSelector({ value, onChange }: ToneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = toneOptions.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-gray-900">Brand Tone</h3>
        <p className="text-xs text-gray-500 mt-1">
          Set the voice and personality of your messaging
        </p>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 rounded-lg border-2',
            'bg-white hover:border-gray-300 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
            isOpen ? 'border-blue-600' : 'border-gray-200'
          )}
        >
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-gray-900">
              {selectedOption?.label}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {selectedOption?.description}
            </div>
          </div>
          <ChevronDown
            className={cn(
              'w-5 h-5 text-gray-400 transition-transform',
              isOpen && 'transform rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {toneOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3 text-left',
                  'hover:bg-gray-50 transition-colors',
                  value === option.value && 'bg-blue-50'
                )}
              >
                <div className="flex-1">
                  <div
                    className={cn(
                      'text-sm font-medium',
                      value === option.value ? 'text-blue-900' : 'text-gray-900'
                    )}
                  >
                    {option.label}
                  </div>
                  <div
                    className={cn(
                      'text-xs mt-0.5',
                      value === option.value ? 'text-blue-700' : 'text-gray-500'
                    )}
                  >
                    {option.description}
                  </div>
                </div>
                {value === option.value && (
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
