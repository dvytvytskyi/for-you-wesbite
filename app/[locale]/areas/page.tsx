import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AreasList from '@/components/AreasList';

import { unstable_setRequestLocale } from 'next-intl/server';

export default function AreasPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <>
      <Header />
      <AreasList />
      <Footer />
    </>
  );
}

