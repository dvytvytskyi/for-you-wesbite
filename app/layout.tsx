import { Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-cormorant',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://nbg1.your-objectstorage.com" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/icon-light.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/icon-light.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/icon-light.png" />
        <link rel="icon" type="image/png" href="/favicons/icon-light.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" type="image/png" href="/favicons/icon-dark.png" media="(prefers-color-scheme: dark)" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              "name": "ForYou Real Estate",
              "url": "https://foryou-realestate.com/",
              "logo": "https://foryou-realestate.com/favicons/icon-light.png",
              "image": "https://foryou-realestate.com/images/main-preview.jpg",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Dubai",
                "addressCountry": "AE"
              },
              "description": "Premium real estate agency in Dubai helping clients find best investment opportunities.",
              "sameAs": [
                "https://www.instagram.com/foryou.real.estate/",
                "https://www.facebook.com/foryou.realestate"
              ]
            })
          }}
        />
      </head>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}

export function NotFound() {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>404 - Page Not Found</h1>
        </div>
    );
}
