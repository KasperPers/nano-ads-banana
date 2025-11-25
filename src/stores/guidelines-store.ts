/**
 * Guidelines Store - Manages design guidelines, style, tone, and brand settings
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { StylePreset, ToneType, BrandColors, AdGuidelinesJSON } from '../types';
import { useContentStore } from './content-store';
import { useCanvasStore } from './canvas-store';

interface GuidelinesState {
  // State
  style: StylePreset;
  tone: ToneType;
  brandColors: BrandColors;
  customInstructions: string;
  targetAudience: string;

  // Actions
  setStyle: (style: StylePreset) => void;
  setTone: (tone: ToneType) => void;
  setBrandColors: (colors: BrandColors) => void;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  setAccentColor: (color: string) => void;
  setCustomInstructions: (instructions: string) => void;
  setTargetAudience: (audience: string) => void;
  exportAsJSON: () => AdGuidelinesJSON;
  reset: () => void;
}

const initialState = {
  style: 'minimalist' as StylePreset,
  tone: 'professional' as ToneType,
  brandColors: {} as BrandColors,
  customInstructions: '' as string,
  targetAudience: '' as string,
};

export const useGuidelinesStore = create<GuidelinesState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setStyle: (style) => {
        set({ style }, false, 'guidelines/setStyle');
      },

      setTone: (tone) => {
        set({ tone }, false, 'guidelines/setTone');
      },

      setBrandColors: (brandColors) => {
        set({ brandColors }, false, 'guidelines/setBrandColors');
      },

      setPrimaryColor: (color) => {
        set(
          (state) => ({
            brandColors: { ...state.brandColors, primary: color },
          }),
          false,
          'guidelines/setPrimaryColor'
        );
      },

      setSecondaryColor: (color) => {
        set(
          (state) => ({
            brandColors: { ...state.brandColors, secondary: color },
          }),
          false,
          'guidelines/setSecondaryColor'
        );
      },

      setAccentColor: (color) => {
        set(
          (state) => ({
            brandColors: { ...state.brandColors, accent: color },
          }),
          false,
          'guidelines/setAccentColor'
        );
      },

      setCustomInstructions: (customInstructions) => {
        set({ customInstructions }, false, 'guidelines/setCustomInstructions');
      },

      setTargetAudience: (targetAudience) => {
        set({ targetAudience }, false, 'guidelines/setTargetAudience');
      },

      exportAsJSON: () => {
        const state = get();
        const contentState = useContentStore.getState();
        const canvasState = useCanvasStore.getState();

        const guidelines: AdGuidelinesJSON = {
          version: '1.0.0',
          metadata: {
            createdAt: new Date().toISOString(),
            appVersion: '1.0.0',
          },
          content: {
            headlines: contentState.headlines.filter(h => h.trim() !== ''),
            usps: contentState.usps.filter(u => u.trim() !== ''),
            ctaText: contentState.ctaText,
            productImages: contentState.productImages.map(img => ({
              id: img.id,
              name: img.name,
              mimeType: img.mimeType,
            })),
          },
          design: {
            style: state.style,
            tone: state.tone,
            aspectRatio: canvasState.aspectRatio,
            brandColors: state.brandColors,
          },
          instructions: {
            targetAudience: state.targetAudience,
            customInstructions: state.customInstructions,
          },
          canvas: {
            elements: canvasState.elementsPerFormat[canvasState.aspectRatio] || [],
          },
        };

        return guidelines;
      },

      reset: () => {
        set(initialState, false, 'guidelines/reset');
      },
    }),
    { name: 'GuidelinesStore' }
  )
);
