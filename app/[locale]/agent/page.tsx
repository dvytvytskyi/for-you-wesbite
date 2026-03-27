import { unstable_setRequestLocale } from 'next-intl/server';
import AgentHeader from '@/components/AgentHeader';
import Footer from '@/components/Footer';
import PropertyFinderList from '@/components/PropertyFinderList';
import { getPropertyFinderProjects } from '@/lib/api';

interface Props {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AgentHomePage({ params: { locale }, searchParams }: Props) {
  unstable_setRequestLocale(locale);

  // Default to Sale if no type is provided
  const listingType = (searchParams.type as string) || 'sale';
  
  // Fetch projects based on all search params
  const initialData = await getPropertyFinderProjects({
    ...searchParams,
    listingType: listingType as any,
    limit: 100 
  });

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AgentHeader />
      <main style={{ padding: '20px 0', flex: 1 }}>
        <PropertyFinderList key={searchParams.type?.toString() || 'all'} initialData={initialData} />
      </main>
      <div style={{ flex: 1 }} />
      <Footer />
    </div>
  );
}
