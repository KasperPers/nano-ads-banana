'use client';

import { Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModelType } from '@/types';

interface ModelToggleProps {
  model: ModelType;
  onChange: (model: ModelType) => void;
}

export function ModelToggle({ model, onChange }: ModelToggleProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <label className="text-xs sm:text-sm font-medium text-gray-700">
        AI Model
      </label>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* Fast Mode */}
        <button
          type="button"
          onClick={() => onChange('flash')}
          className={cn(
            'relative flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-lg border-2 transition-all touch-manipulation min-h-[80px] sm:min-h-[100px]',
            'hover:border-blue-400 hover:shadow-sm',
            model === 'flash'
              ? 'border-blue-500 bg-blue-50 shadow-sm'
              : 'border-gray-200 bg-white'
          )}
        >
          <div className={cn(
            'flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full',
            model === 'flash' ? 'bg-blue-100' : 'bg-gray-100'
          )}>
            <Zap className={cn(
              'w-4 h-4 sm:w-5 sm:h-5',
              model === 'flash' ? 'text-blue-600' : 'text-gray-600'
            )} />
          </div>

          <div className="text-center">
            <div className="font-semibold text-xs sm:text-sm">Fast Mode</div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
              ~$0.04/image
            </div>
          </div>

          {model === 'flash' && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </button>

        {/* Quality Mode */}
        <button
          type="button"
          onClick={() => onChange('pro')}
          className={cn(
            'relative flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-lg border-2 transition-all touch-manipulation min-h-[80px] sm:min-h-[100px]',
            'hover:border-purple-400 hover:shadow-sm',
            model === 'pro'
              ? 'border-purple-500 bg-purple-50 shadow-sm'
              : 'border-gray-200 bg-white'
          )}
        >
          <div className={cn(
            'flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full',
            model === 'pro' ? 'bg-purple-100' : 'bg-gray-100'
          )}>
            <Crown className={cn(
              'w-4 h-4 sm:w-5 sm:h-5',
              model === 'pro' ? 'text-purple-600' : 'text-gray-600'
            )} />
          </div>

          <div className="text-center">
            <div className="font-semibold text-xs sm:text-sm">Quality Mode</div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
              ~$0.15/image
            </div>
          </div>

          {model === 'pro' && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full" />
          )}
        </button>
      </div>
    </div>
  );
}
