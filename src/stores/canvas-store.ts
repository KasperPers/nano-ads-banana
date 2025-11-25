/**
 * Canvas Store - Manages canvas state and element positioning per format
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AspectRatio, CanvasElement, Position, Size } from '../types';

// Type for elements stored per aspect ratio
type ElementsPerFormat = Record<AspectRatio, CanvasElement[]>;

const createEmptyElementsPerFormat = (): ElementsPerFormat => ({
  '1:1': [],
  '9:16': [],
  '4:5': [],
  '16:9': [],
});

interface CanvasState {
  // State
  aspectRatio: AspectRatio; // Current preview aspect ratio
  selectedFormats: AspectRatio[]; // Selected formats for generation
  elementsPerFormat: ElementsPerFormat; // Elements stored per format
  selectedElementId: string | null;

  // Actions
  setAspectRatio: (aspectRatio: AspectRatio) => void;
  toggleFormat: (format: AspectRatio) => void;
  setSelectedFormats: (formats: AspectRatio[]) => void;
  addElement: (element: Omit<CanvasElement, 'id' | 'zIndex'>) => void;
  updateElementPosition: (id: string, position: Position) => void;
  updateElementSize: (id: string, size: Size) => void;
  updateElement: (id: string, updates: Partial<{ x: number; y: number; width: number; height: number }>) => void;
  updateElementContent: (id: string, content: string) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  copyElementsToFormat: (fromFormat: AspectRatio, toFormat: AspectRatio) => void;
  copyElementsToAllFormats: () => void;
  getElementsForFormat: (format: AspectRatio) => CanvasElement[];
  resetCanvas: () => void;
}

const initialElementsPerFormat = createEmptyElementsPerFormat();

export const useCanvasStore = create<CanvasState>()(
  devtools(
    (set, get) => ({
      aspectRatio: '1:1' as AspectRatio,
      selectedFormats: ['1:1'] as AspectRatio[],
      elementsPerFormat: initialElementsPerFormat,
      selectedElementId: null as string | null,

      setAspectRatio: (aspectRatio) => {
        set({ aspectRatio, selectedElementId: null }, false, 'canvas/setAspectRatio');
      },

      toggleFormat: (format) => {
        const current = get().selectedFormats;
        const isSelected = current.includes(format);

        if (isSelected && current.length > 1) {
          set(
            { selectedFormats: current.filter(f => f !== format) },
            false,
            'canvas/toggleFormat'
          );
        } else if (!isSelected) {
          set(
            { selectedFormats: [...current, format] },
            false,
            'canvas/toggleFormat'
          );
        }
      },

      setSelectedFormats: (formats) => {
        if (formats.length > 0) {
          set({ selectedFormats: formats }, false, 'canvas/setSelectedFormats');
        }
      },

      addElement: (element) => {
        const { aspectRatio, elementsPerFormat } = get();
        const currentElements = elementsPerFormat[aspectRatio] || [];
        const maxZIndex = currentElements.length > 0
          ? Math.max(...currentElements.map(el => el.zIndex))
          : 0;

        const newElement: CanvasElement = {
          ...element,
          id: `element-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          zIndex: maxZIndex + 1,
          // Set initial percentage-based position and size
          x: element.position?.x ?? 25,
          y: element.position?.y ?? 25,
          width: element.size?.width ?? 30,
          height: element.size?.height ?? 20,
        };

        set(
          {
            elementsPerFormat: {
              ...elementsPerFormat,
              [aspectRatio]: [...currentElements, newElement],
            },
          },
          false,
          'canvas/addElement'
        );
      },

      // Update x, y position (percentage-based)
      updateElementPosition: (id, position) => {
        const { aspectRatio, elementsPerFormat } = get();
        const currentElements = elementsPerFormat[aspectRatio] || [];

        set(
          {
            elementsPerFormat: {
              ...elementsPerFormat,
              [aspectRatio]: currentElements.map((el) =>
                el.id === id ? { ...el, x: position.x, y: position.y } : el
              ),
            },
          },
          false,
          'canvas/updateElementPosition'
        );
      },

      // Update width, height (percentage-based)
      updateElementSize: (id, size) => {
        const { aspectRatio, elementsPerFormat } = get();
        const currentElements = elementsPerFormat[aspectRatio] || [];

        set(
          {
            elementsPerFormat: {
              ...elementsPerFormat,
              [aspectRatio]: currentElements.map((el) =>
                el.id === id ? { ...el, width: size.width, height: size.height } : el
              ),
            },
          },
          false,
          'canvas/updateElementSize'
        );
      },

      // Combined update for position and size (used by resize)
      updateElement: (id, updates) => {
        const { aspectRatio, elementsPerFormat } = get();
        const currentElements = elementsPerFormat[aspectRatio] || [];

        set(
          {
            elementsPerFormat: {
              ...elementsPerFormat,
              [aspectRatio]: currentElements.map((el) =>
                el.id === id ? { ...el, ...updates } : el
              ),
            },
          },
          false,
          'canvas/updateElement'
        );
      },

      updateElementContent: (id, content) => {
        const { aspectRatio, elementsPerFormat } = get();
        const currentElements = elementsPerFormat[aspectRatio] || [];

        set(
          {
            elementsPerFormat: {
              ...elementsPerFormat,
              [aspectRatio]: currentElements.map((el) =>
                el.id === id ? { ...el, content } : el
              ),
            },
          },
          false,
          'canvas/updateElementContent'
        );
      },

      removeElement: (id) => {
        const { aspectRatio, elementsPerFormat, selectedElementId } = get();
        const currentElements = elementsPerFormat[aspectRatio] || [];

        set(
          {
            elementsPerFormat: {
              ...elementsPerFormat,
              [aspectRatio]: currentElements.filter((el) => el.id !== id),
            },
            selectedElementId: selectedElementId === id ? null : selectedElementId,
          },
          false,
          'canvas/removeElement'
        );
      },

      selectElement: (id) => {
        set({ selectedElementId: id }, false, 'canvas/selectElement');
      },

      bringToFront: (id) => {
        const { aspectRatio, elementsPerFormat } = get();
        const currentElements = elementsPerFormat[aspectRatio] || [];
        const maxZIndex = currentElements.length > 0
          ? Math.max(...currentElements.map(el => el.zIndex))
          : 0;

        set(
          {
            elementsPerFormat: {
              ...elementsPerFormat,
              [aspectRatio]: currentElements.map((el) =>
                el.id === id ? { ...el, zIndex: maxZIndex + 1 } : el
              ),
            },
          },
          false,
          'canvas/bringToFront'
        );
      },

      sendToBack: (id) => {
        const { aspectRatio, elementsPerFormat } = get();
        const currentElements = elementsPerFormat[aspectRatio] || [];
        const minZIndex = currentElements.length > 0
          ? Math.min(...currentElements.map(el => el.zIndex))
          : 0;

        set(
          {
            elementsPerFormat: {
              ...elementsPerFormat,
              [aspectRatio]: currentElements.map((el) =>
                el.id === id ? { ...el, zIndex: minZIndex - 1 } : el
              ),
            },
          },
          false,
          'canvas/sendToBack'
        );
      },

      // Copy elements from one format to another (with new IDs)
      copyElementsToFormat: (fromFormat, toFormat) => {
        const { elementsPerFormat } = get();
        const sourceElements = elementsPerFormat[fromFormat] || [];

        // Create new elements with new IDs
        const copiedElements = sourceElements.map(el => ({
          ...el,
          id: `element-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        }));

        set(
          {
            elementsPerFormat: {
              ...elementsPerFormat,
              [toFormat]: copiedElements,
            },
          },
          false,
          'canvas/copyElementsToFormat'
        );
      },

      // Copy current format's elements to all selected formats
      copyElementsToAllFormats: () => {
        const { aspectRatio, selectedFormats, elementsPerFormat } = get();
        const sourceElements = elementsPerFormat[aspectRatio] || [];
        const newElementsPerFormat = { ...elementsPerFormat };

        selectedFormats.forEach(format => {
          if (format !== aspectRatio) {
            // Create new elements with new IDs for each format
            newElementsPerFormat[format] = sourceElements.map(el => ({
              ...el,
              id: `element-${Date.now()}-${Math.random().toString(36).substring(2, 11)}-${format}`,
            }));
          }
        });

        set(
          { elementsPerFormat: newElementsPerFormat },
          false,
          'canvas/copyElementsToAllFormats'
        );
      },

      // Get elements for a specific format (used by generation)
      getElementsForFormat: (format) => {
        return get().elementsPerFormat[format] || [];
      },

      resetCanvas: () => {
        set(
          {
            aspectRatio: '1:1' as AspectRatio,
            selectedFormats: ['1:1'] as AspectRatio[],
            elementsPerFormat: createEmptyElementsPerFormat(),
            selectedElementId: null,
          },
          false,
          'canvas/reset'
        );
      },
    }),
    { name: 'CanvasStore' }
  )
);
