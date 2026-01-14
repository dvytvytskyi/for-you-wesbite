import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsDetail from '@/components/NewsDetail';
import { unstable_setRequestLocale } from 'next-intl/server';

interface NewsDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug, locale } = await params;
  unstable_setRequestLocale(locale);

  return (
    <>
      <Header />
      <NewsDetail slug={slug} />
      <Footer />
    </>
  );
}

