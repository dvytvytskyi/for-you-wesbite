import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AreaDetail from '@/components/AreaDetail';

interface AreaDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function AreaDetailPage({ params }: AreaDetailPageProps) {
  const { slug } = await params;
  
  return (
    <>
      <Header />
      <AreaDetail slug={slug} />
      <Footer />
    </>
  );
}

