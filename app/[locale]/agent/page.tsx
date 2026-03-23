import { unstable_setRequestLocale } from 'next-intl/server';
import AgentHeader from '@/components/AgentHeader';
import Footer from '@/components/Footer';
import PropertyFinderList from '@/components/PropertyFinderList';
import { getPropertyFinderProjects } from '@/lib/api';

interface Props {
  params: { locale: string };
  searchParams: { [key: string]: string | undefined };
}

export default async function AgentHomePage({ params: { locale }, searchParams }: Props) {
  unstable_setRequestLocale(locale);

  // Prefetch projects on server to avoid CORS/loading issues
  const initialData = await getPropertyFinderProjects({
    category: searchParams.category as any,
    status: searchParams.status as any,
    search: searchParams.search,
    page: parseInt(searchParams.page || '1', 10),
    limit: 24
  });

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
      <AgentHeader />
      <main style={{ padding: '20px 0', flex: 1 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 40px' }}>
          <PropertyFinderList initialData={initialData} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
