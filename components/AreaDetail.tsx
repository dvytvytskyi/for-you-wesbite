'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getAreaById, Area as ApiArea, getProperties, Property, getDevelopersSimple, getDevelopers } from '@/lib/api';
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
  const [filters, setFilters] = useState({
    type: 'new' as 'new' | 'secondary',
    search: '',
    priceFrom: '',
    priceTo: '',
    sizeFrom: '',
    sizeTo: '',
    developerId: undefined as string | undefined
  });
  const [developers, setDevelopers] = useState<{ id: string, name: string }[]>([]);
  const [isDeveloperOpen, setIsDeveloperOpen] = useState(false);
  const developerRef = useRef<HTMLDivElement>(null);
  const [developerSearch, setDeveloperSearch] = useState('');

  // Прибираємо автоматичне прокручування при завантаженні сторінки
  useEffect(() => {
    // Вимикаємо scroll restoration в Next.js
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Скролимо вгору при монтуванні компонента
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Load developers for filter
    const loadDevs = async () => {
      try {
        let devs = await getDevelopersSimple();
        if (!devs || devs.length === 0) {
          const { developers: fullDevs } = await getDevelopers();
          devs = fullDevs.map(d => ({ id: d.id, name: d.name || 'Unknown' }));
        }
        setDevelopers(devs.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) { }
    };
    loadDevs();

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
            const imagesStr = apiArea.images as string;
            const trimmed = imagesStr.trim();
            if (trimmed.includes(',')) {
              // Split by comma and take first valid URL
              const urls = trimmed.split(',').map((url: string) => url.trim()).filter((url: string) => url && url.startsWith('http'));
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
              const trimmed = (imagesValue as string).trim();
              if (trimmed.includes(',')) {
                const urls = trimmed.split(',').map((url: string) => url.trim()).filter((url: string) => url && url.startsWith('http'));
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
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load area');
        setLoading(false);
      }
    };

    loadAreaData();
  }, [slug, locale]);

  // Handle local property filtering
  const loadFilteredProperties = async (currentFilters: typeof filters) => {
    if (!area) return;
    setLoadingProperties(true);
    try {
      const apiFilters: any = {
        areaId: area.id,
        propertyType: currentFilters.type === 'new' ? 'off-plan' : 'secondary',
        search: currentFilters.search || undefined,
        // Send both variants of param names for maximum compatibility
        priceFrom: currentFilters.priceFrom || undefined,
        priceTo: currentFilters.priceTo || undefined,
        priceMin: currentFilters.priceFrom || undefined,
        priceMax: currentFilters.priceTo || undefined,
        sizeFrom: currentFilters.sizeFrom || undefined,
        sizeTo: currentFilters.sizeTo || undefined,
        sizeMin: currentFilters.sizeFrom || undefined,
        sizeMax: currentFilters.sizeTo || undefined,
        developerId: currentFilters.developerId,
        limit: 100
      };

      const result = await getProperties(apiFilters, true);
      setProperties(result.properties || []);
      setTotalProperties(result.total || 0);
    } catch (err) {
      setProperties([]);
    } finally {
      setLoadingProperties(false);
    }
  };

  useEffect(() => {
    if (area) {
      const timer = setTimeout(() => {
        loadFilteredProperties(filters);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [filters, area]);

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (developerRef.current && !developerRef.current.contains(event.target as Node)) {
        setIsDeveloperOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatNumberWithCommas = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    return new Intl.NumberFormat('en-US').format(parseInt(numericValue, 10));
  };

  // Filter properties client-side as well for accuracy and instant feedback
  const filteredProperties = properties.filter(prop => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const name = prop.name || '';
      if (!name.toLowerCase().includes(searchLower)) return false;
    }

    // Developer filter
    if (filters.developerId && prop.developer?.id !== filters.developerId) {
      return false;
    }

    // Price filtering
    const price = prop.propertyType === 'off-plan'
      ? (prop.priceFromAED || (prop.priceFrom ? Math.round(prop.priceFrom * 3.673) : 0))
      : (prop.priceAED || (prop.price ? Math.round(prop.price * 3.673) : 0));

    const pFrom = filters.priceFrom ? parseInt(filters.priceFrom, 10) : 0;
    const pTo = filters.priceTo ? parseInt(filters.priceTo, 10) : Infinity;

    if (price < pFrom || (pTo !== Infinity && price > pTo)) return false;

    // Size filtering (sqft)
    const size = prop.propertyType === 'off-plan'
      ? (prop.sizeFromSqft || (prop.sizeFrom ? Math.round(prop.sizeFrom * 10.764) : 0))
      : (prop.sizeSqft || (prop.size ? Math.round(prop.size * 10.764) : 0));

    const sFrom = filters.sizeFrom ? parseInt(filters.sizeFrom, 10) : 0;
    const sTo = filters.sizeTo ? parseInt(filters.sizeTo, 10) : Infinity;

    if (size < sFrom || (sTo !== Infinity && size > sTo)) return false;

    return true;
  });

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
    } catch (err) { } finally {
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

  const getSectionTitle = () => {
    const name = getAreaName();
    return locale === 'ru' ? `Узнайте больше о ${name}` : `Learn more about ${name}`;
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
        <div className={styles.heroSection}>
          {area.images && area.images.length > 0 && (
            <div className={styles.heroImageContainer}>
              <div className={styles.imageWrapper}>
                <Image
                  src={area.images[0]}
                  alt={getAreaName()}
                  fill
                  className={styles.heroImage}
                  sizes="70vw"
                  unoptimized
                />
                <div className={styles.heroOverlay}>
                  <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>{getAreaName()}</h1>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Опис */}
        {area.description && (
          <div className={styles.descriptionSection}>
            <h2 className={styles.sectionTitle}>{getSectionTitle()}</h2>
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

        {/* Фільтри */}
        <div className={styles.localFilters}>
          <div className={styles.filterColumn}>
            <div className={styles.filterRow}>
              <div className={styles.typeToggle}>
                <button
                  className={`${styles.typeButton} ${filters.type === 'new' ? styles.active : ''}`}
                  onClick={() => handleFilterChange('type', 'new')}
                >
                  {locale === 'ru' ? 'Off-plan' : 'Off-plan'}
                </button>
                <button
                  className={`${styles.typeButton} ${filters.type === 'secondary' ? styles.active : ''}`}
                  onClick={() => handleFilterChange('type', 'secondary')}
                >
                  {locale === 'ru' ? 'Вторичка' : 'Secondary'}
                </button>
              </div>

              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder={locale === 'ru' ? 'Поиск проекта...' : 'Search project...'}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className={styles.filterInput}
                />
              </div>

              <div className={styles.developerBox} ref={developerRef}>
                <button
                  className={styles.filterDropdownButton}
                  onClick={() => setIsDeveloperOpen(!isDeveloperOpen)}
                >
                  <span>{filters.developerId ? developers.find(d => d.id === filters.developerId)?.name : (locale === 'ru' ? 'Забудовник' : 'Developer')}</span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isDeveloperOpen && (
                  <div className={styles.filterDropdownMenu}>
                    <div className={styles.dropdownSearch}>
                      <input
                        type="text"
                        placeholder="..."
                        value={developerSearch}
                        onChange={(e) => setDeveloperSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div
                      className={`${styles.dropdownItem} ${!filters.developerId ? styles.active : ''}`}
                      onClick={() => { handleFilterChange('developerId', undefined); setIsDeveloperOpen(false); }}
                    >
                      {locale === 'ru' ? 'Все забудовники' : 'All Developers'}
                    </div>
                    {developers
                      .filter(d => d.name.toLowerCase().includes(developerSearch.toLowerCase()))
                      .map(dev => (
                        <div
                          key={dev.id}
                          className={`${styles.dropdownItem} ${filters.developerId === dev.id ? styles.active : ''}`}
                          onClick={() => { handleFilterChange('developerId', dev.id); setIsDeveloperOpen(false); }}
                        >
                          {dev.name}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.filterRow}>
              <div className={styles.priceSizeBox}>
                <div className={styles.rangeGroup}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputLabel}>AED</span>
                    <input
                      type="text"
                      placeholder={locale === 'ru' ? 'от' : 'from'}
                      value={formatNumberWithCommas(filters.priceFrom)}
                      onChange={(e) => handleFilterChange('priceFrom', e.target.value.replace(/\D/g, ''))}
                      className={styles.filterInputWithLabel}
                    />
                  </div>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputLabel}>AED</span>
                    <input
                      type="text"
                      placeholder={locale === 'ru' ? 'до' : 'to'}
                      value={formatNumberWithCommas(filters.priceTo)}
                      onChange={(e) => handleFilterChange('priceTo', e.target.value.replace(/\D/g, ''))}
                      className={styles.filterInputWithLabel}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.priceSizeBox}>
                <div className={styles.rangeGroup}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputLabel}>sqft</span>
                    <input
                      type="text"
                      placeholder={locale === 'ru' ? 'от' : 'from'}
                      value={formatNumberWithCommas(filters.sizeFrom)}
                      onChange={(e) => handleFilterChange('sizeFrom', e.target.value.replace(/\D/g, ''))}
                      className={styles.filterInputWithLabel}
                    />
                  </div>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputLabel}>sqft</span>
                    <input
                      type="text"
                      placeholder={locale === 'ru' ? 'до' : 'to'}
                      value={formatNumberWithCommas(filters.sizeTo)}
                      onChange={(e) => handleFilterChange('sizeTo', e.target.value.replace(/\D/g, ''))}
                      className={styles.filterInputWithLabel}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Список проектів */}
        {loadingProperties ? (
          <div className={styles.propertiesLoading}>{locale === 'ru' ? 'Загрузка...' : 'Loading...'}</div>
        ) : filteredProperties.length > 0 ? (
          <div className={styles.propertiesSection}>
            <div className={styles.propertiesGrid}>
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.noProperties}>{locale === 'ru' ? 'Проектов не найдено' : 'No properties found'}</div>
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

