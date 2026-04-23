import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DeveloperDetail from '@/components/DeveloperDetail';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale, id } }: { params: { locale: string, id: string } }) {
    const t = await getTranslations({ locale, namespace: 'metadata' });
    const baseUrl = 'https://foryou-realestate.com';
    const canonical = locale === 'en' ? `${baseUrl}/developers/${id}` : `${baseUrl}/ru/developers/${id}`;
    const description = locale === 'ru'
        ? 'Профиль застройщика в Дубае: проекты, направление, рыночное позиционирование и возможности для инвестиций.'
        : 'Dubai developer profile with projects, market positioning, and investment opportunities across off-plan and ready properties.';

    return {
        title: `${t('developers')} | ForYou`,
        description: description,
        alternates: {
            canonical: canonical,
            languages: {
                'en': `${baseUrl}/developers/${id}`,
                'ru': `${baseUrl}/ru/developers/${id}`,
                'x-default': `${baseUrl}/developers/${id}`,
            },
        },
        openGraph: {
            title: t('developers'),
            description: description,
            siteName: 'ForYou Real Estate',
            type: 'website',
            url: canonical,
            locale: locale,
        },
    };
}

export default function DeveloperPage({ params: { locale, id } }: { params: { locale: string, id: string } }) {
    unstable_setRequestLocale(locale);
    return (
        <>
            <Header />
            <DeveloperDetail id={id} />
            <Footer />
        </>
    );
}
