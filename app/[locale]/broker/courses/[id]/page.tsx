import BrokerDashboard from '@/components/broker/BrokerDashboard';

interface CourseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  return <BrokerDashboard />;
}

