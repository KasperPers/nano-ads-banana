'use client';

import { useState, useEffect } from 'react';
import { X, Key, ExternalLink, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { useSettingsStore } from '@/stores/settings-store';
import { cn } from '@/lib/utils';

export function SettingsModal() {
  const { apiKey, isSettingsOpen, setApiKey, clearApiKey, closeSettings } = useSettingsStore();
  const [inputValue, setInputValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync input with stored value when modal opens
  useEffect(() => {
    if (isSettingsOpen) {
      setInputValue(apiKey);
      setSaved(false);
    }
  }, [isSettingsOpen, apiKey]);

  // ESC key handler to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSettingsOpen) {
        closeSettings();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSettingsOpen, closeSettings]);

  const handleSave = () => {
    setApiKey(inputValue.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setInputValue('');
    clearApiKey();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeSettings();
    }
  };

  if (!isSettingsOpen) return null;

  const maskedKey = inputValue ? `${inputValue.slice(0, 8)}${'•'.repeat(Math.max(0, inputValue.length - 12))}${inputValue.slice(-4)}` : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-lg font-semibold text-gray-900">Settings</h2>
              <p className="text-sm text-gray-500">Configure your API key</p>
            </div>
          </div>
          <button
            onClick={closeSettings}
            aria-label="Close settings"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* API Key Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Gemini API Key
            </label>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter your Gemini API key..."
                className={cn(
                  "w-full px-4 py-3 pr-12 border rounded-xl transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  inputValue ? "border-gray-300" : "border-gray-200"
                )}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                {showKey ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Status indicator */}
            {apiKey && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="w-4 h-4" />
                <span>API key saved</span>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="text-amber-800 font-medium">Your API key is stored locally</p>
                <p className="text-amber-700">
                  Your key is saved in your browser&apos;s local storage and is only sent directly to Google&apos;s API.
                  We never store or have access to your API key.
                </p>
              </div>
            </div>
          </div>

          {/* Get API Key Link */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-3">
              Don&apos;t have an API key? Get one from Google AI Studio:
            </p>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Get your Gemini API Key
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Pricing Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p className="font-medium">Estimated costs per image:</p>
            <ul className="list-disc list-inside space-y-0.5 text-gray-400">
              <li>Fast Mode (Flash): ~$0.04/image</li>
              <li>Quality Mode (Pro): ~$0.15-0.24/image</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleClear}
            disabled={!inputValue}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              inputValue
                ? "text-red-600 hover:bg-red-50"
                : "text-gray-400 cursor-not-allowed"
            )}
          >
            Clear Key
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={closeSettings}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!inputValue.trim()}
              className={cn(
                "px-6 py-2 text-sm font-medium rounded-lg transition-all",
                inputValue.trim()
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed",
                saved && "bg-green-600 hover:bg-green-600"
              )}
            >
              {saved ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Saved
                </span>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
