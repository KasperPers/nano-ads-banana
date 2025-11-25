'use client';

import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenerateButtonProps {
  onGenerate: () => void;
  isGenerating: boolean;
  disabled: boolean;
}

export function GenerateButton({
  onGenerate,
  isGenerating,
  disabled,
}: GenerateButtonProps) {
  return (
    <button
      onClick={onGenerate}
      disabled={disabled || isGenerating}
      aria-label="Generate ad creative"
      className={cn(
        'w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold text-white text-sm sm:text-base',
        'flex items-center justify-center gap-2',
        'transition-all duration-200',
        'shadow-lg hover:shadow-xl touch-manipulation min-h-[44px]',
        disabled || isGenerating
          ? 'bg-gray-300 cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
        !disabled && !isGenerating && 'hover:scale-[1.02] active:scale-[0.98]'
      )}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Generate Ad</span>
        </>
      )}
    </button>
  );
}
