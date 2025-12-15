'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAreas, Area as ApiArea } from '@/lib/api';
import styles from './AreasList.module.css';
import AreaCardSkeleton from '@/components/AreaCardSkeleton';

interface Area {
  id: string;
  name: string;
  nameRu: string;
  projectsCount: number;
  image: string;
  city?: string;
  cityRu?: string;
}

const ITEMS_PER_PAGE = 20;

// List of allowed areas (43 areas from areas.json)
const ALLOWED_AREAS = [
  'Al Barari',
  'Al Furjan',
  'Arjan',
  'Business Bay',
  'Cherrywoods',
  'City of Arabia',
  'Damac Hills',
  'Damac Hills 2',
  'Damac Lagoons',
  'Discovery Gardens',
  'Downtown Dubai',
  'Dubai Creek Harbour',
  'Dubai Harbour',
  'Dubai Hills',
  'Dubai Industrial City',
  'Dubai Internet City',
  'Dubai Investment Park',
  'Dubai Islands',
  'Dubai Marina',
  'Dubai Media City',
  'Dubai Production City',
  'Dubai Science Park',
  'Dubai Silicon Oasis',
  'Dubai Sports City',
  'Dubai Studio City',
  'International City',
  'Jumeirah',
  'Jumeirah Lake Towers (JLT)',
  'Jumeirah Village Circle (JVC)',
  'Jumeirah Village Triangle (JVT)',
  'Majan',
  'Mina Rashid',
  'Mohammed Bin Rashid City (MBR)',
  'Motor City',
  'Palm Jumeirah',
  'Sobha Hartland',
  'Tilal Al Ghaf',
  'Town Square',
  'Wadi Al Safa 4',
  'Wadi Al Safa 5',
  'Wadi Al Safa 7',
];

export default function AreasList() {
  const t = useTranslations('areas');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [allAreas, setAllAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagesLoading, setImagesLoading] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set()); // Track failed image loads
  
  // Initialize all images as loading
  useEffect(() => {
    if (allAreas.length > 0) {
      setImagesLoading(new Set(allAreas.map(area => area.id)));
    }
  }, [allAreas]);
  
  // Get current page from URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const totalPages = Math.ceil(allAreas.length / ITEMS_PER_PAGE);
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  
  // Get areas for current page
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const areas = allAreas.slice(startIndex, endIndex);

  useEffect(() => {
    const loadAreas = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiAreas = await getAreas();
        
        
        // Convert API areas to component format
        // Filter to only show allowed areas with valid images
        const convertedAreas: Area[] = apiAreas
          .filter(area => {
            const areaName = (area.nameEn || '').trim();
            
            // Filter by allowed areas list (case-insensitive, flexible matching)
            let isAllowed = false;
            let matchedAllowedName = '';
            
            for (const allowed of ALLOWED_AREAS) {
              const allowedLower = allowed.toLowerCase().trim();
              const areaLower = areaName.toLowerCase().trim();
              
              // Exact match
              if (allowedLower === areaLower) {
                isAllowed = true;
                matchedAllowedName = allowed;
                break;
              }
              
              // Check if area name contains allowed name or vice versa (for longer names)
              if (allowedLower.length > 5 && areaLower.length > 5) {
                if (allowedLower.includes(areaLower) || areaLower.includes(allowedLower)) {
                  isAllowed = true;
                  matchedAllowedName = allowed;
                  break;
                }
              }
              
              // Also check if area name starts with allowed name (for cases like "Dubai Marina" matching "Marina")
              if (areaLower.startsWith(allowedLower) || allowedLower.startsWith(areaLower)) {
                isAllowed = true;
                matchedAllowedName = allowed;
                break;
              }
            }
            
            if (!isAllowed) {
              return false;
            }
            
            // Filter out areas with 0 projects
            const projectsCount = area.projectsCount?.total || 0;
            if (projectsCount === 0) {
              return false;
            }
            
            // Allow areas even without images - we'll use fallback
            return true;
          })
          .map(area => {
            // Get first valid image URL or use fallback
            let imageUrl = '/golf.jpg'; // Default fallback image
            
            // Handle images - can be array, string, or null
            let imagesArray: string[] = [];
            
            // Debug: log raw images data for areas that will use fallback (only in dev, and only for first few)
            // REMOVED: Too much logging slows down the site
            
            if (area.images) {
              if (Array.isArray(area.images)) {
                // Already an array - filter valid URLs
                imagesArray = area.images
                  .filter(img => img && typeof img === 'string' && img.trim() !== '')
                  .map(img => {
                    // Even if it's in array, check if individual item contains comma
                    const trimmed = img.trim();
                    return trimmed.includes(',') ? trimmed.split(',')[0].trim() : trimmed;
                  })
                  .filter(img => img && img.startsWith('http'));
              } else if (typeof area.images === 'string') {
                // Single string - convert to array
                const trimmed = area.images.trim();
                if (trimmed === '') {
                  imagesArray = [];
                } else if (trimmed.includes(',')) {
                  // CRITICAL: Split by comma and take only first valid URL
                  const urls = trimmed.split(',').map(url => url.trim()).filter(url => url && url.startsWith('http'));
                  imagesArray = urls.length > 0 ? [urls[0]] : []; // Take only first URL
                  // REMOVED: Too much logging
                } else {
                  // Single URL
                  if (trimmed.startsWith('http')) {
                    imagesArray = [trimmed];
                  } else {
                    imagesArray = [];
                  }
                }
              } else if (typeof area.images === 'object' && area.images !== null) {
                // Try to extract from object (in case it's wrapped)
                const imagesValue = (area.images as any).images || (area.images as any).data || (area.images as any).url || area.images;
                
                // Check if imagesValue is null or undefined
                if (imagesValue === null || imagesValue === undefined) {
                  imagesArray = [];
                } else if (Array.isArray(imagesValue)) {
                  // Array from object
                  imagesArray = imagesValue
                    .filter(img => img && typeof img === 'string' && img.trim() !== '')
                    .map(img => {
                      const trimmed = img.trim();
                      return trimmed.includes(',') ? trimmed.split(',')[0].trim() : trimmed;
                    })
                    .filter(img => img && img.startsWith('http'));
                } else if (typeof imagesValue === 'string') {
                  // String from object - handle comma-separated URLs
                  const trimmed = imagesValue.trim();
                  if (trimmed === '') {
                    imagesArray = [];
                  } else if (trimmed.includes(',')) {
                    const urls = trimmed.split(',').map(url => url.trim()).filter(url => url && url.startsWith('http'));
                    imagesArray = urls.length > 0 ? [urls[0]] : []; // Take only first URL
                  } else {
                    if (trimmed.startsWith('http')) {
                      imagesArray = [trimmed];
                    } else {
                      imagesArray = [];
                    }
                  }
                } else {
                  // Unknown format
                  imagesArray = [];
                }
              }
            }
            
            const hasImages = imagesArray.length > 0;
            if (hasImages) {
              // Find first valid image (not placeholder)
              for (const img of imagesArray) {
                if (img && typeof img === 'string') {
                  const cleanImg = img.trim();
                  if (cleanImg === '') continue;
                  
                  // If image contains comma, take only first part
                  const singleImg = cleanImg.includes(',') ? cleanImg.split(',')[0].trim() : cleanImg;
                  
                  // Check if image is placeholder
                  const isPlaceholder = singleImg.includes('unsplash.com') ||
                    singleImg.includes('placeholder') ||
                    singleImg.includes('via.placeholder.com') ||
                    singleImg.includes('dummyimage.com') ||
                    singleImg.includes('placehold.it') ||
                    singleImg.includes('fakeimg.pl');
                  
                  // Check if URL is valid
                  const isValidUrl = singleImg.startsWith('http://') || singleImg.startsWith('https://');
                  
                  if (!isPlaceholder && isValidUrl) {
                    imageUrl = singleImg;
                    break; // Use first valid image
                  }
                }
              }
              
              // REMOVED: Too much logging slows down the site
            }
            // REMOVED: Too much logging slows down the site
            
            // Always ensure we have a valid image URL (fallback to /golf.jpg)
            if (!imageUrl || imageUrl.trim() === '' || imageUrl === '/golf.jpg') {
              imageUrl = '/golf.jpg';
            } else {
              // CRITICAL FIX: If imageUrl contains comma (multiple URLs), take only the first one
              // This can happen if area.images is an array that gets stringified incorrectly
              if (imageUrl.includes(',')) {
                const firstUrl = imageUrl.split(',')[0].trim();
                // REMOVED: Too much logging
                imageUrl = firstUrl;
              }
              
              // Ensure it's a single string, not an array
              if (Array.isArray(imageUrl)) {
                imageUrl = imageUrl[0] || '/golf.jpg';
              }
              
              // Remove any whitespace
              if (typeof imageUrl === 'string') {
                imageUrl = imageUrl.trim();
              }
              
              // Final validation: must be a valid URL string
              if (typeof imageUrl !== 'string' || (!imageUrl.startsWith('http') && imageUrl !== '/golf.jpg')) {
                // REMOVED: Too much logging
                imageUrl = '/golf.jpg';
              }
            }
            
            // Final safety check: ensure image is always a clean string
            if (typeof imageUrl !== 'string') {
              imageUrl = '/golf.jpg';
            }
            
            return {
              id: area.id,
              name: area.nameEn,
              nameRu: area.nameRu,
              projectsCount: area.projectsCount.total,
              image: imageUrl, // Always valid - single URL string, no commas
              city: area.city.nameEn,
              cityRu: area.city.nameRu,
            };
          });
        
        setAllAreas(convertedAreas);
        
            // REMOVED: Too much logging slows down the site
      } catch (err: any) {setError(err.message || 'Failed to load areas');
      } finally {
        setLoading(false);
      }
    };
    
    loadAreas();
  }, []);
  
  // Update URL when page changes
  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete('page');
    } else {
      params.set('page', newPage.toString());
    }
    
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    
    router.replace(newUrl, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, router]);
  
  // Ensure page is valid when areas change
  useEffect(() => {
    if (allAreas.length > 0 && validPage > totalPages && totalPages > 0) {
      handlePageChange(1);
    }
  }, [allAreas.length, validPage, totalPages, handlePageChange]);

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const getAreaName = (area: Area) => {
    return locale === 'ru' ? area.nameRu : area.name;
  };

  const getCityName = (area: Area) => {
    if (area.city && area.cityRu) {
      return locale === 'ru' ? area.cityRu : area.city;
    }
    return '';
  };

  // Прибираємо автоматичне прокручування при завантаженні сторінки
  useEffect(() => {
    // Вимикаємо scroll restoration в Next.js
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    // Скролимо вгору при монтуванні компонента
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Також перевіряємо, чи немає hash в URL
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <section className={styles.areasList}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <AreaCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.areasList}>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.areasList} ref={sectionRef}>
      <div className={styles.container}>
        {areas.length > 0 ? (
          <>
            <div className={styles.grid}>
              {areas
                .map((area) => {
                const isImageLoading = imagesLoading.has(area.id);
                
                return (
                  <Link
                    key={area.id}
                    href={getLocalizedPath(`/areas/${area.id}`)}
                    className={styles.card}
                  >
                    <div className={styles.cardImage}>
                      {isImageLoading && (
                        <div className={styles.imageSkeleton}></div>
                      )}
                      <Image
                          src={(() => {
                            // Ensure we always use a single URL, never multiple URLs with comma
                            let src = area.image;
                            
                            // If area.image is not set or empty, use fallback
                            if (!src || typeof src !== 'string' || src.trim() === '' || src === '/golf.jpg') {
                              src = '/golf.jpg';
                            } else {
                              // Clean the URL
                              src = src.trim();
                              
                              // If somehow src still contains comma, take first URL
                              if (src.includes(',')) {
                                src = src.split(',')[0].trim();
                              }
                              
                              // Validate URL is complete and valid
                              if (src !== '/golf.jpg') {
                                // Check if URL is complete (ends with image extension or is a valid URL)
                                const isValidUrl = src.startsWith('http://') || src.startsWith('https://');
                                
                                if (!isValidUrl) {
                                  src = '/golf.jpg';
                                }
                              }
                            }
                            
                            // Final validation before returning
                            if (src !== '/golf.jpg' && (!src.startsWith('http') || src.length < 10)) {
                              src = '/golf.jpg';
                            }
                            
                            return src;
                          })()}
                        alt={getAreaName(area)}
                        fill
                        style={{ objectFit: 'cover', opacity: isImageLoading ? 0 : 1, transition: 'opacity 0.3s ease' }}
                        sizes="(max-width: 1200px) 50vw, (max-width: 900px) 100vw, 33vw"
                        loading="lazy"
                        unoptimized={(() => {
                          // Use unoptimized for external images that might not be in remotePatterns
                          const src = area.image;
                          if (!src || src === '/golf.jpg' || !src.startsWith('http')) {
                            return false; // Local images can be optimized
                          }
                          // For external images, use unoptimized to ensure they load
                          return true;
                        })()}
                        onLoad={() => {
                          setImagesLoading(prev => {
                            const next = new Set(prev);
                            next.delete(area.id);
                            return next;
                          });
                        }}
                        onError={(e) => {
                            // If image fails to load, force fallback
                            const target = e.target as HTMLImageElement;
                            
                            if (target && target.src !== `${window.location.origin}/golf.jpg`) {
                              target.src = '/golf.jpg';
                              // Also update the area's image in state to prevent retries
                              setAllAreas(prev => prev.map(a => 
                                a.id === area.id ? { ...a, image: '/golf.jpg' } : a
                              ));
                            }
                          setImagesLoading(prev => {
                            const next = new Set(prev);
                            next.delete(area.id);
                            return next;
                          });
                        }}
                      />
                      <div className={styles.cardOverlayTop}></div>
                      <div className={styles.cardOverlayBottom}></div>
                      <div className={styles.cardContent}>
                        <h3 className={styles.cardTitle}>{getAreaName(area)}</h3>
                        {getCityName(area) && (
                          <p className={styles.cardCity}>{getCityName(area)}</p>
                        )}
                        <div className={styles.cardInfo}>
                          <span className={styles.projectsCount}>{area.projectsCount}</span>
                          <span className={styles.projectsLabel}>{t('projects')}</span>
                        </div>
                      </div>
                      <div className={styles.cardArrow}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 5L16 12L9 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  onClick={() => handlePageChange(validPage - 1)}
                  disabled={validPage === 1}
                >
                  {t('previous') || 'Previous'}
                </button>
                <div className={styles.paginationNumbers}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= validPage - 2 && page <= validPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`${styles.paginationNumber} ${validPage === page ? styles.active : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === validPage - 3 || page === validPage + 3) {
                      return <span key={page} className={styles.paginationEllipsis}>...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  className={styles.paginationButton}
                  onClick={() => handlePageChange(validPage + 1)}
                  disabled={validPage >= totalPages}
                >
                  {t('next') || 'Next'}
                </button>
              </div>
            )}
          </>
        ) : !loading && (
          <div className={styles.noAreas}>
            {t('noAreas')}
          </div>
        )}
      </div>
    </section>
  );
}

