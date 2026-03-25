import PropertyFinderList from '@/components/PropertyFinderList';
import { getPropertyFinderProjects } from '@/lib/api';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dubai Real Estate Projects | ForYou',
  description: 'Explore 200+ exclusive real estate projects in Dubai. Off-plan and completed properties with verified data.',
};

export default async function ProjectsPage() {
  const initialData = await getPropertyFinderProjects({ page: 1, limit: 24 });

  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh', background: '#f8f9fa' }}>
      <Suspense fallback={<div>Loading projects...</div>}>
         <PropertyFinderList initialData={initialData} />
      </Suspense>
    </main>
  );
}
