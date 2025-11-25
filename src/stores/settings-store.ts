/**
 * Settings Store - Manages user settings including API key
 * API key is stored in localStorage for persistence
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SettingsState {
  // State
  apiKey: string;
  isSettingsOpen: boolean;

  // Actions
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;

  // Computed
  hasApiKey: () => boolean;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        apiKey: '',
        isSettingsOpen: false,

        setApiKey: (apiKey) => {
          set({ apiKey }, false, 'settings/setApiKey');
        },

        clearApiKey: () => {
          set({ apiKey: '' }, false, 'settings/clearApiKey');
        },

        openSettings: () => {
          set({ isSettingsOpen: true }, false, 'settings/openSettings');
        },

        closeSettings: () => {
          set({ isSettingsOpen: false }, false, 'settings/closeSettings');
        },

        toggleSettings: () => {
          set(
            (state) => ({ isSettingsOpen: !state.isSettingsOpen }),
            false,
            'settings/toggleSettings'
          );
        },

        hasApiKey: () => {
          return get().apiKey.length > 0;
        },
      }),
      {
        name: 'nano-ads-settings',
        partialize: (state) => ({ apiKey: state.apiKey }), // Only persist the API key
      }
    ),
    { name: 'SettingsStore' }
  )
);
