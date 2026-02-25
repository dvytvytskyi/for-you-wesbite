'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import styles from './NewsList.module.css';
import NewsCard from './NewsCard';
import { getNews, NewsItem as ApiNewsItem } from '@/lib/api';

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

export default function NewsList() {
  const t = useTranslations('news');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getNews(1, 12);

        // Convert API format to component format
        const convertedNews: NewsItem[] = result.news.map((item: ApiNewsItem) => ({
          id: item.id,
          title: item.title,
          titleRu: item.titleRu,
          description: item.description,
          descriptionRu: item.descriptionRu,
          image: item.image,
          publishedAt: new Date(item.publishedAt),
          slug: item.slug,
        }));

        setNews(convertedNews);
      } catch (err) {
        setError('Failed to load news. Please try again later.');
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

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

  if (error) {
    return (
      <section className={styles.newsList}>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.newsList} ref={sectionRef}>
      <div className={styles.container}>


        {news.length === 0 ? (
          <div className={styles.noNews}>No news articles found.</div>
        ) : (
          <div className={styles.newsContentWrapper}>
            {/* Top Section: Featured + 2x2 Grid */}
            <div className={styles.topNewsLayout}>
              <div className={styles.featuredColumn}>
                <NewsCard news={news[0]} isFeatured={true} />
              </div>
              <div className={styles.secondaryGrid}>
                {/* Newsletter Block - Takes top row */}
                <div className={styles.newsletterBlock}>
                  <h3 className={styles.newsletterTitle}>Subscribe to our newsletter</h3>
                  <button
                    className={styles.subscribeButton}
                    onClick={() => setIsNewsletterModalOpen(true)}
                  >
                    Subscribe
                  </button>
                </div>
                {/* Regular News - Bottom row of the top section */}
                {news.length > 1 && news.slice(1, 3).map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
            </div>

            {/* Bottom Section: Regular Grid for remaining news */}
            {news.length > 3 && (
              <div className={styles.remainingGrid}>
                {news.slice(3).map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <NewsletterModal
        isOpen={isNewsletterModalOpen}
        onClose={() => setIsNewsletterModalOpen(false)}
      />
    </section>
  );
}

import { createPortal } from 'react-dom';

function NewsletterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStatus('success');
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {status === 'success' ? (
          <div className={styles.successContent}>
            <div className={styles.successIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className={styles.successTitle}>Successfully subscribed!</h3>
            <p className={styles.successText}>We'll keep you updated with the latest news.</p>
          </div>
        ) : (
          <>
            <h3 className={styles.modalTitle}>Subscribe</h3>
            <p className={styles.modalSubtitle}>Enter your email to receive our weekly news digest.</p>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.modalInput}
              />
              <button
                type="submit"
                className={styles.modalSubmit}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

