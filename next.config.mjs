import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'worldestate.homes',
      },
      {
        protocol: 'https',
        hostname: 'elysian.com',
      },
      {
        protocol: 'https',
        hostname: 'files.alnair.ae',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'api.foryou-realestate.co',
      },
      {
        protocol: 'https',
        hostname: 'api.reelly.io',
      },
      {
        protocol: 'https',
        hostname: 'reelly.io',
      },
      {
        protocol: 'https',
        hostname: 'xdil-qda0-zofk.m2.xano.io',
      },
      {
        protocol: 'https',
        hostname: 'www.propertyfinder.ae',
      },
      {
        protocol: 'https',
        hostname: 'propertyfinder.ae',
      },
      {
        protocol: 'https',
        hostname: 'static.tildacdn.com',
      },
      {
        protocol: 'https',
        hostname: 'foryou-realestate.co',
      },
      {
        protocol: 'https',
        hostname: 'nbg1.your-objectstorage.com',
      },
      {
        protocol: 'https',
        hostname: 'reelly-backend.s3.amazonaws.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/eng',
        destination: '/en',
        permanent: true,
      },
      {
        source: '/eng/:path*',
        destination: '/en/:path*',
        permanent: true,
      },
      {
        source: '/blog',
        destination: '/news',
        permanent: true,
      },
      {
        source: '/ru/blog',
        destination: '/ru/news',
        permanent: true,
      },
      {
        source: '/projects/:slug*',
        destination: '/properties/:slug*',
        permanent: true,
      },
      {
        source: '/ru/projects/:slug*',
        destination: '/ru/properties/:slug*',
        permanent: true,
      },
      {
        source: '/about-us',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/ru/about-us',
        destination: '/ru/about',
        permanent: true,
      },
      {
        source: '/contacts',
        destination: '/',
        permanent: false,
      },
      {
        source: '/ru/contacts',
        destination: '/ru',
        permanent: false,
      },
      {
        source: '/policy',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/ru/policy',
        destination: '/ru/privacy',
        permanent: true,
      },
      {
        source: '/sell',
        destination: '/',
        permanent: false,
      },
      {
        source: '/ru/sell',
        destination: '/ru',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: 'https://admin.foryou-realestate.com/api/:path*',
        },
      ],
    };
  },
};

export default withNextIntl(nextConfig);
