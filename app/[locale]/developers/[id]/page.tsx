import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DeveloperDetail from '@/components/DeveloperDetail';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale, id } }: { params: { locale: string, id: string } }) {
    const t = await getTranslations({ locale, namespace: 'metadata' });
    const baseUrl = 'https://foryou-realestate.com';
    const canonical = `${baseUrl}/${locale}/developers/${id}`;

    return {
        title: `${t('developers')} | ForYou`,
        alternates: {
            canonical: canonical,
        },
        openGraph: {
            title: t('developers'),
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
