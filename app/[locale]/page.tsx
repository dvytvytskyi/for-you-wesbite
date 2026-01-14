import Header from '@/components/Header';
import Hero from '@/components/Hero';

import Footer from '@/components/Footer';
import AboutUs from '@/components/AboutUs';
import Partners from '@/components/Partners';
import Areas from '@/components/Areas';
import ProjectImage from '@/components/ProjectImage';
import AboutSections from '@/components/AboutSections';

import { unstable_setRequestLocale } from 'next-intl/server';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <>
      <Header />
      <Hero />

      <AboutUs />
      <Partners />
      <Areas />
      <ProjectImage />
      <AboutSections />
      <Footer />
    </>
  );
}
