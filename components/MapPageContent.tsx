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
                propertyType: 'off-plan',
                search: currentFilters.search || undefined,
                priceFrom: currentFilters.priceFrom || undefined,
                priceTo: currentFilters.priceTo || undefined,
                bedrooms: currentFilters.bedrooms.length > 0 ? currentFilters.bedrooms.join(',') : undefined,
                areaIds: currentFilters.location.length > 0 ? currentFilters.location.join(',') : undefined,
                developerId: currentFilters.developerId || undefined,
            };

            // Fetch both in parallel
            // Determine property type and status for API
            const propertyType = 'off-plan';
            const pfStatus = 'off-plan';

            // Fetch both in parallel
            const [offPlanMarkers, pfMarkers] = await Promise.all([
                getMapMarkers({ ...apiFilters, propertyType }),
                getPropertyFinderMapMarkers(pfStatus)
            ]);

            // Convert off-plan markers with strict filtering
            const mappedOffPlan = offPlanMarkers
                .filter(m => m.propertyType === 'off-plan')
                .map(m => ({
                id: m.id,
                slug: (m as any).slug || '',
                name: (m as any).nameEn || (m as any).name || (m as any).title || '',
                nameRu: (m as any).nameRu || (m as any).name || (m as any).title || '',
                location: { 
                    area: (m as any).area || (m as any).district || '', 
                    areaRu: (m as any).areaRu || (m as any).area || (m as any).district || '', 
                    city: (m as any).city || 'Dubai', 
                    cityRu: (m as any).cityRu || (m as any).city || 'Дубай' 
                },
                price: {
                    usd: 0,
                    aed: typeof m.priceAED === 'string' ? parseFloat(m.priceAED) : Number(m.priceAED),
                    eur: 0
                },
                developer: { 
                    name: (m as any).developerName || (m as any).developer || '', 
                    nameRu: (m as any).developerNameRu || (m as any).developerName || (m as any).developer || '' 
                },
                bedrooms: (m as any).bedrooms || 0,
                bathrooms: (m as any).bathrooms || 0,
                size: { sqm: (m as any).size || 0, sqft: ((m as any).size || 0) * 10.764 },
                images: (m as any).mainImage ? [(m as any).mainImage] : ((m as any).image ? [(m as any).image] : ((m as any).images || [])),
                type: 'sale' as const, 
                propertyType: 'off-plan',
                coordinates: [
                    typeof m.lng === 'string' ? parseFloat(m.lng) : Number(m.lng),
                    typeof m.lat === 'string' ? parseFloat(m.lat) : Number(m.lat)
                ] as [number, number],
                isPartial: true,
                priceAED: typeof m.priceAED === 'string' ? parseFloat(m.priceAED) : Number(m.priceAED),
                priceFromAED: typeof m.priceAED === 'string' ? parseFloat(m.priceAED) : Number(m.priceAED)
            }));

            // Convert PF markers
            const mappedPF = (pfMarkers || []).map(m => ({
                id: m.id,
                slug: m.slug || m.id,
                name: m.name || m.title || '',
                nameRu: m.nameRu || m.name || m.title || '',
                location: { 
                    area: m.area || m.district || m.location || '', 
                    areaRu: m.areaRu || m.area || m.district || m.location || '', 
                    city: m.city || 'Dubai', 
                    cityRu: m.cityRu || m.city || 'Дубай' 
                },
                price: {
                    usd: 0,
                    aed: typeof m.price === 'string' ? parseFloat(m.price) : Number(m.price || 0),
                    eur: 0
                },
                developer: { 
                    name: m.developer || '', 
                    nameRu: m.developer || '' 
                },
                bedrooms: m.bedrooms || 0,
                bathrooms: m.bathrooms || 0,
                size: { sqm: m.size || 0, sqft: (m.size || 0) * 10.764 },
                images: (m as any).mainImage ? [(m as any).mainImage] : (m.image ? [m.image] : (m.images || [])),
                type: m.type === 'rent' ? 'rent' as const : 'sale' as const,
                propertyType: pfStatus === 'off-plan' ? 'off-plan' : 'secondary',
                coordinates: [
                    typeof m.lng === 'string' ? parseFloat(m.lng) : Number(m.lng),
                    typeof m.lat === 'string' ? parseFloat(m.lat) : Number(m.lat)
                ] as [number, number],
                isPartial: true,
                isPropertyFinder: true,
                priceAED: typeof m.price === 'string' ? parseFloat(m.price) : Number(m.price || 0),
                priceFromAED: typeof m.price === 'string' ? parseFloat(m.price) : Number(m.price || 0)
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
