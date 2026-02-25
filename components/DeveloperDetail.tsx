'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getDeveloperById, getProperties, Property, getDevelopersSimple } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import styles from './DeveloperDetail.module.css';

interface DeveloperDetailData {
    id: string;
    slug?: string;
    name: string;
    nameEn?: string;
    nameRu?: string;
    logo: string | null;
    previewImage?: string | null;
    description?: {
        title?: string;
        description?: string;
    } | null;
    descriptionEn?: string | null;
    descriptionRu?: string | null;
    images?: string[] | null;
    projectsCount?: {
        total: number;
        offPlan: number;
        secondary: number;
    };
}

interface DeveloperDetailProps {
    id: string;
}

export default function DeveloperDetail({ id }: DeveloperDetailProps) {
    const t = useTranslations('developerDetail');
    const locale = useLocale();
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [developer, setDeveloper] = useState<DeveloperDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loadingProperties, setLoadingProperties] = useState(false);
    const [totalProperties, setTotalProperties] = useState(0);
    const [filters, setFilters] = useState({
        type: 'new' as 'new' | 'secondary',
        search: '',
        priceFrom: '',
        priceTo: '',
        sizeFrom: '',
        sizeTo: '',
    });
    const [heroImageError, setHeroImageError] = useState(false);
    const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

    const handleImageError = (imgUrl: string) => {
        setBrokenImages(prev => new Set(prev).add(imgUrl));
    };

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

        const loadDeveloperData = async () => {
            setLoading(true);
            setError(null);

            try {
                const dev = await getDeveloperById(id);

                if (dev) {
                    const localizedName = locale === 'ru' ? (dev.nameRu || dev.nameEn || dev.name) : (dev.nameEn || dev.name);
                    const localizedData = {
                        ...dev,
                        name: localizedName as string
                    };
                    setDeveloper(localizedData as any);
                }
                setLoading(false);
            } catch (err: any) {
                setError(err.message || 'Failed to load developer');
                setLoading(false);
            }
        };

        loadDeveloperData();
    }, [id, locale]);

    const loadFilteredProperties = async (currentFilters: typeof filters) => {
        if (!developer) return;
        setLoadingProperties(true);
        try {
            const apiFilters: any = {
                developerId: developer.id,
                propertyType: currentFilters.type === 'new' ? 'off-plan' : 'secondary',
                search: currentFilters.search || undefined,
                priceMin: currentFilters.priceFrom || undefined,
                priceMax: currentFilters.priceTo || undefined,
                sizeMin: currentFilters.sizeFrom || undefined,
                sizeMax: currentFilters.sizeTo || undefined,
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
        if (developer) {
            const timer = setTimeout(() => {
                loadFilteredProperties(filters);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [filters, developer]);

    const handleFilterChange = (field: string, value: any) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const formatNumberWithCommas = (value: string) => {
        const numericValue = value.replace(/\D/g, '');
        if (!numericValue) return '';
        return new Intl.NumberFormat('en-US').format(parseInt(numericValue, 10));
    };

    const filteredProperties = properties.filter(prop => {
        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const name = prop.name || '';
            if (!name.toLowerCase().includes(searchLower)) return false;
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

    if (loading) {
        return (
            <section className={styles.developerDetail}>
                <div className={styles.container}>
                    <div className={styles.loading}>{locale === 'ru' ? 'Загрузка...' : 'Loading...'}</div>
                </div>
            </section>
        );
    }

    if (error || !developer) {
        return (
            <section className={styles.developerDetail}>
                <div className={styles.container}>
                    <div className={styles.notFound}>
                        <h1>{error || (locale === 'ru' ? 'Забудовника не знайдено' : 'Developer not found')}</h1>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.developerDetail} ref={sectionRef}>
            <div className={styles.container}>
                <div className={styles.heroSection}>
                    <div className={styles.heroImageContainer}>
                        <div className={styles.imageWrapper}>
                            {/* Logic: use 2nd image for better preview, fallback to preview image or 1st image */}
                            {(() => {
                                const heroImg = (developer.images && developer.images.length > 1)
                                    ? developer.images[1]
                                    : (developer.previewImage || (developer.images && developer.images.length > 0 ? developer.images[0] : null));

                                if (heroImg && !heroImageError) {
                                    return (
                                        <Image
                                            src={heroImg}
                                            alt={developer.name}
                                            fill
                                            className={styles.heroImage}
                                            priority
                                            unoptimized
                                            onError={() => setHeroImageError(true)}
                                        />
                                    );
                                }
                                return <div className={styles.placeholderBackground}></div>;
                            })()}
                            <div className={styles.heroOverlay}>
                                <div className={styles.heroContent}>
                                    {developer.logo && (
                                        <div className={styles.logoWrapper}>
                                            <Image src={developer.logo} alt={developer.name} width={100} height={100} className={styles.logo} unoptimized />
                                        </div>
                                    )}
                                    <h1 className={styles.heroTitle}>{developer.name}</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {(developer.description || developer.descriptionEn || developer.descriptionRu) && (
                    <div className={styles.descriptionSection}>
                        <h2 className={styles.sectionTitle}>{t('aboutTitle')}</h2>
                        <div className={styles.descriptionText}>
                            {locale === 'ru'
                                ? (developer.descriptionRu || (developer.description?.description || developer.description?.title))
                                : (developer.descriptionEn || (developer.description?.description || developer.description?.title))
                            }
                        </div>
                    </div>
                )}

                {/* Images */}
                {developer.images && developer.images.length > 0 && (
                    <div className={styles.imagesSection}>
                        <h2 className={styles.sectionTitle}>{t('galleryTitle')}</h2>
                        <div className={styles.imagesGrid}>
                            {developer.images
                                .filter(img => !brokenImages.has(img))
                                .map((img, index) => (
                                    <div key={index} className={styles.imageWrapper} onClick={() => setSelectedImage(img)}>
                                        <Image
                                            src={img}
                                            alt={`${developer.name} ${index + 1}`}
                                            fill
                                            className={styles.galleryImage}
                                            unoptimized
                                            onError={() => handleImageError(img)}
                                        />
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className={styles.localFilters}>
                    <div className={styles.filterColumn}>
                        <div className={styles.filterRow}>
                            <div className={styles.typeToggle}>
                                <button
                                    className={`${styles.typeButton} ${filters.type === 'new' ? styles.active : ''}`}
                                    onClick={() => handleFilterChange('type', 'new')}
                                >
                                    {t('offPlan')}
                                </button>
                                <button
                                    className={`${styles.typeButton} ${filters.type === 'secondary' ? styles.active : ''}`}
                                    onClick={() => handleFilterChange('type', 'secondary')}
                                >
                                    {t('secondary')}
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
                        </div>

                        <div className={styles.filterRow}>
                            <div className={styles.priceSizeBox}>
                                <div className={styles.rangeGroup}>
                                    <div className={styles.inputWrapper}>
                                        <span className={styles.inputLabel}>AED</span>
                                        <input
                                            type="text"
                                            placeholder={locale === 'ru' ? 'від' : 'from'}
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
                                            placeholder={locale === 'ru' ? 'від' : 'from'}
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

                {/* Projects Grid */}
                {loadingProperties ? (
                    <div className={styles.propertiesLoading}>{locale === 'ru' ? 'Загрузка...' : 'Loading...'}</div>
                ) : filteredProperties.length > 0 ? (
                    <div className={styles.propertiesSection}>
                        <h2 className={styles.sectionTitle}>{t('projectsTitle')}</h2>
                        <div className={styles.propertiesGrid}>
                            {filteredProperties.map((property) => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={styles.noProperties}>{locale === 'ru' ? 'Проектов не найдено' : 'No properties found'}</div>
                )}

                {/* Image Modal */}
                {selectedImage && (
                    <div className={styles.imageModal} onClick={() => setSelectedImage(null)}>
                        <div className={styles.imageModalContent}>
                            <button className={styles.imageModalClose} onClick={() => setSelectedImage(null)}>×</button>
                            <Image src={selectedImage} alt={developer.name} fill style={{ objectFit: 'contain' }} sizes="90vw" unoptimized />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
