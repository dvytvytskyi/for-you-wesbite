import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PropertyDetail from '@/components/PropertyDetail';

interface PropertyDetailPageProps {
  params: {
    locale: string;
    id: string;
  };
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  return (
    <>
      <Header />
      <PropertyDetail propertyId={params.id} />
      <Footer />
    </>
  );
}

