import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FavoritesList from '@/components/FavoritesList';

import { unstable_setRequestLocale } from 'next-intl/server';

export default function FavoritesPage({ params: { locale } }: { params: { locale: string } }) {
    unstable_setRequestLocale(locale);
    return (
        <>
            <Header />
            <FavoritesList />
            <Footer />
        </>
    );
}
