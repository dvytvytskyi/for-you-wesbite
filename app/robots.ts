import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin', '/api/private/'],
        },
        sitemap: [
            'https://www.foryou-realestate.com/sitemap/main.xml',
            'https://www.foryou-realestate.com/sitemap/projects.xml',
            'https://www.foryou-realestate.com/sitemap/news.xml',
        ],
    };
}
