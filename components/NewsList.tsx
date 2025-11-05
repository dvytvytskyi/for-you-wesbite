'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import styles from './NewsList.module.css';
import NewsCard from './NewsCard';

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

// TODO: Замінити на реальний API запит
// const fetchNews = async (): Promise<NewsItem[]> => {
//   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news`);
//   const data = await response.json();
//   return data.news || [];
// };

// Mock data - замінити на реальні дані з API
const generateMockNews = (): NewsItem[] => {
  const news: NewsItem[] = [];
  const titles = [
    { en: 'Dubai Real Estate Market Shows Strong Growth in Q1 2024', ru: 'Рынок недвижимости Дубая показывает сильный рост в первом квартале 2024 года' },
    { en: 'New Luxury Development Launches in Palm Jumeirah', ru: 'Запуск новой роскошной застройки на Пальм Джумейра' },
    { en: 'Emaar Announces New Residential Complex in Downtown Dubai', ru: 'Emaar объявляет о новом жилом комплексе в Даунтаун Дубай' },
    { en: 'Dubai Marina Property Prices Reach New Heights', ru: 'Цены на недвижимость в Дубай Марина достигли новых высот' },
    { en: 'Investment Opportunities in Business Bay District', ru: 'Инвестиционные возможности в районе Бизнес Бей' },
    { en: 'Sustainable Living: Green Buildings Take Center Stage', ru: 'Устойчивая жизнь: экологичные здания выходят на первый план' },
    { en: 'Dubai Hills Estate: A New Standard in Luxury Living', ru: 'Dubai Hills Estate: новый стандарт роскошной жизни' },
    { en: 'Real Estate Investment Trends in Dubai 2024', ru: 'Тренды инвестиций в недвижимость Дубая в 2024 году' },
    { en: 'Waterfront Properties: The New Real Estate Hotspot', ru: 'Недвижимость на набережной: новая горячая точка рынка' },
    { en: 'Dubai Property Market Forecast for 2025', ru: 'Прогноз рынка недвижимости Дубая на 2025 год' },
    { en: 'Luxury Penthouses: The Ultimate Dubai Lifestyle', ru: 'Роскошные пентхаусы: образ жизни Дубая высшего класса' },
    { en: 'Affordable Housing Initiatives in Dubai', ru: 'Инициативы по доступному жилью в Дубае' },
  ];

  const descriptions = [
    { en: 'The real estate sector in Dubai continues to demonstrate resilience and growth, with significant investments in luxury residential developments.', ru: 'Сектор недвижимости в Дубае продолжает демонстрировать устойчивость и рост, с значительными инвестициями в роскошные жилые комплексы.' },
    { en: 'Discover the latest trends and opportunities in Dubai\'s thriving property market.', ru: 'Откройте для себя последние тенденции и возможности на процветающем рынке недвижимости Дубая.' },
    { en: 'Explore premium properties and investment opportunities in one of the world\'s most dynamic real estate markets.', ru: 'Исследуйте премиальную недвижимость и инвестиционные возможности на одном из самых динамичных рынков недвижимости в мире.' },
  ];

  const images = [
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=675&fit=crop',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&h=675&fit=crop',
    'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&h=675&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=675&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=675&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=675&fit=crop',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&h=675&fit=crop',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=675&fit=crop',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=675&fit=crop',
    'https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=1200&h=675&fit=crop',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&h=675&fit=crop',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=675&fit=crop',
  ];

  for (let i = 0; i < 20; i++) {
    const titleIndex = i % titles.length;
    const descIndex = i % descriptions.length;
    const imageIndex = i % images.length;
    
    news.push({
      id: `news-${i + 1}`,
      title: titles[titleIndex].en,
      titleRu: titles[titleIndex].ru,
      description: descriptions[descIndex].en,
      descriptionRu: descriptions[descIndex].ru,
      image: images[imageIndex],
      publishedAt: new Date(2024, 11 - i, 15 - (i % 15)),
      slug: `news-${i + 1}`,
    });
  }
  
  // Сортуємо за датою (новіші спочатку)
  return news.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
};

const mockNews = generateMockNews();

export default function NewsList() {
  const t = useTranslations('news');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [loading, setLoading] = useState(false);

  // TODO: Замінити на реальний API запит
  // useEffect(() => {
  //   const loadNews = async () => {
  //     setLoading(true);
  //     try {
  //       const data = await fetchNews();
  //       // Сортуємо за датою (новіші спочатку)
  //       const sorted = data.sort((a, b) => 
  //         new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  //       );
  //       setNews(sorted);
  //     } catch (error) {
  //       console.error('Failed to fetch news:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   loadNews();
  // }, []);

  // Прибираємо автоматичне прокручування при завантаженні сторінки
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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
      <section className={styles.newsList}>
        <div className={styles.container}>
          <div className={styles.loading}>{t('loading')}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.newsList} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('pageTitle')}</h1>
        </div>

        <div className={styles.grid}>
          {news.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

