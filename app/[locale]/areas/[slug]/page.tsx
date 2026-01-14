import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AreaDetail from '@/components/AreaDetail';
import { unstable_setRequestLocale } from 'next-intl/server';

interface AreaDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function AreaDetailPage({ params }: AreaDetailPageProps) {
  const { slug, locale } = await params;
  unstable_setRequestLocale(locale);

  return (
    <>
      <Header />
      <AreaDetail slug={slug} />
      <Footer />
    </>
  );
}

