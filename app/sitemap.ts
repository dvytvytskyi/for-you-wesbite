import { MetadataRoute } from 'next';
import { getProperties, getAreas, getDevelopers, getNews } from '@/lib/api';

const baseUrl = 'https://foryou-realestate.com';
const locales = ['en', 'ru'];

/**
 * Generate multiple sitemaps to handle 10k+ pages and avoid GC limits
 * Each sitemap segment will contain up to ~5000 URLs
 */
export async function generateSitemaps() {
  return [
    { id: 'main' },
    { id: 'projects' },
    { id: 'units' },
    { id: 'news' }
  ];
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = [];

  try {
    if (id === 'main') {
      const staticRoutes = ['', '/properties', '/map', '/areas', '/developers', '/about', '/news'];
      staticRoutes.forEach((route) => {
        locales.forEach((locale) => {
          sitemap.push({
            url: `${baseUrl}/${locale}${route}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
          });
        });
      });
      
      const areas = await getAreas();
      areas.forEach(area => {
        locales.forEach(locale => {
          sitemap.push({
            url: `${baseUrl}/${locale}/areas/${area.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        });
      });
    }

    if (id === 'projects') {
      const propertyResults = await getProperties({ limit: 4000 }, true);
      propertyResults.properties.forEach(prop => {
        const areaSlug = typeof prop.area === 'object' ? prop.area?.slug : (prop.area || 'dubai');
        locales.forEach(locale => {
          // Standard property page (hierarchical if we want, but keeping current for now)
          sitemap.push({
            url: `${baseUrl}/${locale}/properties/${prop.slug}`,
            lastModified: prop.updatedAt ? new Date(prop.updatedAt) : new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
          });
          // Hierarchical Landing pages
          sitemap.push({
            url: `${baseUrl}/${locale}/landing/${areaSlug}/${prop.slug}`,
            lastModified: prop.updatedAt ? new Date(prop.updatedAt) : new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
          });
          sitemap.push({
            url: `${baseUrl}/${locale}/landing/${areaSlug}/${prop.slug}/premium`,
            lastModified: prop.updatedAt ? new Date(prop.updatedAt) : new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
          });
        });
      });
    }

    if (id === 'units') {
      const propertyResults = await getProperties({ limit: 2000 }, true);
      propertyResults.properties.forEach(prop => {
        if (prop.units && prop.units.length > 0) {
           const areaSlug = typeof prop.area === 'object' ? prop.area?.slug : (prop.area || 'dubai');
           const projectSlug = prop.slug;
           
           locales.forEach(locale => {
             // Deep Hierarchical Slug: /landing/area/project/unit-type
             sitemap.push({
               url: `${baseUrl}/${locale}/landing/${areaSlug}/${projectSlug}/1-bedroom-apartment`,
               lastModified: prop.updatedAt ? new Date(prop.updatedAt) : new Date(),
               changeFrequency: 'weekly',
               priority: 0.7,
             });
             sitemap.push({
              url: `${baseUrl}/${locale}/landing/${areaSlug}/${projectSlug}/luxury-residence`,
              lastModified: prop.updatedAt ? new Date(prop.updatedAt) : new Date(),
              changeFrequency: 'weekly',
              priority: 0.7,
            });
           });
        }
      });
    }

    if (id === 'news') {
      const newsResults = await getNews(1, 1000);
      newsResults.news.forEach(item => {
        locales.forEach(locale => {
          sitemap.push({
            url: `${baseUrl}/${locale}/news/${item.slug}`,
            lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
          });
        });
      });
    }

  } catch (error) {
    console.error(`Error generating sitemap segment ${id}:`, error);
  }

  return sitemap;
}
