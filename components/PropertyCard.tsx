'use client';

import { useState, useEffect, memo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { saveScrollState } from '@/lib/scrollRestoration';
import styles from './PropertyCard.module.css';

interface PropertyCardProps {
  property: Property;
  currentPage?: number;
}

function PropertyCard({ property, currentPage = 1 }: PropertyCardProps) {
  const t = useTranslations('propertyCard');
  const locale = useLocale();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevImageIndex, setPrevImageIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const getName = () => {
    return property.name; // API повертає name (без окремих nameRu)
  };

  const getLocation = () => {
    // For off-plan properties: area is a string "areaName, cityName" or null
    // For secondary properties: area is an object
    if (property.area === null || property.area === undefined) {
      // If area is null, try to use city if available
      if (property.city) {
        return locale === 'ru' ? property.city.nameRu : property.city.nameEn;
      }
      return '';
    }
    
    if (typeof property.area === 'string') {
      // Off-plan: area already contains "areaName, cityName"
      return property.area;
    }
    
    // Secondary: area is an object, need to combine with city
    if (!property.city) {
      // If no city, just return area name
      return locale === 'ru' ? property.area.nameRu : property.area.nameEn;
    }
    
    const areaName = locale === 'ru' ? property.area.nameRu : property.area.nameEn;
    const cityName = locale === 'ru' ? property.city.nameRu : property.city.nameEn;
    
    // Format: "area name, city name"
    const parts = [];
    if (areaName) parts.push(areaName);
    if (cityName) parts.push(cityName);
    
    return parts.join(', ');
  };

  const getDeveloper = () => {
    return property.developer?.name || '';
  };

  const getPrice = () => {
    if (property.propertyType === 'off-plan') {
      return property.priceFromAED && property.priceFromAED > 0 ? property.priceFromAED : null;
    } else {
      return property.priceAED && property.priceAED > 0 ? property.priceAED : null;
    }
  };

  const getBedrooms = () => {
    if (property.propertyType === 'off-plan') {
      // For off-plan: use bedroomsFrom/bedroomsTo
      if (property.bedroomsFrom !== null && property.bedroomsFrom !== undefined) {
        if (property.bedroomsTo !== null && property.bedroomsTo !== undefined && property.bedroomsTo !== property.bedroomsFrom) {
          return `${property.bedroomsFrom}-${property.bedroomsTo}`;
        } else if (property.bedroomsFrom > 0) {
          return `${property.bedroomsFrom}`;
        }
      }
      return '';
    } else {
      // For secondary: use bedrooms
      if (property.bedrooms !== null && property.bedrooms !== undefined && property.bedrooms > 0) {
        return `${property.bedrooms}`;
      }
      return '';
    }
  };

  const getBathrooms = () => {
    if (property.propertyType === 'off-plan') {
      // For off-plan properties, bathroomsFrom/To are always null
      return '';
    } else {
      return property.bathrooms || '';
    }
  };

  const getSize = () => {
    if (property.propertyType === 'off-plan') {
      // For off-plan: use sizeFrom/sizeTo
      const sizeFrom = property.sizeFrom;
      const sizeTo = property.sizeTo;
      const sizeFromSqft = property.sizeFromSqft;
      const sizeToSqft = property.sizeToSqft;
      
      // Check if we have valid size data
      if (sizeFrom !== null && sizeFrom !== undefined && sizeFrom > 0) {
        if (sizeTo !== null && sizeTo !== undefined && sizeTo > 0 && sizeTo !== sizeFrom) {
          // Range: from - to
          let from: number;
          let to: number;
          if (locale === 'ru') {
            from = sizeFrom;
            to = sizeTo;
          } else {
            from = sizeFromSqft !== null && sizeFromSqft !== undefined && sizeFromSqft > 0 
              ? sizeFromSqft 
              : Math.round(sizeFrom * 10.764);
            to = sizeToSqft !== null && sizeToSqft !== undefined && sizeToSqft > 0
              ? sizeToSqft
              : Math.round(sizeTo * 10.764);
          }
          const unit = locale === 'ru' ? 'м²' : 'sq.ft';
          return `${formatNumber(from)} - ${formatNumber(to)} ${unit}`;
        } else {
          // Single value: from
          let size: number;
          if (locale === 'ru') {
            size = sizeFrom;
          } else {
            size = sizeFromSqft !== null && sizeFromSqft !== undefined && sizeFromSqft > 0
              ? sizeFromSqft
              : Math.round(sizeFrom * 10.764);
          }
          const unit = locale === 'ru' ? 'м²' : 'sq.ft';
          return `${formatNumber(size)} ${unit}`;
        }
      }
      // No valid size data
      return '';
    } else {
      // For secondary: use size/sizeSqft
      const size = property.size;
      const sizeSqft = property.sizeSqft;
      
      if (size !== null && size !== undefined && size > 0) {
        let displaySize: number;
        if (locale === 'ru') {
          displaySize = size;
        } else {
          displaySize = sizeSqft !== null && sizeSqft !== undefined && sizeSqft > 0
            ? sizeSqft
            : Math.round(size * 10.764);
        }
        const unit = locale === 'ru' ? 'м²' : 'sq.ft';
        return `${formatNumber(displaySize)} ${unit}`;
      }
      // No valid size data
      return '';
    }
  };

  const getPricePerSqm = () => {
    // Get price directly from property, not from getPrice() which returns null
    let price: number | null = null;
    if (property.propertyType === 'off-plan') {
      price = (property.priceFromAED && property.priceFromAED > 0) ? property.priceFromAED : null;
    } else {
      price = (property.priceAED && property.priceAED > 0) ? property.priceAED : null;
    }
    
    if (!price || price === 0) {
      return 'N/A';
    }
    
    let size: number;
    if (property.propertyType === 'off-plan') {
      size = property.sizeFrom || 0;
    } else {
      size = property.size || 0;
    }
    
    if (!size || size === 0) {
      return 'N/A';
    }
    
    // Calculate price per sqm in AED (price is already in AED)
    const pricePerSqm = price / size;
    if (isNaN(pricePerSqm) || !isFinite(pricePerSqm)) {
      return 'N/A';
    }
    
    return formatNumber(Math.round(pricePerSqm));
  };

  // Limit to first 5 photos for performance
  const MAX_PHOTOS_TO_LOAD = 5;
  const visiblePhotos = property.photos?.slice(0, MAX_PHOTOS_TO_LOAD) || [];
  const hasMorePhotos = (property.photos?.length || 0) > MAX_PHOTOS_TO_LOAD;
  const totalPhotos = property.photos?.length || 0;

  const handleImageChange = (dir: 'prev' | 'next') => {
    // Calculate max index based on available photos
    const maxVisibleIndex = visiblePhotos.length - 1;
    const totalAvailable = hasMorePhotos ? MAX_PHOTOS_TO_LOAD + 1 : visiblePhotos.length; // 5 photos + 1 blur = 6 total
    
    if (totalAvailable <= 1 || isTransitioning) return;
    
    setIsTransitioning(true);
    setPrevImageIndex(currentImageIndex);
    setDirection(dir === 'next' ? 'right' : 'left');
    
    let newIndex: number;
    if (dir === 'next') {
      // If at last visible photo (index 4) and has more, go to blur placeholder (index 5)
      if (currentImageIndex === maxVisibleIndex && hasMorePhotos) {
        newIndex = MAX_PHOTOS_TO_LOAD; // Index 5 = blur placeholder
      } else if (currentImageIndex === MAX_PHOTOS_TO_LOAD) {
        // If at blur placeholder, wrap to first photo
        newIndex = 0;
      } else {
        newIndex = currentImageIndex + 1;
      }
    } else {
      // If at blur placeholder (index 5), go to last visible photo (index 4)
      if (currentImageIndex === MAX_PHOTOS_TO_LOAD) {
        newIndex = maxVisibleIndex;
      } else if (currentImageIndex === 0) {
        // If at first photo, wrap to blur placeholder if exists, otherwise to last
        newIndex = hasMorePhotos ? MAX_PHOTOS_TO_LOAD : maxVisibleIndex;
      } else {
        newIndex = currentImageIndex - 1;
      }
    }
    
    setCurrentImageIndex(newIndex);
    
    setTimeout(() => {
      setIsTransitioning(false);
      setDirection(null);
    }, 500);
  };

  // Reset image loading when property changes
  useEffect(() => {
    setImageLoading(true);
    setCurrentImageIndex(0);
    
    // Ensure we don't load more than 5 photos
    // Limit property.photos to first 5 for performance
    if (property.photos && property.photos.length > MAX_PHOTOS_TO_LOAD) {
      // This is just for reference - actual limiting happens in visiblePhotos
    }
    }, [property.id, property.photos, property.name]);

  const handleClick = () => {
    // Save scroll position and page before navigating
    saveScrollState(currentPage);
  };

  return (
    <Link 
      href={getLocalizedPath(`/properties/${property.id}`)} 
      className={styles.card}
      onClick={handleClick}
    >
      <div className={styles.imageContainer}>
        <div className={styles.imageGradientTop}></div>
        <div className={styles.imageGradientBottom}></div>
        {/* Image skeleton while loading */}
        {imageLoading && (
          <div className={styles.imageSkeleton}></div>
        )}
        {/* Ensure photos is an array and has at least one valid URL */}
        {Array.isArray(property.photos) && property.photos.length > 0 && property.photos[0] && (
          <div className={styles.imageWrapper} style={{ opacity: imageLoading ? 0 : 1, transition: 'opacity 0.3s ease' }}>
            {/* Show blur placeholder for 6th photo and beyond */}
            {currentImageIndex >= MAX_PHOTOS_TO_LOAD ? (
              <div className={styles.blurredPlaceholder}>
                <div className={styles.blurredImage}>
                  {visiblePhotos[0] && (
                    <Image
                      src={visiblePhotos[0]}
                      alt={getName()}
                      fill
                      style={{ objectFit: 'cover', filter: 'blur(10px)', transform: 'scale(1.1)' }}
                      sizes="(max-width: 1200px) 50vw, (max-width: 900px) 100vw, 33vw"
                      loading="lazy"
                      unoptimized
                    />
                  )}
                </div>
                <div className={styles.viewAllOverlay}>
                  <button 
                    className={styles.viewAllButton}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Navigate to property detail page
                      window.location.href = getLocalizedPath(`/properties/${property.id}`);
                    }}
                  >
                    View All
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Previous image - sliding out */}
                {isTransitioning && prevImageIndex !== currentImageIndex && prevImageIndex < MAX_PHOTOS_TO_LOAD && visiblePhotos[prevImageIndex] && (
                  <Image
                    key={`prev-${prevImageIndex}`}
                    src={visiblePhotos[prevImageIndex]}
                    alt={getName()}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 1200px) 50vw, (max-width: 900px) 100vw, 33vw"
                    className={`${styles.cardImage} ${styles.prevImage} ${direction === 'right' ? styles.slideOutLeft : styles.slideOutRight}`}
                    loading="lazy"
                    unoptimized={(() => {
                      // Use unoptimized for external images that might not be in remotePatterns
                      const src = visiblePhotos[prevImageIndex];
                      if (!src || src === '/golf.jpg' || !src.startsWith('http')) {
                        return false; // Local images can be optimized
                      }
                      return true; // External images use unoptimized
                    })()}
                  />
                )}
                {/* Current image - sliding in - only load if index < 5 */}
                {currentImageIndex < MAX_PHOTOS_TO_LOAD && visiblePhotos[currentImageIndex] && (
                  <Image
                    key={`current-${currentImageIndex}`}
                    src={visiblePhotos[currentImageIndex]}
                    alt={getName()}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 1200px) 50vw, (max-width: 900px) 100vw, 33vw"
                    className={`${styles.cardImage} ${styles.currentImage} ${isTransitioning && direction === 'right' ? styles.slideInRight : isTransitioning && direction === 'left' ? styles.slideInLeft : ''}`}
                    loading={currentImageIndex === 0 ? 'eager' : 'lazy'}
                    unoptimized={(() => {
                      // Use unoptimized for external images that might not be in remotePatterns
                      const src = visiblePhotos[currentImageIndex];
                      if (!src || src === '/golf.jpg' || !src.startsWith('http')) {
                        return false; // Local images can be optimized
                      }
                      return true; // External images use unoptimized
                    })()}
                    onLoad={() => {
                      setImageLoading(false);
                      }}
                    onError={(e) => {setImageLoading(false);
                    }}
                  />
                )}
              </>
            )}
          </div>
        )}
        {/* Placeholder when no photos */}
        {(!Array.isArray(property.photos) || property.photos.length === 0 || !property.photos[0]) && (
          <div className={styles.imageWrapper}>
            <div className={styles.placeholderImage}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.105 20 20 19.105 20 18V6C20 4.895 19.105 4 18 4H6C4.895 4 4 4.895 4 6V18C4 19.105 4.895 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        )}
        {property.photos && property.photos.length > 1 && (visiblePhotos.length > 1 || hasMorePhotos) && (
          <>
            <button
              className={`${styles.imageNav} ${styles.prev}`}
              onClick={(e) => {
                e.preventDefault();
                handleImageChange('prev');
              }}
              aria-label="Previous image"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              className={`${styles.imageNav} ${styles.next}`}
              onClick={(e) => {
                e.preventDefault();
                handleImageChange('next');
              }}
              aria-label="Next image"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className={styles.imageIndicator}>
              {currentImageIndex + 1} / {totalPhotos}
            </div>
          </>
        )}
        <div className={styles.badgesContainer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className={styles.typeBadge}>
              {property.propertyType === 'off-plan' ? (t('type.offPlan') || 'Off Plan') : (t('type.secondary') || 'Secondary')}
            </div>
            {property.developer && (
              <div className={styles.developerBadge}>
                {property.developer.logo && (
                  <img src={property.developer.logo} alt={getDeveloper()} className={styles.developerLogo} />
                )}
                <span className={styles.developerName}>{getDeveloper()}</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className={styles.favoriteButton}
              onClick={(e) => {
                e.preventDefault();
                setIsFavorite(!isFavorite);
              }}
              aria-label="Add to favorites"
            >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={isFavorite ? 'currentColor' : 'none'}
              />
            </svg>
          </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.locationRow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className={styles.locationText}>{getLocation()}</span>
        </div>

        <h3 className={styles.title}>{getName()}</h3>

        <div className={styles.details}>
          {getBedrooms() && (
            <div className={styles.detailItem}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V6C17 5.44772 16.5523 5 16 5H4C3.44772 5 3 5.44772 3 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 5V3C7 2.44772 7.44772 2 8 2H12C12.5523 2 13 2.44772 13 3V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 10H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 13H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{getBedrooms()} {locale === 'ru' ? 'спалень' : 'beds'}</span>
            </div>
          )}
          {getBathrooms() && (
            <div className={styles.detailItem}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6C4 5.44772 4.44772 5 5 5H15C15.5523 5 16 5.44772 16 6V14C16 14.5523 15.5523 15 15 15H5C4.44772 15 4 14.5523 4 14V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="7.5" cy="11" r="0.8" fill="currentColor"/>
                <circle cx="12.5" cy="11" r="0.8" fill="currentColor"/>
                <path d="M10 8V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{getBathrooms()} {locale === 'ru' ? 'ванн' : 'baths'}</span>
            </div>
          )}
          {getSize() && (
            <div className={styles.detailItem}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 9H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{getSize()}</span>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.price}>
            <span className={styles.priceAmount}>
              {(() => {
                const price = getPrice();
                if (!price || price === 0) {
                  return t('priceOnRequest');
                }
                if (property.propertyType === 'off-plan') {
                  return `From ${formatNumber(price)} AED`;
                }
                return `${formatNumber(price)} AED`;
              })()}
            </span>
          </div>
          {(() => {
            const pricePerSqm = getPricePerSqm();
            if (pricePerSqm !== 'N/A') {
              return (
                <div className={styles.pricePerSqm}>
                  {pricePerSqm} AED/sq.m
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>
    </Link>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(PropertyCard, (prevProps, nextProps) => {
  // Only re-render if property ID or key properties change
  return (
    prevProps.property.id === nextProps.property.id &&
    prevProps.property.photos?.[0] === nextProps.property.photos?.[0] &&
    prevProps.property.priceAED === nextProps.property.priceAED &&
    prevProps.property.priceFromAED === nextProps.property.priceFromAED
  );
});

