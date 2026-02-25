'use client';

import { useState, useEffect, memo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/lib/api';
import { getOptimizedImageUrl } from '@/lib/images';
import { formatNumber } from '@/lib/utils';
import { saveScrollState } from '@/lib/scrollRestoration';
import { useFavorites } from '@/lib/favoritesContext';
import styles from './PropertyCard.module.css';

interface PropertyCardProps {
  property: Property;
  currentPage?: number;
  index?: number;
  isSelected?: boolean;
  isMapView?: boolean;
  onSelect?: () => void;
  onRequestCallback?: (projectName?: string) => void;
}

function PropertyCard({ property, currentPage = 1, index = 10, isSelected = false, isMapView = false, onSelect, onRequestCallback }: PropertyCardProps) {
  const t = useTranslations('propertyCard');
  const locale = useLocale();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevImageIndex, setPrevImageIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // const [isFavorite, setIsFavorite] = useState(false); // Removed local state
  const isFav = isFavorite(property.id);
  const [imageLoading, setImageLoading] = useState(true);
  const [isInteracted, setIsInteracted] = useState(false);

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

  // Limit to first 5 photos for performance - CRITICAL: only use first 5 photos
  const MAX_PHOTOS_TO_LOAD = 5;
  // Force limit to first 5 photos - don't allow more
  // Prefer property.images (small) for optimized loading, fallback to photos
  const allPhotos = (property.images && property.images.length > 0)
    ? property.images.map(img => img.small)
    : (Array.isArray(property.photos) ? property.photos : []);
  const visiblePhotos = allPhotos.slice(0, MAX_PHOTOS_TO_LOAD);
  const hasMorePhotos = allPhotos.length > MAX_PHOTOS_TO_LOAD;
  const totalPhotos = allPhotos.length;

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
  }, [property.id, property.photos, property.images, property.name]);

  // Manual prefetching removed in favor of hidden pre-rendering

  const handleMouseEnter = () => {
    setIsInteracted(true);
  };

  const handleClick = () => {
    // Save scroll position and page before navigating
    saveScrollState(currentPage);
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleImageChange('next');
    } else if (isRightSwipe) {
      handleImageChange('prev');
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
      onClick={(e) => {
        if (!isMapView) {
          // Direct navigation in list mode
          handleClick();
          return;
        }

        if (onSelect) {
          e.preventDefault();
          onSelect();
        }
      }}
      onMouseEnter={handleMouseEnter}
    >
      {!isMapView && (
        <Link
          href={getLocalizedPath(`/properties/${property.slug}`)}
          className={styles.fullCardLink}
          onClick={handleClick}
        />
      )}
      <div
        className={styles.imageContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.imageGradientTop}></div>
        <div className={styles.imageGradientBottom}></div>
        {/* Image skeleton while loading */}
        {imageLoading && (
          <div className={styles.imageSkeleton}>
            <svg viewBox="0 0 24 24" fill="none" className={styles.skeletonLogo} xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 7L12 12L4 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        {/* Ensure photos is an array and has at least one valid URL - ONLY use first 5 photos */}
        {visiblePhotos.length > 0 && visiblePhotos[0] && (
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
                      window.location.href = getLocalizedPath(`/properties/${property.slug}`);
                    }}
                  >
                    View All
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Previous image - sliding out */}
                {/* Render ALL visible photos for instant browsing */}
                {visiblePhotos.slice(0, MAX_PHOTOS_TO_LOAD).map((src, idx) => {
                  let imageClass = styles.preloadImage;
                  const isCurrent = idx === currentImageIndex;
                  const isPrev = idx === prevImageIndex;

                  if (isCurrent) {
                    imageClass = `${styles.cardImage} ${styles.currentImage}`;
                    if (isTransitioning) {
                      imageClass += direction === 'right' ? ` ${styles.slideInRight}` : ` ${styles.slideInLeft}`;
                    }
                  } else if (isPrev && isTransitioning) {
                    imageClass = `${styles.cardImage} ${styles.prevImage}`;
                    if (isTransitioning) {
                      imageClass += direction === 'right' ? ` ${styles.slideOutLeft}` : ` ${styles.slideOutRight}`;
                    }
                  }

                  // Render up to 5 photos with lazy loading for smooth slider experience

                  return (
                    <Image
                      key={`photo-${idx}`}
                      src={getOptimizedImageUrl(src, 800)}
                      alt={getName()}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className={imageClass}
                      // First image of top 2 cards is eager. Others lazy.
                      loading={idx === 0 && index < 2 ? 'eager' : 'lazy'}
                      priority={idx === 0 && index < 2}
                      unoptimized={!src.includes('res.cloudinary.com')}
                      onLoad={() => {
                        if (idx === 0) setImageLoading(false);
                      }}
                      onError={() => {
                        if (idx === 0) setImageLoading(false);
                      }}
                    />
                  );
                })}
              </>
            )}
          </div>
        )}
        {/* Placeholder when no photos */}
        {visiblePhotos.length === 0 && (
          <div className={styles.imageWrapper}>
            <div className={styles.placeholderImage}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.105 20 20 19.105 20 18V6C20 4.895 19.105 4 18 4H6C4.895 4 4 4.895 4 6V18C4 19.105 4.895 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}
        {(visiblePhotos.length > 1 || hasMorePhotos) && (
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
                <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Pagination Dots */}
            <div className={styles.paginationDots}>
              {Array.from({ length: Math.min(totalPhotos, 6) }).map((_, idx) => (
                <div
                  key={`dot-${idx}`}
                  className={`${styles.dot} ${idx === currentImageIndex ? styles.dotActive : ''}`}
                />
              ))}
            </div>

            <div className={styles.imageIndicator}>
              {currentImageIndex + 1} / {totalPhotos}
            </div>
          </>
        )}
        <div className={styles.badgesContainer}>
          <div className={styles.badgesGroup}>
            {property.isForYouChoice && (
              <div className={styles.exclusiveBadge}>
                {t('exclusiveForYou') || 'Exclusive ForYou'}
              </div>
            )}
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
          <button
            className={styles.favoriteButton}
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(property);
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
                fill={isFav ? 'currentColor' : 'none'}
              />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.locationRow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.locationText}>{getLocation()}</span>
        </div>

        <h3 className={styles.title}>{getName()}</h3>

        <div className={styles.details}>
          {getBedrooms() && (
            <div className={styles.detailItem}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V6C17 5.44772 16.5523 5 16 5H4C3.44772 5 3 5.44772 3 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 5V3C7 2.44772 7.44772 2 8 2H12C12.5523 2 13 2.44772 13 3V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 10H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 13H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>
                {(() => {
                  const bedsText = getBedrooms();
                  if (locale !== 'ru') return `${bedsText} beds`;

                  // Extract the relevant number for pluralization (last number in range)
                  const nums = bedsText.match(/\d+/g);
                  if (!nums || nums.length === 0) return `${bedsText} спален`;

                  const count = parseInt(nums[nums.length - 1], 10);

                  // Pluralization rules for Russian
                  let suffix = 'спален';
                  const n = Math.abs(count) % 100;
                  const n1 = n % 10;

                  if (n > 10 && n < 20) {
                    suffix = 'спален';
                  } else if (n1 > 1 && n1 < 5) {
                    suffix = 'спальни';
                  } else if (n1 === 1) {
                    suffix = 'спальня';
                  }

                  return `${bedsText} ${suffix}`;
                })()}
              </span>
            </div>
          )}
          {getBathrooms() && (
            <div className={styles.detailItem}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6C4 5.44772 4.44772 5 5 5H15C15.5523 5 16 5.44772 16 6V14C16 14.5523 15.5523 15 15 15H5C4.44772 15 4 14.5523 4 14V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="7.5" cy="11" r="0.8" fill="currentColor" />
                <circle cx="12.5" cy="11" r="0.8" fill="currentColor" />
                <path d="M10 8V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{getBathrooms()} {locale === 'ru' ? 'ванн' : 'baths'}</span>
            </div>
          )}
          {getSize() && (
            <div className={styles.detailItem}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 9H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
      {isSelected && isMapView && (
        <div className={styles.selectedActions} onClick={(e) => e.stopPropagation()}>
          <Link
            href={getLocalizedPath(`/properties/${property.slug}`)}
            className={styles.actionBtn}
            onClick={handleClick}
            target="_blank"
          >
            {locale === 'ru' ? 'Подробнее' : 'View Details'}
          </Link>
          <div className={styles.contactButtons}>
            <button
              className={styles.contactBtn}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onRequestCallback) onRequestCallback(getName());
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            </button>
            <button className={`${styles.contactBtn} ${styles.whatsapp}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(PropertyCard, (prevProps, nextProps) => {
  // Only re-render if property ID or key properties change
  return (
    prevProps.property.id === nextProps.property.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isMapView === nextProps.isMapView &&
    prevProps.property.images?.[0]?.small === nextProps.property.images?.[0]?.small &&
    prevProps.property.photos?.[0] === nextProps.property.photos?.[0] &&
    prevProps.property.priceAED === nextProps.property.priceAED &&
    prevProps.property.priceFromAED === nextProps.property.priceFromAED
  );
});

