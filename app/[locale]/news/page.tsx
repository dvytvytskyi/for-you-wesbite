import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsList from '@/components/NewsList';

import { unstable_setRequestLocale } from 'next-intl/server';

export default function NewsPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <>
      <Header />
      <NewsList />
      <Footer />
    </>
  );
}

