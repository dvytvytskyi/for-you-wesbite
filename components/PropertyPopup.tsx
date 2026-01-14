'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './PropertyPopup.module.css';
import { useFavorites } from '@/lib/favoritesContext';
import { Property as ApiProperty } from '@/lib/api';
import { getOptimizedImageUrl } from '@/lib/images';

interface Property {
  id: string;
  name: string;
  nameRu: string;
  location: {
    area: string;
    areaRu: string;
    city: string;
    cityRu: string;
  };
  price: {
    usd: number;
    aed: number;
    eur: number;
  };
  developer: {
    name: string;
    nameRu: string;
  };
  bedrooms: number;
  bathrooms: number;
  size: {
    sqm: number;
    sqft: number;
  };
  images: string[];
  type: 'new' | 'secondary';
  amenities?: string[];
  units?: Array<{
    bedrooms: number;
    bathrooms: number;
    size: { sqm: number; sqft: number };
    price: { aed: number };
  }>;
  description?: string;
  descriptionRu?: string;
  isForYouChoice?: boolean;
}

interface PropertyPopupProps {
  property: Property | null;
  onClose: () => void;
}

export default function PropertyPopup({ property, onClose }: PropertyPopupProps) {
  const t = useTranslations('propertyCard');
  const locale = useLocale();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevImageIndex, setPrevImageIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isFavorite: checkFavorite, toggleFavorite } = useFavorites();
  const isFavorite = property ? checkFavorite(property.id) : false;
  const [isClosing, setIsClosing] = useState(false);

  if (!property) return null;

  const getPropertyPath = () => {
    const localePrefix = locale === 'en' ? '' : `/${locale}`;
    return `${localePrefix}/properties/${property.id}`;
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getName = () => locale === 'ru' ? property.nameRu : property.name;
  const getLocation = () => {
    const area = locale === 'ru' ? property.location.areaRu : property.location.area;
    const city = locale === 'ru' ? property.location.cityRu : property.location.city;
    return `${area}, ${city}`;
  };
  const getDeveloper = () => locale === 'ru' ? property.developer.nameRu : property.developer.name;
  const getDescription = () => locale === 'ru' ? property.descriptionRu : property.description;
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const handleImageChange = (dir: 'prev' | 'next') => {
    if (property.images.length <= 1 || isTransitioning) return;

    setIsTransitioning(true);
    setPrevImageIndex(currentImageIndex);
    setDirection(dir === 'next' ? 'right' : 'left');

    const newIndex = dir === 'next'
      ? (currentImageIndex + 1) % property.images.length
      : currentImageIndex === 0 ? property.images.length - 1 : currentImageIndex - 1;

    setCurrentImageIndex(newIndex);

    setTimeout(() => {
      setIsTransitioning(false);
      setDirection(null);
    }, 500);
  };

  return (
    <div className={`${styles.overlay} ${isClosing ? styles.closing : ''}`} onClick={handleClose}>
      <div className={`${styles.popup} ${isClosing ? styles.closing : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.scrollArea}>
          {/* Image with scroll */}
          <div className={styles.imageContainer}>
            <button className={styles.closeButton} onClick={handleClose} aria-label="Close"></button>
            {property.isForYouChoice && (
              <div className={styles.exclusiveBadge}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                </svg>
                {t('exclusiveForYou') || 'Exclusive ForYou'}
              </div>
            )}
            {property.images.length > 0 && (
              <div className={styles.imageWrapper}>
                {/* Previous image - sliding out */}
                {isTransitioning && prevImageIndex !== currentImageIndex && (
                  <Image
                    key={`prev-${prevImageIndex}`}
                    src={getOptimizedImageUrl(property.images[prevImageIndex], 800)}
                    alt={getName()}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 560px"
                    className={`${styles.cardImage} ${styles.prevImage} ${direction === 'right' ? styles.slideOutLeft : styles.slideOutRight}`}
                    loading="lazy"
                    unoptimized={!property.images[prevImageIndex].includes('res.cloudinary.com')}
                  />
                )}
                {/* Current image - sliding in */}
                <Image
                  key={`current-${currentImageIndex}`}
                  src={getOptimizedImageUrl(property.images[currentImageIndex], 800)}
                  alt={getName()}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 560px"
                  className={`${styles.cardImage} ${direction === 'right' ? styles.slideInRight : direction === 'left' ? styles.slideInLeft : ''}`}
                  priority
                  unoptimized={!property.images[currentImageIndex].includes('res.cloudinary.com')}
                />
              </div>
            )}
            {property.images.length > 1 && (
              <>
                <button
                  className={`${styles.imageNav} ${styles.prev}`}
                  onClick={(e) => {
                    e.stopPropagation();
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
                    e.stopPropagation();
                    handleImageChange('next');
                  }}
                  aria-label="Next image"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className={styles.imageIndicator}>
                  {currentImageIndex + 1} / {property.images.length}
                </div>
              </>
            )}
          </div>

          <div className={styles.content}>
            {/* Title and Favorite */}
            <div className={styles.titleRow}>
              <h2 className={styles.title}>{getName()}</h2>
              <button
                className={styles.favoriteButton}
                onClick={() => {
                  if (property) toggleFavorite(property as any as ApiProperty);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={isFavorite ? 'currentColor' : 'none'}
                  />
                </svg>
              </button>
            </div>

            {/* Location and Developer */}
            <div className={styles.locationRow}>
              <div className={styles.location}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0C4.7 0 2 2.7 2 6c0 4.5 6 10 6 10s6-5.5 6-10c0-3.3-2.7-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="currentColor" />
                </svg>
                <span>{getLocation()}</span>
              </div>
              <div className={styles.developer}>
                <span>{getDeveloper()}</span>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className={styles.amenities}>
                <h3 className={styles.sectionTitle}>Amenities</h3>
                <ul className={styles.amenitiesList}>
                  {property.amenities.map((amenity, index) => (
                    <li key={index}>{amenity}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Available Units */}
            {property.units && property.units.length > 0 && (
              <div className={styles.units}>
                <h3 className={styles.sectionTitle}>Available Units</h3>
                <div className={styles.unitsList}>
                  {property.units.map((unit, index) => (
                    <div key={index} className={styles.unitItem}>
                      <span>{unit.bedrooms} beds</span>
                      <span>{unit.bathrooms} baths</span>
                      <span>{formatPrice(unit.size.sqft)} sq.ft</span>
                      <span className={styles.unitPrice}>
                        {unit.price.aed && unit.price.aed > 0
                          ? `${formatPrice(unit.price.aed)} AED`
                          : 'On request'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {getDescription() && (
              <div className={styles.description}>
                <h3 className={styles.sectionTitle}>Description</h3>
                <p>{getDescription()}</p>
              </div>
            )}
          </div>
        </div>


        {/* Fixed bottom actions */}
        <div className={styles.bottomActions}>
          <Link
            href={getPropertyPath()}
            className={styles.actionButton}
            onClick={handleClose}
          >
            View full property
          </Link>
          <button
            className={`${styles.actionButton} ${isFavorite ? styles.actionButtonLiked : ''}`}
            onClick={() => {
              if (property) toggleFavorite(property as any as ApiProperty);
            }}
          >
            {isFavorite ? 'Liked' : 'Add to likes'}
          </button>
          <button className={`${styles.actionButton} ${styles.hideOnMobile}`} onClick={handleClose}>
            Back to map
          </button>
        </div>
      </div>
    </div>
  );
}

