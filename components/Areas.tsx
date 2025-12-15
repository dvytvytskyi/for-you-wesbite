'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import styles from './Areas.module.css';
import { getAreas, Area as ApiArea } from '@/lib/api';

interface Area {
  id: string;
  name: string;
  nameRu: string;
  projectsCount: number;
  image: string;
}

// Number of top areas to display on home page
const TOP_AREAS_COUNT = 10;

export default function Areas() {
  const t = useTranslations('areas');
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardsWrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set()); // Track failed image loads

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const getAreaName = (area: Area) => {
    return locale === 'ru' ? area.nameRu : area.name;
  };

  // Load top 10 areas from Dubai - similar to /areas page
  useEffect(() => {
    const loadAreas = async () => {
      setLoading(true);
      try {
        const apiAreas = await getAreas(undefined, true); // Використовуємо кеш
        
        // Filter Dubai areas, sort by projectsCount, and take top 10
        const convertedAreas: Area[] = apiAreas
          .filter((apiArea: ApiArea) => {
            // Filter for Dubai areas only
            const isDubai = apiArea.city?.nameEn?.toLowerCase() === 'dubai' || 
                           apiArea.city?.nameRu?.toLowerCase() === 'дубай';
            if (!isDubai) {
              return false;
            }
            
            // Filter out areas with 0 projects
            const projectsCount = apiArea.projectsCount?.total || 0;
            if (projectsCount === 0) {
              return false;
            }
            
            return true;
          })
          .map((apiArea: ApiArea) => {
            // Use actual image if available and valid, otherwise use fallback
            let imageUrl = '/golf.jpg'; // Default fallback image
            const hasImages = apiArea.images && Array.isArray(apiArea.images) && apiArea.images.length > 0;
            const firstImage = hasImages ? apiArea.images[0] : null;

            if (firstImage && typeof firstImage === 'string' && firstImage.trim() !== '') {
              const isPlaceholder = firstImage.includes('unsplash.com') ||
                firstImage.includes('placeholder') ||
                firstImage.includes('via.placeholder.com') ||
                firstImage.includes('dummyimage.com') ||
                firstImage.includes('placehold.it') ||
                firstImage.includes('fakeimg.pl');

              const isValidUrl = firstImage.startsWith('http://') || firstImage.startsWith('https://');

              if (!isPlaceholder && isValidUrl) {
                imageUrl = firstImage;
              }
            }
            
            // Generate slug from nameEn
            const slug = (apiArea.nameEn || '')
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '');
            
            return {
              id: slug || apiArea.id,
              name: apiArea.nameEn || '',
              nameRu: apiArea.nameRu || apiArea.nameEn || '',
              projectsCount: apiArea.projectsCount?.total || 0,
              image: imageUrl, // Can be fallback or real image
            };
          })
          .sort((a, b) => {
            // Sort by projectsCount descending
            return b.projectsCount - a.projectsCount;
          })
          .slice(0, TOP_AREAS_COUNT); // Take top 10
        
        setAreas(convertedAreas);
        
        } catch (error) {setAreas([]);
      } finally {
        setLoading(false);
      }
    };

    loadAreas();
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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current && cardsWrapperRef.current) {
      const firstCard = cardsWrapperRef.current.firstElementChild as HTMLElement;
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth;
        const gap = 24; // gap between cards
        const scrollAmount = cardWidth + gap;
        
        scrollRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <section className={styles.areas} ref={sectionRef}>
      <div className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('title')}</h2>
          <div className={styles.descriptionWrapper}>
            <p className={styles.description}>{t('description')}</p>
            <div className={styles.scrollButtons}>
              <button 
                className={`${styles.scrollButton} ${styles.left}`}
                onClick={() => scroll('left')}
                aria-label="Scroll left"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className={`${styles.scrollButton} ${styles.right}`}
                onClick={() => scroll('right')}
                aria-label="Scroll right"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.scrollWrapper}>
          <div className={styles.scrollContainer} ref={scrollRef}>
            <div className={styles.cardsWrapper} ref={cardsWrapperRef}>
              {loading ? (
                <div className={styles.loading}>Loading areas...</div>
              ) : areas.length === 0 ? (
                <div className={styles.noAreas}>No areas found</div>
              ) : (
                areas.map((area) => {
                    return (
                      <Link
                        key={area.id}
                        href={getLocalizedPath(`/areas/${area.id}`)}
                        className={styles.card}
                      >
                        <div className={styles.cardImage}>
                          <Image
                            src={area.image}
                            alt={getAreaName(area)}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 1200px) 33vw, (max-width: 900px) 50vw, 25vw"
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
                            onError={() => {
                              // If image fails to load (even fallback), log it but don't hide the card
                              if (process.env.NODE_ENV === 'development') {
                              }
                              // No need to add to failedImages, as we now use a fallback
                            }}
                          />
                          <div className={styles.cardOverlay}></div>
                          <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>{getAreaName(area)}</h3>
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
                  })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

