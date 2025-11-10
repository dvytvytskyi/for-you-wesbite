'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAreas, Area as ApiArea } from '@/lib/api';
import styles from './AreasList.module.css';
import AreaCardSkeleton from './AreaCardSkeleton';

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
        const convertedAreas: Area[] = apiAreas.map(area => {
          const hasImages = area.images && area.images.length > 0;
          const imageUrl = hasImages 
            ? area.images[0] 
            : 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop';
          
          if (process.env.NODE_ENV === 'development' && !hasImages) {
            console.warn(`⚠️ Area ${area.nameEn} (${area.id}) has no images`);
          }
          
          return {
            id: area.id,
            name: area.nameEn,
            nameRu: area.nameRu,
            projectsCount: area.projectsCount.total,
            image: imageUrl,
            city: area.city.nameEn,
            cityRu: area.city.nameRu,
          };
        });
        
        setAllAreas(convertedAreas);
        
        if (process.env.NODE_ENV === 'development') {
          const areasWithImages = convertedAreas.filter(a => 
            !a.image.includes('unsplash.com')
          ).length;
          console.log(`Loaded ${convertedAreas.length} areas, ${areasWithImages} with real images`);
        }
      } catch (err: any) {
        console.error('Failed to fetch areas:', err);
        setError(err.message || 'Failed to load areas');
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
              {areas.map((area) => {
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
                        src={area.image}
                        alt={getAreaName(area)}
                        fill
                        style={{ objectFit: 'cover', opacity: isImageLoading ? 0 : 1, transition: 'opacity 0.3s ease' }}
                        sizes="(max-width: 1200px) 50vw, (max-width: 900px) 100vw, 33vw"
                        onLoad={() => {
                          setImagesLoading(prev => {
                            const next = new Set(prev);
                            next.delete(area.id);
                            return next;
                          });
                        }}
                        onError={() => {
                          setImagesLoading(prev => {
                            const next = new Set(prev);
                            next.delete(area.id);
                            return next;
                          });
                        }}
                        onLoadingComplete={() => {
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

