'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { generateWhatsAppLink } from '@/lib/utils';
import CallbackModal from './CallbackModal';
import PropertyCard from './PropertyCard';
import { getNewsBySlug, NewsItem, getNews, NewsContent, getProperties, Property, submitCallback } from '@/lib/api';
import styles from './NewsDetail.module.css';

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

// Deterministic random for views/shares
const getDeterministicValue = (seed: string, min: number, max: number) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const factor = (Math.abs(hash) % 1000) / 1000;
  return Math.floor(min + factor * (max - min));
};

export default function NewsDetail({ slug }: NewsDetailProps) {
  const t = useTranslations('newsDetail');
  const locale = useLocale();
  const [news, setNews] = useState<NewsDetailData | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [recommendedProjects, setRecommendedProjects] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarName, setSidebarName] = useState('');
  const [sidebarPhone, setSidebarPhone] = useState('');
  const [sidebarSuccess, setSidebarSuccess] = useState(false);
  const [sidebarLoading, setSidebarLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiNews = await getNewsBySlug(slug);

        if (!apiNews) {
          setError('News article not found');
          setLoading(false);
          return;
        }

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

        const { news: latest } = await getNews(1, 10);
        setRelatedNews(latest.filter(item => item.slug !== slug));

        const { properties: allProperties } = await getProperties({ limit: 20, sortBy: 'createdAt', sortOrder: 'DESC' });
        // Filter out properties without photos
        const withPhotos = allProperties.filter(p => (p.photos && p.photos.length > 0) || (p.images && p.images.length > 0));
        setRecommendedProjects(withPhotos.slice(0, 9));
      } catch (err) {
        setError('Failed to load news article.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  const getTitle = () => {
    if (!news) return '';
    return locale === 'ru' ? news.titleRu : news.title;
  };

  const getDescription = () => {
    if (!news) return null;
    return locale === 'ru' ? news.descriptionRu : news.description;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = getTitle();

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`
  };

  if (loading) return <div className={styles.loading}>{t('loading')}</div>;
  if (error || !news) return <div className={styles.notFound}>{t('notFound')}</div>;

  const views = getDeterministicValue(news.id, 1200, 1800);
  const shares = getDeterministicValue(news.id, 8, 25);

  const sortedContents = [...news.contents].sort((a, b) => a.order - b.order);

  return (
    <div className={styles.newsDetail}>
      <div className={styles.container}>
        <div className={styles.mainGrid}>
          {/* Main Content */}
          <div className={styles.leftColumn}>

            <div className={styles.mainImageContainer}>
              <Image
                src={news.imageUrl}
                alt={getTitle()}
                fill
                className={styles.mainImage}
                priority
                sizes="(max-width: 900px) 100vw, 800px"
              />
            </div>

            <div className={styles.articleHeader}>
              <span className={styles.categoryBadge}>MARKET</span>
              
              <div className={styles.headerTop}>
                <h1 className={styles.title}>{getTitle()}</h1>
                <div className={styles.metrics}>
                  <div className={styles.metric}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <span>{views}</span>
                  </div>
                  <div className={styles.metric}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    <span>{shares}</span>
                  </div>
                </div>
              </div>

              <div className={styles.articleMetaActions}>
                <div className={styles.authorDate}>
                  <span className={styles.byAuthor}>By <span className={styles.authorNameBold}>Ruslan K.</span></span>
                  <span className={styles.publishDate}>{formatDate(news.publishedAt)}</span>
                </div>

                <div className={styles.actionButtons}>
                  <button className={styles.saveBtn} aria-label="Save for later">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    <span>Save for later</span>
                  </button>
                </div>
              </div>
            </div>


            <div className={styles.contentBlocks}>
              {sortedContents.map((block) => (
                <div key={block.id} className={styles.contentBlock}>
                  {block.type === 'text' && (
                    <div className={styles.textBlock}>
                      {block.title && <h2 className={styles.contentTitle}>{block.title}</h2>}
                      <div
                        className={styles.contentDescription}
                        dangerouslySetInnerHTML={{ __html: block.description || '' }}
                      />
                    </div>
                  )}

                  {block.type === 'image' && block.imageUrl && (
                    <div className={styles.imageBlock}>
                      <div className={styles.contentImageContainer}>
                        <Image
                          src={block.imageUrl}
                          alt={block.title || ''}
                          fill
                          className={styles.contentImage}
                          sizes="(max-width: 900px) 100vw, 800px"
                        />
                      </div>
                    </div>
                  )}

                  {block.type === 'video' && block.videoUrl && (
                    <div className={styles.videoBlock}>
                      <div className={styles.videoContainer}>
                        <iframe
                          src={block.videoUrl.replace('watch?v=', 'embed/')}
                          title={block.title || 'Video content'}
                          className={styles.video}
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>


            {/* Author Card at the bottom of left column */}
            <div className={styles.authorSection}>
              <div className={styles.authorSectionHeader}>
                <div className={styles.authorLabelUnderline}>{t('author.writtenBy')}</div>
                <div className={styles.shareMenuMini}>
                  <span className={styles.shareLabel}>Share on</span>
                  <div className={styles.shareIcons}>
                    <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className={styles.shareLink}>
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer" className={styles.shareLink}>
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.53.26l.213-3.048 5.548-5.012c.24-.214-.054-.334-.376-.12l-6.86 4.316-2.956-.924c-.642-.204-.658-.642.131-.95l11.554-4.453c.537-.194 1.006.131.831.942z"/></svg>
                    </a>
                    <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className={styles.shareLink}>
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
              <div className={styles.authorCard}>
                <div className={styles.authorPhotoWrapper}>
                  <Image
                    src="https://res.cloudinary.com/dgv0rxd60/image/upload/v1765715854/photo_2025-12-14_15-36-43_jn55hm.jpg"
                    alt="Ruslan"
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'top' }}
                    unoptimized
                  />
                </div>
                <div className={styles.authorInfo}>
                  <h3 className={styles.authorName}>Ruslan K.</h3>
                  <div className={styles.authorRole}>{t('author.role')}</div>
                  <div className={styles.authorDetails}>
                    <div>{t('author.specialization')}</div>
                    <div>{t('author.languages')}</div>
                  </div>
                </div>
                <div className={styles.authorButtons}>
                  <a
                    href={generateWhatsAppLink({
                      phone: '971501769699',
                      locale,
                      contextType: 'general',
                      contextName: 'News Author: Ruslan'
                    })}
                    className={styles.whatsappButton}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{t('author.whatsapp', { name: 'Ruslan' })}</span>
                  </a>
                  <button
                    className={styles.bookCallButton}
                    onClick={() => setIsModalOpen(true)}
                  >
                    <span>{t('author.bookCall')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className={styles.rightColumn}>
            <div className={styles.sidebarHeader}>
              <h2 className={styles.sidebarTitle}>Related <span className={styles.sidebarTitleAccent}>News</span></h2>
              <a href={`/${locale}/news`} className={styles.seeAll}>See all</a>
            </div>

            <div className={styles.relatedGrid}>
              {relatedNews.map((item) => (
                <a key={item.id} href={`/${locale}/news/${item.slug}`} className={styles.smallCard}>
                  <div className={styles.smallCardImageWrapper}>
                    <Image
                      src={item.image}
                      alt={locale === 'ru' ? item.titleRu : item.title}
                      fill
                      className={styles.smallCardImage}
                      sizes="300px"
                    />
                  </div>
                  <div className={styles.smallCardContent}>
                    <div className={styles.smallCardHeader}>
                      <span className={styles.categoryBadgeSmall}>MARKET</span>
                      <div className={styles.smallMetric}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        <span>{getDeterministicValue(item.id, 1200, 1800)}</span>
                      </div>
                    </div>
                    <h3 className={styles.smallCardTitle}>
                      {locale === 'ru' ? item.titleRu : item.title}
                    </h3>
                  </div>
                </a>
              ))}
            </div>

            <div className={styles.sidebarForm}>
              <h3 className={styles.formTitle}>{t('author.formTitle')}</h3>
              {sidebarSuccess ? (
                <div className={styles.sidebarSuccess}>
                  {t('author.successMessage') || 'Thank you! We will contact you soon.'}
                </div>
              ) : (
                <form
                  className={styles.form}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (sidebarLoading) return;
                    setSidebarLoading(true);
                    try {
                      await submitCallback({
                        name: sidebarName,
                        phone: sidebarPhone,
                        source: `Contact from News: ${getTitle()}`
                      });
                      setSidebarSuccess(true);
                      setSidebarName('');
                      setSidebarPhone('');
                    } catch (err) {
                      console.error('Sidebar form error:', err);
                    } finally {
                      setSidebarLoading(false);
                    }
                  }}
                >
                  <input
                    type="text"
                    placeholder={t('author.nameLabel')}
                    className={styles.sidebarInput}
                    value={sidebarName}
                    onChange={(e) => setSidebarName(e.target.value)}
                    required
                  />
                  <input
                    type="tel"
                    placeholder={t('author.phoneLabel')}
                    className={styles.sidebarInput}
                    value={sidebarPhone}
                    onChange={(e) => setSidebarPhone(e.target.value)}
                    required
                  />
                  <button type="submit" className={styles.sidebarSubmit} disabled={sidebarLoading}>
                    {sidebarLoading ? '...' : t('author.submitButton')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {recommendedProjects.length > 0 && (
        <div className={styles.recommendedSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sidebarTitle}>{t('recommendedProjects')}</h2>
            </div>
            <div className={styles.projectsGrid}>
              {recommendedProjects.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </div>
      )}

      <CallbackModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
