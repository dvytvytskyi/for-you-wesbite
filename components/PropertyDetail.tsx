'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getProperty, Property } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import InvestmentForm from '@/components/investment/InvestmentForm';
import PropertyDetailSkeleton from '@/components/PropertyDetailSkeleton';
import styles from './PropertyDetail.module.css';

interface PropertyDetailProps {
  propertyId: string;
}

export default function PropertyDetail({ propertyId }: PropertyDetailProps) {
  const t = useTranslations('propertyDetail');
  const tFilters = useTranslations('filters.type');
  const tHeader = useTranslations('header.nav');
  const locale = useLocale();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevImageIndex, setPrevImageIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const unitsScrollRef = useRef<HTMLDivElement>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProperty(propertyId);
        setProperty(data);
      } catch (err: any) {
        console.error('Error fetching property:', err);
        setError(err.message || t('notFound') || 'Property not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, t]);

  // Initialize map when property is loaded
  useEffect(() => {
    if (!property || !mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    if (!token) {
      console.warn('Mapbox access token is not set');
      return;
    }

    if (map.current) return; // Map already initialized

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/abiespana/cmcxiep98004r01quhxspf3w9',
        center: [property.longitude, property.latitude],
        zoom: 14,
        accessToken: token,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Create marker element
      const el = document.createElement('div');
      el.className = 'property-marker';
      
      // Outer circle (border, no fill)
      const outerCircle = document.createElement('div');
      outerCircle.style.cssText = `
        width: 18px;
        height: 18px;
        border: 1.5px solid #003077;
        border-radius: 50%;
        background: transparent;
        position: absolute;
        top: 0;
        left: 0;
        box-sizing: border-box;
      `;
      
      // Inner circle (filled)
      const innerCircle = document.createElement('div');
      innerCircle.style.cssText = `
        width: 8px;
        height: 8px;
        background: #003077;
        border-radius: 50%;
        position: absolute;
        top: 5px;
        left: 5px;
        box-sizing: border-box;
      `;
      
      el.appendChild(outerCircle);
      el.appendChild(innerCircle);
      
      el.style.cssText = `
        width: 18px;
        height: 18px;
        cursor: pointer;
        pointer-events: auto;
        position: relative;
      `;

      // Add marker
      markerRef.current = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current);

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [property]);

  if (loading) {
    return <PropertyDetailSkeleton />;
  }

  if (error || !property) {
    return (
      <div className={styles.error}>
        <p>{error || t('notFound') || 'Property not found'}</p>
        <button onClick={() => router.back()}>{t('goBack') || 'Go Back'}</button>
      </div>
    );
  }

  const getName = () => property.name;
  const getDescription = () => property.description;
  // For off-plan properties: area is a string "areaName, cityName"
  // For secondary properties: area is an object
  const getAreaName = () => {
    if (typeof property.area === 'string') {
      // Off-plan: extract area name from string (before comma)
      return property.area.split(',')[0].trim();
    }
    return locale === 'ru' ? property.area.nameRu : property.area.nameEn;
  };
  const getCityName = () => locale === 'ru' ? property.city.nameRu : property.city.nameEn;
  const getLocation = () => {
    if (typeof property.area === 'string') {
      // Off-plan: area already contains "areaName, cityName"
      return property.area;
    }
    // Secondary: combine area and city
    return `${getAreaName()}, ${getCityName()}`;
  };
  const getFacilityName = (facility: typeof property.facilities[0]) => 
    locale === 'ru' ? facility.nameRu : facility.nameEn;
  // Formatting functions are now imported from utils
  const formatPrice = formatNumber;
  const formatSize = (size: number) => formatNumber(Math.round(size * 100) / 100);

  const handleImageChange = (dir: 'prev' | 'next') => {
    if (property.photos.length <= 1 || isTransitioning) return;
    
    setIsTransitioning(true);
    setPrevImageIndex(currentImageIndex);
    setDirection(dir === 'next' ? 'right' : 'left');
    
    const newIndex = dir === 'next'
      ? (currentImageIndex + 1) % property.photos.length
      : currentImageIndex === 0 ? property.photos.length - 1 : currentImageIndex - 1;
    
    setCurrentImageIndex(newIndex);
    
    setTimeout(() => {
      setIsTransitioning(false);
      setDirection(null);
    }, 500);
  };

  const getPriceDisplay = () => {
    if (property.propertyType === 'off-plan' && property.priceFromAED) {
      return `${t('from')} ${formatPrice(property.priceFromAED)} AED`;
    } else if (property.propertyType === 'secondary' && property.priceAED) {
      return `${formatPrice(property.priceAED)} AED`;
    }
    return t('priceOnRequest');
  };

  const getSizeDisplay = () => {
    if (property.sizeFromSqft && property.sizeToSqft) {
      return `${formatSize(property.sizeFromSqft)} - ${formatSize(property.sizeToSqft)} ${t('sqft')}`;
    } else if (property.sizeSqft) {
      return `${formatSize(property.sizeSqft)} ${t('sqft')}`;
    }
    return t('sizeOnRequest');
  };

  const getBedroomsDisplay = () => {
    if (property.bedroomsFrom && property.bedroomsTo) {
      return property.bedroomsFrom === property.bedroomsTo 
        ? `${property.bedroomsFrom} ${t('beds')}`
        : `${property.bedroomsFrom} - ${property.bedroomsTo} ${t('beds')}`;
    } else if (property.bedrooms) {
      return `${property.bedrooms} ${t('beds')}`;
    }
    return '';
  };

  const getBathroomsDisplay = () => {
    if (property.bathroomsFrom && property.bathroomsTo) {
      return property.bathroomsFrom === property.bathroomsTo 
        ? `${property.bathroomsFrom} ${t('baths')}`
        : `${property.bathroomsFrom} - ${property.bathroomsTo} ${t('baths')}`;
    } else if (property.bathrooms) {
      return `${property.bathrooms} ${t('baths')}`;
    }
    return '';
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      {property && (
        <div className={styles.breadcrumb}>
          <Link href={`/${locale}/properties`} className={styles.breadcrumbLink}>
            {tHeader('properties')}
          </Link>
          <span className={styles.breadcrumbSeparator}>→</span>
          <Link 
            href={`/${locale}/properties?type=${property.propertyType === 'off-plan' ? 'offPlan' : 'secondary'}`}
            className={styles.breadcrumbLink}
          >
            {property.propertyType === 'off-plan' ? tFilters('offPlan') : tFilters('secondary')}
          </Link>
          <span className={styles.breadcrumbSeparator}>→</span>
          <span className={styles.breadcrumbCurrent}>{getName()}</span>
        </div>
      )}

      {/* Hero Image Section */}
      <div className={styles.heroSection}>
        <div className={styles.imageContainer}>
          {property.photos.length > 0 && (
            <>
              <div className={styles.imageWrapper}>
                {/* Previous image - sliding out */}
                {isTransitioning && prevImageIndex !== currentImageIndex && (
                  <Image
                    key={`prev-${prevImageIndex}`}
                    src={property.photos[prevImageIndex]}
                    alt={getName()}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="100vw"
                    className={`${styles.heroImage} ${styles.prevImage} ${direction === 'right' ? styles.slideOutLeft : styles.slideOutRight}`}
                  />
                )}
                {/* Current image - sliding in */}
                <Image
                  key={`current-${currentImageIndex}`}
                  src={property.photos[currentImageIndex]}
                  alt={getName()}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="100vw"
                  className={`${styles.heroImage} ${styles.currentImage} ${direction === 'right' ? styles.slideInRight : direction === 'left' ? styles.slideInLeft : ''}`}
                />
              </div>

              {/* Navigation arrows */}
              {property.photos.length > 1 && (
                <>
                  <button
                    className={`${styles.imageNav} ${styles.prev}`}
                    onClick={() => handleImageChange('prev')}
                    aria-label="Previous image"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    className={`${styles.imageNav} ${styles.next}`}
                    onClick={() => handleImageChange('next')}
                    aria-label="Next image"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </>
              )}

              {/* Image indicator */}
              {property.photos.length > 1 && (
                <div className={styles.imageIndicator}>
                  {currentImageIndex + 1} / {property.photos.length}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className={styles.content}>
        <div className={styles.contentWrapper}>
          {/* Left Column - 70% */}
          <div className={styles.leftColumn}>
            {/* Main Info */}
            <div className={styles.mainInfo}>
          <div className={styles.header}>
            <h1 className={styles.title}>{getName()}</h1>
            <div className={styles.location}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{getLocation()}</span>
            </div>
          </div>

          <div className={styles.priceSection}>
            <div className={styles.price}>{getPriceDisplay()}</div>
            {property.propertyType === 'off-plan' && property.paymentPlan && (
              <div className={styles.paymentPlan}>{property.paymentPlan}</div>
            )}
          </div>

          <div className={styles.details}>
            {getBedroomsDisplay() && (
              <div className={styles.detailItem}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>{getBedroomsDisplay()}</span>
              </div>
            )}
            {getBathroomsDisplay() && (
              <div className={styles.detailItem}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 2L7 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3l-2-2H9z"></path>
                  <circle cx="12" cy="13" r="3"></circle>
                </svg>
                <span>{getBathroomsDisplay()}</span>
              </div>
            )}
            {getSizeDisplay() && (
              <div className={styles.detailItem}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
                <span>{getSizeDisplay()}</span>
              </div>
            )}
          </div>

          {property.developer && (
            <div className={styles.developer}>
              <span className={styles.developerLabel}>{t('developer')}:</span>
              <span className={styles.developerName}>{property.developer.name}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {getDescription() && (
          <div className={styles.descriptionSection}>
            <h2 className={styles.sectionTitle}>{t('description')}</h2>
            <p className={styles.description}>{getDescription()}</p>
          </div>
        )}

        {/* Facilities */}
        {property.facilities.length > 0 && (
          <div className={styles.facilitiesSection}>
            <h2 className={styles.sectionTitle}>{t('facilities')}</h2>
            <div className={styles.facilitiesList}>
              {property.facilities.map((facility) => (
                <div key={facility.id} className={styles.facilityItem}>
                  {getFacilityName(facility)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Area Details - Only show for secondary properties (where area is an object) */}
        {typeof property.area === 'object' && property.area.description && (
          <div className={styles.descriptionSection}>
            <h2 className={styles.sectionTitle}>
              {property.area.description.title || (locale === 'ru' ? 'О районе' : 'About Area')}
            </h2>
            {property.area.description.description && (
              <p className={styles.description}>{property.area.description.description}</p>
            )}
          </div>
        )}

        {typeof property.area === 'object' && property.area.infrastructure && (
          <div className={styles.descriptionSection}>
            <h2 className={styles.sectionTitle}>
              {property.area.infrastructure.title || (locale === 'ru' ? 'Инфраструктура' : 'Infrastructure')}
            </h2>
            {property.area.infrastructure.description && (
              <p className={styles.description}>{property.area.infrastructure.description}</p>
            )}
          </div>
        )}

        {typeof property.area === 'object' && property.area.images && property.area.images.length > 0 && (
          <div className={styles.areaImagesSection}>
            <h2 className={styles.sectionTitle}>{locale === 'ru' ? 'Фото района' : 'Area Photos'}</h2>
            <div className={styles.areaImagesGrid}>
              {property.area.images.map((image, index) => (
                <div key={index} className={styles.areaImageWrapper}>
                  <Image
                    src={image}
                    alt={`${getAreaName()} - ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Developer Details */}
        {property.developer && property.developer.description && (
          <div className={styles.descriptionSection}>
            <h2 className={styles.sectionTitle}>
              {locale === 'ru' ? 'О девелопере' : 'About Developer'}
            </h2>
            {property.developer.logo && (
              <div className={styles.developerLogoWrapper}>
                <Image
                  src={property.developer.logo}
                  alt={property.developer.name || 'Developer'}
                  width={200}
                  height={100}
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}
            <p className={styles.description}>{property.developer.description}</p>
          </div>
        )}

        {property.developer && property.developer.images && property.developer.images.length > 0 && (
          <div className={styles.developerImagesSection}>
            <h2 className={styles.sectionTitle}>{locale === 'ru' ? 'Фото девелопера' : 'Developer Photos'}</h2>
            <div className={styles.developerImagesGrid}>
              {property.developer.images.map((image, index) => (
                <div key={index} className={styles.developerImageWrapper}>
                  <Image
                    src={image}
                    alt={`${property.developer?.name || 'Developer'} - ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Units */}
        {property.units && property.units.length > 0 && (
          <div className={styles.unitsSection}>
            <div className={styles.unitsHeader}>
              <h2 className={styles.sectionTitle}>{t('availableUnits')}</h2>
              <div className={styles.unitsNavigation}>
                <button
                  className={styles.unitsNavButton}
                  onClick={() => {
                    if (unitsScrollRef.current) {
                      unitsScrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
                    }
                  }}
                  aria-label="Scroll left"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18L9 12L15 6"/>
                  </svg>
                </button>
                <button
                  className={styles.unitsNavButton}
                  onClick={() => {
                    if (unitsScrollRef.current) {
                      unitsScrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
                    }
                  }}
                  aria-label="Scroll right"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18L15 12L9 6"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className={styles.unitsList} ref={unitsScrollRef}>
              {property.units.map((unit) => (
                <div key={unit.id} className={styles.unitCard}>
                  <div className={styles.unitHeader}>
                    <div className={styles.unitId}>{unit.unitId}</div>
                    <div className={styles.unitType}>{unit.type}</div>
                  </div>
                  {unit.planImage && (
                    <div className={styles.unitPlanImage}>
                      <Image
                        src={unit.planImage}
                        alt={`Plan for ${unit.unitId}`}
                        width={400}
                        height={300}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    </div>
                  )}
                  <div className={styles.unitDetails}>
                    <div className={styles.unitPrice}>{formatPrice(unit.priceAED)} AED</div>
                    <div className={styles.unitSize}>
                      {formatSize(unit.totalSize)} {t('sqm')} ({formatSize(unit.totalSizeSqft)} {t('sqft')})
                      {unit.balconySize > 0 && (
                        <span className={styles.balconySize}>
                          + {formatSize(unit.balconySize)} {t('sqm')} ({formatSize(unit.balconySizeSqft)} {t('sqft')}) {t('balcony')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

            {/* Map Section */}
            <div className={styles.mapSection}>
              <h2 className={styles.sectionTitle}>{t('location')}</h2>
              <div className={styles.mapContainer} ref={mapContainer}></div>
            </div>
          </div>

          {/* Right Column - 30% - Investment Form */}
          <div className={styles.rightColumn}>
            <InvestmentForm
              propertyId={property.id}
              propertyPriceFrom={property.priceFromAED}
              propertyPrice={property.priceAED}
              propertyType={property.propertyType}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

