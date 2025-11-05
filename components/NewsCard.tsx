'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import styles from './NewsCard.module.css';

interface NewsItem {
  id: string;
  title: string;
  titleRu: string;
  description?: string;
  descriptionRu?: string;
  image: string;
  publishedAt: Date;
  slug: string;
}

interface NewsCardProps {
  news: NewsItem;
}

export default function NewsCard({ news }: NewsCardProps) {
  const locale = useLocale();

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const getTitle = () => {
    return locale === 'ru' ? news.titleRu : news.title;
  };

  const getDescription = () => {
    if (!news.description && !news.descriptionRu) return null;
    return locale === 'ru' ? news.descriptionRu : news.description;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Link href={getLocalizedPath(`/news/${news.slug}`)} className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={news.image}
          alt={getTitle()}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 1200px) 50vw, (max-width: 900px) 100vw, 33vw"
        />
        <div className={styles.overlay}></div>
        <div className={styles.playButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="rgba(255, 255, 255, 0.9)" />
            <path d="M10 8L16 12L10 16V8Z" fill="#003077" />
          </svg>
        </div>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{getTitle()}</h3>
        {getDescription() && (
          <p className={styles.description}>{getDescription()}</p>
        )}
        <div className={styles.meta}>
          <span className={styles.date}>{formatDate(news.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}

