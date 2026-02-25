import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://foryou-realestate.com';
    const locales = ['en', 'ru'];
    const routes = [
        '',
        '/properties',
        '/map',
        '/areas',
        '/developers',
        '/about',
        '/news',
        '/careers',
    ];

    const sitemap: MetadataRoute.Sitemap = [];

    routes.forEach((route) => {
        locales.forEach((locale) => {
            sitemap.push({
                url: `${baseUrl}/${locale}${route}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: route === '' ? 1 : 0.8,
            });
        });
    });

    return sitemap;
}
