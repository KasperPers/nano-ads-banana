'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';
import type { UploadedImage } from '@/types';
import { cn } from '@/lib/utils';

interface ImageDropzoneProps {
  onUpload: (images: UploadedImage[]) => void;
  disabled?: boolean;
  currentCount: number;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
};

// Compression options for browser-image-compression
// Higher quality settings for better reference images
const compressionOptions = {
  maxSizeMB: 4,           // Allow larger files for quality
  maxWidthOrHeight: 4096, // Higher resolution
  useWebWorker: true,
  initialQuality: 0.92,   // High quality
};

// Timeout for compression (30 seconds)
const COMPRESSION_TIMEOUT_MS = 30000;

// Helper to add timeout to compression
const compressWithTimeout = async (file: File): Promise<File> => {
  return Promise.race([
    imageCompression(file, compressionOptions),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Compression timeout')), COMPRESSION_TIMEOUT_MS)
    ),
  ]);
};

export function ImageDropzone({ onUpload, disabled, currentCount }: ImageDropzoneProps) {
  const [isCompressing, setIsCompressing] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Limit to remaining slots
      const remainingSlots = MAX_FILES - currentCount;
      const filesToProcess = acceptedFiles.slice(0, remainingSlots);

      setIsCompressing(true);

      try {
        // Compress and convert files to UploadedImage objects
        const uploadedImages: UploadedImage[] = await Promise.all(
          filesToProcess.map(async (file) => {
            try {
              // Compress the image with timeout
              const compressedFile = await compressWithTimeout(file);

              // Convert compressed file to base64
              return new Promise<UploadedImage>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const base64 = reader.result as string;
                  resolve({
                    id: uuidv4(),
                    name: file.name,
                    base64,
                    mimeType: compressedFile.type,
                    size: compressedFile.size,
                  });
                };
                reader.onerror = reject;
                reader.readAsDataURL(compressedFile);
              });
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.error('Compression failed for file:', file.name, error);
              }
              // Fallback to original file if compression fails
              return new Promise<UploadedImage>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const base64 = reader.result as string;
                  resolve({
                    id: uuidv4(),
                    name: file.name,
                    base64,
                    mimeType: file.type,
                    size: file.size,
                  });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
              });
            }
          })
        );

        onUpload(uploadedImages);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error processing images:', error);
        }
      } finally {
        setIsCompressing(false);
      }
    },
    [onUpload, currentCount]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxFiles: MAX_FILES - currentCount,
    maxSize: MAX_FILE_SIZE,
    disabled: disabled || currentCount >= MAX_FILES || isCompressing,
  });

  return (
    <div
      {...getRootProps()}
      aria-label="Upload product images"
      className={cn(
        'border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer',
        'hover:border-blue-400 hover:bg-blue-50/50',
        isDragActive && 'border-blue-500 bg-blue-50',
        (disabled || currentCount >= MAX_FILES || isCompressing) && 'opacity-50 cursor-not-allowed hover:border-gray-300 hover:bg-transparent',
        !isDragActive && !disabled && currentCount < MAX_FILES && !isCompressing && 'border-gray-300'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        {isCompressing ? (
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        ) : (
          <Upload className={cn(
            'w-12 h-12',
            isDragActive ? 'text-blue-500' : 'text-gray-400'
          )} />
        )}
        <div>
          {isCompressing ? (
            <p className="text-sm font-medium text-blue-600">
              Compressing images...
            </p>
          ) : (
            <p className="text-sm font-medium text-gray-700">
              {isDragActive ? 'Drop images here' : 'Drop images here or click to upload'}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, JPEG, or WEBP (max {MAX_FILE_SIZE / 1024 / 1024}MB each)
          </p>
          <p className="text-xs text-gray-500">
            {currentCount}/{MAX_FILES} images uploaded
          </p>
        </div>
      </div>
    </div>
  );
}
