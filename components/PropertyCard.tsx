'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import styles from './PropertyCard.module.css';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const t = useTranslations('propertyCard');
  const locale = useLocale();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevImageIndex, setPrevImageIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const getName = () => {
    return property.name; // API повертає name (без окремих nameRu)
  };

  const getLocation = () => {
    const area = locale === 'ru' ? property.area.nameRu : property.area.nameEn;
    const city = locale === 'ru' ? property.city.nameRu : property.city.nameEn;
    return `${area}, ${city}`;
  };

  const getDeveloper = () => {
    return property.developer.name;
  };

  const getPrice = () => {
    if (property.propertyType === 'off-plan') {
      return property.priceFromAED || 0;
    } else {
      return property.priceAED || 0;
    }
  };

  const getBedrooms = () => {
    if (property.propertyType === 'off-plan') {
      return property.bedroomsFrom && property.bedroomsTo
        ? `${property.bedroomsFrom}-${property.bedroomsTo}`
        : property.bedroomsFrom || '';
    } else {
      return property.bedrooms || '';
    }
  };

  const getBathrooms = () => {
    if (property.propertyType === 'off-plan') {
      return property.bathroomsFrom && property.bathroomsTo
        ? `${property.bathroomsFrom}-${property.bathroomsTo}`
        : property.bathroomsFrom || '';
    } else {
      return property.bathrooms || '';
    }
  };

  const getSize = () => {
    if (property.propertyType === 'off-plan') {
      if (property.sizeFrom && property.sizeTo) {
        const from = locale === 'ru' ? formatNumber(property.sizeFrom) : formatNumber(property.sizeFromSqft || 0);
        const to = locale === 'ru' ? formatNumber(property.sizeTo) : formatNumber(property.sizeToSqft || 0);
        const unit = locale === 'ru' ? 'м²' : 'sq.ft';
        return `${from} - ${to} ${unit}`;
      }
      const size = locale === 'ru' ? (property.sizeFrom || 0) : (property.sizeFromSqft || 0);
      const unit = locale === 'ru' ? 'м²' : 'sq.ft';
      return `${formatNumber(size)} ${unit}`;
    } else {
      const size = locale === 'ru' ? (property.size || 0) : (property.sizeSqft || 0);
      const unit = locale === 'ru' ? 'м²' : 'sq.ft';
      return `${formatNumber(size)} ${unit}`;
    }
  };

  const getPricePerSqm = () => {
    const price = getPrice();
    let size: number;
    if (property.propertyType === 'off-plan') {
      size = property.sizeFrom || 1;
    } else {
      size = property.size || 1;
    }
    const pricePerSqm = price / size;
    return formatNumber(Math.round(pricePerSqm));
  };

  const handleImageChange = (dir: 'prev' | 'next') => {
    if (!property.photos || property.photos.length <= 1 || isTransitioning) return;
    
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

  return (
    <Link href={getLocalizedPath(`/properties/${property.id}`)} className={styles.card}>
      <div className={styles.imageContainer}>
        <div className={styles.imageGradientTop}></div>
        <div className={styles.imageGradientBottom}></div>
        {property.photos && property.photos.length > 0 && (
          <div className={styles.imageWrapper}>
            {/* Previous image - sliding out */}
            {isTransitioning && prevImageIndex !== currentImageIndex && (
              <Image
                key={`prev-${prevImageIndex}`}
                src={property.photos[prevImageIndex]}
                alt={getName()}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 1200px) 50vw, (max-width: 900px) 100vw, 33vw"
                className={`${styles.cardImage} ${styles.prevImage} ${direction === 'right' ? styles.slideOutLeft : styles.slideOutRight}`}
              />
            )}
            {/* Current image - sliding in */}
            <Image
              key={`current-${currentImageIndex}`}
              src={property.photos[currentImageIndex]}
              alt={getName()}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 1200px) 50vw, (max-width: 900px) 100vw, 33vw"
              className={`${styles.cardImage} ${styles.currentImage} ${isTransitioning && direction === 'right' ? styles.slideInRight : isTransitioning && direction === 'left' ? styles.slideInLeft : ''}`}
            />
          </div>
        )}
        {property.photos && property.photos.length > 1 && (
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
              {currentImageIndex + 1} / {property.photos?.length || 0}
            </div>
          </>
        )}
        <div className={styles.badgesContainer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className={styles.typeBadge}>
              {property.propertyType === 'off-plan' ? (t('type.offPlan') || 'Off Plan') : (t('type.secondary') || 'Secondary')}
            </div>
            <div className={styles.developerBadge}>
              {property.developer.logo && (
                <img src={property.developer.logo} alt={getDeveloper()} className={styles.developerLogo} />
              )}
              <span className={styles.developerName}>{getDeveloper()}</span>
            </div>
          </div>
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
          <div className={styles.detailItem}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V6C17 5.44772 16.5523 5 16 5H4C3.44772 5 3 5.44772 3 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 5V3C7 2.44772 7.44772 2 8 2H12C12.5523 2 13 2.44772 13 3V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 10H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 13H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{getBedrooms()} {locale === 'ru' ? 'спалень' : 'beds'}</span>
          </div>
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
          <div className={styles.detailItem}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 9H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{getSize()}</span>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.price}>
            <span className={styles.priceAmount}>
              {property.propertyType === 'off-plan' && property.priceFromAED
                ? `From ${formatNumber(property.priceFromAED)} AED`
                : `${formatNumber(getPrice())} AED`}
            </span>
          </div>
          <div className={styles.pricePerSqm}>
            {getPricePerSqm()} AED/sq.m
          </div>
        </div>
      </div>
    </Link>
  );
}

