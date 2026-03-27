'use client';

import { useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './PropertyPopup.module.css';
import { useFavorites } from '@/lib/favoritesContext';
import { Property as ApiProperty } from '@/lib/api';
import { getOptimizedImageUrl } from '@/lib/images';
import { formatNumber, generateWhatsAppLink, getLeadReference } from '@/lib/utils';

interface Property {
  id: string;
  slug: string;
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
  priceFromAED?: number;
  priceAED?: number;
  developer: {
    name: string;
    nameRu: string;
    logo?: string;
  };
  propertyType?: string;
  bedrooms: number;
  bathrooms: number;
  size: {
    sqm: number;
    sqft: number;
  };
  images: string[];
  type: 'new' | 'secondary' | 'rent' | 'sale';
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
  isPropertyFinder?: boolean;
}

interface PropertyPopupProps {
  property: Property | null;
  onClose: () => void;
  onRequestCallback?: (projectName?: string) => void;
}

export default function PropertyPopup({ property, onClose, onRequestCallback }: PropertyPopupProps) {
  const t = useTranslations('propertyCard');
  const tDetail = useTranslations('propertyDetail');
  const locale = useLocale();
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const imageScrollRef = useRef<HTMLDivElement>(null);
  const { isFavorite: checkFavorite, toggleFavorite } = useFavorites();
  const isFavorite = property ? checkFavorite(property.id) : false;
  const [isClosing, setIsClosing] = useState(false);

  if (!property) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    if (width > 0) {
      const index = Math.round(scrollLeft / width);
      if (index !== activeImageIndex) {
        setActiveImageIndex(index);
      }
    }
  };

  const handleImageChange = (dir: 'prev' | 'next') => {
    if (!imageScrollRef.current) return;
    const { scrollLeft, offsetWidth } = imageScrollRef.current;
    const targetScroll = dir === 'next'
      ? scrollLeft + offsetWidth
      : scrollLeft - offsetWidth;

    imageScrollRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  const getPropertyPath = () => {
    const localePrefix = locale === 'en' ? '' : `/${locale}`;
    
    if (property.isPropertyFinder) {
      const base = window.location.pathname.includes('/agent') ? 'agent' : 'app';
      return `${localePrefix}/${base}/${property.id}`;
    }
    
    return `${localePrefix}/properties/${property.slug}`;
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
  const getDeveloper = () => {
    if (!property.developer) return '';
    return locale === 'ru' ? property.developer.nameRu : property.developer.name;
  };
  const getDescription = () => locale === 'ru' ? property.descriptionRu : property.description;
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  return (
    <div className={`${styles.overlay} ${isClosing ? styles.closing : ''}`} onClick={handleClose}>
      <div className={`${styles.popup} ${isClosing ? styles.closing : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.scrollArea}>
          {/* Image with horizontal scroll */}
          <div className={styles.imageContainer}>
            <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {property.isForYouChoice && (
              <div className={styles.exclusiveBadge}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                </svg>
                {t('exclusiveForYou') || 'Exclusive ForYou'}
              </div>
            )}

            <div
              className={styles.imageScrollContainer}
              onScroll={handleScroll}
              ref={imageScrollRef}
            >
              {property.images.map((src, idx) => (
                <div key={`${property.id}-img-${idx}`} className={styles.imageSlide}>
                  <Image
                    src={getOptimizedImageUrl(src, 800)}
                    alt={`${getName()} - photo ${idx + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 560px"
                    priority={idx === 0}
                    unoptimized={!src.includes('res.cloudinary.com')}
                  />
                </div>
              ))}
              {property.images.length === 0 && (
                <div className={styles.imageSlide}>
                  <div className={styles.placeholderImage}>No images available</div>
                </div>
              )}
            </div>

            {property.images.length > 1 && (
              <>
                <button
                  className={`${styles.imageNav} ${styles.prev}`}
                  onClick={() => handleImageChange('prev')}
                  aria-label="Previous image"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  className={`${styles.imageNav} ${styles.next}`}
                  onClick={() => handleImageChange('next')}
                  aria-label="Next image"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className={styles.imageDots}>
                  {property.images.map((_, idx) => (
                    <div
                      key={`dot-${idx}`}
                      className={`${styles.dot} ${idx === activeImageIndex ? styles.activeDot : ''}`}
                      onClick={() => {
                        if (imageScrollRef.current) {
                          imageScrollRef.current.scrollTo({
                            left: idx * imageScrollRef.current.offsetWidth,
                            behavior: 'smooth'
                          });
                        }
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={styles.content}>
            {/* Title and Favorite */}
            <div className={styles.titleRow}>
              <h2 className={styles.title}>
                {getName()}
                {property.isForYouChoice && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#EBA44E" style={{ marginLeft: '6px', verticalAlign: 'middle' }}>
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                )}
              </h2>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.priceAmount}>
                {property.propertyType === 'off-plan' ? `${tDetail('from')} ` : ''}
                {formatPrice(property.priceAED || property.priceFromAED || property.price.aed)} AED
              </span>
            </div>

            {/* Location and Developer */}
            <div className={styles.locationRow}>
              <div className={styles.location}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0C4.7 0 2 2.7 2 6c0 4.5 6 10 6 10s6-5.5 6-10c0-3.3-2.7-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="currentColor" />
                </svg>
                <span>{getLocation()}</span>
              </div>
              {property.developer?.logo && (
                <div className={styles.developerLogo}>
                  <Image
                    src={property.developer.logo}
                    alt={getDeveloper()}
                    fill
                    style={{ objectFit: 'contain' }}
                    unoptimized
                  />
                </div>
              )}
              {property.developer && <span>{getDeveloper()}</span>}
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className={styles.amenities}>
                <h3 className={styles.sectionTitle}>{tDetail('facilities')}</h3>
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
                <h3 className={styles.sectionTitle}>{tDetail('availableUnits')}</h3>
                <div className={styles.unitsList}>
                  {property.units.map((unit, index) => (
                    <div key={index} className={styles.unitItem}>
                      <span>{unit.bedrooms} {tDetail('beds')}</span>
                      <span>{unit.bathrooms} {tDetail('baths')}</span>
                      <span>{formatPrice(unit.size.sqft)} {tDetail('sqft')}</span>
                      <span className={styles.unitPrice}>
                        {unit.price.aed && unit.price.aed > 0
                          ? `${formatPrice(unit.price.aed)} AED`
                          : tDetail('priceOnRequest')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {getDescription() && (
              <div className={styles.description}>
                <h3 className={styles.sectionTitle}>{tDetail('description')}</h3>
                <p>{getDescription()}</p>
              </div>
            )}
          </div>
        </div>


        {/* Fixed bottom actions */}
        <div className={styles.bottomActions}>
          <button
            className={styles.callbackButton}
            onClick={() => {
              if (onRequestCallback) onRequestCallback(getName());
            }}
          >
            {locale === 'ru' ? 'Заказать звонок' : 'Request callback'}
          </button>

          <a
            href={generateWhatsAppLink({
              phone: '971501769699', // using main line instead of 971501234567
              locale,
              propertyName: getName(),
              propertyPrice: property.priceAED || property.priceFromAED || property.price.aed,
              contextType: 'property',
            })}
            onClick={() => {
              import('@/lib/api').then(({ trackUserActivity }) => {
                trackUserActivity({
                  referenceId: getLeadReference(),
                  action: 'click_whatsapp',
                  propertyId: property.id,
                  url: window.location.href,
                });
              });
            }}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappButton}
          >
            <img
              src="https://img.icons8.com/?size=100&id=IrRDQlTuSTHb&format=png&color=ffffff"
              alt="WhatsApp"
              width="20"
              height="20"
            />
            <span>WhatsApp</span>
          </a>

          <Link
            href={getPropertyPath()}
            className={styles.iconButton}
            onClick={handleClose}
            title={locale === 'ru' ? 'Подробнее' : 'View Details'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Link>

        </div>
      </div>
    </div>
  );
}
