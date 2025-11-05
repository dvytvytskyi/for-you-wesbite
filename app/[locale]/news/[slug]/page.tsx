import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsDetail from '@/components/NewsDetail';

interface NewsDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  
  return (
    <>
      <Header />
      <NewsDetail slug={slug} />
      <Footer />
    </>
  );
}

