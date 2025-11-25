/**
 * Generation Store - Manages AI generation state and results
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { GenerationStatus, ModelType, GenerationResult, GenerationError, FormatGenerationResult, AspectRatio } from '../types';

// Cost estimates per model (approximate USD)
const COST_PER_IMAGE = {
  flash: 0.04,   // ~$0.04 per image
  pro: 0.15,     // ~$0.15 per image
} as const;

interface GenerationState {
  // State
  status: GenerationStatus;
  generatedImage: string | null;
  generatedText: string | null;
  error: string | null;
  model: ModelType;
  isGenerating: boolean;
  progress: number;

  // Multi-format state
  multiFormatResults: FormatGenerationResult[];
  currentFormatIndex: number;
  totalFormats: number;

  // Metadata
  lastGenerationTime: string | null;
  tokensUsed: number | null;

  // Cost tracking
  totalGenerations: number;
  estimatedCostUSD: number;

  // Actions
  setModel: (model: ModelType) => void;
  startGeneration: () => void;
  setProgress: (progress: number) => void;
  setResult: (result: GenerationResult) => void;
  setError: (error: string | GenerationError) => void;
  clearError: () => void;
  reset: () => void;
  resetResults: () => void;
  resetCostTracking: () => void;

  // Multi-format actions
  startMultiFormatGeneration: (formats: AspectRatio[]) => void;
  setFormatGenerating: (index: number) => void;
  setFormatResult: (index: number, image: string | null, text: string | null) => void;
  setFormatError: (index: number, error: string) => void;
  completeMultiFormatGeneration: () => void;
}

const initialState = {
  status: 'idle' as GenerationStatus,
  generatedImage: null as string | null,
  generatedText: null as string | null,
  error: null as string | null,
  model: 'flash' as ModelType,
  isGenerating: false as boolean,
  progress: 0 as number,
  multiFormatResults: [] as FormatGenerationResult[],
  currentFormatIndex: 0 as number,
  totalFormats: 0 as number,
  lastGenerationTime: null as string | null,
  tokensUsed: null as number | null,
  totalGenerations: 0 as number,
  estimatedCostUSD: 0 as number,
};

export const useGenerationStore = create<GenerationState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

      setModel: (model) => {
        set({ model }, false, 'generation/setModel');
      },

      startGeneration: () => {
        set(
          {
            status: 'preparing',
            isGenerating: true,
            error: null,
            generatedImage: null,
            generatedText: null,
            progress: 10, // Initial progress - we're starting
            lastGenerationTime: null,
            tokensUsed: null,
          },
          false,
          'generation/startGeneration'
        );

        // Update status to show we're sending to API
        setTimeout(() => {
          if (get().isGenerating && get().status === 'preparing') {
            set({ status: 'generating', progress: 30 }, false, 'generation/updateStatus');
          }
        }, 1000);
      },

      setProgress: (progress) => {
        set({ progress }, false, 'generation/setProgress');
      },

      setResult: (result) => {
        const model = get().model;
        const cost = COST_PER_IMAGE[model] || 0.04;
        set(
          (state) => ({
            status: 'complete',
            isGenerating: false,
            generatedImage: result.image || null,
            generatedText: result.text || null,
            error: null,
            progress: 100,
            lastGenerationTime: result.metadata?.timestamp || new Date().toISOString(),
            tokensUsed: result.metadata?.tokensUsed || null,
            totalGenerations: state.totalGenerations + 1,
            estimatedCostUSD: state.estimatedCostUSD + cost,
          }),
          false,
          'generation/setResult'
        );
      },

      setError: (error) => {
        const errorMessage = typeof error === 'string'
          ? error
          : error.message;

        set(
          {
            status: 'error',
            isGenerating: false,
            error: errorMessage,
            progress: 0,
          },
          false,
          'generation/setError'
        );
      },

      clearError: () => {
        set({ error: null }, false, 'generation/clearError');
      },

      reset: () => {
        set(initialState, false, 'generation/reset');
      },

      resetResults: () => {
        set(
          {
            status: 'idle',
            generatedImage: null,
            generatedText: null,
            error: null,
            isGenerating: false,
            progress: 0,
            multiFormatResults: [],
            currentFormatIndex: 0,
            totalFormats: 0,
            lastGenerationTime: null,
            tokensUsed: null,
          },
          false,
          'generation/resetResults'
        );
      },

      resetCostTracking: () => {
        set(
          {
            totalGenerations: 0,
            estimatedCostUSD: 0,
          },
          false,
          'generation/resetCostTracking'
        );
      },

      // Multi-format generation actions
      startMultiFormatGeneration: (formats) => {
        const results: FormatGenerationResult[] = formats.map((aspectRatio) => ({
          aspectRatio,
          image: null,
          text: null,
          status: 'pending',
        }));

        set(
          {
            status: 'preparing',
            isGenerating: true,
            error: null,
            generatedImage: null,
            generatedText: null,
            progress: 0,
            multiFormatResults: results,
            currentFormatIndex: 0,
            totalFormats: formats.length,
            lastGenerationTime: null,
            tokensUsed: null,
          },
          false,
          'generation/startMultiFormatGeneration'
        );
      },

      setFormatGenerating: (index) => {
        const results = [...get().multiFormatResults];
        if (results[index]) {
          results[index] = { ...results[index], status: 'generating' };
          const progress = Math.round((index / get().totalFormats) * 100);
          set(
            {
              status: 'generating',
              multiFormatResults: results,
              currentFormatIndex: index,
              progress,
            },
            false,
            'generation/setFormatGenerating'
          );
        }
      },

      setFormatResult: (index, image, text) => {
        const results = [...get().multiFormatResults];
        if (results[index]) {
          results[index] = {
            ...results[index],
            image,
            text,
            status: 'complete',
          };
          const completedCount = results.filter(r => r.status === 'complete').length;
          const progress = Math.round((completedCount / get().totalFormats) * 100);
          set(
            {
              multiFormatResults: results,
              progress,
            },
            false,
            'generation/setFormatResult'
          );
        }
      },

      setFormatError: (index, error) => {
        const results = [...get().multiFormatResults];
        if (results[index]) {
          results[index] = {
            ...results[index],
            status: 'error',
            error,
          };
          set(
            { multiFormatResults: results },
            false,
            'generation/setFormatError'
          );
        }
      },

      completeMultiFormatGeneration: () => {
        const results = get().multiFormatResults;
        const model = get().model;
        const hasError = results.some(r => r.status === 'error');
        const firstSuccess = results.find(r => r.status === 'complete' && r.image);
        const successCount = results.filter(r => r.status === 'complete' && r.image).length;
        const cost = (COST_PER_IMAGE[model] || 0.04) * successCount;

        set(
          (state) => ({
            status: hasError ? 'error' : 'complete',
            isGenerating: false,
            progress: 100,
            // Set the first successful result as the main result for backward compatibility
            generatedImage: firstSuccess?.image || null,
            generatedText: firstSuccess?.text || null,
            lastGenerationTime: new Date().toISOString(),
            totalGenerations: state.totalGenerations + successCount,
            estimatedCostUSD: state.estimatedCostUSD + cost,
          }),
          false,
          'generation/completeMultiFormatGeneration'
        );
      },
      }),
      {
        name: 'nano-ads-generation',
        // Only persist cost tracking and model preference - not images (too large)
        partialize: (state) => ({
          model: state.model,
          totalGenerations: state.totalGenerations,
          estimatedCostUSD: state.estimatedCostUSD,
        }),
      }
    ),
    { name: 'GenerationStore' }
  )
);
