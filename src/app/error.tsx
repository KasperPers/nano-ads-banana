'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Route error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-lg p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h1>

          <p className="text-gray-600 mb-6">
            We encountered an unexpected error while loading this page.
            Your work is safe and you can try again.
          </p>

          {process.env.NODE_ENV === 'development' && error && (
            <div className="w-full mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs font-semibold text-red-900 mb-2">
                Error Details (Development Only):
              </p>
              <p className="text-xs font-mono text-red-800 text-left break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs font-mono text-red-700 text-left mt-2">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 w-full">
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>

            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
