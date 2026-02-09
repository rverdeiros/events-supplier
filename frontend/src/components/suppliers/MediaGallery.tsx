'use client';

import { useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Media, MediaType } from '@/types';
import { ChevronLeft, ChevronRight, Play, FileText, Image as ImageIcon, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import Image from 'next/image';

interface MediaGalleryProps {
  media: Media[];
  supplierName?: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({ media, supplierName }) => {
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
  });

  const images = media.filter((m) => m.type === 'image');
  const videos = media.filter((m) => m.type === 'video');
  const documents = media.filter((m) => m.type === 'document');

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const openModal = (item: Media) => {
    setSelectedMedia(item);
  };

  const closeModal = () => {
    setSelectedMedia(null);
  };

  if (media.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Nenhuma mídia disponível</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Images Carousel */}
        {images.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Imagens ({images.length})
            </h3>
            <div className="relative">
              <div className="embla overflow-hidden" ref={emblaRef}>
                <div className="embla__viewport">
                  <div className="embla__container flex gap-4">
                    {images.map((item) => (
                      <div
                        key={item.id}
                        className="embla__slide flex-[0_0_auto] min-w-0 w-full md:w-1/2 lg:w-1/3"
                      >
                        <div
                          className="relative h-64 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => openModal(item)}
                        >
                          <Image
                            src={item.url}
                            alt={`${supplierName || 'Fornecedor'} - Imagem ${item.id}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={scrollPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={scrollNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Vídeos ({videos.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-video rounded-lg overflow-hidden bg-black cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openModal(item)}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-16 h-16 text-white opacity-80" />
                  </div>
                  <iframe
                    src={item.url}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documentos ({documents.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-8 h-8 text-blue-600" />
                  <span className="flex-1 text-sm text-gray-700 truncate">
                    Documento {item.id}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal for full-size view */}
      {selectedMedia && (
        <Modal isOpen={!!selectedMedia} onClose={closeModal} title="">
          <div className="relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
            >
              <X className="w-5 h-5" />
            </button>
            {selectedMedia.type === 'image' && (
              <div className="relative w-full h-[80vh]">
                <Image
                  src={selectedMedia.url}
                  alt={`${supplierName || 'Fornecedor'} - Imagem`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
            )}
            {selectedMedia.type === 'video' && (
              <div className="aspect-video w-full">
                <iframe
                  src={selectedMedia.url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};
