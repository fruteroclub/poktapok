/**
 * ProjectImages Component
 *
 * Displays project images in a responsive grid with lightbox
 * Used in the individual project view page
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageLightbox } from './image-lightbox';

interface ProjectImagesProps {
  images: string[];
}

export function ProjectImages({ images }: ProjectImagesProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            🖼️ Project Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index)}
                className="
                  relative aspect-video rounded-lg overflow-hidden
                  border-2 border-transparent hover:border-primary
                  transition-all cursor-pointer group
                  bg-gray-100
                "
                type="button"
              >
                <Image
                  src={imageUrl}
                  alt={`Project image ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {/* Overlay on hover */}
                <div className="
                  absolute inset-0 bg-black/0 group-hover:bg-black/20
                  transition-colors flex items-center justify-center
                ">
                  <span className="
                    text-white text-sm font-medium opacity-0 group-hover:opacity-100
                    transition-opacity
                  ">
                    View
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox */}
      <ImageLightbox
        images={images}
        currentIndex={selectedImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setSelectedImageIndex}
      />
    </>
  );
}
