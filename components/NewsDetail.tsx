'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import styles from './NewsDetail.module.css';

interface NewsContent {
  id: string;
  newsId: string;
  type: 'text' | 'image' | 'video';
  title: string;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  order: number;
}

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

  useEffect(() => {
    // Prevent automatic scroll
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    window.history.scrollRestoration = 'manual';

    // Load mock data
    const loadNews = () => {
      // TODO: Replace with actual API call
      // const response = await axios.get(`/api/news/${slug}`);
      
      // Mock data for testing
      const mockNews: NewsDetailData = {
        id: '1',
        slug: slug,
        title: 'Dubai Real Estate Market Sees Record Growth',
        titleRu: 'Рынок недвижимости Дубая показывает рекордный рост',
        description: 'The Dubai real estate market has experienced unprecedented growth in the first quarter, with property values increasing by 15% year-over-year.',
        descriptionRu: 'Рынок недвижимости Дубая испытал беспрецедентный рост в первом квартале, стоимость недвижимости выросла на 15% в годовом исчислении.',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=600&fit=crop',
        publishedAt: new Date('2024-01-15'),
        contents: [
          {
            id: '1',
            newsId: '1',
            type: 'text',
            title: 'Market Overview',
            description: 'The Dubai real estate sector continues to attract international investors, with luxury properties in areas like Palm Jumeirah and Downtown Dubai leading the market.',
            imageUrl: null,
            videoUrl: null,
            order: 1
          },
          {
            id: '2',
            newsId: '1',
            type: 'image',
            title: 'Luxury Developments',
            description: null,
            imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop',
            videoUrl: null,
            order: 2
          },
          {
            id: '3',
            newsId: '1',
            type: 'video',
            title: 'Investment Opportunities',
            description: null,
            imageUrl: null,
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            order: 3
          },
          {
            id: '4',
            newsId: '1',
            type: 'text',
            title: 'Future Prospects',
            description: 'Analysts predict continued growth in the Dubai real estate market, driven by infrastructure development and favorable government policies.',
            imageUrl: null,
            videoUrl: null,
            order: 4
          }
        ]
      };

      setNews(mockNews);
      setLoading(false);
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

  if (!news) {
    return (
      <div className={styles.newsDetail}>
        <div className={styles.container}>
          <div className={styles.notFound}>{t('notFound')}</div>
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

