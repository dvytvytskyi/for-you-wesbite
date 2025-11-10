'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { getAreaById, Area as ApiArea } from '@/lib/api';
import styles from './AreaDetail.module.css';

interface AreaDetailData {
  id: string;
  cityId: string;
  nameEn: string;
  nameRu: string;
  nameAr: string;
  description?: {
    title?: string;
    description?: string;
  };
  infrastructure?: {
    title?: string;
    description?: string;
  };
  images?: string[];
  projectsCount?: {
    total: number;
    offPlan: number;
    secondary: number;
  };
}

interface AreaDetailProps {
  slug: string;
}

export default function AreaDetail({ slug }: AreaDetailProps) {
  const t = useTranslations('areaDetail');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [area, setArea] = useState<AreaDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

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
    const loadAreaData = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // Load area data
        const apiArea = await getAreaById(slug);
        
        if (!apiArea) {
          setError('Area not found');
          setLoading(false);
          return;
        }

        // Convert API area to component format
        const areaData: AreaDetailData = {
          id: apiArea.id,
          cityId: apiArea.cityId,
          nameEn: apiArea.nameEn,
          nameRu: apiArea.nameRu,
          nameAr: apiArea.nameAr,
          description: apiArea.description || undefined,
          infrastructure: apiArea.infrastructure || undefined,
          images: apiArea.images || undefined,
          projectsCount: apiArea.projectsCount,
        };

        setArea(areaData);
        setCurrentSlide(0);

        if (process.env.NODE_ENV === 'development') {
          console.log(`Loaded area ${apiArea.nameEn}`);
        }
      } catch (err: any) {
        console.error('Failed to fetch area:', err);
        setError(err.message || 'Failed to load area');
      } finally {
        setLoading(false);
      }
    };

    loadAreaData();
  }, [slug, locale]);

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

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

  const getAreaName = () => {
    if (!area) return '';
    if (locale === 'ru') return area.nameRu;
    if (locale === 'ar') return area.nameAr;
    return area.nameEn;
  };

  if (loading) {
    return (
      <section className={styles.areaDetail}>
        <div className={styles.container}>
          <div className={styles.loading}>{t('loading')}</div>
        </div>
      </section>
    );
  }

  if (error || !area) {
    return (
      <section className={styles.areaDetail}>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <h1>{error || t('notFound')}</h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.areaDetail} ref={sectionRef}>
      <div className={styles.container}>
        {/* Заголовок */}
        <div className={styles.header}>
          <h1 className={styles.title}>{getAreaName()}</h1>
          {area.projectsCount && (
            <div className={styles.projectsCount}>
              <span className={styles.countNumber}>{area.projectsCount.total}</span>
              <span className={styles.countLabel}>{t('projects')}</span>
            </div>
          )}
        </div>

        {/* Галерея зображень - слайд-шоу */}
        {area.images && area.images.length > 0 && (
          <div className={styles.imagesSection}>
            <div className={styles.sliderContainer}>
              <div className={styles.sliderWrapper}>
                <div 
                  className={styles.sliderTrack}
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {area.images.slice(0, 8).map((image, index) => (
                    <div
                      key={index}
                      className={styles.slide}
                      onClick={() => setSelectedImage(image)}
                    >
                      <Image
                        src={image}
                        alt={`${getAreaName()} - Image ${index + 1}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="100vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Навігаційні кнопки */}
              {area.images.length > 1 && (
                <>
                  <button
                    className={`${styles.sliderButton} ${styles.prevButton}`}
                    onClick={() => setCurrentSlide((prev) => 
                      prev === 0 ? area.images!.length - 1 : prev - 1
                    )}
                    aria-label="Previous image"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    className={`${styles.sliderButton} ${styles.nextButton}`}
                    onClick={() => setCurrentSlide((prev) => 
                      prev === area.images!.length - 1 ? 0 : prev + 1
                    )}
                    aria-label="Next image"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  {/* Індикатори слайдів */}
                  <div className={styles.sliderIndicators}>
                    {area.images.slice(0, 8).map((_, index) => (
                      <button
                        key={index}
                        className={`${styles.indicator} ${currentSlide === index ? styles.active : ''}`}
                        onClick={() => setCurrentSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  {/* Счетчик слайдів */}
                  <div className={styles.sliderCounter}>
                    {currentSlide + 1} / {area.images.length}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Опис */}
        {area.description && (
          <div className={styles.descriptionSection}>
            {area.description.title && (
              <h2 className={styles.sectionTitle}>{area.description.title}</h2>
            )}
            {area.description.description && (
              <p className={styles.descriptionText}>{area.description.description}</p>
            )}
          </div>
        )}

        {/* Інфраструктура */}
        {area.infrastructure && (
          <div className={styles.infrastructureSection}>
            {area.infrastructure.title && (
              <h2 className={styles.sectionTitle}>{area.infrastructure.title}</h2>
            )}
            {area.infrastructure.description && (
              <p className={styles.descriptionText}>{area.infrastructure.description}</p>
            )}
          </div>
        )}

        {/* Модальне вікно для зображення */}
        {selectedImage && (
          <div className={styles.imageModal} onClick={() => setSelectedImage(null)}>
            <div className={styles.imageModalContent}>
              <button className={styles.imageModalClose} onClick={() => setSelectedImage(null)}>
                ×
              </button>
              <Image
                src={selectedImage}
                alt={getAreaName()}
                fill
                style={{ objectFit: 'contain' }}
                sizes="90vw"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

