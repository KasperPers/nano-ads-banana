import { Plus, Trash2, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface USPListProps {
  usps: string[];
  onChange: (usps: string[]) => void;
}

const MAX_USPS = 5;
const RECOMMENDED_MAX_CHARS = 80;
const MAX_CHARS = 100;

export function USPList({ usps, onChange }: USPListProps) {
  const handleAdd = () => {
    if (usps.length < MAX_USPS) {
      onChange([...usps, '']);
    }
  };

  const handleRemove = (index: number) => {
    onChange(usps.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, value: string) => {
    const updated = [...usps];
    updated[index] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <List className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Unique Selling Points</h3>
        </div>
        <button
          onClick={handleAdd}
          disabled={usps.length >= MAX_USPS}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
            usps.length >= MAX_USPS
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          <Plus className="h-4 w-4" />
          Add USP
        </button>
      </div>

      <div className="space-y-3">
        {usps.map((usp, index) => {
          const isOverLimit = usp.length > MAX_CHARS;
          const isWarning = usp.length > RECOMMENDED_MAX_CHARS;

          return (
            <div key={index} className="space-y-1">
              <div className="flex gap-2">
                <div className="flex items-center justify-center w-8 text-sm font-medium text-muted-foreground">
                  {index + 1}.
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={usp}
                    onChange={(e) => handleChange(index, e.target.value)}
                    placeholder={`Unique selling point ${index + 1}`}
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
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  className={cn(
                    'px-3 py-2 border rounded-md transition-colors',
                    'hover:bg-destructive hover:text-destructive-foreground hover:border-destructive'
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex justify-between text-xs px-1 ml-8">
                <span>
                  {isOverLimit && (
                    <span className="text-red-500">
                      Exceeds maximum length of {MAX_CHARS} characters
                    </span>
                  )}
                  {!isOverLimit && isWarning && (
                    <span className="text-amber-500">
                      Exceeds recommended length
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
                  {usp.length} / {RECOMMENDED_MAX_CHARS} recommended
                </span>
              </div>
            </div>
          );
        })}

        {usps.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-md">
            <List className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No USPs added yet</p>
            <p className="text-sm">Add up to {MAX_USPS} unique selling points</p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {usps.length} / {MAX_USPS} unique selling points
      </p>
    </div>
  );
}
