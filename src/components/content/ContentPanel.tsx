'use client';

import { useContentStore } from '@/stores/content-store';
import { HeadlineInput } from './HeadlineInput';
import { USPList } from './USPList';
import { CTAInput } from './CTAInput';
import { ImageDropzone } from '@/components/upload/ImageDropzone';
import { ImageGallery } from '@/components/upload/ImageGallery';
import { Image } from 'lucide-react';
import type { UploadedImage } from '@/types';

export function ContentPanel() {
  const {
    headlines,
    usps,
    ctaText,
    productImages,
    setHeadlines,
    setUsps,
    setCta,
    addProductImage,
    removeProductImage,
    setProductImages,
  } = useContentStore();

  // Handle multiple images being uploaded
  const handleImagesUpload = (images: UploadedImage[]) => {
    images.forEach((image) => addProductImage(image));
  };

  // Handle reordering - ImageGallery gives us the new array
  const handleReorder = (newImages: UploadedImage[]) => {
    // Directly set the new order
    setProductImages(newImages);
  };

  return (
    <div className="space-y-6">
      {/* Product Images Section */}
      <section className="space-y-4 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Product Images</h3>
        </div>
        <p className="text-xs text-gray-500">
          Upload 1-5 product images for the AI to use as reference
        </p>
        <ImageDropzone
          onUpload={handleImagesUpload}
          currentCount={productImages.length}
        />
        {productImages.length > 0 && (
          <ImageGallery
            images={productImages}
            onRemove={removeProductImage}
            onReorder={handleReorder}
          />
        )}
      </section>

      {/* Headlines Section */}
      <section className="pb-6 border-b border-gray-200">
        <HeadlineInput headlines={headlines} onChange={setHeadlines} />
      </section>

      {/* USPs Section */}
      <section className="pb-6 border-b border-gray-200">
        <USPList usps={usps} onChange={setUsps} />
      </section>

      {/* CTA Section */}
      <section>
        <CTAInput value={ctaText} onChange={setCta} />
      </section>
    </div>
  );
}
