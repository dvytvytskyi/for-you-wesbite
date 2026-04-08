import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import CareersPageContent from '@/components/CareersPageContent';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'metadata' });
    const baseUrl = 'https://foryou-realestate.com';
    const canonical = `${baseUrl}/${locale}/careers`;

    return {
        title: t('careers'),
        description: t('careersDescription'),
        alternates: {
            canonical: canonical,
        },
        openGraph: {
            title: t('careers'),
            description: t('careersDescription'),
            siteName: 'ForYou Real Estate',
            type: 'website',
            url: canonical,
            locale: locale,
            images: [
                {
                    url: `https://foryou-realestate.com/thumb/careers-${locale}.png`,
                    width: 1200,
                    height: 630,
                    alt: t('careers'),
                },
            ],
        },
    };
}

export default function CareersPage({ params: { locale } }: { params: { locale: string } }) {
    unstable_setRequestLocale(locale);
    return <CareersPageContent />;
}
