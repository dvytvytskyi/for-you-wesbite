import { unstable_setRequestLocale } from 'next-intl/server';
import AnonymousHeader from '@/components/AnonymousHeader';
import PropertyFinderList from '@/components/PropertyFinderList';
import { getPropertyFinderProjects } from '@/lib/api';

interface Props {
  params: { locale: string };
  searchParams: { [key: string]: string | undefined };
}

export default async function AppHomePage({ params: { locale }, searchParams }: Props) {
  unstable_setRequestLocale(locale);

  const initialData = await getPropertyFinderProjects({
    category: searchParams.category as any,
    status: searchParams.status as any,
    search: searchParams.search,
    page: parseInt(searchParams.page || '1', 10),
    limit: 24
  });

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AnonymousHeader />
      <main style={{ padding: '20px 0', flex: 1 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 40px' }}>
          <PropertyFinderList anonymous={true} initialData={initialData} />
        </div>
      </main>
      <footer style={{ padding: '40px 0', borderTop: '1px solid rgba(0, 48, 119, 0.05)' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 40px', textAlign: 'center', color: 'rgb(93 93 93 / 40%)', fontSize: '13px' }}>
          <span>&copy; {new Date().getFullYear()} {locale === 'ru' ? 'Каталог недвижимости Дубая' : 'Dubai Properties Catalog'}</span>
        </div>
      </footer>
    </div>
  );
}
