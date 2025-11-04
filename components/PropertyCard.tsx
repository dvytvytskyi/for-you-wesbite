'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import styles from './PropertyCard.module.css';

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
}

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const t = useTranslations('propertyCard');
  const locale = useLocale();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const getName = () => {
    return locale === 'ru' ? property.nameRu : property.name;
  };

  const getLocation = () => {
    const area = locale === 'ru' ? property.location.areaRu : property.location.area;
    const city = locale === 'ru' ? property.location.cityRu : property.location.city;
    return `${area}, ${city}`;
  };

  const getDeveloper = () => {
    return locale === 'ru' ? property.developer.nameRu : property.developer.name;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const handleImageChange = (dir: 'prev' | 'next') => {
    if (property.images.length <= 1) return;
    
    setDirection(dir === 'next' ? 'right' : 'left');
    setCurrentImageIndex((prev) => {
      if (dir === 'next') {
        return (prev + 1) % property.images.length;
      } else {
        return prev === 0 ? property.images.length - 1 : prev - 1;
      }
    });
  };

  return (
    <Link href={getLocalizedPath(`/properties/${property.id}`)} className={styles.card}>
      <div className={styles.imageContainer}>
        {property.images.length > 0 && (
          <div className={styles.imageWrapper}>
            <Image
              key={currentImageIndex}
              src={property.images[currentImageIndex]}
              alt={getName()}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 1200px) 50vw, (max-width: 900px) 100vw, 33vw"
              className={`${styles.cardImage} ${direction === 'right' ? styles.slideInRight : styles.slideInLeft}`}
            />
          </div>
        )}
        {property.images.length > 1 && (
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
              {currentImageIndex + 1} / {property.images.length}
            </div>
          </>
        )}
        <div className={styles.typeBadge}>
          {property.type === 'new' ? t('type.new') : t('type.secondary')}
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
            <span>{property.bedrooms} {locale === 'ru' ? 'спалень' : 'beds'}</span>
          </div>
          <div className={styles.detailItem}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6C4 5.44772 4.44772 5 5 5H15C15.5523 5 16 5.44772 16 6V14C16 14.5523 15.5523 15 15 15H5C4.44772 15 4 14.5523 4 14V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="7.5" cy="11" r="0.8" fill="currentColor"/>
              <circle cx="12.5" cy="11" r="0.8" fill="currentColor"/>
              <path d="M10 8V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{property.bathrooms} {locale === 'ru' ? 'ванн' : 'baths'}</span>
          </div>
          <div className={styles.detailItem}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 9H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{locale === 'ru' ? `${formatPrice(property.size.sqm)} м²` : `${formatPrice(property.size.sqft)} sq.ft`}</span>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.price}>
            <span className={styles.priceAmount}>
              ${formatPrice(property.price.usd)}
            </span>
          </div>
          <div className={styles.developer}>
            <span className={styles.developerName}>{getDeveloper()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

