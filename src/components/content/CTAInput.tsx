import { MessageSquare, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface CTAInputProps {
  value: string;
  onChange: (cta: string) => void;
}

const RECOMMENDED_MAX_CHARS = 25;
const MAX_CHARS = 30;

const SUGGESTED_CTAS = [
  'Shop Now',
  'Learn More',
  'Get Started',
  'Try Free',
  'Sign Up',
  'Download Now',
  'Buy Now',
  'Order Today',
  'Get Yours',
  'Discover More',
  'Join Now',
  'Start Free Trial',
];

export function CTAInput({ value, onChange }: CTAInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isOverLimit = value.length > MAX_CHARS;
  const isWarning = value.length > RECOMMENDED_MAX_CHARS;

  const handleSuggestionClick = (cta: string) => {
    onChange(cta);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Call to Action</h3>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your call to action"
            maxLength={MAX_CHARS}
            className={cn(
              'w-full px-3 py-2 border rounded-md transition-colors',
              'focus:outline-none focus:ring-2 focus:border-transparent',
              'placeholder:text-muted-foreground',
              isOverLimit && 'border-red-500 focus:ring-red-500',
              isWarning && !isOverLimit && 'border-amber-500 focus:ring-amber-500',
              !isWarning && !isOverLimit && 'focus:ring-primary'
            )}
          />
          <div className="flex justify-between text-xs px-1">
            <span>
              {isOverLimit && (
                <span className="text-red-500">
                  Exceeds maximum length of {MAX_CHARS} characters
                </span>
              )}
              {!isOverLimit && isWarning && (
                <span className="text-amber-500">
                  Approaching character limit
                </span>
              )}
            </span>
            <span
              className={cn(
                'text-muted-foreground',
                isOverLimit && 'text-red-500',
                isWarning && !isOverLimit && 'text-amber-500'
              )}
            >
              {value.length} / {MAX_CHARS} characters
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 border rounded-md transition-colors',
              'hover:bg-muted text-sm'
            )}
          >
            <span className="text-muted-foreground">Choose from suggestions</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                showSuggestions && 'transform rotate-180'
              )}
            />
          </button>

          {showSuggestions && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
              {SUGGESTED_CTAS.map((cta) => (
                <button
                  key={cta}
                  onClick={() => handleSuggestionClick(cta)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors',
                    value === cta && 'bg-muted font-medium'
                  )}
                >
                  {cta}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Your call to action tells customers what action to take
      </p>
    </div>
  );
}
