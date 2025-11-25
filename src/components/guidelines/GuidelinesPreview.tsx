/**
 * GuidelinesPreview Component
 * Shows a live JSON preview of the current ad guidelines with copy functionality
 */
import { AdGuidelinesJSON } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, FileJson } from 'lucide-react';

interface GuidelinesPreviewProps {
  guidelines: AdGuidelinesJSON;
}

export function GuidelinesPreview({ guidelines }: GuidelinesPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const jsonString = JSON.stringify(guidelines, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  const jsonString = JSON.stringify(guidelines, null, 2);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileJson className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-900">
            Guidelines JSON
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
            'text-xs font-medium text-gray-700',
            'hover:bg-gray-100 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          )}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Expand
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="relative">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'absolute top-3 right-3 z-10',
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
              'text-xs font-medium',
              'transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              isCopied
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>

          {/* JSON Display */}
          <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-900">
            <div className="overflow-x-auto">
              <pre className="p-4 pr-24 text-xs font-mono text-gray-100 min-h-[200px] max-h-[500px] overflow-y-auto">
                {jsonString}
              </pre>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mt-3">
            <div className="text-xs text-blue-700">
              This JSON representation includes all your guidelines settings. You can copy
              and save it for future use or share it with your team.
            </div>
          </div>
        </div>
      )}

      {!isExpanded && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-500 text-center">
            Click "Expand" to view the complete guidelines JSON
          </div>
        </div>
      )}
    </div>
  );
}
