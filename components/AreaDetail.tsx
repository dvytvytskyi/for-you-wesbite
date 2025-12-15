'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getAreaById, Area as ApiArea, getProperties, Property } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
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
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [totalProperties, setTotalProperties] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

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

        // Normalize images to always be an array
        let normalizedImages: string[] = [];
        if (apiArea.images) {
          if (Array.isArray(apiArea.images)) {
            // Already an array - filter valid URLs
            normalizedImages = apiArea.images
              .filter(img => img && typeof img === 'string' && img.trim() !== '')
              .map(img => {
                // Handle comma-separated URLs
                const trimmed = img.trim();
                return trimmed.includes(',') ? trimmed.split(',')[0].trim() : trimmed;
              })
              .filter(img => img && img.startsWith('http'));
          } else if (typeof apiArea.images === 'string') {
            // Single string - check if it contains comma
            const trimmed = apiArea.images.trim();
            if (trimmed.includes(',')) {
              // Split by comma and take first valid URL
              const urls = trimmed.split(',').map(url => url.trim()).filter(url => url && url.startsWith('http'));
              normalizedImages = urls.length > 0 ? [urls[0]] : [];
            } else if (trimmed.startsWith('http')) {
              normalizedImages = [trimmed];
            }
          } else if (typeof apiArea.images === 'object' && apiArea.images !== null) {
            // Try to extract from object
            const imagesValue = (apiArea.images as any).images || (apiArea.images as any).data || apiArea.images;
            if (Array.isArray(imagesValue)) {
              normalizedImages = imagesValue
                .filter(img => img && typeof img === 'string' && img.trim() !== '')
                .map(img => {
                  const trimmed = img.trim();
                  return trimmed.includes(',') ? trimmed.split(',')[0].trim() : trimmed;
                })
                .filter(img => img && img.startsWith('http'));
            } else if (typeof imagesValue === 'string') {
              const trimmed = imagesValue.trim();
              if (trimmed.includes(',')) {
                const urls = trimmed.split(',').map(url => url.trim()).filter(url => url && url.startsWith('http'));
                normalizedImages = urls.length > 0 ? [urls[0]] : [];
              } else if (trimmed.startsWith('http')) {
                normalizedImages = [trimmed];
              }
            }
          }
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
          images: normalizedImages.length > 0 ? normalizedImages : undefined,
          projectsCount: apiArea.projectsCount,
        };

        setArea(areaData);
        setCurrentSlide(0);

        // Load properties for this area - initially load 36 for better performance
        setLoadingProperties(true);
        try {
          const propertiesResult = await getProperties({ areaId: apiArea.id, limit: 36 }, true);
          setProperties(propertiesResult.properties || []);
          setTotalProperties(propertiesResult.total || 0);
        } catch (err) {setProperties([]);
          setTotalProperties(0);
        } finally {
          setLoadingProperties(false);
        }
      } catch (err: any) {setError(err.message || 'Failed to load area');
      } finally {
        setLoading(false);
      }
    };

    loadAreaData();
  }, [slug, locale]);

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const loadMoreProperties = async () => {
    if (!area || loadingMore) return;
    
    setLoadingMore(true);
    try {
      // Load all remaining properties - use totalProperties or a large number
      const limitToLoad = totalProperties > 0 ? totalProperties : 1000;
      const propertiesResult = await getProperties({ 
        areaId: area.id, 
        limit: limitToLoad
      }, true);
      
      // Replace all properties with the full list
      setProperties(propertiesResult.properties || []);
      
      // Update total if we got more accurate count
      if (propertiesResult.total && propertiesResult.total > totalProperties) {
        setTotalProperties(propertiesResult.total);
      }
    } catch (err) {} finally {
      setLoadingMore(false);
    }
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
        {area.images && Array.isArray(area.images) && area.images.length > 0 && (
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
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Навігаційні кнопки */}
              {Array.isArray(area.images) && area.images.length > 1 && (
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

        {/* Список проектів */}
        {properties.length > 0 && (
          <div className={styles.propertiesSection}>
            <h2 className={styles.sectionTitle}>
              {locale === 'ru' ? 'Проекты в этом районе' : 'Properties in this area'}
              {totalProperties > 0 && (
                <span className={styles.propertiesCount}>
                  {' '}({properties.length} {locale === 'ru' ? 'из' : 'of'} {totalProperties})
                </span>
              )}
            </h2>
            <div className={styles.propertiesGrid}>
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
            {totalProperties > properties.length && (
              <div className={styles.loadMoreContainer}>
                <button 
                  className={styles.loadMoreButton}
                  onClick={loadMoreProperties}
                  disabled={loadingMore}
                >
                  {loadingMore 
                    ? (locale === 'ru' ? 'Загрузка...' : 'Loading...')
                    : (locale === 'ru' 
                        ? `Загрузить еще (${totalProperties - properties.length} ${totalProperties - properties.length === 1 ? 'проект' : totalProperties - properties.length < 5 ? 'проекта' : 'проектов'})`
                        : `Load more (${totalProperties - properties.length} ${totalProperties - properties.length === 1 ? 'property' : 'properties'})`
                      )
                  }
                </button>
              </div>
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

