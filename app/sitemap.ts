import { MetadataRoute } from 'next';
import { getProperties, getAreas, getDevelopers, getNews } from '@/lib/api';

const baseUrl = 'https://foryou-realestate.com';
const locales = ['en', 'ru'];

const DEFAULT_LAST_MODIFIED = new Date('2026-01-01T00:00:00.000Z');

function withLocale(path: string, locale: string): string {
  // EN URLs are canonical without /en prefix in this project.
  return locale === 'en' ? `${baseUrl}${path}` : `${baseUrl}/${locale}${path}`;
}

function asDate(value?: string): Date {
  if (!value) return DEFAULT_LAST_MODIFIED;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? DEFAULT_LAST_MODIFIED : date;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate multiple sitemaps to handle 10k+ pages and avoid GC limits
 * Each sitemap segment will contain up to ~5000 URLs
 */
export async function generateSitemaps() {
  return [
    { id: 'main' },
    { id: 'projects' },
    { id: 'news' }
  ];
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = [];

  try {
    if (id === 'main') {
      const staticRoutes = [
        '',
        '/properties',
        '/map',
        '/areas',
        '/developers',
        '/about',
        '/news',
        '/careers',
        '/projects',
        '/privacy',
        '/terms',
        '/cookies',
      ];

      staticRoutes.forEach((route) => {
        locales.forEach((locale) => {
          sitemap.push({
            url: withLocale(route, locale),
            lastModified: DEFAULT_LAST_MODIFIED,
            changeFrequency: route === '' ? 'daily' : 'weekly',
            priority: route === '' ? 1.0 : 0.8,
          });
        });
      });
      
      const areas = await getAreas();
      areas.forEach(area => {
        if (!area?.slug) return;
        locales.forEach(locale => {
          sitemap.push({
            url: withLocale(`/areas/${area.slug}`, locale),
            lastModified: asDate((area as any).updatedAt || (area as any).createdAt),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        });
      });

      const developers = await getDevelopers({ summary: true, page: 1, limit: 1000 });
      developers.developers.forEach((dev) => {
        if (!dev?.id) return;
        locales.forEach((locale) => {
          sitemap.push({
            url: withLocale(`/developers/${dev.id}`, locale),
            lastModified: asDate((dev as any).updatedAt || (dev as any).createdAt),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        });
      });
    }

    if (id === 'projects') {
      const pageSize = 1000;
      let page = 1;

      while (true) {
        const propertyResults = await getProperties({ limit: pageSize, page }, true);
        const props = propertyResults.properties || [];
        if (props.length === 0) break;

        props.forEach((prop) => {
          if (!prop?.slug) return;

          const areaSlugFromObject = typeof prop.area === 'object' ? prop.area?.slug : '';
          const areaSlugFromString = typeof prop.area === 'string' ? toSlug(prop.area.split(',')[0] || 'dubai') : '';
          const areaSlug = areaSlugFromObject || areaSlugFromString || 'dubai';
          const modified = asDate((prop as any).updatedAt || (prop as any).createdAt);

          locales.forEach((locale) => {
            sitemap.push({
              url: withLocale(`/properties/${prop.slug}`, locale),
              lastModified: modified,
              changeFrequency: 'daily',
              priority: 0.9,
            });

            // Keep only canonical project landing URL variant.
            sitemap.push({
              url: withLocale(`/landing/${areaSlug}/${prop.slug}`, locale),
              lastModified: modified,
              changeFrequency: 'weekly',
              priority: 0.7,
            });
          });
        });

        if (props.length < pageSize) break;
        page += 1;
      }
    }

    if (id === 'news') {
      const pageSize = 200;
      let page = 1;

      while (true) {
        const newsResults = await getNews(page, pageSize);
        const items = newsResults.news || [];
        if (items.length === 0) break;

        items.forEach((item) => {
          if (!item?.slug) return;

          const modified = asDate(item.updatedAt || item.publishedAt || item.createdAt);
          locales.forEach((locale) => {
            sitemap.push({
              url: withLocale(`/news/${item.slug}`, locale),
              lastModified: modified,
              changeFrequency: 'weekly',
              priority: 0.6,
            });
          });
        });

        if (items.length < pageSize) break;
        page += 1;
      }
    }

  } catch (error) {
    console.error(`Error generating sitemap segment ${id}:`, error);
  }

  return sitemap;
}
