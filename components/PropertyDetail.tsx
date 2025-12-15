'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getProperty, Property, getProperties } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import InvestmentForm from '@/components/investment/InvestmentForm';
import PropertyDetailSkeleton from '@/components/PropertyDetailSkeleton';
import PropertyCard from '@/components/PropertyCard';
import styles from './PropertyDetail.module.css';

interface PropertyDetailProps {
  propertyId: string;
  initialProperty?: Property | null;
}

export default function PropertyDetail({ propertyId, initialProperty = null }: PropertyDetailProps) {
  const t = useTranslations('propertyDetail');
  const tFilters = useTranslations('filters.type');
  const tHeader = useTranslations('header.nav');
  const locale = useLocale();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(initialProperty);
  const [loading, setLoading] = useState(!initialProperty);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevImageIndex, setPrevImageIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [unitImagesLoading, setUnitImagesLoading] = useState<Set<string>>(new Set());
  const [heroImageLoading, setHeroImageLoading] = useState(true);
  const [otherProperties, setOtherProperties] = useState<Property[]>([]);
  const [loadingOtherProperties, setLoadingOtherProperties] = useState(false);
  const unitsScrollRef = useRef<HTMLDivElement>(null);
  const otherPropertiesScrollRef = useRef<HTMLDivElement>(null);
  const otherPropertiesCardsRef = useRef<HTMLDivElement>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // If we have initialProperty, skip fetching
    if (initialProperty) {
      setProperty(initialProperty);
      setLoading(false);
      
      // Initialize hero image as loading
      if (initialProperty.photos && initialProperty.photos.length > 0) {
        setHeroImageLoading(true);
      }
      
      // Initialize unit images as loading
      if (initialProperty.units && initialProperty.units.length > 0) {
        const unitsWithImages = initialProperty.units
          .filter(unit => unit.planImage)
          .map(unit => unit.id);
        setUnitImagesLoading(new Set(unitsWithImages));
      }
      return;
    }

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProperty(propertyId);
        setProperty(data);
        
        // Log area images for debugging
        // Initialize hero image as loading
        if (data.photos && data.photos.length > 0) {
          setHeroImageLoading(true);
        }
        
        // Initialize unit images as loading
        if (data.units && data.units.length > 0) {
          const unitsWithImages = data.units
            .filter(unit => unit.planImage)
            .map(unit => unit.id);
          setUnitImagesLoading(new Set(unitsWithImages));
        }
      } catch (err: any) {setError(err.message || t('notFound') || 'Property not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, t, initialProperty]);
  
  // Reset hero image loading when image index changes
  // Note: If image was prefetched, it should load quickly from cache
  useEffect(() => {
    if (property && property.photos.length > 0) {
      // Show skeleton briefly, but prefetched images will load very quickly
      setHeroImageLoading(true);
    }
  }, [currentImageIndex, property]);
  
  // Preload first image and prefetch next images
  useEffect(() => {
    if (!property || !property.photos || property.photos.length === 0) return;
    
    // Create and add preload link for first image in head
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = property.photos[0];
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
    
    // Also preload using Image object for immediate cache
    const firstImage = new window.Image();
    firstImage.src = property.photos[0];
    
    // Check if first image is already cached
    firstImage.onload = () => {
      // Image is cached or loaded quickly, hide skeleton immediately
      setHeroImageLoading(false);
    };
    
    // If image fails to load quickly, let the Image component handle it
    firstImage.onerror = () => {
      // If preload fails, still let the Image component try
    };
    
    // Prefetch next 2-3 images in background using Image objects
    const imagesToPrefetch = Math.min(3, property.photos.length - 1);
    for (let i = 1; i <= imagesToPrefetch; i++) {
      const img = new window.Image();
      img.src = property.photos[i];
    }
    
    // Cleanup: remove preload link when component unmounts
    return () => {
      if (link && link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, [property]);
  
  // Prefetch adjacent images when current image changes
  useEffect(() => {
    if (!property || !property.photos || property.photos.length <= 1) return;
    
    // Prefetch next image (for smooth navigation)
    const nextIndex = (currentImageIndex + 1) % property.photos.length;
    if (nextIndex !== currentImageIndex) {
      const img = new window.Image();
      img.src = property.photos[nextIndex];
    }
    
    // Prefetch previous image (for smooth navigation)
    const prevIndex = currentImageIndex === 0 
      ? property.photos.length - 1 
      : currentImageIndex - 1;
    if (prevIndex !== currentImageIndex) {
      const img = new window.Image();
      img.src = property.photos[prevIndex];
    }
    
    // Also prefetch one more image ahead for even smoother experience
    if (property.photos.length > 2) {
      const nextNextIndex = (currentImageIndex + 2) % property.photos.length;
      if (nextNextIndex !== currentImageIndex && nextNextIndex !== nextIndex) {
        const img = new window.Image();
        img.src = property.photos[nextNextIndex];
      }
    }
  }, [currentImageIndex, property]);

  // Load other properties (25 random, excluding current) - lazy load when section is visible
  const otherPropertiesSectionRef = useRef<HTMLDivElement>(null);
  const [shouldLoadOtherProperties, setShouldLoadOtherProperties] = useState(false);

  useEffect(() => {
    if (!property || !otherPropertiesSectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoadOtherProperties) {
            setShouldLoadOtherProperties(true);
          }
        });
      },
      { threshold: 0.1, rootMargin: '200px' } // Start loading 200px before section is visible
    );

    observer.observe(otherPropertiesSectionRef.current);

    return () => {
      if (otherPropertiesSectionRef.current) {
        observer.unobserve(otherPropertiesSectionRef.current);
      }
    };
  }, [property, shouldLoadOtherProperties]);

  useEffect(() => {
    if (!property || !shouldLoadOtherProperties) return;
    
    const loadOtherProperties = async () => {
      setLoadingOtherProperties(true);
      try {
        if (process.env.NODE_ENV === 'development') {
        }
        
        // Load fewer properties to reduce load - 25 instead of 50 for faster loading
        const result = await getProperties({ limit: 25 }, true);
        const allProperties = result.properties || [];
        
        // Filter out current property and shuffle
        const filtered = allProperties.filter(p => p.id !== property.id);
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        
        // Take 12 random properties (reduced for faster loading)
        const randomProperties = shuffled.slice(0, 12);
        setOtherProperties(randomProperties);
        
        } catch (err) {setOtherProperties([]);
      } finally {
        setLoadingOtherProperties(false);
      }
    };

    loadOtherProperties();
  }, [property, shouldLoadOtherProperties]);

  // Initialize map when property is loaded - lazy load to avoid blocking render
  useEffect(() => {
    if (!property || !mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    if (!token) {return;
    }

    if (map.current) return; // Map already initialized

    // Delay map initialization to avoid blocking initial render
    const initMap = () => {
      if (!mapContainer.current || map.current) return;

      let cleanup: (() => void) | null = null;

      try {
      // Check if mobile device based on screen width
      const checkIsMobile = () => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth <= 768;
      };
      
      const isMobile = checkIsMobile();
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/abiespana/cmcxiep98004r01quhxspf3w9',
        center: [property.longitude, property.latitude],
        zoom: 14,
        accessToken: token,
        // Disable drag pan on mobile (one finger drag)
        // Allow touch zoom/rotate (two finger gestures)
        interactive: true,
        dragPan: !isMobile, // Disable one-finger drag on mobile
        touchZoomRotate: true, // Allow two-finger zoom/rotate
        touchPitch: true, // Allow two-finger pitch
        boxZoom: false,
        doubleClickZoom: true,
        keyboard: false,
        scrollZoom: true,
      });

      // On mobile, ensure dragPan is disabled
      if (isMobile) {
        map.current.dragPan.disable();
        
        // Also disable on 'load' event to ensure it stays disabled
        map.current.once('load', () => {
          if (map.current) {
            map.current.dragPan.disable();
          }
        });
      }
      
      // Handle window resize to update dragPan setting
      const handleResize = () => {
        if (!map.current) return;
        const nowMobile = checkIsMobile();
        if (nowMobile) {
          map.current.dragPan.disable();
        } else {
          map.current.dragPan.enable();
        }
      };
      
      window.addEventListener('resize', handleResize);

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

      // Cleanup function
      cleanup = () => {
        window.removeEventListener('resize', handleResize);
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };

      } catch (error) {
        cleanup = () => {};
      }
    };

    // Delay map initialization to avoid blocking initial render
    const timeoutId = setTimeout(initMap, 100);
    
    return () => {
      clearTimeout(timeoutId);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
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

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const getName = () => property.name;
  const getDescription = () => property.description;
  // For off-plan properties: area is a string "areaName, cityName" or null
  // For secondary properties: area is an object
  const getAreaName = () => {
    if (property.area === null || property.area === undefined) {
      return '';
    }
    if (typeof property.area === 'string') {
      // Off-plan: extract area name from string (before comma)
      return property.area.split(',')[0].trim();
    }
    return locale === 'ru' ? property.area.nameRu : property.area.nameEn;
  };
  const getCityName = () => {
    if (!property.city) {
      return '';
    }
    return locale === 'ru' ? property.city.nameRu : property.city.nameEn;
  };
  const getLocation = () => {
    if (property.area === null || property.area === undefined) {
      // If area is null, try to use city if available
      return getCityName();
    }
    if (typeof property.area === 'string') {
      // Off-plan: area already contains "areaName, cityName"
      return property.area;
    }
    // Secondary: combine area and city
    const areaName = getAreaName();
    const cityName = getCityName();
    const parts = [];
    if (areaName) parts.push(areaName);
    if (cityName) parts.push(cityName);
    return parts.join(', ') || '';
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

  // Swipe handlers for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchEndRef.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    touchEndRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    
    const deltaX = touchStartRef.current.x - touchEndRef.current.x;
    const deltaY = touchStartRef.current.y - touchEndRef.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // Only handle swipe if horizontal movement is greater than vertical (horizontal swipe)
    // and the distance is greater than minimum swipe distance
    if (absDeltaX > minSwipeDistance && absDeltaX > absDeltaY) {
      if (deltaX > 0) {
        // Swipe left - next image
        handleImageChange('next');
      } else {
        // Swipe right - previous image
        handleImageChange('prev');
      }
    }
    
    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  const getPriceDisplay = () => {
    if (property.propertyType === 'off-plan') {
      // For off-plan: use priceFromAED
      const priceFromAED = property.priceFromAED;
      // Check if priceFromAED exists and is valid
      if (priceFromAED !== null && priceFromAED !== undefined) {
        const priceValue = typeof priceFromAED === 'string' ? parseFloat(priceFromAED) : Number(priceFromAED);
        if (!isNaN(priceValue) && priceValue > 0) {
          return `${t('from')} ${formatPrice(priceValue)} AED`;
        }
      }
      
      // Fallback: check if priceFrom exists and calculate priceFromAED
      if (property.priceFrom !== null && property.priceFrom !== undefined) {
        const priceFrom = typeof property.priceFrom === 'string' ? parseFloat(property.priceFrom) : Number(property.priceFrom);
        if (!isNaN(priceFrom) && priceFrom > 0) {
          const calculatedPriceFromAED = Math.round(priceFrom * 3.673);
          return `${t('from')} ${formatPrice(calculatedPriceFromAED)} AED`;
        }
      }
    } else {
      // For secondary: use priceAED
      const priceAED = property.priceAED;
      // Check if priceAED exists and is valid
      if (priceAED !== null && priceAED !== undefined) {
        const priceValue = typeof priceAED === 'string' ? parseFloat(priceAED) : Number(priceAED);
        if (!isNaN(priceValue) && priceValue > 0) {
          return `${formatPrice(priceValue)} AED`;
        }
      }
      
      // Fallback: check if price exists and calculate priceAED
      if (property.price !== null && property.price !== undefined) {
        const price = typeof property.price === 'string' ? parseFloat(property.price) : Number(property.price);
        if (!isNaN(price) && price > 0) {
          const calculatedPriceAED = Math.round(price * 3.673);
          return `${formatPrice(calculatedPriceAED)} AED`;
        }
      }
    }
    
    return t('priceOnRequest') || 'On request';
  };

  const getSizeDisplay = () => {
    if (property.propertyType === 'off-plan') {
      // For off-plan: use sizeFrom/sizeTo
      if (property.sizeFromSqft && property.sizeToSqft) {
        return `${formatSize(property.sizeFromSqft)} - ${formatSize(property.sizeToSqft)} ${t('sqft')}`;
      } else if (property.sizeFromSqft) {
        return `${formatSize(property.sizeFromSqft)} ${t('sqft')}`;
      }
      // Try m² if sqft not available
      if (property.sizeFrom && property.sizeTo) {
        const unit = locale === 'ru' ? 'м²' : 'sq.ft';
        if (locale === 'ru') {
          return `${formatSize(property.sizeFrom)} - ${formatSize(property.sizeTo)} ${unit}`;
        } else {
          // Convert to sqft
          const fromSqft = property.sizeFrom * 10.764;
          const toSqft = property.sizeTo * 10.764;
          return `${formatSize(fromSqft)} - ${formatSize(toSqft)} ${unit}`;
        }
      } else if (property.sizeFrom) {
        const unit = locale === 'ru' ? 'м²' : 'sq.ft';
        if (locale === 'ru') {
          return `${formatSize(property.sizeFrom)} ${unit}`;
        } else {
          const fromSqft = property.sizeFrom * 10.764;
          return `${formatSize(fromSqft)} ${unit}`;
        }
      }
    } else {
      // For secondary: use size/sizeSqft
      if (property.sizeSqft) {
        return `${formatSize(property.sizeSqft)} ${t('sqft')}`;
      } else if (property.size) {
        const unit = locale === 'ru' ? 'м²' : 'sq.ft';
        if (locale === 'ru') {
          return `${formatSize(property.size)} ${unit}`;
        } else {
          const sizeSqft = property.size * 10.764;
          return `${formatSize(sizeSqft)} ${unit}`;
        }
      }
    }
    return t('sizeOnRequest');
  };

  const getBedroomsDisplay = () => {
    if (property.propertyType === 'off-plan') {
      if (property.bedroomsFrom && property.bedroomsTo) {
        return property.bedroomsFrom === property.bedroomsTo 
          ? `${property.bedroomsFrom} ${t('beds')}`
          : `${property.bedroomsFrom} - ${property.bedroomsTo} ${t('beds')}`;
      } else if (property.bedroomsFrom) {
        return `${property.bedroomsFrom} ${t('beds')}`;
      }
    } else {
      if (property.bedrooms) {
        return `${property.bedrooms} ${t('beds')}`;
      }
    }
    return '';
  };

  const getBathroomsDisplay = () => {
    if (property.propertyType === 'off-plan') {
      // For off-plan properties, bathroomsFrom/To are always null
      return '';
    } else {
      // For secondary properties
      if (property.bathrooms) {
        return `${property.bathrooms} ${t('baths')}`;
      }
    }
    return '';
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation - Hidden on mobile */}
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
        <div 
          className={styles.imageContainer}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {property.photos.length > 0 && (
            <>
              <div className={styles.imageWrapper}>
                {/* Skeleton while loading */}
                {heroImageLoading && (
                  <div className={styles.heroImageSkeleton}></div>
                )}
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
                    loading="lazy"
                  />
                )}
                {/* Current image - sliding in */}
                <Image
                  key={`current-${currentImageIndex}`}
                  src={property.photos[currentImageIndex]}
                  alt={getName()}
                  fill
                  priority={currentImageIndex === 0}
                  style={{ 
                    objectFit: 'cover',
                    opacity: heroImageLoading ? 0 : 1,
                    transition: 'opacity 0.3s ease'
                  }}
                  sizes="100vw"
                  className={`${styles.heroImage} ${styles.currentImage} ${direction === 'right' ? styles.slideInRight : direction === 'left' ? styles.slideInLeft : ''}`}
                  onLoad={() => {
                    setHeroImageLoading(false);
                  }}
                  onError={() => {
                    setHeroImageLoading(false);
                  }}
                  onLoadingComplete={() => {
                    setHeroImageLoading(false);
                  }}
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
            <div className={styles.areaImagesHeader}>
              <h2 className={styles.sectionTitle}>{locale === 'ru' ? 'Фото района' : 'Area Photos'}</h2>
              {property.area.id && (
                <Link 
                  href={getLocalizedPath(`/areas/${property.area.id}`)}
                  className={styles.viewAllButton}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {locale === 'ru' ? 'Посмотреть все фото' : 'View all photos'}
                </Link>
              )}
            </div>
            <div className={styles.areaImagesGrid}>
              {property.area.images
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
                  
                  return isValidUrl && !isPlaceholder;
                })
                .slice(0, 2)
                .map((image, index) => (
                  <div key={index} className={styles.areaImageWrapper}>
                    <Image
                      src={image}
                      alt={`${getAreaName()} - ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
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
            <p className={styles.description}>{property.developer.description}</p>
          </div>
        )}

        {property.developer && property.developer.images && property.developer.images.length > 0 && (
          <div className={styles.developerImagesSection}>
            <div className={styles.developerImagesHeader}>
              <h2 className={styles.sectionTitle}>{locale === 'ru' ? 'Фото девелопера' : 'Developer Photos'}</h2>
              {property.developer.id && (
                <Link 
                  href={getLocalizedPath(`/developers`)}
                  className={styles.viewAllButton}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {locale === 'ru' ? 'Посмотреть все фото' : 'View all photos'}
                </Link>
              )}
            </div>
            <div className={styles.developerImagesGrid}>
              {property.developer.images
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
                  
                  return isValidUrl && !isPlaceholder;
                })
                .slice(0, 2)
                .map((image, index) => (
                  <div key={index} className={styles.developerImageWrapper}>
                    <Image
                      src={image}
                      alt={`${property.developer?.name || 'Developer'} - ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        // Hide the wrapper if image fails
                        const wrapper = target.closest(`.${styles.developerImageWrapper}`);
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
              {property.units.map((unit) => {
                const isImageLoading = unit.planImage && unitImagesLoading.has(unit.id);
                
                return (
                  <div key={unit.id} className={styles.unitCard}>
                    <div className={styles.unitHeader}>
                      <div className={styles.unitId}>{unit.unitId}</div>
                      <div className={styles.unitType}>{unit.type}</div>
                    </div>
                    {unit.planImage && (
                      <div className={styles.unitPlanImage}>
                        {isImageLoading && (
                          <div className={styles.unitPlanImageSkeleton}></div>
                        )}
                        <Image
                          src={unit.planImage}
                          alt={`Plan for ${unit.unitId}`}
                          fill
                          style={{ 
                            objectFit: 'cover',
                            opacity: isImageLoading ? 0 : 1,
                            transition: 'opacity 0.3s ease',
                            position: 'absolute',
                            zIndex: isImageLoading ? 0 : 2
                          }}
                          sizes="(max-width: 768px) 100vw, 300px"
                          loading="lazy"
                          onLoad={() => {
                            setUnitImagesLoading(prev => {
                              const next = new Set(prev);
                              next.delete(unit.id);
                              return next;
                            });
                          }}
                          onError={() => {
                            setUnitImagesLoading(prev => {
                              const next = new Set(prev);
                              next.delete(unit.id);
                              return next;
                            });
                          }}
                          onLoadingComplete={() => {
                            setUnitImagesLoading(prev => {
                              const next = new Set(prev);
                              next.delete(unit.id);
                              return next;
                            });
                          }}
                        />
                      </div>
                    )}
                  <div className={styles.unitDetails}>
                    <div className={styles.unitPrice}>
                      {unit.priceAED && unit.priceAED > 0 
                        ? `${formatPrice(unit.priceAED)} AED` 
                        : (t('priceOnRequest') || 'On request')}
                    </div>
                      <div className={styles.unitSize}>
                        {locale === 'ru' ? (
                          <>
                            {formatSize(unit.totalSize)} {t('sqm')}
                            {unit.totalSizeSqft && ` (${formatSize(unit.totalSizeSqft)} ${t('sqft')})`}
                          </>
                        ) : (
                          <>
                            {unit.totalSizeSqft ? `${formatSize(unit.totalSizeSqft)} ${t('sqft')}` : `${formatSize(unit.totalSize * 10.764)} ${t('sqft')}`}
                            {` (${formatSize(unit.totalSize)} ${t('sqm')})`}
                          </>
                        )}
                        {unit.balconySize && unit.balconySize > 0 && (
                          <span className={styles.balconySize}>
                            {' '}+ {locale === 'ru' ? (
                              <>
                                {formatSize(unit.balconySize)} {t('sqm')}
                                {unit.balconySizeSqft && ` (${formatSize(unit.balconySizeSqft)} ${t('sqft')})`}
                              </>
                            ) : (
                              <>
                                {unit.balconySizeSqft ? formatSize(unit.balconySizeSqft) : formatSize(unit.balconySize * 10.764)} {t('sqft')}
                                {` (${formatSize(unit.balconySize)} ${t('sqm')})`}
                              </>
                            )} {t('balcony')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {/* Other Properties Section */}
      <div className={styles.otherPropertiesSection} ref={otherPropertiesSectionRef}>
        {(otherProperties.length > 0 || loadingOtherProperties || shouldLoadOtherProperties) && (
          <>
            <div className={styles.otherPropertiesHeader}>
            <h2 className={styles.otherPropertiesTitle}>
              {locale === 'ru' ? 'Другие объекты' : 'Other Properties'}
            </h2>
            <div className={styles.scrollButtons}>
              <button 
                className={`${styles.scrollButton} ${styles.left}`}
                onClick={() => {
                  if (otherPropertiesScrollRef.current && otherPropertiesCardsRef.current) {
                    const firstCard = otherPropertiesCardsRef.current.firstElementChild as HTMLElement;
                    if (firstCard) {
                      const cardWidth = firstCard.offsetWidth;
                      const gap = 24;
                      const scrollAmount = cardWidth + gap;
                      otherPropertiesScrollRef.current.scrollBy({
                        left: -scrollAmount,
                        behavior: 'smooth',
                      });
                    }
                  }
                }}
                aria-label="Scroll left"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className={`${styles.scrollButton} ${styles.right}`}
                onClick={() => {
                  if (otherPropertiesScrollRef.current && otherPropertiesCardsRef.current) {
                    const firstCard = otherPropertiesCardsRef.current.firstElementChild as HTMLElement;
                    if (firstCard) {
                      const cardWidth = firstCard.offsetWidth;
                      const gap = 24;
                      const scrollAmount = cardWidth + gap;
                      otherPropertiesScrollRef.current.scrollBy({
                        left: scrollAmount,
                        behavior: 'smooth',
                      });
                    }
                  }
                }}
                aria-label="Scroll right"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className={styles.otherPropertiesScrollWrapper}>
            <div className={styles.otherPropertiesScrollContainer} ref={otherPropertiesScrollRef}>
              <div className={styles.otherPropertiesCardsWrapper} ref={otherPropertiesCardsRef}>
                {loadingOtherProperties ? (
                  <div className={styles.loadingOtherProperties}>Loading...</div>
                ) : (
                  otherProperties.map((prop) => (
                    <div key={prop.id} className={styles.otherPropertyCardWrapper}>
                      <PropertyCard property={prop} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
