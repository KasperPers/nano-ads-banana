'use client';

import { useState, useEffect } from 'react';
import { Download, RefreshCw, Maximize2, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GenerationStatus } from '@/types';

interface ResultPreviewProps {
  image: string | null;
  text: string | null;
  onRegenerate: () => void;
  onDownload: () => void;
  status?: GenerationStatus;
}

export function ResultPreview({
  image,
  text,
  onRegenerate,
  onDownload,
  status,
}: ResultPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ESC key handler to close fullscreen modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  // Error state - show when status is error but no image
  if (status === 'error' && !image) {
    return (
      <div className="w-full p-4 sm:p-8 bg-red-50 rounded-lg border-2 border-red-200">
        <div className="flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-red-900 mb-2">
              Generation Failed
            </h3>
            <p className="text-xs sm:text-sm text-red-700 max-w-md px-4 sm:px-0">
              {text || 'An error occurred while generating your ad. Please try again.'}
            </p>
          </div>
          <button
            onClick={onRegenerate}
            className={cn(
              'mt-2 py-2.5 px-6 rounded-lg font-medium text-sm',
              'flex items-center justify-center gap-2',
              'bg-red-600 hover:bg-red-700 text-white',
              'transition-colors shadow-sm hover:shadow touch-manipulation min-h-[44px]'
            )}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (!image && !text) {
    return null;
  }

  return (
    <>
      <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Image Preview */}
        {image && (
          <div className="relative bg-gray-50">
            <img
              src={`data:image/png;base64,${image}`}
              alt="Generated ad"
              className="w-full h-auto"
            />

            {/* Fullscreen button */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="View fullscreen"
              aria-label="View fullscreen"
            >
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </button>
          </div>
        )}

        {/* AI Response Text */}
        {text && (
          <div className="p-3 sm:p-4 bg-blue-50 border-t border-blue-100">
            <h4 className="text-xs sm:text-sm font-semibold text-blue-900 mb-2">
              AI Response
            </h4>
            <p className="text-xs sm:text-sm text-blue-800 whitespace-pre-wrap">
              {text}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onDownload}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-lg font-medium text-sm',
                'flex items-center justify-center gap-2',
                'bg-blue-600 hover:bg-blue-700 text-white',
                'transition-colors shadow-sm hover:shadow touch-manipulation min-h-[44px]'
              )}
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={onRegenerate}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-lg font-medium text-sm',
                'flex items-center justify-center gap-2',
                'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
                'transition-colors touch-manipulation min-h-[44px]'
              )}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && image && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsFullscreen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setIsFullscreen(false)}
            aria-label="Close fullscreen view"
            className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{
              paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
              paddingRight: 'max(0.5rem, env(safe-area-inset-right))'
            }}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>

          <img
            src={`data:image/png;base64,${image}`}
            alt="Generated ad (fullscreen)"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
