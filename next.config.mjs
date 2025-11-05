import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
};

export default withNextIntl(nextConfig);
