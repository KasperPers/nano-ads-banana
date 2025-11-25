/**
 * CustomInstructions Component
 * Allows users to provide custom AI instructions and target audience
 */
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface CustomInstructionsProps {
  instructions: string;
  audience: string;
  onInstructionsChange: (instructions: string) => void;
  onAudienceChange: (audience: string) => void;
}

export function CustomInstructions({
  instructions,
  audience,
  onInstructionsChange,
  onAudienceChange,
}: CustomInstructionsProps) {
  const instructionsLimit = 500;
  const audienceLimit = 200;
  const instructionsWarningThreshold = 450;
  const audienceWarningThreshold = 180;

  const instructionsCount = instructions.length;
  const audienceCount = audience.length;

  const isAudienceOverLimit = audienceCount > audienceLimit;
  const isAudienceWarning = audienceCount > audienceWarningThreshold;
  const isInstructionsOverLimit = instructionsCount > instructionsLimit;
  const isInstructionsWarning = instructionsCount > instructionsWarningThreshold;

  return (
    <div className="space-y-6">
      {/* Target Audience */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Target Audience</h3>
          <p className="text-xs text-gray-500 mt-1">
            Who are you trying to reach with these ads?
          </p>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            value={audience}
            onChange={(e) => onAudienceChange(e.target.value)}
            placeholder="e.g., Tech-savvy millennials, Small business owners, Fitness enthusiasts"
            maxLength={audienceLimit}
            className={cn(
              'w-full px-4 py-3 rounded-lg border-2',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              'text-sm placeholder:text-gray-400',
              isAudienceOverLimit && 'border-red-500 focus:ring-red-500',
              isAudienceWarning && !isAudienceOverLimit && 'border-amber-500 focus:ring-amber-500',
              !isAudienceWarning && !isAudienceOverLimit && 'border-gray-200 focus:ring-blue-500'
            )}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              {isAudienceOverLimit && (
                <span className="text-red-600">
                  Exceeds maximum length of {audienceLimit} characters
                </span>
              )}
              {!isAudienceOverLimit && isAudienceWarning && (
                <span className="text-amber-600">
                  Approaching character limit
                </span>
              )}
              {!isAudienceOverLimit && !isAudienceWarning && (
                <>
                  <Info className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-500">Be specific about demographics and interests</span>
                </>
              )}
            </div>
            <div
              className={cn(
                'text-xs font-mono',
                isAudienceOverLimit && 'text-red-600',
                isAudienceWarning && !isAudienceOverLimit && 'text-amber-600',
                !isAudienceWarning && !isAudienceOverLimit && 'text-gray-400'
              )}
            >
              {audienceCount}/{audienceLimit}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Instructions */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            Custom Instructions
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Additional guidance for AI-generated content
          </p>
        </div>

        <div className="space-y-2">
          <textarea
            value={instructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
            placeholder="e.g., Always mention free shipping, Emphasize sustainability, Use inclusive language, Avoid technical jargon..."
            maxLength={instructionsLimit}
            rows={6}
            className={cn(
              'w-full px-4 py-3 rounded-lg border-2',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              'text-sm placeholder:text-gray-400 resize-none',
              isInstructionsOverLimit && 'border-red-500 focus:ring-red-500',
              isInstructionsWarning && !isInstructionsOverLimit && 'border-amber-500 focus:ring-amber-500',
              !isInstructionsWarning && !isInstructionsOverLimit && 'border-gray-200 focus:ring-blue-500'
            )}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              {isInstructionsOverLimit && (
                <span className="text-red-600">
                  Exceeds maximum length of {instructionsLimit} characters
                </span>
              )}
              {!isInstructionsOverLimit && isInstructionsWarning && (
                <span className="text-amber-600">
                  Approaching character limit
                </span>
              )}
              {!isInstructionsOverLimit && !isInstructionsWarning && (
                <>
                  <Info className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-500">Include do's and don'ts for better results</span>
                </>
              )}
            </div>
            <div
              className={cn(
                'text-xs font-mono',
                isInstructionsOverLimit && 'text-red-600',
                isInstructionsWarning && !isInstructionsOverLimit && 'text-amber-600',
                !isInstructionsWarning && !isInstructionsOverLimit && 'text-gray-400'
              )}
            >
              {instructionsCount}/{instructionsLimit}
            </div>
          </div>
        </div>
      </div>

      {/* Helper Tips */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
        <div className="text-sm font-medium text-blue-900">Tips for better AI results:</div>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>Be specific about what you want and don't want</li>
          <li>Mention brand values or key differentiators</li>
          <li>Include any legal or compliance requirements</li>
          <li>Specify preferred language style or terminology</li>
        </ul>
      </div>
    </div>
  );
}
