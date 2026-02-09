'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Star, User } from 'lucide-react';
import Link from 'next/link';
import { Review } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { reviewService } from '@/lib/api/reviewService';

interface ReviewCarouselProps {
  title?: string;
  limit?: number;
  className?: string;
}

const MAX_COMMENT_LENGTH = 150;

export const ReviewCarousel = ({ 
  title = 'Avaliações de Clientes',
  limit = 10,
  className = ''
}: ReviewCarouselProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    loop: false,
    dragFree: true,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }
    try {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    } catch (error) {
      console.error('Error checking scroll state:', error);
      setCanScrollPrev(false);
      setCanScrollNext(false);
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }
    
    // Set up event listeners first
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('resize', onSelect);
    emblaApi.on('init', onSelect);
    
    // Initial check after a small delay to ensure DOM is ready
    const checkTimer = setTimeout(() => {
      onSelect();
    }, 100);
    
    return () => {
      clearTimeout(checkTimer);
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
      emblaApi.off('resize', onSelect);
      emblaApi.off('init', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    loadReviews();
  }, []);

  // Re-initialize embla when reviews are loaded
  useEffect(() => {
    if (!emblaApi || reviews.length === 0 || loading) {
      return;
    }
    
    // Wait for DOM to update, then reinitialize
    const timer = setTimeout(() => {
      try {
        const container = emblaApi.containerNode();
        const slides = container.querySelectorAll('.embla__slide');
        
        // Only reInit if we have slides in the DOM
        if (slides.length === 0) {
          console.warn('No slides found in DOM, skipping reInit');
          return;
        }
        
        // Force a layout recalculation before reInit
        void container.offsetHeight;
        
        // Ensure all slides have fixed width (find slides recursively in case of wrapper)
        const allSlides = container.querySelectorAll('.embla__slide');
        allSlides.forEach((slide) => {
          const slideEl = slide as HTMLElement;
          slideEl.style.setProperty('flex', '0 0 280px', 'important');
          slideEl.style.setProperty('min-width', '280px', 'important');
          slideEl.style.setProperty('max-width', '280px', 'important');
          slideEl.style.setProperty('width', '280px', 'important');
          slideEl.style.setProperty('flex-shrink', '0', 'important');
        });
        
        // Reinitialize embla
        emblaApi.reInit();
        
        // Wait for embla to process and then check
        const checkAfterReInit = () => {
          const slideNodes = emblaApi.slideNodes();
          const containerAfter = emblaApi.containerNode();
          const canPrev = emblaApi.canScrollPrev();
          const canNext = emblaApi.canScrollNext();
          
          // Force recalculation by checking widths
          const firstSlideWidth = slideNodes[0]?.getBoundingClientRect().width || 0;
          const expectedWidth = slideNodes.length * 280; // 280px per slide + padding
          
          console.log('After reInit:', {
            slideNodesLength: slideNodes.length,
            containerScrollWidth: containerAfter.scrollWidth,
            containerClientWidth: containerAfter.clientWidth,
            canPrev,
            canNext,
            firstSlideWidth,
            expectedTotalWidth: expectedWidth,
            containerDirectChildren: containerAfter.children.length
          });
          
          // Check if we have a wrapper issue (slideNodesLength is 1 but scrollWidth suggests more content)
          const hasWrapperIssue = slideNodes.length === 1 && containerAfter.scrollWidth > containerAfter.clientWidth;
          
          if (hasWrapperIssue) {
            console.warn('Wrapper issue detected: slideNodesLength is 1 but scrollWidth > clientWidth');
            // The wrapper itself needs to be treated as a slide, or we need to unwrap
            // For now, let's try to make the wrapper work with Embla by ensuring it has proper width
            const wrapper = slideNodes[0] as HTMLElement;
            if (wrapper && wrapper.children.length > 0) {
              // Calculate total width needed
              const totalSlides = wrapper.querySelectorAll('.embla__slide').length;
              const totalWidth = totalSlides * 280; // 280px per slide
              
              // Make wrapper behave like a slide for Embla
              wrapper.style.setProperty('width', `${totalWidth}px`, 'important');
              wrapper.style.setProperty('flex', `0 0 ${totalWidth}px`, 'important');
              wrapper.style.setProperty('min-width', `${totalWidth}px`, 'important');
              wrapper.style.setProperty('max-width', `${totalWidth}px`, 'important');
              wrapper.style.setProperty('flex-shrink', '0', 'important');
              wrapper.style.setProperty('display', 'flex', 'important');
              wrapper.style.setProperty('flex-wrap', 'nowrap', 'important');
              
              // Also ensure all slides inside wrapper maintain width
              const slidesInWrapper = wrapper.querySelectorAll('.embla__slide');
              slidesInWrapper.forEach((slide) => {
                const slideEl = slide as HTMLElement;
                slideEl.style.setProperty('flex', '0 0 280px', 'important');
                slideEl.style.setProperty('min-width', '280px', 'important');
                slideEl.style.setProperty('max-width', '280px', 'important');
                slideEl.style.setProperty('width', '280px', 'important');
                slideEl.style.setProperty('flex-shrink', '0', 'important');
              });
              
              // Force layout recalculation
              void containerAfter.offsetHeight;
              void containerAfter.scrollWidth;
              
              // Manually check if we can scroll based on scrollWidth vs clientWidth
              const canScroll = containerAfter.scrollWidth > containerAfter.clientWidth;
              const scrollLeft = containerAfter.scrollLeft;
              const maxScrollLeft = containerAfter.scrollWidth - containerAfter.clientWidth;
              
              // Set scroll state manually since Embla doesn't detect it
              setCanScrollPrev(scrollLeft > 0);
              setCanScrollNext(scrollLeft < maxScrollLeft);
              
              console.log('After wrapper fix:', {
                canPrev: scrollLeft > 0,
                canNext: scrollLeft < maxScrollLeft,
                scrollWidth: containerAfter.scrollWidth,
                clientWidth: containerAfter.clientWidth,
                scrollLeft,
                maxScrollLeft,
                difference: containerAfter.scrollWidth - containerAfter.clientWidth
              });
              
              // ReInit after a delay to see if Embla picks it up
              setTimeout(() => {
                emblaApi.reInit();
                const newCanPrev = emblaApi.canScrollPrev();
                const newCanNext = emblaApi.canScrollNext();
                const newContainer = emblaApi.containerNode();
                const newScrollLeft = newContainer.scrollLeft;
                const newMaxScrollLeft = newContainer.scrollWidth - newContainer.clientWidth;
                
                // Use manual calculation if Embla still doesn't detect it
                const manualCanPrev = newScrollLeft > 0;
                const manualCanNext = newScrollLeft < newMaxScrollLeft;
                
                setCanScrollPrev(newCanPrev || manualCanPrev);
                setCanScrollNext(newCanNext || manualCanNext);
                
                console.log('After reInit:', {
                  emblaCanPrev: newCanPrev,
                  emblaCanNext: newCanNext,
                  manualCanPrev,
                  manualCanNext,
                  scrollWidth: newContainer.scrollWidth,
                  clientWidth: newContainer.clientWidth,
                  scrollLeft: newScrollLeft,
                  maxScrollLeft: newMaxScrollLeft
                });
              }, 100);
            } else {
              setCanScrollPrev(canPrev);
              setCanScrollNext(canNext);
            }
          } else if (containerAfter.scrollWidth === containerAfter.clientWidth && slideNodes.length > 1) {
            console.warn('Slides compressed, forcing recalculation');
            // Force each slide to maintain width
            slideNodes.forEach((slide) => {
              const slideEl = slide as HTMLElement;
              slideEl.style.setProperty('flex', '0 0 280px', 'important');
              slideEl.style.setProperty('min-width', '280px', 'important');
              slideEl.style.setProperty('max-width', '280px', 'important');
              slideEl.style.setProperty('width', '280px', 'important');
              slideEl.style.setProperty('flex-shrink', '0', 'important');
            });
            
            // Force layout recalculation
            void containerAfter.offsetHeight;
            void containerAfter.scrollWidth;
            
            // ReInit after a delay
            setTimeout(() => {
              emblaApi.reInit();
              const newCanPrev = emblaApi.canScrollPrev();
              const newCanNext = emblaApi.canScrollNext();
              const newContainer = emblaApi.containerNode();
              setCanScrollPrev(newCanPrev);
              setCanScrollNext(newCanNext);
              console.log('After forced recalculation:', {
                canPrev: newCanPrev,
                canNext: newCanNext,
                scrollWidth: newContainer.scrollWidth,
                clientWidth: newContainer.clientWidth,
                difference: newContainer.scrollWidth - newContainer.clientWidth
              });
            }, 50);
          } else {
            setCanScrollPrev(canPrev);
            setCanScrollNext(canNext);
          }
        };
        
        // Check after reInit
        setTimeout(checkAfterReInit, 100);
      } catch (error) {
        console.error('Error reinitializing embla:', error);
      }
    }, 600);
    
    return () => clearTimeout(timer);
  }, [emblaApi, reviews.length, loading]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getApproved(limit);
      if (response.success && Array.isArray(response.data)) {
        setReviews(response.data);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollPrev = useCallback(() => {
    if (!emblaApi) {
      console.warn('Embla API not ready for scrollPrev');
      return;
    }
    try {
      const container = emblaApi.containerNode();
      const currentScroll = container.scrollLeft;
      const slideWidth = 280; // Width of each slide
      const newScroll = Math.max(0, currentScroll - slideWidth);
      
      // Try Embla's scrollPrev first
      if (emblaApi.canScrollPrev()) {
        emblaApi.scrollPrev();
      } else {
        // Fallback to manual scroll if Embla doesn't detect it
        container.scrollTo({ left: newScroll, behavior: 'smooth' });
        // Update state after scroll
        setTimeout(() => {
          const newScrollLeft = container.scrollLeft;
          const maxScrollLeft = container.scrollWidth - container.clientWidth;
          setCanScrollPrev(newScrollLeft > 0);
          setCanScrollNext(newScrollLeft < maxScrollLeft);
        }, 100);
      }
    } catch (error) {
      console.error('Error scrolling prev:', error);
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) {
      console.warn('Embla API not ready for scrollNext');
      return;
    }
    try {
      const container = emblaApi.containerNode();
      const currentScroll = container.scrollLeft;
      const slideWidth = 280; // Width of each slide
      const maxScroll = container.scrollWidth - container.clientWidth;
      const newScroll = Math.min(maxScroll, currentScroll + slideWidth);
      
      // Try Embla's scrollNext first
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        // Fallback to manual scroll if Embla doesn't detect it
        container.scrollTo({ left: newScroll, behavior: 'smooth' });
        // Update state after scroll
        setTimeout(() => {
          const newScrollLeft = container.scrollLeft;
          const maxScrollLeft = container.scrollWidth - container.clientWidth;
          setCanScrollPrev(newScrollLeft > 0);
          setCanScrollNext(newScrollLeft < maxScrollLeft);
        }, 100);
      }
    } catch (error) {
      console.error('Error scrolling next:', error);
    }
  }, [emblaApi]);

  const truncateComment = (comment: string): string => {
    if (comment.length <= MAX_COMMENT_LENGTH) return comment;
    return comment.substring(0, MAX_COMMENT_LENGTH).trim() + '...';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className={className}>
        {title && <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {title && <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>}
      <div className="relative" style={{ minHeight: '400px', paddingLeft: '3rem', paddingRight: '3rem' }}>
        <div className="embla" ref={emblaRef}>
          <div className="embla__viewport">
            <div className="embla__container">
              {reviews.map((review) => (
                <div key={review.id} className="embla__slide" style={{ flex: '0 0 280px', minWidth: '280px', maxWidth: '280px', width: '280px' }}>
                  <Link href={`/fornecedores/${review.supplier_id}`} className="h-full block">
                    <Card className="h-full min-h-[380px] hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
                      <CardHeader className="flex-shrink-0">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {review.user_name || 'Cliente'}
                            </p>
                            {review.supplier_name && (
                              <p className="text-sm text-gray-500 truncate">
                                {review.supplier_name}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col">
                        <p className="text-sm text-gray-700 line-clamp-4 flex-grow">
                          {truncateComment(review.comment)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {reviews.length > 0 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Prev clicked', { emblaApi: !!emblaApi, canScrollPrev, reviewsLength: reviews.length });
                scrollPrev();
              }}
              type="button"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              style={{ left: '0.5rem', cursor: 'pointer' }}
              aria-label="Previous reviews"
            >
              <ChevronLeft className={`w-6 h-6 ${canScrollPrev ? 'text-gray-700' : 'text-gray-300'}`} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Next clicked', { emblaApi: !!emblaApi, canScrollNext, reviewsLength: reviews.length });
                scrollNext();
              }}
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              style={{ right: '0.5rem', cursor: 'pointer' }}
              aria-label="Next reviews"
            >
              <ChevronRight className={`w-6 h-6 ${canScrollNext ? 'text-gray-700' : 'text-gray-300'}`} />
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        .embla {
          overflow: hidden;
        }
        .embla__viewport {
          overflow: hidden;
        }
        .embla__container {
          display: flex !important;
          touch-action: pan-y pinch-zoom;
          user-select: none;
          margin-left: 0 !important;
          margin-right: 0 !important;
          will-change: transform;
          flex-wrap: nowrap !important;
        }
        .embla__slide {
          flex: 0 0 280px !important;
          min-width: 280px !important;
          max-width: 280px !important;
          width: 280px !important;
          padding-right: 1rem;
          position: relative;
          box-sizing: border-box;
          flex-shrink: 0 !important;
        }
      `}</style>
    </div>
  );
};

