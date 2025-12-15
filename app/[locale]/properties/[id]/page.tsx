import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PropertyDetail from '@/components/PropertyDetail';
import PropertyDetailSkeleton from '@/components/PropertyDetailSkeleton';
import { getProperty } from '@/lib/api';
import { notFound } from 'next/navigation';

interface PropertyDetailPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  
  // Pre-fetch property data on server for faster initial render
  let property = null;
  try {
    property = await getProperty(id);
  } catch (error) {
    // If property not found, show 404
    notFound();
  }

  return (
    <>
      <Header />
      <Suspense fallback={<PropertyDetailSkeleton />}>
        <PropertyDetail propertyId={id} initialProperty={property} />
      </Suspense>
      <Footer />
    </>
  );
}

