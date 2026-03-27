'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import dynamic from 'next/dynamic';
import AgentHeader from '@/components/AgentHeader';
import { getPropertyFinderMapMarkers, ensureAbsoluteUrl } from '@/lib/api';
import styles from '@/app/[locale]/map/page.module.css';
import { useSearchParams, useRouter } from 'next/navigation';

// Reuse MapboxMap from main site
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

export default function AgentMapContent() {
    const locale = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    // Current status from URL
    const status = searchParams.get('status') || '';

    const loadProperties = useCallback(async () => {
        try {
            setLoading(true);
            console.log('[AgentMap] Starting to load properties with status:', status);
            
            // Call the optimized map markers endpoint with optional status
            const markers = await getPropertyFinderMapMarkers(status);
            console.log(`[AgentMap] Markers from API: ${markers?.length || 0}`);
    
            if (!markers || markers.length === 0) {
                setProperties([]);
                setIsInitialLoad(false);
                return;
            }

            const mapProperties = markers.map((m: any) => {
                const lng = parseFloat(m.lng || m.lon || m.longitude || '0');
                const lat = parseFloat(m.lat || m.latitude || '0');
                const price = parseFloat(m.price || m.priceAED || '0');
                
                return {
                    id: m.id,
                    name: m.name,
                    nameRu: m.name,
                    price: { usd: 0, aed: price, eur: 0 },
                    location: {
                        area: m.area || '',
                        areaRu: m.area || '',
                        city: 'Dubai',
                        cityRu: 'Дубай'
                    },
                    images: (m.images && m.images.length > 0) ? m.images.map(ensureAbsoluteUrl) : (m.image ? [ensureAbsoluteUrl(m.image)] : (m.photo ? [ensureAbsoluteUrl(m.photo)] : (m.coverImage || m.cover_image ? [ensureAbsoluteUrl(m.coverImage || m.cover_image)] : []))),
                    type: (m.type === 'rent' || m.offeringType === 'rent' || m.offering_type === 'rent') ? 'rent' : 'sale',
                    coordinates: [lng, lat] as [number, number],
                    isPropertyFinder: true,
                    isPartial: true 
                };
            }).filter(p => p.coordinates[0] !== 0 && p.coordinates[1] !== 0);

            setProperties(mapProperties);
            setIsInitialLoad(false);
        } catch (err) {
            console.error('[AgentMap] Failed to load map projects:', err);
            setIsInitialLoad(false);
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => {
        loadProperties();
    }, [loadProperties]);

    const handleStatusChange = (newStatus: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (newStatus) {
            params.set('status', newStatus);
        } else {
            params.delete('status');
        }
        router.push(`?${params.toString()}`);
        setIsStatusOpen(false);
    };

    const statusOptions = [
        { value: '', label: locale === 'ru' ? 'Все статусы' : 'All statuses' },
        { value: 'off-plan', label: locale === 'ru' ? 'Off-plan' : 'Off-plan' },
        { value: 'secondary', label: locale === 'ru' ? 'Completed' : 'Completed' }
    ];

    return (
        <div className={styles.mapPageContainer}>
            <AgentHeader />
            <div className={styles.mapPage} style={{ height: 'calc(100vh - 80px)' }}>
                {/* View Toggles Overlay */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 100,
                    display: 'flex',
                    gap: '12px'
                }}>
                  <a href="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        background: '#ffffff',
                        border: '1px solid rgba(0, 48, 119, 0.1)',
                        color: '#003077',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                      <span>{locale === 'ru' ? 'Список' : 'List'}</span>
                  </a>

                  <div style={{ position: 'relative' }}>
                    <button 
                        onClick={() => setIsStatusOpen(!isStatusOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            background: '#ffffff',
                            border: '1px solid rgba(0, 48, 119, 0.1)',
                            color: '#003077',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer'
                        }}
                    >
                        <span>
                            {status === 'off-plan' ? 'Off-plan' : status === 'secondary' ? 'Completed' : (locale === 'ru' ? 'Статус' : 'Status')}
                        </span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isStatusOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </button>

                    {isStatusOpen && (
                        <>
                            <div 
                                onClick={() => setIsStatusOpen(false)}
                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} 
                            />
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                left: 0,
                                width: '200px',
                                background: '#ffffff',
                                border: '1px solid rgba(0, 48, 119, 0.1)',
                                borderRadius: '12px',
                                padding: '8px',
                                boxShadow: '0 8px 32px rgba(0, 48, 119, 0.15)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            }}>
                                {statusOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleStatusChange(opt.value)}
                                        style={{
                                            padding: '10px 12px',
                                            textAlign: 'left',
                                            background: status === opt.value ? '#f0f4ff' : 'transparent',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#003077',
                                            fontSize: '14px',
                                            fontWeight: status === opt.value ? '600' : '400',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f4ff')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = status === opt.value ? '#f0f4ff' : 'transparent')}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                  </div>
                </div>
                
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        Loading projects...
                    </div>
                )}
                
                <MapboxMap properties={properties} />
            </div>
        </div>
    );
}
