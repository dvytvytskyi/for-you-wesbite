'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { PropertyFinderProject } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import styles from './PropertyFinderCard.module.css';

interface Props {
  project: PropertyFinderProject;
  anonymous?: boolean;
}

export default function PropertyFinderCard({ project, anonymous = false }: Props) {
  const t = useTranslations('propertyCard');
  const locale = useLocale();
  const [imageLoading, setImageLoading] = useState(true);

  const getPrice = () => {
    const price = project.priceAED || (typeof project.price === 'number' ? project.price * 3.673 : 0);
    if (!price || price === 0) return null;
    return `From ${formatNumber(Math.round(price))} AED`;
  };

  const getBadgeClass = () => {
    return project.status === 'completed' ? styles.badgeCompleted : styles.badgeOffPlan;
  };

  const getStatusText = () => {
    if (project.status === 'completed') return locale === 'ru' ? 'Готов' : 'Completed';
    return locale === 'ru' ? 'Строится' : 'Off-plan';
  };

  const getDetailPath = () => {
    const base = anonymous ? '/app' : '/agent';
    const path = `${base}/${project.id}`;
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  return (
    <div className={styles.card}>
      <Link href={getDetailPath()} className={styles.fullLink} />
      <div className={styles.imageContainer}>
        {project.images && project.images.length > 0 ? (
          <Image
            src={project.images[0]}
            alt={project.name}
            fill
            className={`${styles.image} ${imageLoading ? styles.imageBlur : ''}`}
            onLoad={() => setImageLoading(false)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className={styles.placeholder}>
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </div>
        )}
        
        <div className={styles.badgeContainer}>
          <span className={`${styles.badge} ${getBadgeClass()}`}>
            {getStatusText()}
          </span>
          <span className={styles.categoryBadge}>
            {project.category === 'commercial' ? (locale === 'ru' ? 'Коммерция' : 'Commercial') : (locale === 'ru' ? 'Жилая' : 'Residential')}
          </span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          {!anonymous && project.developer && (
            <div className={styles.developer}>
              <span>{project.developer}</span>
            </div>
          )}
          <h3 className={styles.title}>{project.name}</h3>
        </div>

        <div className={styles.location}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>{project.location}</span>
        </div>

        <div className={styles.footer}>
          <div className={styles.priceContainer}>
             <span className={styles.priceLabel}>{t('from') || 'From'}</span>
             <span className={styles.priceValue}>{getPrice() || (locale === 'ru' ? 'По запросу' : 'On request')}</span>
          </div>
          
          <button className={styles.detailsBtn}>
            {locale === 'ru' ? 'Подробнее' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
}
