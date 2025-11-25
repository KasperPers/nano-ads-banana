'use client';

import { useState } from 'react';
import { Sparkles, Image, Palette, Settings as SettingsIcon, PanelLeft, Key, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Import components
import { ContentPanel } from '@/components/content';
import { GuidelinesBuilder } from '@/components/guidelines';
import { AdCanvas, AspectRatioSelector, ElementToolbar } from '@/components/canvas';
import { GenerationPanel } from '@/components/generation';
import { SettingsModal } from '@/components/settings';
import { ErrorBoundary } from '@/components/shared';

// Import stores
import { useCanvasStore } from '@/stores/canvas-store';
import { useContentStore } from '@/stores/content-store';
import { useSettingsStore } from '@/stores/settings-store';

type TabType = 'content' | 'guidelines' | 'canvas';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [showSidebar, setShowSidebar] = useState(true);

  // Canvas store
  const {
    aspectRatio,
    setAspectRatio,
    selectedFormats,
    toggleFormat,
    elementsPerFormat,
    selectedElementId,
    addElement,
    updateElementPosition,
    updateElement,
    selectElement,
    copyElementsToAllFormats,
  } = useCanvasStore();

  // Compute elements for current format (zustand getters aren't reactive)
  const elements = elementsPerFormat[aspectRatio] || [];

  // Content store (for validation display)
  const { productImages, headlines, ctaText } = useContentStore();

  // Settings store
  const { apiKey, openSettings } = useSettingsStore();
  const hasApiKey = apiKey.length > 0;

  const tabs = [
    { id: 'content' as const, label: 'Content', icon: Image },
    { id: 'guidelines' as const, label: 'Style', icon: Palette },
    { id: 'canvas' as const, label: 'Layout', icon: SettingsIcon },
  ];

  const handleAddElement = (type: 'product' | 'headline' | 'usp' | 'cta') => {
    addElement({
      type,
      position: { x: 25, y: 25 },
      size: { width: 50, height: type === 'product' ? 50 : 20 },
    });
  };

  // Validation status
  const hasImages = productImages.length > 0;
  const hasHeadline = headlines.some(h => h.trim().length > 0);
  const hasCta = ctaText.trim().length > 0;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Settings Modal */}
        <SettingsModal />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-gray-900">Nano Ads Banana</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Powered by Gemini AI</p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {/* Settings Button */}
              <button
                onClick={openSettings}
                aria-label="Open settings"
                className={cn(
                  "flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg transition-colors touch-manipulation",
                  hasApiKey
                    ? "text-gray-600 hover:bg-gray-100"
                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                )}
              >
                <Key className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">
                  {hasApiKey ? 'Settings' : 'Add API Key'}
                </span>
              </button>

              {/* Mobile sidebar toggle */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                aria-label="Toggle sidebar"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation lg:hidden"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* API Key Warning Banner */}
      {!hasApiKey && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 text-amber-800">
                <Key className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">
                  Add your Gemini API key to start generating ads
                </span>
              </div>
              <button
                onClick={openSettings}
                className="text-xs sm:text-sm font-medium text-amber-700 hover:text-amber-900 underline whitespace-nowrap touch-manipulation"
              >
                Add Key
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Left Panel - Configuration */}
          <aside className={cn(
            "w-full lg:w-[400px] flex-shrink-0 space-y-4 transition-all",
            !showSidebar && "hidden lg:block"
          )}>
            {/* Status Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-3">Setup Progress</h3>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className={cn(
                  "flex-1 h-2 rounded-full",
                  hasApiKey ? "bg-green-500" : "bg-gray-200"
                )} />
                <div className={cn(
                  "flex-1 h-2 rounded-full",
                  hasImages ? "bg-green-500" : "bg-gray-200"
                )} />
                <div className={cn(
                  "flex-1 h-2 rounded-full",
                  hasHeadline ? "bg-green-500" : "bg-gray-200"
                )} />
                <div className={cn(
                  "flex-1 h-2 rounded-full",
                  hasCta ? "bg-green-500" : "bg-gray-200"
                )} />
              </div>
              <div className="flex justify-between mt-2 text-[10px] sm:text-xs text-gray-500">
                <span className={cn(hasApiKey ? "text-green-600" : "", "truncate")}>API Key</span>
                <span className={cn(hasImages ? "text-green-600" : "", "truncate")}>Images</span>
                <span className={cn(hasHeadline ? "text-green-600" : "", "truncate")}>Headline</span>
                <span className={cn(hasCta ? "text-green-600" : "", "truncate")}>CTA</span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    aria-label={`${tab.label} tab`}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-colors touch-manipulation min-h-[44px]",
                      activeTab === tab.id
                        ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <tab.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-3 sm:p-4 max-h-[calc(100vh-320px)] overflow-y-auto">
                {activeTab === 'content' && <ContentPanel />}
                {activeTab === 'guidelines' && <GuidelinesBuilder />}
                {activeTab === 'canvas' && (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Output Formats</h3>
                      <AspectRatioSelector
                        mode="multi"
                        value={aspectRatio}
                        onChange={setAspectRatio}
                        selectedFormats={selectedFormats}
                        onToggleFormat={toggleFormat}
                        elementsPerFormat={elementsPerFormat}
                      />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Add Elements</h3>
                      <ElementToolbar onAddElement={handleAddElement} />
                    </div>

                    {/* Copy layout to all formats button */}
                    {elements.length > 0 && selectedFormats.length > 1 && (
                      <button
                        onClick={() => {
                          copyElementsToAllFormats();
                          toast.success('Layout copied to all selected formats', {
                            description: `${elements.length} element(s) copied to ${selectedFormats.length - 1} other format(s).`,
                          });
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Copy layout to all selected formats
                      </button>
                    )}

                    <div className="text-xs text-gray-500 bg-gray-50 p-2.5 sm:p-3 rounded-lg">
                      <p className="font-medium mb-1">Tip:</p>
                      <p>Each format has its own layout. Position elements for the current format, then use "Copy layout" to apply to other formats, or customize each format individually.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Canvas Area */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Canvas Preview</h2>
                <span className="text-xs sm:text-sm text-gray-500">
                  {elements.length} element{elements.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex justify-center">
                <AdCanvas
                  aspectRatio={aspectRatio}
                  elements={elements}
                  selectedId={selectedElementId}
                  onUpdateElement={(id, updates) => {
                    updateElement(id, updates);
                  }}
                  onSelectElement={selectElement}
                  productImages={productImages}
                />
              </div>

              {elements.length === 0 && (
                <p className="text-center text-gray-500 text-xs sm:text-sm mt-4">
                  Go to the Layout tab to add elements to your canvas
                </p>
              )}
            </div>

            {/* Generation Panel */}
            <div className="mt-4 sm:mt-6">
              <GenerationPanel />
            </div>
          </main>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
