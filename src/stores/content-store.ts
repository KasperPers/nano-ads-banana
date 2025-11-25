/**
 * Content Store - Manages ad content (headlines, USPs, CTA, images)
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { UploadedImage } from '../types';

interface ContentState {
  // State
  headlines: string[];
  usps: string[];
  ctaText: string;
  productImages: UploadedImage[];

  // Actions
  setHeadlines: (headlines: string[]) => void;
  addHeadline: (headline?: string) => void;
  updateHeadline: (index: number, headline: string) => void;
  removeHeadline: (index: number) => void;

  setUsps: (usps: string[]) => void;
  addUsp: (usp?: string) => void;
  updateUsp: (index: number, usp: string) => void;
  removeUsp: (index: number) => void;

  setCta: (cta: string) => void;

  addProductImage: (image: UploadedImage) => void;
  removeProductImage: (id: string) => void;
  setProductImages: (images: UploadedImage[]) => void;
  reorderImages: (startIndex: number, endIndex: number) => void;

  reset: () => void;
}

const initialState = {
  headlines: [''] as string[],
  usps: [''] as string[],
  ctaText: '' as string,
  productImages: [] as UploadedImage[],
};

export const useContentStore = create<ContentState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setHeadlines: (headlines) => {
        set({ headlines }, false, 'content/setHeadlines');
      },

      addHeadline: (headline = '') => {
        set(
          (state) => ({ headlines: [...state.headlines, headline] }),
          false,
          'content/addHeadline'
        );
      },

      updateHeadline: (index, headline) => {
        set(
          (state) => ({
            headlines: state.headlines.map((h, i) => (i === index ? headline : h)),
          }),
          false,
          'content/updateHeadline'
        );
      },

      removeHeadline: (index) => {
        set(
          (state) => ({
            headlines: state.headlines.filter((_, i) => i !== index),
          }),
          false,
          'content/removeHeadline'
        );
      },

      setUsps: (usps) => {
        set({ usps }, false, 'content/setUsps');
      },

      addUsp: (usp = '') => {
        set(
          (state) => ({ usps: [...state.usps, usp] }),
          false,
          'content/addUsp'
        );
      },

      updateUsp: (index, usp) => {
        set(
          (state) => ({
            usps: state.usps.map((u, i) => (i === index ? usp : u)),
          }),
          false,
          'content/updateUsp'
        );
      },

      removeUsp: (index) => {
        set(
          (state) => ({
            usps: state.usps.filter((_, i) => i !== index),
          }),
          false,
          'content/removeUsp'
        );
      },

      setCta: (ctaText) => {
        set({ ctaText }, false, 'content/setCta');
      },

      addProductImage: (image) => {
        set(
          (state) => ({
            productImages: [...state.productImages, image],
          }),
          false,
          'content/addProductImage'
        );
      },

      removeProductImage: (id) => {
        set(
          (state) => ({
            productImages: state.productImages.filter((img) => img.id !== id),
          }),
          false,
          'content/removeProductImage'
        );
      },

      setProductImages: (images) => {
        set({ productImages: images }, false, 'content/setProductImages');
      },

      reorderImages: (startIndex, endIndex) => {
        set(
          (state) => {
            const images = [...state.productImages];
            const [removed] = images.splice(startIndex, 1);
            images.splice(endIndex, 0, removed);
            return { productImages: images };
          },
          false,
          'content/reorderImages'
        );
      },

      reset: () => {
        set(initialState, false, 'content/reset');
      },
    }),
    { name: 'ContentStore' }
  )
);
