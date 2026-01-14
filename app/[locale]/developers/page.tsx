import Header from '@/components/Header';
import DevelopersList from '@/components/DevelopersList';

import { unstable_setRequestLocale } from 'next-intl/server';

export default function DevelopersPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <>
      <Header />
      <DevelopersList />
    </>
  );
}

