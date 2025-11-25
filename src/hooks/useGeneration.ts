'use client';

import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useContentStore } from '@/stores/content-store';
import { useCanvasStore } from '@/stores/canvas-store';
import { useGuidelinesStore } from '@/stores/guidelines-store';
import { useGenerationStore } from '@/stores/generation-store';
import { useSettingsStore } from '@/stores/settings-store';
import { buildCompletePrompt } from '@/lib/gemini/prompt-builder';
import type { GeminiRequest } from '@/lib/gemini/types';
import type { GenerationResult, AspectRatio, ASPECT_RATIOS } from '@/types';

export function useGeneration() {
  // Get all stores
  const contentState = useContentStore();
  const canvasState = useCanvasStore();
  const guidelinesState = useGuidelinesStore();
  const generationState = useGenerationStore();
  const settingsState = useSettingsStore();

  // Check if API key is configured
  const hasApiKey = settingsState.apiKey.length > 0;

  // Check if we can generate
  const canGenerate = useMemo(() => {
    // Need API key
    if (!hasApiKey) {
      return false;
    }

    // Need at least one product image
    if (contentState.productImages.length === 0) {
      return false;
    }

    // Need at least one headline
    const hasHeadline = contentState.headlines.some(h => h.trim() !== '');
    if (!hasHeadline) {
      return false;
    }

    // Need CTA text
    if (!contentState.ctaText.trim()) {
      return false;
    }

    return true;
  }, [
    hasApiKey,
    contentState.productImages.length,
    contentState.headlines,
    contentState.ctaText,
  ]);

  // Helper function to generate a single format with timeout and retry
  const generateSingleFormat = useCallback(async (
    aspectRatio: AspectRatio,
    prompt: string,
    referenceImages: Array<{ base64: string; mimeType: string }>,
    retryCount = 0,
  ): Promise<{ image: string | null; text: string | null; error?: string }> => {
    const MAX_RETRIES = 2;
    const TIMEOUT_MS = 120000; // 2 minutes for image generation

    try {
      const request: GeminiRequest = {
        prompt,
        referenceImages,
        aspectRatio,
        imageSize: 'LARGE',
        model: generationState.model,
        apiKey: settingsState.apiKey,
      };

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = errorData.error || 'Failed to generate ad';

        // Handle rate limiting with exponential backoff
        if (response.status === 429 || errorMessage.toLowerCase().includes('rate limit')) {
          if (retryCount < MAX_RETRIES) {
            const backoffMs = Math.pow(2, retryCount + 1) * 1000; // 2s, 4s, 8s
            toast.info(`Rate limited. Retrying in ${backoffMs / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            return generateSingleFormat(aspectRatio, prompt, referenceImages, retryCount + 1);
          }
          errorMessage = 'Rate limit exceeded - please wait a moment and try again';
        } else if (response.status === 401 || errorMessage.toLowerCase().includes('api key')) {
          errorMessage = 'Invalid API key - please check Settings';
        } else if (response.status === 400) {
          errorMessage = 'Invalid request - check your inputs';
        } else if (response.status >= 500) {
          // Retry on server errors
          if (retryCount < MAX_RETRIES) {
            const backoffMs = Math.pow(2, retryCount + 1) * 1000;
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            return generateSingleFormat(aspectRatio, prompt, referenceImages, retryCount + 1);
          }
          errorMessage = 'Service temporarily unavailable - try again later';
        }

        return { image: null, text: null, error: errorMessage };
      }

      const result = await response.json();
      return { image: result.image || null, text: result.text || null };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { image: null, text: null, error: 'Request timed out - please try again' };
      }
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { image: null, text: null, error: 'Network error - check your internet connection' };
      }
      return { image: null, text: null, error: 'An unexpected error occurred' };
    }
  }, [generationState.model, settingsState.apiKey]);

  // Generate function - supports multi-format sequential generation
  const generate = useCallback(async () => {
    if (!hasApiKey) {
      toast.error('API key required', {
        description: 'Please add your Gemini API key in Settings.',
      });
      settingsState.openSettings();
      return;
    }

    if (!canGenerate) {
      toast.error('Missing required content', {
        description: 'Please add product images, headlines, and CTA text.',
      });
      return;
    }

    // Get selected formats
    const selectedFormats = canvasState.selectedFormats;
    const isMultiFormat = selectedFormats.length > 1;

    try {
      // Build base data for prompts
      const guidelines = guidelinesState.exportAsJSON();
      const filteredHeadlines = contentState.headlines.filter(h => h.trim() !== '');
      const filteredUsps = contentState.usps.filter(u => u.trim() !== '');

      // Prepare reference images
      const referenceImages = contentState.productImages.map(img => ({
        base64: img.base64.split(',')[1] || img.base64,
        mimeType: img.mimeType,
      }));

      if (isMultiFormat) {
        // Multi-format sequential generation with per-format elements
        generationState.startMultiFormatGeneration(selectedFormats);

        toast.info(`Generating ${selectedFormats.length} formats...`, {
          description: 'This may take a moment.',
        });

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < selectedFormats.length; i++) {
          const format = selectedFormats[i];
          generationState.setFormatGenerating(i);

          // Get elements specific to this format
          const formatElements = canvasState.getElementsForFormat(format);

          // Build prompt with format-specific elements
          const formatPrompt = buildCompletePrompt(
            guidelines,
            formatElements,
            filteredHeadlines,
            filteredUsps,
            contentState.ctaText
          );

          const result = await generateSingleFormat(format, formatPrompt, referenceImages);

          if (result.error) {
            generationState.setFormatError(i, result.error);
            errorCount++;
          } else {
            generationState.setFormatResult(i, result.image, result.text);
            successCount++;
          }

          // Small delay between requests to avoid rate limiting
          if (i < selectedFormats.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        generationState.completeMultiFormatGeneration();

        if (errorCount === 0) {
          toast.success(`${successCount} ads generated successfully!`, {
            description: 'All formats are ready to preview and download.',
          });
        } else if (successCount > 0) {
          toast.warning(`${successCount} of ${selectedFormats.length} ads generated`, {
            description: `${errorCount} format(s) failed. Check individual results.`,
          });
        } else {
          toast.error('All generations failed', {
            description: 'Please check your settings and try again.',
          });
        }
      } else {
        // Single format generation
        generationState.startGeneration();

        const format = selectedFormats[0] || canvasState.aspectRatio;

        // Get elements for the current format
        const formatElements = canvasState.getElementsForFormat(format);

        // Build prompt with format-specific elements
        const prompt = buildCompletePrompt(
          guidelines,
          formatElements,
          filteredHeadlines,
          filteredUsps,
          contentState.ctaText
        );

        generationState.setProgress(50);

        const result = await generateSingleFormat(format, prompt, referenceImages);

        if (result.error) {
          throw new Error(result.error);
        }

        generationState.setProgress(90);

        const generationResult: GenerationResult = {
          image: result.image || undefined,
          text: result.text || undefined,
          metadata: {
            model: generationState.model,
            timestamp: new Date().toISOString(),
          },
        };

        generationState.setResult(generationResult);

        toast.success('Ad generated successfully!', {
          description: 'Your ad is ready to preview and download.',
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Generation error:', error);
      }

      let errorMessage: string;
      let errorTitle = 'Generation failed';

      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorTitle = 'Network error';
        errorMessage = 'Network error - check your internet connection';
      } else if (error instanceof Error) {
        errorMessage = error.message;

        if (errorMessage.toLowerCase().includes('api key')) {
          errorTitle = 'Invalid API key';
        } else if (errorMessage.toLowerCase().includes('rate limit')) {
          errorTitle = 'Rate limit exceeded';
        }
      } else {
        errorMessage = 'An unexpected error occurred - please try again';
      }

      generationState.setError(errorMessage);

      toast.error(errorTitle, {
        description: errorMessage,
      });
    }
  }, [
    canGenerate,
    hasApiKey,
    contentState,
    canvasState,
    guidelinesState,
    generationState,
    settingsState,
    generateSingleFormat,
  ]);

  // Download function for single image
  const downloadImage = useCallback((image?: string, suffix?: string) => {
    const imageToDownload = image || generationState.generatedImage;
    if (!imageToDownload) {
      toast.error('No image to download');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${imageToDownload}`;
      link.download = `nano-ad-${suffix || Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Image downloaded successfully!');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Download error:', error);
      }
      toast.error('Failed to download image');
    }
  }, [generationState.generatedImage]);

  // Download all generated images
  const downloadAllImages = useCallback(() => {
    const results = generationState.multiFormatResults.filter(r => r.status === 'complete' && r.image);

    if (results.length === 0) {
      toast.error('No images to download');
      return;
    }

    try {
      const timestamp = Date.now();
      results.forEach((result, index) => {
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = `data:image/png;base64,${result.image}`;
          link.download = `nano-ad-${result.aspectRatio.replace(':', 'x')}-${timestamp}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 200); // Stagger downloads
      });

      toast.success(`Downloading ${results.length} images...`);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Download error:', error);
      }
      toast.error('Failed to download images');
    }
  }, [generationState.multiFormatResults]);

  return {
    generate,
    downloadImage,
    downloadAllImages,
    canGenerate,
    hasApiKey,
    isGenerating: generationState.isGenerating,
    status: generationState.status,
    progress: generationState.progress,
    result: {
      image: generationState.generatedImage,
      text: generationState.generatedText,
    },
    multiFormatResults: generationState.multiFormatResults,
    currentFormatIndex: generationState.currentFormatIndex,
    totalFormats: generationState.totalFormats,
    error: generationState.error,
  };
}
