'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import styles from './AreasList.module.css';

interface Area {
  id: string;
  name: string;
  nameRu: string;
  projectsCount: number;
  image: string;
  city?: string;
  cityRu?: string;
}

// TODO: Замінити на реальний API запит
// const fetchAreas = async (): Promise<Area[]> => {
//   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/data`);
//   const data = await response.json();
//   return data.areas || [];
// };

// Mock data - замінити на реальні дані з API
const mockAreas: Area[] = [
  { id: 'palm', name: 'Palm Jumeirah', nameRu: 'Пальм Джумейра', projectsCount: 10, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop', city: 'Dubai', cityRu: 'Дубай' },
  { id: 'business-bay', name: 'Business Bay', nameRu: 'Бізнес Бей', projectsCount: 40, image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop', city: 'Dubai', cityRu: 'Дубай' },
  { id: 'downtown', name: 'Downtown Dubai', nameRu: 'Даунтаун Дубай', projectsCount: 5, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop', city: 'Dubai', cityRu: 'Дубай' },
  { id: 'town-square', name: 'Town Square', nameRu: 'Таун Сквер', projectsCount: 2, image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop', city: 'Dubai', cityRu: 'Дубай' },
  { id: 'dubai-marina', name: 'Dubai Marina', nameRu: 'Дубай Марина', projectsCount: 32, image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop', city: 'Dubai', cityRu: 'Дубай' },
  { id: 'dubai-hills', name: 'Dubai Hills', nameRu: 'Дубай Хіллз', projectsCount: 22, image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop', city: 'Dubai', cityRu: 'Дубай' },
  { id: 'jbr', name: 'JBR', nameRu: 'JBR', projectsCount: 18, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop', city: 'Dubai', cityRu: 'Дубай' },
  { id: 'dubai-creek', name: 'Dubai Creek', nameRu: 'Дубай Крік', projectsCount: 15, image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop', city: 'Dubai', cityRu: 'Дубай' },
  { id: 'jvc', name: 'JVC', nameRu: 'JVC', projectsCount: 25, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop', city: 'Dubai', cityRu: 'Дубай' },
  { id: 'arabian-ranches', name: 'Arabian Ranches', nameRu: 'Арабіан Ранчос', projectsCount: 12, image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop', city: 'Dubai', cityRu: 'Дубай' },
  { id: 'dubai-south', name: 'Dubai South', nameRu: 'Дубай Саут', projectsCount: 8, image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop', city: 'Dubai', cityRu: 'Дубай' },
  { id: 'motor-city', name: 'Motor City', nameRu: 'Мотор Сіті', projectsCount: 6, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop', city: 'Dubai', cityRu: 'Дубай' },
];

export default function AreasList() {
  const t = useTranslations('areas');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [areas, setAreas] = useState<Area[]>(mockAreas);
  const [loading, setLoading] = useState(false);

  // TODO: Замінити на реальний API запит
  // useEffect(() => {
  //   const loadAreas = async () => {
  //     setLoading(true);
  //     try {
  //       const data = await fetchAreas();
  //       setAreas(data);
  //     } catch (error) {
  //       console.error('Failed to fetch areas:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   loadAreas();
  // }, []);

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const getAreaName = (area: Area) => {
    return locale === 'ru' ? area.nameRu : area.name;
  };

  const getCityName = (area: Area) => {
    if (area.city && area.cityRu) {
      return locale === 'ru' ? area.cityRu : area.city;
    }
    return '';
  };

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

  if (loading) {
    return (
      <section className={styles.areasList}>
        <div className={styles.container}>
          <div className={styles.loading}>{t('loading')}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.areasList} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {areas.map((area) => (
            <Link
              key={area.id}
              href={getLocalizedPath(`/areas/${area.id}`)}
              className={styles.card}
            >
              <div className={styles.cardImage}>
                <Image
                  src={area.image}
                  alt={getAreaName(area)}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 1200px) 50vw, (max-width: 900px) 100vw, 33vw"
                />
                <div className={styles.cardOverlay}></div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{getAreaName(area)}</h3>
                  {getCityName(area) && (
                    <p className={styles.cardCity}>{getCityName(area)}</p>
                  )}
                  <div className={styles.cardInfo}>
                    <span className={styles.projectsCount}>{area.projectsCount}</span>
                    <span className={styles.projectsLabel}>{t('projects')}</span>
                  </div>
                </div>
                <div className={styles.cardArrow}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5L16 12L9 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

