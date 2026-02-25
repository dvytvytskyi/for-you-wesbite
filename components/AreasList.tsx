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
  slug: string;
  name: string;
  nameRu: string;
  projectsCount: number;
  image: string;
  city?: string;
  cityRu?: string;
}

const ITEMS_PER_PAGE = 20;



interface AreaCardProps {
  area: Area;
  getLocalizedPath: (path: string) => string;
  getAreaName: (area: Area) => string;
  getCityName: (area: Area) => string;
  t: any;
}

function AreaCard({ area, getLocalizedPath, getAreaName, getCityName, t }: AreaCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Clean the image URL
  const imageUrl = (() => {
    let src = area.image;
    if (!src || typeof src !== 'string' || src.trim() === '' || src.includes('golf.jpg')) {
      return 'https://res.cloudinary.com/dgv0rxd60/image/upload/f_auto,q_auto:eco,w_800/v1768389724/golf.jpg';
    }
    src = src.trim();
    if (src.includes(',')) {
      src = src.split(',')[0].trim();
    }
    return src;
  })();

  return (
    <Link
      href={getLocalizedPath(`/areas/${area.slug}`)}
      className={styles.card}
    >
      <div className={styles.cardImage}>
        {isImageLoading && (
          <div className={styles.imageSkeleton}></div>
        )}
        <Image
          src={imageUrl}
          alt={getAreaName(area)}
          fill
          style={{
            objectFit: 'cover',
            opacity: isImageLoading ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}
          sizes="(max-width: 1200px) 50vw, (max-width: 900px) 100vw, 33vw"
          loading="lazy"
          unoptimized={imageUrl.startsWith('http')}
          onLoad={() => setIsImageLoading(false)}
          onError={() => {
            setIsImageLoading(false);
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
            <path d="M9 5L16 12L9 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

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
        // The backend now filters the list to the approved 59 areas, 
        // so we can use the API response directly.
        const convertedAreas: Area[] = apiAreas.map(area => {
          // Get first valid image URL or use fallback
          let imageUrl = 'https://res.cloudinary.com/dgv0rxd60/image/upload/f_auto,q_auto:eco,w_800/v1768389724/golf.jpg';

          if (area.images && Array.isArray(area.images) && area.images.length > 0) {
            // Use the first image if it starts with http
            const firstImg = area.images[0];
            if (typeof firstImg === 'string') {
              imageUrl = firstImg;
            }
          }

          return {
            id: area.id,
            slug: area.slug,
            name: area.nameEn,
            nameRu: area.nameRu,
            projectsCount: area.projectsCount?.total || 0,
            image: imageUrl,
            city: area.city?.nameEn || '',
            cityRu: area.city?.nameRu || '',
          };
        });

        setAllAreas(convertedAreas);

        // REMOVED: Too much logging slows down the site
      } catch (err: any) {
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

  const getLocalizedPath = useCallback((path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  }, [locale]);

  const getAreaName = useCallback((area: Area) => {
    return locale === 'ru' ? area.nameRu : area.name;
  }, [locale]);

  const getCityName = useCallback((area: Area) => {
    if (area.city && area.cityRu) {
      return locale === 'ru' ? area.cityRu : area.city;
    }
    return '';
  }, [locale]);

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
              {areas.map((area) => (
                <AreaCard
                  key={area.id}
                  area={area}
                  getLocalizedPath={getLocalizedPath}
                  getAreaName={getAreaName}
                  getCityName={getCityName}
                  t={t}
                />
              ))}
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

