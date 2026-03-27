'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import MapFilters from '@/components/MapFilters';
import { getMapMarkers, getPropertyFinderMapMarkers } from '@/lib/api';
import styles from '@/app/[locale]/map/page.module.css';

// Lazily load MapboxMap as it's a heavy client component
const MapboxMap = dynamic(() => import('@/components/MapboxMap'), {
    ssr: false,
    loading: () => (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8f9fa'
        }}>
            <div style={{ color: '#003077', fontWeight: '500' }}>Initializing Map...</div>
        </div>
    )
});

interface Filters {
    type: 'new' | 'secondary';
    search: string;
    location: string[];
    bedrooms: number[];
    sizeFrom: string;
    sizeTo: string;
    priceFrom: string;
    priceTo: string;
    sort: string;
    developerId?: string;
    cityId?: string;
}

export default function MapPageContent() {
    const locale = useLocale();
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [filters, setFilters] = useState<Filters>({
        type: 'new', // Default to off-plan for map
        search: '',
        location: [],
        bedrooms: [],
        sizeFrom: '',
        sizeTo: '',
        priceFrom: '',
        priceTo: '',
        sort: 'newest'
    });

    const loadProperties = useCallback(async (currentFilters: Filters) => {
        try {
            setLoading(true);
            setError(null);

            // Format filters for the API
            const apiFilters: any = {
                propertyType: currentFilters.type === 'new' ? 'off-plan' : 'secondary',
                search: currentFilters.search || undefined,
                priceFrom: currentFilters.priceFrom || undefined,
                priceTo: currentFilters.priceTo || undefined,
                // If the backend expects comma-separated strings for multiple values:
                bedrooms: currentFilters.bedrooms.length > 0 ? currentFilters.bedrooms.join(',') : undefined,
                areaIds: currentFilters.location.length > 0 ? currentFilters.location.join(',') : undefined,
                developerId: currentFilters.developerId || undefined,
            };

            // Fetch both in parallel
            const [offPlanMarkers, pfMarkers] = await Promise.all([
                getMapMarkers({ ...apiFilters, propertyType: 'off-plan' }),
                getPropertyFinderMapMarkers()
            ]);

            // Convert off-plan markers
            const mappedOffPlan = offPlanMarkers.map(m => ({
                id: m.id,
                slug: '',
                name: '',
                nameRu: '',
                location: { area: '', areaRu: '', city: '', cityRu: '' },
                price: {
                    usd: 0,
                    aed: typeof m.priceAED === 'string' ? parseFloat(m.priceAED) : Number(m.priceAED),
                    eur: 0
                },
                developer: { name: '', nameRu: '' },
                bedrooms: 0,
                bathrooms: 0,
                size: { sqm: 0, sqft: 0 },
                images: [],
                type: 'sale' as const, // Off-plan is always sale
                coordinates: [
                    typeof m.lng === 'string' ? parseFloat(m.lng) : Number(m.lng),
                    typeof m.lat === 'string' ? parseFloat(m.lat) : Number(m.lat)
                ] as [number, number],
                isPartial: true
            }));

            // Convert PF markers
            const mappedPF = (pfMarkers || []).map(m => ({
                id: m.id,
                slug: '',
                name: m.name || '',
                nameRu: m.name || '',
                location: { area: m.area || '', areaRu: m.area || '', city: '', cityRu: '' },
                price: {
                    usd: 0,
                    aed: typeof m.price === 'string' ? parseFloat(m.price) : Number(m.price || 0),
                    eur: 0
                },
                developer: { name: '', nameRu: '' },
                bedrooms: 0,
                bathrooms: 0,
                size: { sqm: 0, sqft: 0 },
                images: [],
                type: m.type === 'rent' ? 'rent' as const : 'sale' as const,
                coordinates: [
                    typeof m.lng === 'string' ? parseFloat(m.lng) : Number(m.lng),
                    typeof m.lat === 'string' ? parseFloat(m.lat) : Number(m.lat)
                ] as [number, number],
                isPartial: true,
                isPropertyFinder: true
            }));

            const mapProperties = [...mappedOffPlan, ...mappedPF];

            setProperties(mapProperties);
            setIsInitialLoad(false);
        } catch (err: any) {
            console.error('Failed to load map markers:', err);
            setError(err.message || 'Failed to load properties');
            setIsInitialLoad(false);
        } finally {
            setLoading(false);
        }
    }, [locale]);

    useEffect(() => {
        loadProperties(filters);
    }, [filters, loadProperties]);

    return (
        <div className={styles.mapPageContainer}>
            <Header />
            <div className={styles.mapPage}>
                <MapFilters filters={filters} onFilterChange={setFilters} />

                {(loading || isInitialLoad) && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1000,
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(5px)',
                        color: '#003077',
                        padding: '16px 32px',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        boxShadow: '0 8px 32px rgba(0, 48, 119, 0.2)',
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: '1px solid rgba(0, 48, 119, 0.1)'
                    }}>
                        <div className={styles.loaderSpinner}></div>
                        Loading properties...
                    </div>
                )}
                {error && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1000,
                        background: 'rgba(220, 38, 38, 0.9)',
                        color: '#fff',
                        padding: '16px 32px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '500',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        pointerEvents: 'none'
                    }}>
                        Error: {error}
                    </div>
                )}
                {!loading && !isInitialLoad && !error && properties.length === 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1000,
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(5px)',
                        color: '#6b7280',
                        padding: '16px 32px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '500',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        pointerEvents: 'none',
                        textAlign: 'center',
                        border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                        No available properties. Change filters.
                    </div>
                )}
                <MapboxMap properties={properties} />
            </div>
        </div>
    );
}
