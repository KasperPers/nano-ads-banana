/**
 * GuidelinesBuilder Component
 * Main container that combines all guideline components
 */
import { useState } from 'react';
import { useGuidelinesStore } from '@/stores/guidelines-store';
import { cn } from '@/lib/utils';
import { Palette, MessageSquare, Droplet, FileText, Eye } from 'lucide-react';
import { StyleSelector } from './StyleSelector';
import { ToneSelector } from './ToneSelector';
import { ColorPicker } from './ColorPicker';
import { CustomInstructions } from './CustomInstructions';
import { GuidelinesPreview } from './GuidelinesPreview';

type Tab = 'style' | 'tone' | 'colors' | 'instructions' | 'preview';

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: TabConfig[] = [
  { id: 'style', label: 'Style', icon: Palette },
  { id: 'tone', label: 'Tone', icon: MessageSquare },
  { id: 'colors', label: 'Colors', icon: Droplet },
  { id: 'instructions', label: 'Instructions', icon: FileText },
  { id: 'preview', label: 'Preview', icon: Eye },
];

export function GuidelinesBuilder() {
  const [activeTab, setActiveTab] = useState<Tab>('style');

  const {
    style,
    tone,
    brandColors,
    customInstructions,
    targetAudience,
    setStyle,
    setTone,
    setBrandColors,
    setCustomInstructions,
    setTargetAudience,
    exportAsJSON,
  } = useGuidelinesStore();

  const guidelines = exportAsJSON();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Design Guidelines</h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Define the visual style and messaging tone for your ad campaigns
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 -mx-3 sm:mx-0">
        <div className="flex gap-0.5 sm:gap-1 overflow-x-auto px-3 sm:px-0 scrollbar-hide" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 border-b-2 font-medium text-xs sm:text-sm transition-colors',
                  'focus:outline-none whitespace-nowrap touch-manipulation min-h-[44px]',
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        {activeTab === 'style' && (
          <StyleSelector value={style} onChange={setStyle} />
        )}

        {activeTab === 'tone' && (
          <ToneSelector value={tone} onChange={setTone} />
        )}

        {activeTab === 'colors' && (
          <ColorPicker colors={brandColors} onChange={setBrandColors} />
        )}

        {activeTab === 'instructions' && (
          <CustomInstructions
            instructions={customInstructions}
            audience={targetAudience}
            onInstructionsChange={setCustomInstructions}
            onAudienceChange={setTargetAudience}
          />
        )}

        {activeTab === 'preview' && (
          <GuidelinesPreview guidelines={guidelines} />
        )}
      </div>

      {/* Quick Summary */}
      {activeTab !== 'preview' && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1 w-full">
              <h3 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                Current Settings
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Style:</span>{' '}
                  <span className="text-gray-900 font-medium capitalize">{style}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tone:</span>{' '}
                  <span className="text-gray-900 font-medium capitalize">{tone}</span>
                </div>
                <div>
                  <span className="text-gray-500">Colors:</span>{' '}
                  <span className="text-gray-900 font-medium">
                    {brandColors.primary || brandColors.secondary || brandColors.accent
                      ? `${[brandColors.primary, brandColors.secondary, brandColors.accent].filter(Boolean).length} set`
                      : 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Audience:</span>{' '}
                  <span className="text-gray-900 font-medium">
                    {targetAudience ? 'Defined' : 'Not set'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('preview')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg w-full sm:w-auto justify-center',
                'text-xs font-medium text-blue-700 bg-blue-50',
                'hover:bg-blue-100 transition-colors touch-manipulation min-h-[44px]',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              )}
            >
              <Eye className="w-4 h-4" />
              View JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
