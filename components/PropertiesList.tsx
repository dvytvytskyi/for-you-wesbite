'use client';

import { useState, useEffect, useCallback, useRef, startTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebounce } from '@/lib/utils';
import { restoreScrollState } from '@/lib/scrollRestoration';
import styles from './PropertiesList.module.css';
import PropertyCard from './PropertyCard';
import PropertyCardSkeleton from './PropertyCardSkeleton';
import FilterModal from './FilterModal';
import PropertyFilters from './PropertyFilters';
import MapboxMap from './MapboxMap';
import CallbackModal from './CallbackModal';
import { convertPropertyToMapFormat } from '@/lib/transformers';
import { getProperties, Property, PropertyFilters as ApiPropertyFilters, getDevelopersSimple, getMapMarkers, MapMarker, getAreasSimple } from '@/lib/api';

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

const ITEMS_PER_PAGE = 36;

const formatNumberWithCommas = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const sortOptions = [
  { value: 'price-desc', label: 'Price Higher', labelRu: 'Цена выше' },
  { value: 'price-asc', label: 'Price Lower', labelRu: 'Цена ниже' },
  { value: 'size-desc', label: 'Size Higher', labelRu: 'Площадь больше' },
  { value: 'size-asc', label: 'Size Lower', labelRu: 'Площадь меньше' },
  { value: 'newest', label: 'Newest First', labelRu: 'Сначала новые' },
];

const mapSortToBackend = (frontendSort: string | undefined, propertyType: 'off-plan' | 'secondary'): { sortBy: ApiPropertyFilters['sortBy'], sortOrder: ApiPropertyFilters['sortOrder'] } => {
  const sortValue = frontendSort || 'newest';
  const mapping: Record<string, { sortBy: ApiPropertyFilters['sortBy'], sortOrder: ApiPropertyFilters['sortOrder'] }> = {
    'price-desc': { sortBy: propertyType === 'off-plan' ? 'priceFrom' : 'price', sortOrder: 'DESC' },
    'price-asc': { sortBy: propertyType === 'off-plan' ? 'priceFrom' : 'price', sortOrder: 'ASC' },
    'size-desc': { sortBy: propertyType === 'off-plan' ? 'sizeFrom' : 'size', sortOrder: 'DESC' },
    'size-asc': { sortBy: propertyType === 'off-plan' ? 'sizeFrom' : 'size', sortOrder: 'ASC' },
    'newest': { sortBy: 'createdAt', sortOrder: 'DESC' },
  };
  return mapping[sortValue] || mapping['newest'];
};

const convertFiltersToApi = (filters: Filters, page: number): ApiPropertyFilters => {
  const propertyType = filters.type === 'new' ? 'off-plan' : 'secondary';
  const sort = mapSortToBackend(filters.sort, propertyType);

  const apiFilters: ApiPropertyFilters = {
    propertyType,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    page: page,
    limit: ITEMS_PER_PAGE,
    summary: true,
  };

  if (filters.developerId) apiFilters.developerId = filters.developerId;
  if (filters.cityId) apiFilters.cityId = filters.cityId;
  if (filters.location.length > 0) {
    const loc = filters.location[0];
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(loc);

    if (isUuid) {
      apiFilters.areaId = loc;
      apiFilters.areaIds = filters.location;
    } else {
      apiFilters.areaSlug = loc;
    }
  }
  if (filters.bedrooms.length > 0) apiFilters.bedrooms = filters.bedrooms.join(',');
  if (filters.sizeFrom) apiFilters.sizeFrom = parseFloat(filters.sizeFrom) || undefined;
  if (filters.sizeTo) apiFilters.sizeTo = parseFloat(filters.sizeTo) || undefined;
  if (filters.priceFrom) {
    const aedPrice = parseFloat(filters.priceFrom.replace(/,/g, '')) || 0;
    apiFilters.priceFrom = Math.round(aedPrice / 3.67);
  }
  if (filters.priceTo) {
    const aedPrice = parseFloat(filters.priceTo.replace(/,/g, '')) || 0;
    apiFilters.priceTo = Math.round(aedPrice / 3.67);
  }
  if (filters.search) apiFilters.search = filters.search;

  return apiFilters;
};

const filtersToUrlParams = (filters: Filters, page?: number): URLSearchParams => {
  const params = new URLSearchParams();
  if (filters.type !== 'new') params.set('type', filters.type);
  if (filters.search) params.set('search', filters.search);
  if (filters.location.length > 0) params.set('location', filters.location.join(','));
  if (filters.bedrooms.length > 0) params.set('bedrooms', filters.bedrooms.join(','));
  if (filters.sizeFrom) params.set('sizeFrom', filters.sizeFrom);
  if (filters.sizeTo) params.set('sizeTo', filters.sizeTo);
  if (filters.priceFrom) params.set('priceFrom', filters.priceFrom);
  if (filters.priceTo) params.set('priceTo', filters.priceTo);
  if (filters.sort !== 'newest') params.set('sort', filters.sort);
  if (filters.developerId) params.set('developerId', filters.developerId);
  if (filters.cityId) params.set('cityId', filters.cityId);
  if (page && page > 1) params.set('page', page.toString());
  return params;
};

const urlParamsToFilters = (searchParams: URLSearchParams): Filters => {
  const typeParam = searchParams.get('type');
  const type: 'new' | 'secondary' = typeParam === 'secondary' ? 'secondary' : 'new';
  return {
    type,
    search: searchParams.get('search') || '',
    location: searchParams.get('location')?.split(',').filter(Boolean) || [],
    bedrooms: searchParams.get('bedrooms')?.split(',').map(Number).filter(n => !isNaN(n)) || [],
    sizeFrom: searchParams.get('sizeFrom') || '',
    sizeTo: searchParams.get('sizeTo') || '',
    priceFrom: searchParams.get('priceFrom') || '',
    priceTo: searchParams.get('priceTo') || '',
    sort: searchParams.get('sort') || 'newest',
    developerId: searchParams.get('developerId') || undefined,
    cityId: searchParams.get('cityId') || undefined,
  };
};

export default function PropertiesList() {
  const t = useTranslations('properties');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [properties, setProperties] = useState<Property[]>([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [areas, setAreas] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Sync filters with URL
  const [filters, setFilters] = useState<Filters>(() => urlParamsToFilters(new URLSearchParams(searchParams.toString())));

  // Sync page with URL
  const [currentPage, setCurrentPage] = useState(() => {
    const p = searchParams.get('page');
    return p ? parseInt(p, 10) : 1;
  });

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [scrollRestored, setScrollRestored] = useState(false);
  const [initialSavedState, setInitialSavedState] = useState<{ page: number; scrollPosition: number } | null>(null);

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Load areas for title mapping and check for mobile
  useEffect(() => {
    setMounted(true);
    getAreasSimple().then(setAreas).catch(console.error);

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Force 'new' (off-plan) type when in map mode
  useEffect(() => {
    if (viewMode === 'map' && filters.type !== 'new') {
      handleFilterChange({ ...filters, type: 'new' });
    }
  }, [viewMode, filters.type]);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [callbackProjectName, setCallbackProjectName] = useState<string | undefined>(undefined);

  const openCallbackModal = (projectName?: string) => {
    setCallbackProjectName(projectName);
    setIsCallbackModalOpen(true);
  };

  // Restore scroll state on mount
  useEffect(() => {
    const saved = restoreScrollState();
    if (saved) {
      setInitialSavedState(saved);
      if (saved.page && saved.page !== currentPage) {
        setCurrentPage(saved.page);
      }
    }
  }, []);

  // External open-filter-modal event
  useEffect(() => {
    const handleOpenFilters = () => setIsFilterModalOpen(true);
    window.addEventListener('open-filter-modal', handleOpenFilters);
    return () => window.removeEventListener('open-filter-modal', handleOpenFilters);
  }, []);

  // Handle click outside for sort dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Watch searchParams for changes (navigation)
  useEffect(() => {
    const urlFilters = urlParamsToFilters(new URLSearchParams(searchParams.toString()));
    const urlPage = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;

    setFilters(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(urlFilters)) return urlFilters;
      return prev;
    });
    setCurrentPage(prev => {
      if (prev !== urlPage) return urlPage;
      return prev;
    });
  }, [searchParams]);

  // Handle scroll to deselect property in map view
  useEffect(() => {
    if (viewMode !== 'map' || !selectedPropertyId) return;

    const handleScroll = () => {
      setSelectedPropertyId(null);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode, selectedPropertyId]);

  const debouncedSearch = useDebounce(filters.search, 500);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiFilters = convertFiltersToApi(filters, currentPage);
      if (debouncedSearch) apiFilters.search = debouncedSearch;

      const result = await getProperties(apiFilters, true);
      const loadedProperties = Array.isArray(result.properties) ? result.properties : [];
      let total = result.total || 0;

      // Handle potential API limits returning fewer items than total
      if (total <= loadedProperties.length && loadedProperties.length >= ITEMS_PER_PAGE) {
        if (total < ITEMS_PER_PAGE * 1.5) total = apiFilters.propertyType === 'secondary' ? 26000 : 1314;
      }

      setTotalProperties(total);
      setProperties(loadedProperties);
    } catch (err: any) {
      setError(err.message || t('errorLoading') || 'Error loading properties');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, debouncedSearch, t]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // Restore scroll position after properties are loaded
  useEffect(() => {
    if (!loading && properties.length > 0 && initialSavedState && !scrollRestored) {
      const timer = setTimeout(() => {
        window.scrollTo({
          top: initialSavedState.scrollPosition,
          behavior: 'instant' as ScrollBehavior,
        });
        setScrollRestored(true);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [loading, properties, initialSavedState, scrollRestored]);

  // Load map markers when viewMode is map or filters change
  useEffect(() => {
    if (viewMode !== 'map') return;

    const loadMarkers = async () => {
      try {
        setLoadingMap(true);
        const apiFilters = convertFiltersToApi(filters, 1);
        apiFilters.limit = 5000; // Get all markers for the map
        const markers = await getMapMarkers(apiFilters);

        // Convert to partial map format
        const mapProperties = markers.map(m => ({
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
          type: m.propertyType === 'off-plan' ? 'new' as const : 'secondary' as const,
          coordinates: [
            typeof m.lng === 'string' ? parseFloat(m.lng) : Number(m.lng),
            typeof m.lat === 'string' ? parseFloat(m.lat) : Number(m.lat)
          ] as [number, number],
          isPartial: true
        }));

        setMapMarkers(mapProperties);
      } catch (e) {
        console.error('Failed to load map markers', e);
      } finally {
        setLoadingMap(false);
      }
    };

    loadMarkers();
  }, [filters, viewMode, locale]);

  const handleSelectProperty = useCallback((id: string | null) => {
    setSelectedPropertyId(id);
    // If selecting a property, we want to make sure map can see it
    // More logic will be in MapboxMap component responding to selectedPropertyId
  }, []);

  const updateUrl = useCallback((newFilters: Filters, page: number) => {
    const params = filtersToUrlParams(newFilters, page);
    const queryString = params.toString();
    const urlWithQuery = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(urlWithQuery, { scroll: false });
  }, [pathname, router]);

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    updateUrl(newFilters, 1);
  }, [updateUrl]);

  const handleApplyFilters = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    updateUrl(newFilters, 1);
  }, [updateUrl]);

  const handleResetFilters = () => {
    const defaultFilters: Filters = {
      type: 'new', search: '', location: [], bedrooms: [], sizeFrom: '', sizeTo: '', priceFrom: '', priceTo: '', sort: 'newest', developerId: undefined, cityId: undefined,
    };
    handleApplyFilters(defaultFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl(filters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.max(1, Math.ceil(totalProperties / ITEMS_PER_PAGE));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  return (
    <div className={`${styles.propertiesList} ${viewMode === 'map' ? styles.viewModeMap : ''}`}>
      <div className={styles.container}>
        <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} filters={filters} onApply={handleApplyFilters} onReset={handleResetFilters} />
        <CallbackModal isOpen={isCallbackModalOpen} onClose={() => setIsCallbackModalOpen(false)} projectName={callbackProjectName} />

        <div className={styles.results}>
          <div className={styles.contentWrapper}>
            <div className={`${styles.listSection} ${viewMode === 'map' ? styles.listSectionWithMap : ''}`}>
              <div className={styles.desktopFilters}>
                <PropertyFilters filters={filters} onFilterChange={handleFilterChange} viewMode={viewMode} isModal={false} />
              </div>

              <div className={styles.listHeader}>
                <div className={styles.titleRow}>
                  <div className={styles.titleGroup}>
                    <h1 className={styles.listTitle}>
                      <span>{(() => {
                        const typeText = filters.type === 'new'
                          ? (locale === 'en' ? 'New buildings in ' : 'Новостройки в ')
                          : (locale === 'en' ? 'Properties for sale in ' : 'Недвижимость в ');

                        if (mounted && filters.location.length > 0) {
                          const selectedAreaNames = filters.location
                            .map(locId => {
                              const area = areas.find(a => a.id === locId || a.slug === locId);
                              return area ? (locale === 'ru' ? area.nameRu : area.nameEn) : null;
                            })
                            .filter(Boolean);

                          if (selectedAreaNames.length > 0) {
                            return `${typeText}${selectedAreaNames.join(', ')}`;
                          }
                        }

                        return `${typeText}${locale === 'en' ? 'UAE' : 'ОАЭ'}`;
                      })()}</span>
                    </h1>
                    <div className={styles.propertyCount}>
                      {loading ? (
                        <div className={styles.countSkeleton}></div>
                      ) : (
                        `${formatNumberWithCommas(totalProperties)} ${locale === 'en' ? 'properties' : 'объектов'}`
                      )}
                    </div>
                  </div>

                  <div className={styles.actionsGroup}>
                    {filters.type === 'new' && (
                      <div className={styles.viewToggle}>
                        <button
                          className={`${styles.toggleButton} ${viewMode === 'map' ? styles.active : ''}`}
                          onClick={() => {
                            if (isMobile) {
                              const params = filtersToUrlParams(filters);
                              router.push(`${locale === 'en' ? '' : '/' + locale}/map?${params.toString()}`);
                            } else {
                              setViewMode(viewMode === 'map' ? 'list' : 'map');
                            }
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                          <span>{locale === 'en' ? 'Map' : 'Карта'}</span>
                        </button>
                      </div>
                    )}

                    {!isMobile && (
                      <>
                        <div className={styles.separator}></div>
                        <div className={styles.sortContainer}>
                          <span className={styles.sortLabel}>{locale === 'en' ? 'Sort:' : 'Сортировка:'}</span>
                          <div className={styles.sortDropdownWrapper} ref={sortRef}>
                            <button
                              className={styles.sortButton}
                              onClick={() => setIsSortOpen(!isSortOpen)}
                            >
                              <span>
                                {sortOptions.find(o => o.value === filters.sort)?.[locale === 'en' ? 'label' : 'labelRu'] || (locale === 'en' ? 'Newest First' : 'Сначала новые')}
                              </span>
                              <svg
                                width="12"
                                height="8"
                                viewBox="0 0 12 8"
                                fill="none"
                                className={isSortOpen ? styles.rotated : ''}
                              >
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                            {isSortOpen && (
                              <div className={styles.sortMenu}>
                                {sortOptions.map((option) => (
                                  <button
                                    key={option.value}
                                    className={`${styles.sortMenuItem} ${filters.sort === option.value ? styles.active : ''}`}
                                    onClick={() => {
                                      handleFilterChange({ ...filters, sort: option.value });
                                      setIsSortOpen(false);
                                    }}
                                  >
                                    {locale === 'en' ? option.label : option.labelRu}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {loading ? (
                <div className={styles.grid}>{Array.from({ length: 8 }).map((_, index) => (<PropertyCardSkeleton key={`skeleton-${index}`} />))}</div>
              ) : properties.length === 0 ? (
                <div className={styles.empty}><p>{t('noProperties') || 'No properties found'}</p></div>
              ) : (
                <>
                  <div className={styles.grid}>
                    {properties.map((property, index) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        currentPage={validPage}
                        index={index}
                        isSelected={selectedPropertyId === property.id}
                        onSelect={() => handleSelectProperty(property.id)}
                        onRequestCallback={openCallbackModal}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className={styles.pagination}>
                      <button
                        className={styles.paginationButton}
                        onClick={() => handlePageChange(validPage - 1)}
                        disabled={validPage === 1}
                      >
                        ← {t('previous') || 'Previous'}
                      </button>

                      <div className={styles.paginationNumbers}>
                        {(() => {
                          const pages = [];
                          const maxVisiblePages = 5;

                          if (totalPages <= maxVisiblePages) {
                            for (let i = 1; i <= totalPages; i++) pages.push(i);
                          } else {
                            pages.push(1);
                            if (validPage > 3) pages.push('...');

                            const start = Math.max(2, validPage - 1);
                            const end = Math.min(totalPages - 1, validPage + 1);

                            for (let i = start; i <= end; i++) {
                              if (!pages.includes(i)) pages.push(i);
                            }

                            if (validPage < totalPages - 2) pages.push('...');
                            if (!pages.includes(totalPages)) pages.push(totalPages);
                          }

                          return pages.map((page, idx) => (
                            typeof page === 'number' ? (
                              <button
                                key={idx}
                                className={`${styles.paginationNumber} ${validPage === page ? styles.active : ''}`}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </button>
                            ) : (
                              <span key={idx} className={styles.paginationEllipsis}>{page}</span>
                            )
                          ));
                        })()}
                      </div>

                      <button
                        className={styles.paginationButton}
                        onClick={() => handlePageChange(validPage + 1)}
                        disabled={validPage === totalPages}
                      >
                        {t('next') || 'Next'} →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={`${styles.mapSection} ${viewMode === 'map' ? styles.mapSectionActive : ''}`}>
              <button className={styles.mapCloseButton} onClick={() => setViewMode('list')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <div className={styles.mapContainer}>
                {loadingMap && (
                  <div className={styles.mapLoadingOverlay}>
                    <div className={styles.loaderSpinner}></div>
                    <span>{locale === 'en' ? 'Updating map...' : 'Обновление карты...'}</span>
                  </div>
                )}
                <MapboxMap
                  properties={mapMarkers}
                  selectedId={selectedPropertyId}
                  onMarkerClick={(id) => handleSelectProperty(id)}
                  onRequestCallback={openCallbackModal}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
