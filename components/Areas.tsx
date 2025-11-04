'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import styles from './Areas.module.css';

interface Area {
  id: string;
  name: string;
  nameRu: string;
  projectsCount: number;
  image: string;
}

const areas: Area[] = [
  { id: 'palm', name: 'Palm Jumeirah', nameRu: 'Пальм Джумейра', projectsCount: 10, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop' },
  { id: 'business-bay', name: 'Business Bay', nameRu: 'Бізнес Бей', projectsCount: 40, image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop' },
  { id: 'downtown', name: 'Downtown Dubai', nameRu: 'Даунтаун Дубай', projectsCount: 5, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop' },
  { id: 'town-square', name: 'Town Square', nameRu: 'Таун Сквер', projectsCount: 2, image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop' },
  { id: 'dubai-marina', name: 'Dubai Marina', nameRu: 'Дубай Марина', projectsCount: 32, image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop' },
  { id: 'dubai-hills', name: 'Dubai Hills', nameRu: 'Дубай Хіллз', projectsCount: 22, image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop' },
  { id: 'jbr', name: 'JBR', nameRu: 'JBR', projectsCount: 18, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop' },
  { id: 'dubai-creek', name: 'Dubai Creek', nameRu: 'Дубай Крік', projectsCount: 15, image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop' },
];

export default function Areas() {
  const t = useTranslations('areas');
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardsWrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const getAreaName = (area: Area) => {
    return locale === 'ru' ? area.nameRu : area.name;
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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current && cardsWrapperRef.current) {
      const firstCard = cardsWrapperRef.current.firstElementChild as HTMLElement;
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth;
        const gap = 24; // gap between cards
        const scrollAmount = cardWidth + gap;
        
        scrollRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <section className={styles.areas} ref={sectionRef}>
      <div className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('title')}</h2>
          <div className={styles.descriptionWrapper}>
            <p className={styles.description}>{t('description')}</p>
            <div className={styles.scrollButtons}>
              <button 
                className={`${styles.scrollButton} ${styles.left}`}
                onClick={() => scroll('left')}
                aria-label="Scroll left"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className={`${styles.scrollButton} ${styles.right}`}
                onClick={() => scroll('right')}
                aria-label="Scroll right"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.scrollWrapper}>
          <div className={styles.scrollContainer} ref={scrollRef}>
            <div className={styles.cardsWrapper} ref={cardsWrapperRef}>
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
                      sizes="(max-width: 1200px) 33vw, (max-width: 900px) 50vw, 25vw"
                    />
                    <div className={styles.cardOverlay}></div>
                    <div className={styles.cardContent}>
                      <h3 className={styles.cardTitle}>{getAreaName(area)}</h3>
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
        </div>
      </div>
    </section>
  );
}

