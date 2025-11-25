'use client';

import { useGenerationStore } from '@/stores/generation-store';
import { useCanvasStore } from '@/stores/canvas-store';
import { useGeneration } from '@/hooks/useGeneration';
import { ModelToggle } from './ModelToggle';
import { GenerateButton } from './GenerateButton';
import { GenerationProgress } from './GenerationProgress';
import { ResultPreview } from './ResultPreview';
import { ResultsGallery } from './ResultsGallery';
import { Sparkles, CheckCircle2, Image, Type, MousePointer, DollarSign, RotateCcw } from 'lucide-react';

export function GenerationPanel() {
  const { model, setModel, totalGenerations, estimatedCostUSD, resetCostTracking } = useGenerationStore();
  const { selectedFormats } = useCanvasStore();
  const {
    generate,
    downloadImage,
    downloadAllImages,
    canGenerate,
    isGenerating,
    status,
    progress,
    result,
    multiFormatResults,
    currentFormatIndex,
  } = useGeneration();

  const isMultiFormat = selectedFormats.length > 1 || multiFormatResults.length > 1;

  const handleRegenerate = () => {
    generate();
  };

  const showEmptyState = !isGenerating && !result.image && !result.text && status === 'idle';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Model Selection and Generate Button - Stack on mobile */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Model Selection */}
        <div className="flex-1">
          <ModelToggle model={model} onChange={setModel} />
        </div>

        {/* Generate Button */}
        <div className="flex-1">
          <GenerateButton
            onGenerate={generate}
            isGenerating={isGenerating}
            disabled={!canGenerate}
          />
        </div>
      </div>

      {/* Cost Tracking */}
      {totalGenerations > 0 && (
        <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-xs sm:text-sm text-gray-600">
                Est. cost: <strong className="text-gray-900">${estimatedCostUSD.toFixed(2)}</strong>
              </span>
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              {totalGenerations} image{totalGenerations !== 1 ? 's' : ''} generated
            </div>
          </div>
          <button
            onClick={resetCostTracking}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
            title="Reset cost tracking"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Validation Message */}
      {!canGenerate && !isGenerating && !result.image && !result.text && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs sm:text-sm text-yellow-800">
            <strong>Required:</strong> Add at least one product image, headline, and CTA text to generate your ad.
          </p>
        </div>
      )}

      {/* Empty State */}
      {showEmptyState && canGenerate && (
        <div className="w-full p-4 sm:p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-200">
          <div className="flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Ready to generate your ad!
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md px-4 sm:px-0">
                All requirements are met. Click the Generate button to create your custom ad design.
              </p>
            </div>

            <div className="w-full max-w-sm mt-2 sm:mt-4">
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-blue-100">
                <h4 className="text-xs font-semibold text-gray-700 mb-2 sm:mb-3">What you've provided:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Image className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Product images</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Type className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Headline text</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MousePointer className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Call-to-action</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Indicator - only show for single format */}
      {!isMultiFormat && (
        <GenerationProgress status={status} progress={progress} isGenerating={isGenerating} />
      )}

      {/* Multi-format selected indicator */}
      {selectedFormats.length > 1 && !multiFormatResults.length && !isGenerating && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs sm:text-sm text-blue-800">
            <strong>{selectedFormats.length} formats selected</strong> - Generation will run sequentially for each format.
          </p>
        </div>
      )}

      {/* Result Preview - Single format */}
      {!isMultiFormat && (
        <ResultPreview
          image={result.image}
          text={result.text}
          onRegenerate={handleRegenerate}
          onDownload={() => downloadImage()}
          status={status}
        />
      )}

      {/* Results Gallery - Multi-format */}
      {isMultiFormat && multiFormatResults.length > 0 && (
        <ResultsGallery
          results={multiFormatResults}
          currentFormatIndex={currentFormatIndex}
          isGenerating={isGenerating}
          onDownloadSingle={(image, suffix) => downloadImage(image, suffix)}
          onDownloadAll={downloadAllImages}
          onRegenerate={handleRegenerate}
        />
      )}
    </div>
  );
}
