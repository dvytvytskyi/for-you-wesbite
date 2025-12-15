'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import styles from './NewsDetail.module.css';
import { getNewsBySlug, NewsDetail as ApiNewsDetail, NewsContent } from '@/lib/api';

interface NewsDetailData {
  id: string;
  slug: string;
  title: string;
  titleRu: string;
  description?: string;
  descriptionRu?: string;
  imageUrl: string;
  publishedAt: Date;
  contents: NewsContent[];
}

interface NewsDetailProps {
  slug: string;
}

export default function NewsDetail({ slug }: NewsDetailProps) {
  const t = useTranslations('newsDetail');
  const locale = useLocale();
  const [news, setNews] = useState<NewsDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent automatic scroll
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    window.history.scrollRestoration = 'manual';

    const loadNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiNews = await getNewsBySlug(slug);
        
        if (!apiNews) {
          setError('News article not found');
          setLoading(false);
          return;
        }

        // Convert API format to component format
        const newsData: NewsDetailData = {
          id: apiNews.id,
          slug: apiNews.slug,
          title: apiNews.title,
          titleRu: apiNews.titleRu,
          description: apiNews.description,
          descriptionRu: apiNews.descriptionRu,
          imageUrl: apiNews.image,
          publishedAt: new Date(apiNews.publishedAt),
          contents: apiNews.contents || [],
        };

        setNews(newsData);
      } catch (err) {setError('Failed to load news article. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [slug]);

  const getTitle = () => {
    if (!news) return '';
    return locale === 'ru' ? news.titleRu : news.title;
  };

  const getDescription = () => {
    if (!news) return null;
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

  const getEmbedUrl = (url: string | null) => {
    if (!url) return '';
    // Convert YouTube URL to embed format
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className={styles.newsDetail}>
        <div className={styles.container}>
          <div className={styles.loading}>{t('loading')}</div>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className={styles.newsDetail}>
        <div className={styles.container}>
          <div className={styles.notFound}>{error || t('notFound')}</div>
        </div>
      </div>
    );
  }

  // Sort contents by order
  const sortedContents = [...news.contents].sort((a, b) => a.order - b.order);

  return (
    <div className={styles.newsDetail}>
      <div className={styles.container}>
        {/* Main Image */}
        {news.imageUrl && (
          <div className={styles.mainImageContainer}>
            <Image
              src={news.imageUrl}
              alt={getTitle()}
              fill
              style={{ objectFit: 'cover' }}
              priority
              sizes="100vw"
            />
          </div>
        )}

        {/* Title */}
        <h1 className={styles.title}>{getTitle()}</h1>

        {/* Meta Info */}
        <div className={styles.meta}>
          <span className={styles.date}>{formatDate(news.publishedAt)}</span>
        </div>

        {/* Description */}
        {getDescription() && (
          <div className={styles.description}>
            <p>{getDescription()}</p>
          </div>
        )}

        {/* Content Blocks */}
        <div className={styles.contentBlocks}>
          {sortedContents.map((content) => (
            <div key={content.id} className={styles.contentBlock}>
              {content.type === 'text' && (
                <div className={styles.textBlock}>
                  <h2 className={styles.contentTitle}>{content.title}</h2>
                  {content.description && (
                    <p className={styles.contentDescription}>{content.description}</p>
                  )}
                </div>
              )}

              {content.type === 'image' && (
                <div className={styles.imageBlock}>
                  <h2 className={styles.contentTitle}>{content.title}</h2>
                  {content.imageUrl && (
                    <div className={styles.contentImageContainer}>
                      <Image
                        src={content.imageUrl}
                        alt={content.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 1200px) 100vw, 1200px"
                      />
                    </div>
                  )}
                </div>
              )}

              {content.type === 'video' && (
                <div className={styles.videoBlock}>
                  <h2 className={styles.contentTitle}>{content.title}</h2>
                  {content.videoUrl && (
                    <div className={styles.videoContainer}>
                      <iframe
                        src={getEmbedUrl(content.videoUrl)}
                        title={content.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className={styles.video}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

