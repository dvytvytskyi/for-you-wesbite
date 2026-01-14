import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AboutHero from '@/components/AboutHero';

import { unstable_setRequestLocale } from 'next-intl/server';

export default function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <>
      <Header />
      <AboutHero />
      <Footer />
    </>
  );
}

