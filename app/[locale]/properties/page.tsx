import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PropertiesList from '@/components/PropertiesList';

import { unstable_setRequestLocale } from 'next-intl/server';

export default function PropertiesPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <>
      <Header />
      <PropertiesList />
      <Footer />
    </>
  );
}

