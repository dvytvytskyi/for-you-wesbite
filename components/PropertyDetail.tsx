'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './PropertyDetail.module.css';

interface PropertyData {
  id: string;
  propertyType: 'off-plan' | 'secondary';
  name: string;
  description: string;
  photos: string[];
  country: {
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    code: string;
  };
  city: {
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
  };
  area: {
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
  };
  developer: {
    id: string;
    name: string;
  };
  facilities: Array<{
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    iconName: string;
  }>;
  units: Array<{
    id: string;
    unitId: string;
    type: 'apartment' | 'villa' | 'penthouse' | 'townhouse' | 'office';
    price: number;
    totalSize: number;
    balconySize: number;
    planImage: string;
  }>;
  paymentPlan?: string;
  price?: number;
  priceFrom?: number;
  priceAED?: number;
  priceFromAED?: number;
  size?: number;
  sizeFrom?: number;
  sizeTo?: number;
  sizeSqft?: number;
  sizeFromSqft?: number;
  sizeToSqft?: number;
  bedrooms?: number;
  bedroomsFrom?: number;
  bedroomsTo?: number;
  bathrooms?: number;
  bathroomsFrom?: number;
  bathroomsTo?: number;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

interface PropertyDetailProps {
  propertyId: string;
}

export default function PropertyDetail({ propertyId }: PropertyDetailProps) {
  const t = useTranslations('propertyDetail');
  const tFilters = useTranslations('filters.type');
  const tHeader = useTranslations('header.nav');
  const locale = useLocale();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
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
    // TODO: Replace with actual API call
    // const fetchProperty = async () => {
    //   try {
    //     const response = await fetch(`/api/properties/${propertyId}`);
    //     const data = await response.json();
    //     if (data.success && data.data[0]) {
    //       setProperty(data.data[0]);
    //     }
    //   } catch (error) {
    //     console.error('Error fetching property:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchProperty();

    // Mock data for now
    const mockProperty: PropertyData = {
      id: propertyId,
      propertyType: 'off-plan',
      name: 'Ultra Premium Luxury Residential Complex with World-Class Amenities',
      description: 'Beautiful property description with stunning views and modern amenities. This exceptional property offers spacious living areas with floor-to-ceiling windows providing panoramic views of the city skyline.',
      photos: [
        '/golf.jpg',
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop',
      ],
      country: {
        id: '1',
        nameEn: 'United Arab Emirates',
        nameRu: 'Объединенные Арабские Эмираты',
        nameAr: 'الإمارات العربية المتحدة',
        code: 'UAE',
      },
      city: {
        id: '1',
        nameEn: 'Dubai',
        nameRu: 'Дубай',
        nameAr: 'دبي',
      },
      area: {
        id: '1',
        nameEn: 'Downtown Dubai',
        nameRu: 'Даунтаун Дубай',
        nameAr: 'دبي مارينا',
      },
      developer: {
        id: '1',
        name: 'Emaar Properties',
      },
      facilities: [
        { id: '1', nameEn: 'Swimming Pool', nameRu: 'Бассейн', nameAr: 'مسبح', iconName: 'pool' },
        { id: '2', nameEn: 'Gym', nameRu: 'Спортзал', nameAr: 'صالة رياضية', iconName: 'gym' },
        { id: '3', nameEn: 'Parking', nameRu: 'Парковка', nameAr: 'موقف سيارات', iconName: 'parking' },
        { id: '4', nameEn: 'Security', nameRu: 'Охорона', nameAr: 'أمن', iconName: 'security' },
      ],
      units: [
        {
          id: '1',
          unitId: 'APT-101',
          type: 'apartment',
          price: 500000,
          totalSize: 120.5,
          balconySize: 15.2,
          planImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        },
        {
          id: '2',
          unitId: 'APT-102',
          type: 'apartment',
          price: 600000,
          totalSize: 150.0,
          balconySize: 20.0,
          planImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        },
      ],
      paymentPlan: '70/30 payment plan',
      priceFrom: 500000,
      priceFromAED: 1836500,
      sizeFrom: 80,
      sizeTo: 200,
      sizeFromSqft: 861.12,
      sizeToSqft: 2152.78,
      bedroomsFrom: 1,
      bedroomsTo: 3,
      bathroomsFrom: 1,
      bathroomsTo: 2,
      latitude: 25.2048,
      longitude: 55.2708,
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-01-15T10:00:00.000Z',
    };

    setTimeout(() => {
      setProperty(mockProperty);
      setLoading(false);
    }, 500);
  }, [propertyId]);

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
    return (
      <div className={styles.loading}>
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className={styles.error}>
        <p>{t('notFound')}</p>
      </div>
    );
  }

  const getName = () => property.name;
  const getDescription = () => property.description;
  const getAreaName = () => locale === 'ru' ? property.area.nameRu : property.area.nameEn;
  const getCityName = () => locale === 'ru' ? property.city.nameRu : property.city.nameEn;
  const getFacilityName = (facility: typeof property.facilities[0]) => 
    locale === 'ru' ? facility.nameRu : facility.nameEn;
  const formatPrice = (price: number) => new Intl.NumberFormat('en-US').format(price);
  const formatSize = (size: number) => new Intl.NumberFormat('en-US', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 2 
  }).format(size);

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
              <span>{getAreaName()}, {getCityName()}</span>
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

          <div className={styles.developer}>
            <span className={styles.developerLabel}>{t('developer')}:</span>
            <span className={styles.developerName}>{property.developer.name}</span>
          </div>
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

        {/* Units */}
        {property.units.length > 0 && (
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
                    <div className={styles.unitPrice}>{formatPrice(unit.price)} AED</div>
                    <div className={styles.unitSize}>
                      {formatSize(unit.totalSize)} {t('sqm')} ({formatSize(unit.totalSize * 10.764)} {t('sqft')})
                      {unit.balconySize > 0 && (
                        <span className={styles.balconySize}>
                          + {formatSize(unit.balconySize)} {t('sqm')} {t('balcony')}
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

          {/* Right Column - 30% - Contact Form */}
          <div className={styles.rightColumn}>
            <div className={styles.contactForm}>
              <h3 className={styles.contactTitle}>Meet our sales expert</h3>
              <p className={styles.contactDescription}>
                Contact us to learn more about this exclusive project and schedule a viewing.
              </p>
              
              {/* Agent Avatar */}
              <div className={styles.agentAvatar}>
                <div className={styles.avatarPlaceholder}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className={styles.agentInfo}>
                  <div className={styles.agentName}>Agent Name</div>
                  <div className={styles.agentRole}>Real Estate Agent</div>
                </div>
              </div>

              <form className={styles.form} onSubmit={(e) => { e.preventDefault(); }}>
                <div className={styles.formField}>
                  <input
                    type="text"
                    placeholder="Name"
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formField}>
                  <div className={styles.phoneInputWrapper}>
                    <span className={styles.phonePrefix}>+</span>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formField}>
                  <textarea
                    placeholder="Comment"
                    className={`${styles.input} ${styles.textarea}`}
                    rows={4}
                  ></textarea>
                </div>

                <button type="submit" className={styles.submitButton}>
                  Send
                </button>

                <div className={styles.agreeTerms}>
                  <input type="checkbox" id="agree" className={styles.checkbox} required />
                  <label htmlFor="agree" className={styles.checkboxLabel}>
                    While submitting I agree to the{' '}
                    <Link href={`/${locale}/privacy-policy`} className={styles.privacyLink}>
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </form>

              {/* Contact Methods */}
              <div className={styles.contactMethods}>
                <a href="tel:+971501234567" className={styles.contactMethod}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span>+971 50 123 4567</span>
                </a>
                <a href="https://wa.me/971501234567" target="_blank" rel="noopener noreferrer" className={styles.contactMethod}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>
                <a href="https://t.me/username" target="_blank" rel="noopener noreferrer" className={styles.contactMethod}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span>Telegram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

