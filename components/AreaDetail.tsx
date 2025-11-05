'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import styles from './AreaDetail.module.css';
import PropertyCard from './PropertyCard';

interface AreaDetailData {
  id: string;
  cityId: string;
  nameEn: string;
  nameRu: string;
  nameAr: string;
  description?: {
    title?: string;
    description?: string;
  };
  infrastructure?: {
    title?: string;
    description?: string;
  };
  images?: string[];
}

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

// TODO: Замінити на реальний API запит
// const fetchAreaDetail = async (slug: string): Promise<AreaDetailData | null> => {
//   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/areas/${slug}`);
//   if (!response.ok) return null;
//   return await response.json();
// };

// Mock data - замінити на реальні дані з API
const mockAreaDetails: Record<string, AreaDetailData> = {
  'palm': {
    id: 'area-1',
    cityId: 'dubai-1',
    nameEn: 'Palm Jumeirah',
    nameRu: 'Пальм Джумейра',
    nameAr: 'نخلة جميرا',
    description: {
      title: 'About Palm Jumeirah',
      description: 'Palm Jumeirah is an artificial archipelago in Dubai, United Arab Emirates, created using land reclamation by Nakheel. It is one of three planned islands in the Palm Islands trilogy. The Palm Jumeirah is home to a number of luxury hotels, residential properties, and entertainment venues. The island is shaped like a palm tree when viewed from above, with a trunk and 17 fronds.',
    },
    infrastructure: {
      title: 'Infrastructure',
      description: 'The Palm Jumeirah features world-class infrastructure including luxury hotels, shopping malls, restaurants, and entertainment facilities. The island is connected to the mainland by a monorail system and has its own private beaches, marinas, and parks. Residents enjoy access to premium amenities including spas, fitness centers, and exclusive beach clubs.',
    },
    images: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=900&fit=crop',
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&h=900&fit=crop',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&h=900&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=900&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=900&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=900&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&h=900&fit=crop',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=900&fit=crop',
    ],
  },
  'business-bay': {
    id: 'area-2',
    cityId: 'dubai-1',
    nameEn: 'Business Bay',
    nameRu: 'Бізнес Бей',
    nameAr: 'الخليج التجاري',
    description: {
      title: 'About Business Bay',
      description: 'Business Bay is a rapidly developing business district in Dubai, United Arab Emirates. It is located along the Dubai Water Canal, near Downtown Dubai. The area is designed to be a mixed-use development featuring commercial, residential, and hospitality projects. Business Bay is home to numerous skyscrapers and serves as an extension of Dubai\'s central business district.',
    },
    infrastructure: {
      title: 'Infrastructure',
      description: 'Business Bay offers excellent infrastructure with modern office buildings, residential towers, hotels, and retail spaces. The area is well-connected with major highways and the Dubai Metro system. It features waterfront promenades, parks, and easy access to Downtown Dubai. The district includes various amenities such as shopping centers, restaurants, and recreational facilities.',
    },
    images: [
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&h=900&fit=crop',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=900&fit=crop',
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&h=900&fit=crop',
    ],
  },
  'downtown': {
    id: 'area-3',
    cityId: 'dubai-1',
    nameEn: 'Downtown Dubai',
    nameRu: 'Даунтаун Дубай',
    nameAr: 'داون تاون دبي',
    description: {
      title: 'About Downtown Dubai',
      description: 'Downtown Dubai is a large-scale, mixed-use development in Dubai, United Arab Emirates. It is known for being home to the Burj Khalifa, the world\'s tallest building, and the Dubai Mall, one of the world\'s largest shopping malls. The area features luxury residential properties, hotels, and entertainment venues.',
    },
    infrastructure: {
      title: 'Infrastructure',
      description: 'Downtown Dubai boasts world-class infrastructure including the Dubai Metro, extensive road networks, and pedestrian-friendly walkways. The area features premium residential towers, luxury hotels, fine dining restaurants, and entertainment venues. Residents have access to the Dubai Fountain, Dubai Opera, and numerous cultural attractions.',
    },
    images: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=900&fit=crop',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&h=900&fit=crop',
    ],
  },
};

interface AreaDetailProps {
  slug: string;
}

export default function AreaDetail({ slug }: AreaDetailProps) {
  const t = useTranslations('areaDetail');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [area, setArea] = useState<AreaDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [properties, setProperties] = useState<Property[]>([]);

  // Прибираємо автоматичне прокручування при завантаженні сторінки
  useEffect(() => {
    // Вимикаємо scroll restoration в Next.js
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    // Скролимо вгору при монтуванні компонента
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Також перевіряємо, чи немає hash в URL
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, []);

  // TODO: Замінити на реальний API запит
  // useEffect(() => {
  //   const loadArea = async () => {
  //     setLoading(true);
  //     try {
  //       const data = await fetchAreaDetail(slug);
  //       setArea(data);
  //     } catch (error) {
  //       console.error('Failed to fetch area:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   loadArea();
  // }, [slug]);

  // TODO: Замінити на реальний API запит
  // const fetchAreaProperties = async (areaId: string): Promise<Property[]> => {
  //   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties?area=${areaId}&type=new`);
  //   const data = await response.json();
  //   return data.properties || [];
  // };

  // Mock properties для кожного району
  const getMockPropertiesForArea = (areaSlug: string): Property[] => {
    const areaName = mockAreaDetails[areaSlug]?.nameEn || '';
    const areaNameRu = mockAreaDetails[areaSlug]?.nameRu || '';
    
    // Генеруємо mock дані для офф план проектів
    const mockOffPlanProperties: Property[] = [
      {
        id: `prop-${areaSlug}-1`,
        name: `Premium Apartment in ${areaName}`,
        nameRu: `Премиум квартира в ${areaNameRu}`,
        location: {
          area: areaName,
          areaRu: areaNameRu,
          city: 'Dubai',
          cityRu: 'Дубай',
        },
        price: {
          usd: 500000,
          aed: 1836500,
          eur: 460000,
        },
        developer: {
          name: 'Emaar',
          nameRu: 'Эмаар',
        },
        bedrooms: 2,
        bathrooms: 2,
        size: {
          sqm: 120,
          sqft: 1292,
        },
        images: [
          'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop',
        ],
        type: 'new',
      },
      {
        id: `prop-${areaSlug}-2`,
        name: `Luxury Residence in ${areaName}`,
        nameRu: `Роскошная резиденция в ${areaNameRu}`,
        location: {
          area: areaName,
          areaRu: areaNameRu,
          city: 'Dubai',
          cityRu: 'Дубай',
        },
        price: {
          usd: 850000,
          aed: 3122050,
          eur: 782000,
        },
        developer: {
          name: 'Damac',
          nameRu: 'Дамак',
        },
        bedrooms: 3,
        bathrooms: 2,
        size: {
          sqm: 180,
          sqft: 1938,
        },
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
        ],
        type: 'new',
      },
      {
        id: `prop-${areaSlug}-3`,
        name: `Modern Penthouse in ${areaName}`,
        nameRu: `Современный пентхаус в ${areaNameRu}`,
        location: {
          area: areaName,
          areaRu: areaNameRu,
          city: 'Dubai',
          cityRu: 'Дубай',
        },
        price: {
          usd: 1200000,
          aed: 4407600,
          eur: 1104000,
        },
        developer: {
          name: 'Emaar',
          nameRu: 'Эмаар',
        },
        bedrooms: 4,
        bathrooms: 3,
        size: {
          sqm: 250,
          sqft: 2691,
        },
        images: [
          'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop',
        ],
        type: 'new',
      },
    ];
    
    return mockOffPlanProperties;
  };

  useEffect(() => {
    // Прибираємо автоматичне прокручування
    window.scrollTo(0, 0);
    
    // Mock data loading
    if (!slug) {
      setLoading(false);
      return;
    }
    
    const areaData = mockAreaDetails[slug] || null;
    setArea(areaData);
    
    // Завантажуємо проекти для району (тільки офф план)
    if (areaData) {
      const areaProperties = getMockPropertiesForArea(slug);
      setProperties(areaProperties);
    }
    
    setLoading(false);
    setCurrentSlide(0); // Скидаємо слайд при зміні району
  }, [slug]);

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const getAreaName = () => {
    if (!area) return '';
    if (locale === 'ru') return area.nameRu;
    if (locale === 'ar') return area.nameAr;
    return area.nameEn;
  };

  if (loading) {
    return (
      <section className={styles.areaDetail}>
        <div className={styles.container}>
          <div className={styles.loading}>{t('loading')}</div>
        </div>
      </section>
    );
  }

  if (!area) {
    return (
      <section className={styles.areaDetail}>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <h1>{t('notFound')}</h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.areaDetail} ref={sectionRef}>
      <div className={styles.container}>
        {/* Заголовок */}
        <div className={styles.header}>
          <h1 className={styles.title}>{getAreaName()}</h1>
        </div>

        {/* Галерея зображень - слайд-шоу */}
        {area.images && area.images.length > 0 && (
          <div className={styles.imagesSection}>
            <div className={styles.sliderContainer}>
              <div className={styles.sliderWrapper}>
                <div 
                  className={styles.sliderTrack}
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {area.images.slice(0, 8).map((image, index) => (
                    <div
                      key={index}
                      className={styles.slide}
                      onClick={() => setSelectedImage(image)}
                    >
                      <Image
                        src={image}
                        alt={`${getAreaName()} - Image ${index + 1}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="100vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Навігаційні кнопки */}
              {area.images.length > 1 && (
                <>
                  <button
                    className={`${styles.sliderButton} ${styles.prevButton}`}
                    onClick={() => setCurrentSlide((prev) => 
                      prev === 0 ? area.images!.length - 1 : prev - 1
                    )}
                    aria-label="Previous image"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    className={`${styles.sliderButton} ${styles.nextButton}`}
                    onClick={() => setCurrentSlide((prev) => 
                      prev === area.images!.length - 1 ? 0 : prev + 1
                    )}
                    aria-label="Next image"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  {/* Індикатори слайдів */}
                  <div className={styles.sliderIndicators}>
                    {area.images.slice(0, 8).map((_, index) => (
                      <button
                        key={index}
                        className={`${styles.indicator} ${currentSlide === index ? styles.active : ''}`}
                        onClick={() => setCurrentSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  {/* Счетчик слайдів */}
                  <div className={styles.sliderCounter}>
                    {currentSlide + 1} / {area.images.length}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Опис */}
        {area.description && (
          <div className={styles.descriptionSection}>
            {area.description.title && (
              <h2 className={styles.sectionTitle}>{area.description.title}</h2>
            )}
            {area.description.description && (
              <p className={styles.descriptionText}>{area.description.description}</p>
            )}
          </div>
        )}

        {/* Інфраструктура */}
        {area.infrastructure && (
          <div className={styles.infrastructureSection}>
            {area.infrastructure.title && (
              <h2 className={styles.sectionTitle}>{area.infrastructure.title}</h2>
            )}
            {area.infrastructure.description && (
              <p className={styles.descriptionText}>{area.infrastructure.description}</p>
            )}
          </div>
        )}

        {/* Список проектів (тільки офф план) */}
        {properties.length > 0 && (
          <div className={styles.propertiesSection}>
            <div className={styles.propertiesHeader}>
              <h2 className={styles.propertiesTitle}>{t('offPlanProperties')}</h2>
              <Link href={getLocalizedPath(`/properties?area=${slug}&type=secondary`)} className={styles.secondaryButton}>
                {t('viewAllSecondary')}
              </Link>
            </div>
            <div className={styles.propertiesGrid}>
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        )}

        {/* Модальне вікно для зображення */}
        {selectedImage && (
          <div className={styles.imageModal} onClick={() => setSelectedImage(null)}>
            <div className={styles.imageModalContent}>
              <button className={styles.imageModalClose} onClick={() => setSelectedImage(null)}>
                ×
              </button>
              <Image
                src={selectedImage}
                alt={getAreaName()}
                fill
                style={{ objectFit: 'contain' }}
                sizes="90vw"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

