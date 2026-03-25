import { getPropertyFinderProject } from '@/lib/api';
import PropertyFinderDetail from '@/components/PropertyFinderDetail';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
  params: { id: string; locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getPropertyFinderProject(params.id);
  if (!project) return { title: 'Project Not Found' };

  return {
    title: `${project.name} | ${project.location} | ForYou Real Estate`,
    description: `Detailed information about ${project.name} project in ${project.location}. View prices, developer details, and units.`,
  };
}

export default async function ProjectPage({ params }: Props) {
  const project = await getPropertyFinderProject(params.id);
  if (!project) notFound();

  return (
    <main style={{ paddingTop: '80px', minHeight: '100vh', background: '#fff' }}>
      <PropertyFinderDetail project={project} />
    </main>
  );
}
