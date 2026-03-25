'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { PropertyFinderProject } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { marked } from 'marked';
import styles from './PropertyFinderDetail.module.css';

interface Props {
  project: PropertyFinderProject;
  anonymous?: boolean;
}

export default function PropertyFinderDetail({ project, anonymous = false }: Props) {
  const t = useTranslations('propertyCard');
  const locale = useLocale();

  const fullData = project.fullData || {};
  let description = locale === 'ru' ? (fullData.description_ru || fullData.description) : fullData.description;
  
  if (description) {
    try {
      description = marked.parse(description, { async: false }) as string;
    } catch (e) {
      console.error('Markdown processing error:', e);
    }
  }
  
  const amenities = fullData.amenities || [];
  const images = project.images || [];

  const getPrice = () => {
    const price = project.priceAED || (typeof project.price === 'number' ? project.price * 3.673 : 0);
    if (!price || price === 0) return null;
    return `${formatNumber(Math.round(price))} AED`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.gallery}>
        {images.map((img: string, idx: number) => (
          <div key={idx} className={styles.imageWrapper}>
            <Image 
              src={img} 
              alt={`${project.name} - ${idx + 1}`} 
              fill 
              className={styles.image} 
              unoptimized
            />
          </div>
        ))}
        {images.length === 0 && (
           <div className={styles.placeholder}>No Images Available</div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.mainInfo}>
          {!anonymous && project.developer && (
            <div className={styles.developerLabel}>{project.developer}</div>
          )}
          <h1 className={styles.title}>{project.name}</h1>
          <div className={styles.location}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{project.location}</span>
          </div>

          <div className={styles.priceSection}>
            <div className={styles.priceLabel}>{locale === 'ru' ? 'Цена от' : 'Price from'}</div>
            <div className={styles.priceValue}>{getPrice() || (locale === 'ru' ? 'По запросу' : 'On request')}</div>
          </div>

          <div className={styles.badges}>
             <span className={`${styles.badge} ${project.status === 'completed' ? styles.badgeCompleted : styles.badgeOffPlan}`}>
               {project.status === 'completed' ? (locale === 'ru' ? 'Готов' : 'Completed') : (locale === 'ru' ? 'Строится' : 'Off-plan')}
             </span>
             <span className={styles.categoryBadge}>
               {project.category === 'commercial' ? (locale === 'ru' ? 'Коммерция' : 'Commercial') : (locale === 'ru' ? 'Жилая' : 'Residential')}
             </span>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{locale === 'ru' ? 'Описание' : 'Description'}</h2>
            <div className={styles.description} dangerouslySetInnerHTML={{ __html: description || '' }} />
          </div>

          {amenities.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{locale === 'ru' ? 'Удобства' : 'Amenities'}</h2>
              <ul className={styles.amenitiesList}>
                {amenities.map((item: any, idx: number) => (
                  <li key={idx} className={styles.amenityItem}>
                    <span>{typeof item === 'string' ? item : item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{locale === 'ru' ? 'Техническая информация' : 'Technical Information'}</h2>
            <div className={styles.techInfo}>
               {fullData.dld_project_id && (
                 <div className={styles.infoRow}>
                   <span className={styles.infoLabel}>DLD ID:</span>
                   <span className={styles.infoValue}>{fullData.dld_project_id}</span>
                 </div>
               )}
               {fullData.lastSync && (
                 <div className={styles.infoRow}>
                   <span className={styles.infoLabel}>{locale === 'ru' ? 'Синхронизация:' : 'Last Sync:'}</span>
                   <span className={styles.infoValue}>{new Date(fullData.lastSync).toLocaleDateString()}</span>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
