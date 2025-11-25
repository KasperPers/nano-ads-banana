'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/shared';
import type { GenerationStatus } from '@/types';

interface GenerationProgressProps {
  status: GenerationStatus;
  progress?: number;
  isGenerating?: boolean;
}

const STATUS_MESSAGES: Record<GenerationStatus, string> = {
  idle: 'Ready to generate',
  preparing: 'Preparing your request...',
  generating: 'Generating your ad...',
  complete: 'Generation complete!',
  error: 'An error occurred',
};

const STATUS_DESCRIPTIONS: Record<GenerationStatus, string> = {
  idle: '',
  preparing: 'Building prompt and processing images for AI generation',
  generating: 'AI is creating your custom ad design with Claude',
  complete: 'Your ad is ready to preview',
  error: 'Please try again or check your settings',
};

export function GenerationProgress({ status, progress, isGenerating }: GenerationProgressProps) {
  if (status === 'idle' || status === 'complete') {
    return null;
  }

  const displayProgress = progress ?? (status === 'preparing' ? 25 : 50);

  return (
    <div className="w-full py-6 px-4 bg-white rounded-lg border border-gray-200 shadow-sm space-y-4">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative">
          <Loader2 className={cn(
            'w-12 h-12 animate-spin',
            status === 'error' ? 'text-red-500' : 'text-blue-600'
          )} />

          {/* Progress ring */}
          <svg className="absolute inset-0 w-12 h-12 -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - displayProgress / 100)}`}
              className={cn(
                'transition-all duration-500',
                status === 'error' ? 'text-red-500' : 'text-blue-600'
              )}
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Status message */}
        <div className="text-center">
          <h3 className={cn(
            'text-lg font-semibold',
            status === 'error' ? 'text-red-700' : 'text-gray-900'
          )}>
            {STATUS_MESSAGES[status]}
          </h3>
          {STATUS_DESCRIPTIONS[status] && (
            <p className="text-sm text-gray-500 mt-1">
              {STATUS_DESCRIPTIONS[status]}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500 ease-out rounded-full',
                status === 'error'
                  ? 'bg-red-500'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600'
              )}
              style={{ width: `${displayProgress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-center mt-2">
            {displayProgress}%
          </div>
        </div>

        {/* Estimated time */}
        {status === 'generating' && (
          <p className="text-xs text-gray-400">
            Estimated time: 10-30 seconds
          </p>
        )}
      </div>

      {/* Image skeleton placeholder */}
      {isGenerating && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-gray-500 text-center">Preview will appear here</p>
          <Skeleton className="w-full h-64 rounded-lg" />
        </div>
      )}
    </div>
  );
}
