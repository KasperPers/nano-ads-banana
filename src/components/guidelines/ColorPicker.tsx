/**
 * ColorPicker Component
 * Allows users to set brand colors (primary, secondary, accent)
 */
import { BrandColors } from '@/types';
import { cn } from '@/lib/utils';
import { HexColorPicker } from 'react-colorful';
import { useState, useRef, useEffect } from 'react';
import { Pipette, X } from 'lucide-react';

interface ColorInputProps {
  label: string;
  color?: string;
  onChange: (color?: string) => void;
}

function ColorInput({ label, color, onChange }: ColorInputProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [inputValue, setInputValue] = useState(color || '');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(color || '');
  }, [color]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsPickerOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    // Only update if it's a valid hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onChange(value);
    } else if (value === '') {
      onChange(undefined);
    }
  };

  const handlePickerChange = (newColor: string) => {
    setInputValue(newColor);
    onChange(newColor);
  };

  const handleClear = () => {
    setInputValue('');
    onChange(undefined);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        {/* Color swatch and picker button */}
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className={cn(
              'w-12 h-10 rounded-lg border-2 border-gray-200',
              'hover:border-gray-300 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              'flex items-center justify-center'
            )}
            style={{
              backgroundColor: color || '#ffffff',
            }}
          >
            {!color && <Pipette className="w-4 h-4 text-gray-400" />}
          </button>

          {isPickerOpen && (
            <div className="absolute z-20 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
              <HexColorPicker color={color || '#000000'} onChange={handlePickerChange} />
            </div>
          )}
        </div>

        {/* Hex input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="#000000"
            className={cn(
              'w-full h-10 px-3 pr-8 rounded-lg border-2 border-gray-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              'text-sm font-mono'
            )}
            maxLength={7}
          />
          {color && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ColorPickerProps {
  colors: BrandColors;
  onChange: (colors: BrandColors) => void;
}

export function ColorPicker({ colors, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-gray-900">Brand Colors</h3>
        <p className="text-xs text-gray-500 mt-1">
          Define your brand's color palette (all optional)
        </p>
      </div>

      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <ColorInput
          label="Primary Color"
          color={colors.primary}
          onChange={(color) => onChange({ ...colors, primary: color })}
        />

        <ColorInput
          label="Secondary Color"
          color={colors.secondary}
          onChange={(color) => onChange({ ...colors, secondary: color })}
        />

        <ColorInput
          label="Accent Color"
          color={colors.accent}
          onChange={(color) => onChange({ ...colors, accent: color })}
        />
      </div>

      {(colors.primary || colors.secondary || colors.accent) && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex-1 flex gap-2">
            {colors.primary && (
              <div
                className="w-8 h-8 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: colors.primary }}
              />
            )}
            {colors.secondary && (
              <div
                className="w-8 h-8 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: colors.secondary }}
              />
            )}
            {colors.accent && (
              <div
                className="w-8 h-8 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: colors.accent }}
              />
            )}
          </div>
          <span className="text-xs text-blue-700">Color palette preview</span>
        </div>
      )}
    </div>
  );
}
