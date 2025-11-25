/**
 * Core TypeScript types for Nano Ads Banana
 */

// Image upload type
export interface UploadedImage {
  id: string;
  name: string;
  base64: string;
  mimeType: string;
  size: number;
}

// Canvas element types
export type ElementType = 'product' | 'headline' | 'usp' | 'cta';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  zIndex: number;
  content?: string;
  // Percentage-based positioning for canvas (0-100)
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

// Style and tone types
export type StylePreset =
  | 'minimalist'
  | 'bold'
  | 'lifestyle'
  | 'luxury'
  | 'playful'
  | 'corporate';

export type ToneType =
  | 'professional'
  | 'friendly'
  | 'luxurious'
  | 'playful'
  | 'urgent'
  | 'inspirational';

// Aspect ratio type
export type AspectRatio = '1:1' | '9:16' | '4:5' | '16:9';

export interface AspectRatioConfig {
  ratio: AspectRatio;
  width: number;
  height: number;
  label: string;
}

export const ASPECT_RATIOS: Record<AspectRatio, AspectRatioConfig> = {
  '1:1': { ratio: '1:1', width: 1, height: 1, label: 'Square' },
  '9:16': { ratio: '9:16', width: 9, height: 16, label: 'Story' },
  '4:5': { ratio: '4:5', width: 4, height: 5, label: 'Portrait' },
  '16:9': { ratio: '16:9', width: 16, height: 9, label: 'Landscape' },
};

// Model type
export type ModelType = 'pro' | 'flash';

// Generation status
export type GenerationStatus =
  | 'idle'
  | 'preparing'
  | 'generating'
  | 'complete'
  | 'error';

// Brand colors interface
export interface BrandColors {
  primary?: string;
  secondary?: string;
  accent?: string;
}

// Ad Guidelines JSON schema
export interface AdGuidelinesJSON {
  version: string;
  metadata: {
    createdAt: string;
    appVersion: string;
  };
  content: {
    headlines: string[];
    usps: string[];
    ctaText: string;
    productImages: Array<{
      id: string;
      name: string;
      mimeType: string;
    }>;
  };
  design: {
    style: StylePreset;
    tone: ToneType;
    aspectRatio: AspectRatio;
    brandColors: BrandColors;
  };
  instructions: {
    targetAudience: string;
    customInstructions: string;
  };
  canvas?: {
    elements: CanvasElement[];
  };
}

// API response types
export interface GenerationResult {
  image?: string;
  text?: string;
  metadata?: {
    model: ModelType;
    timestamp: string;
    tokensUsed?: number;
  };
}

// Multi-format generation result
export interface FormatGenerationResult {
  aspectRatio: AspectRatio;
  image: string | null;
  text: string | null;
  status: 'pending' | 'generating' | 'complete' | 'error';
  error?: string;
}

export interface GenerationError {
  message: string;
  code?: string;
  details?: unknown;
}
