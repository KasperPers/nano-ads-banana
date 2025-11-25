'use client';

import { useState, useEffect } from 'react';
import { Download, RefreshCw, Maximize2, X, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ASPECT_RATIOS } from '@/types';
import type { FormatGenerationResult, AspectRatio } from '@/types';

interface ResultsGalleryProps {
  results: FormatGenerationResult[];
  currentFormatIndex: number;
  isGenerating: boolean;
  onDownloadSingle: (image: string, suffix: string) => void;
  onDownloadAll: () => void;
  onRegenerate: () => void;
}

export function ResultsGallery({
  results,
  currentFormatIndex,
  isGenerating,
  onDownloadSingle,
  onDownloadAll,
  onRegenerate,
}: ResultsGalleryProps) {
  const [fullscreenImage, setFullscreenImage] = useState<{ image: string; aspectRatio: AspectRatio } | null>(null);

  // ESC key handler to close fullscreen modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreenImage) {
        setFullscreenImage(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [fullscreenImage]);

  if (results.length === 0) {
    return null;
  }

  const completedCount = results.filter(r => r.status === 'complete' && r.image).length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <>
      <div className="w-full space-y-4">
        {/* Header with summary and download all button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating format {currentFormatIndex + 1} of {results.length}...
              </span>
            ) : (
              <span>
                {completedCount} of {results.length} formats generated
                {errorCount > 0 && <span className="text-red-500 ml-1">({errorCount} failed)</span>}
              </span>
            )}
          </div>

          {completedCount > 1 && !isGenerating && (
            <button
              onClick={onDownloadAll}
              className={cn(
                'py-2 px-4 rounded-lg font-medium text-sm',
                'flex items-center gap-2',
                'bg-blue-600 hover:bg-blue-700 text-white',
                'transition-colors shadow-sm hover:shadow touch-manipulation min-h-[40px]'
              )}
            >
              <Download className="w-4 h-4" />
              Download All ({completedCount})
            </button>
          )}
        </div>

        {/* Results grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {results.map((result, index) => {
            const config = ASPECT_RATIOS[result.aspectRatio];
            const isCurrentlyGenerating = isGenerating && index === currentFormatIndex;

            return (
              <div
                key={result.aspectRatio}
                className={cn(
                  'bg-white rounded-lg border overflow-hidden transition-all',
                  result.status === 'complete' && 'border-green-200',
                  result.status === 'error' && 'border-red-200',
                  result.status === 'generating' && 'border-blue-300 ring-2 ring-blue-100',
                  result.status === 'pending' && 'border-gray-200 opacity-60'
                )}
              >
                {/* Format label */}
                <div className={cn(
                  'px-3 py-2 text-xs font-medium flex items-center justify-between',
                  result.status === 'complete' && 'bg-green-50 text-green-800',
                  result.status === 'error' && 'bg-red-50 text-red-800',
                  result.status === 'generating' && 'bg-blue-50 text-blue-800',
                  result.status === 'pending' && 'bg-gray-50 text-gray-600'
                )}>
                  <span>{config.label} ({result.aspectRatio})</span>
                  {result.status === 'complete' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  {result.status === 'generating' && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                  {result.status === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
                </div>

                {/* Content area */}
                <div className="relative bg-gray-50 aspect-square flex items-center justify-center">
                  {result.status === 'pending' && (
                    <div className="text-gray-400 text-sm">Waiting...</div>
                  )}

                  {result.status === 'generating' && (
                    <div className="flex flex-col items-center gap-2 text-blue-600">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-sm">Generating...</span>
                    </div>
                  )}

                  {result.status === 'error' && (
                    <div className="flex flex-col items-center gap-2 text-red-600 p-4 text-center">
                      <AlertCircle className="w-8 h-8" />
                      <span className="text-sm">{result.error || 'Generation failed'}</span>
                    </div>
                  )}

                  {result.status === 'complete' && result.image && (
                    <>
                      <img
                        src={`data:image/png;base64,${result.image}`}
                        alt={`Generated ad - ${config.label}`}
                        className="w-full h-full object-contain"
                      />
                      {/* Fullscreen button */}
                      <button
                        onClick={() => setFullscreenImage({ image: result.image!, aspectRatio: result.aspectRatio })}
                        className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-colors touch-manipulation"
                        title="View fullscreen"
                        aria-label="View fullscreen"
                      >
                        <Maximize2 className="w-4 h-4 text-gray-700" />
                      </button>
                    </>
                  )}
                </div>

                {/* Action buttons for completed items */}
                {result.status === 'complete' && result.image && (
                  <div className="p-2 border-t border-gray-100 bg-gray-50">
                    <button
                      onClick={() => onDownloadSingle(result.image!, `${result.aspectRatio.replace(':', 'x')}`)}
                      className={cn(
                        'w-full py-2 px-3 rounded-md text-xs font-medium',
                        'flex items-center justify-center gap-1.5',
                        'bg-blue-600 hover:bg-blue-700 text-white',
                        'transition-colors touch-manipulation'
                      )}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PNG
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Regenerate button */}
        {!isGenerating && (
          <button
            onClick={onRegenerate}
            className={cn(
              'w-full py-2.5 px-4 rounded-lg font-medium text-sm',
              'flex items-center justify-center gap-2',
              'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
              'transition-colors touch-manipulation min-h-[44px]'
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate All Formats
          </button>
        )}
      </div>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setFullscreenImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setFullscreenImage(null)}
            aria-label="Close fullscreen view"
            className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{
              paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
              paddingRight: 'max(0.5rem, env(safe-area-inset-right))'
            }}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>

          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 px-3 py-1.5 bg-white/10 rounded-lg text-white text-sm">
            {ASPECT_RATIOS[fullscreenImage.aspectRatio].label} ({fullscreenImage.aspectRatio})
          </div>

          <img
            src={`data:image/png;base64,${fullscreenImage.image}`}
            alt={`Generated ad - ${ASPECT_RATIOS[fullscreenImage.aspectRatio].label} (fullscreen)`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
