'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { getDevelopers, Developer as ApiDeveloper } from '@/lib/api';
import styles from './DevelopersList.module.css';

interface Developer {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  images: string[] | null;
  projectsCount: number;
  createdAt?: string;
}

export default function DevelopersList() {
  const t = useTranslations('developers');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadDevelopers = async () => {
      setLoading(true);
      setError(null);
      try {const apiDevelopers = await getDevelopers();if (!Array.isArray(apiDevelopers)) {setError('Invalid data format from API');
          setLoading(false);
          return;
        }
        
        // Convert API developers to component format
        const convertedDevelopers: Developer[] = apiDevelopers.map(dev => {
          // Get description text (can be from description.description or description.title)
          const descriptionText = dev.description 
            ? (dev.description.description || dev.description.title || null)
            : null;
          
          return {
            id: dev.id,
            name: dev.name,
            logo: dev.logo,
            description: descriptionText,
            images: dev.images,
            projectsCount: dev.projectsCount?.total || 0,
            createdAt: dev.createdAt,
          };
        });
        
        // Filter out developers without logos
        const developersWithLogos = convertedDevelopers.filter(dev => {
          return dev.logo && dev.logo.trim() !== '';
        });
        setDevelopers(developersWithLogos);
        
        if (developersWithLogos.length > 0) {
          setSelectedDeveloper(developersWithLogos[0]);
        }
        
        if (process.env.NODE_ENV === 'development') {
          const developersWithImages = developersWithLogos.filter(d => d.images && d.images.length > 0).length;}
      } catch (err: any) {setError(err.message || 'Failed to load developers');
      } finally {
        setLoading(false);
      }
    };
    
    loadDevelopers();
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

  const handleDeveloperSelect = (developer: Developer) => {
    setSelectedDeveloper(developer);
    // Reset failed images when switching developers
    setFailedImages(new Set());
  };

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US');
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <section className={styles.developersList}>
        <div className={styles.container}>
          <div className={styles.loading}>{t('loading') || 'Loading...'}</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.developersList}>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </section>
    );
  }

  if (developers.length === 0 && !loading) {
    return (
      <section className={styles.developersList}>
        <div className={styles.container}>
          <div className={styles.noDevelopers}>
            {t('noDevelopers') || 'No developers found'}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.developersList} ref={sectionRef}>
      <div className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.content}>
          {/* Ліва частина - список девелоперів (60%) */}
          <div className={styles.developersGrid}>
            {developers.length > 0 ? developers.map((developer) => (
              <div
                key={developer.id}
                className={`${styles.developerCard} ${
                  selectedDeveloper?.id === developer.id ? styles.selected : ''
                }`}
                onClick={() => handleDeveloperSelect(developer)}
              >
                <div className={styles.logoWrapper}>
                  {developer.logo ? (
                    <div className={styles.logoContainer}>
                      <Image
                        src={developer.logo}
                        alt={developer.name}
                        fill
                        className={styles.logo}
                        sizes="120px"
                      />
                    </div>
                  ) : (
                    <div className={styles.logoPlaceholder}>
                      <span className={styles.logoPlaceholderText}>
                        {developer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className={styles.developerName}>{developer.name}</h3>
              </div>
            )) : (
              <div className={styles.noDevelopers}>
                {t('noDevelopers') || 'No developers found'}
              </div>
            )}
          </div>

          {/* Права частина - інформація по девелоперу (40%) */}
          <div className={styles.developerDetails}>
            {selectedDeveloper ? (
              <>
                <div className={styles.detailsHeader}>
                  {selectedDeveloper.logo ? (
                    <div className={styles.detailsLogoContainer}>
                      <Image
                        src={selectedDeveloper.logo}
                        alt={selectedDeveloper.name}
                        width={120}
                        height={120}
                        className={styles.detailsLogo}
                      />
                    </div>
                  ) : (
                    <div className={styles.detailsLogoPlaceholder}>
                      <span className={styles.detailsLogoPlaceholderText}>
                        {selectedDeveloper.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <h2 className={styles.detailsName}>{selectedDeveloper.name}</h2>
                </div>

                {selectedDeveloper.description && (
                  <div className={styles.description}>
                    <p>{selectedDeveloper.description}</p>
                  </div>
                )}

                {selectedDeveloper.images && selectedDeveloper.images.length > 0 && (
                  <div className={styles.images}>
                    <h3 className={styles.imagesTitle}>{t('images')}</h3>
                    <div className={styles.imagesGrid}>
                      {selectedDeveloper.images
                        .filter((image) => {
                          // Filter out placeholder or invalid images
                          const isPlaceholder = image && (
                            image.includes('unsplash.com') ||
                            image.includes('placeholder') ||
                            image.includes('via.placeholder.com') ||
                            image.includes('dummyimage.com') ||
                            image.includes('placehold.it') ||
                            image.includes('fakeimg.pl')
                          );
                          
                          const isValidUrl = image && (image.startsWith('http://') || image.startsWith('https://'));
                          
                          // Filter out images that failed to load
                          const hasFailed = failedImages.has(image);
                          
                          return isValidUrl && !isPlaceholder && !hasFailed;
                        })
                        .map((image, index) => (
                          <div key={index} className={styles.imageItem}>
                            <Image
                              src={image}
                              alt={`${selectedDeveloper.name} - Image ${index + 1}`}
                              fill
                              style={{ objectFit: 'cover' }}
                              sizes="(max-width: 1200px) 50vw, 33vw"
                              unoptimized
                              onError={(e) => {
                                // Add to failed images set
                                setFailedImages(prev => new Set(prev).add(image));
                                // Hide the image and its wrapper
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const wrapper = target.closest(`.${styles.imageItem}`);
                                if (wrapper) {
                                  (wrapper as HTMLElement).style.display = 'none';
                                }
                              }}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              </>
            ) : (
              <div className={styles.noSelection}>
                <p>{t('noSelection')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

