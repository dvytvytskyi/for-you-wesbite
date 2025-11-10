'use client';

import { useTranslations } from 'next-intl';
import { TeamSection, OfficeSection, LeadershipSection, FAQSection } from '@/components/AboutHero';

export default function AboutSections() {
  const t = useTranslations('aboutUs');
  
  return (
    <>
      <TeamSection t={t} />
      <OfficeSection t={t} />
      <LeadershipSection t={t} />
      <FAQSection t={t} />
    </>
  );
}

