import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PropertyDetail from '@/components/PropertyDetail';
import PropertyDetailSkeleton from '@/components/PropertyDetailSkeleton';

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
      <Suspense fallback={<PropertyDetailSkeleton />}>
        <PropertyDetail propertyId={params.id} />
      </Suspense>
      <Footer />
    </>
  );
}

