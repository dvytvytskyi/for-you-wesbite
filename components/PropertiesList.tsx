'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebounce } from '@/lib/utils';
import { getProperties, Property, PropertyFilters as ApiPropertyFilters } from '@/lib/api';
import styles from './PropertiesList.module.css';
import PropertyCard from './PropertyCard';
import PropertyFilters from './PropertyFilters';
import PropertyCardSkeleton from './PropertyCardSkeleton';

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

// Map frontend sort to backend sort
const mapSortToBackend = (frontendSort: string | undefined, propertyType: 'off-plan' | 'secondary'): { sortBy: ApiPropertyFilters['sortBy'], sortOrder: ApiPropertyFilters['sortOrder'] } => {
  // Default to 'newest' if sort is empty or undefined
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

// Convert frontend filters to API filters
const convertFiltersToApi = (filters: Filters): ApiPropertyFilters => {
  const propertyType = filters.type === 'new' ? 'off-plan' : 'secondary';
  const sort = mapSortToBackend(filters.sort, propertyType);
  
  const apiFilters: ApiPropertyFilters = {
    propertyType,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
  };

  // Developer filter
  if (filters.developerId) {
    apiFilters.developerId = filters.developerId;
  }

  // City filter
  if (filters.cityId) {
    apiFilters.cityId = filters.cityId;
  }

  // Area filter (multiselect - convert to comma-separated string for first area, or use first one)
  if (filters.location.length > 0) {
    // API supports only one areaId, so we'll use the first selected
    apiFilters.areaId = filters.location[0];
    // But for client-side filtering, we need all selected areas
    apiFilters.areaIds = filters.location;
  }

  // Bedrooms filter (multiselect - convert to comma-separated string)
  if (filters.bedrooms.length > 0) {
    apiFilters.bedrooms = filters.bedrooms.join(',');
  }

  // Size filter (convert from sqft to m² if needed, or keep as is if already in m²)
  // Frontend shows sqft, but API expects m²
  // For now, assuming frontend inputs are in m²
  if (filters.sizeFrom) {
    apiFilters.sizeFrom = parseFloat(filters.sizeFrom) || undefined;
  }
  if (filters.sizeTo) {
    apiFilters.sizeTo = parseFloat(filters.sizeTo) || undefined;
  }

  // Price filter (convert from AED to USD)
  // Frontend shows AED, but API expects USD
  // USD = AED / 3.67
  if (filters.priceFrom) {
    const aedPrice = parseFloat(filters.priceFrom.replace(/,/g, '')) || 0;
    apiFilters.priceFrom = Math.round(aedPrice / 3.67);
  }
  if (filters.priceTo) {
    const aedPrice = parseFloat(filters.priceTo.replace(/,/g, '')) || 0;
    apiFilters.priceTo = Math.round(aedPrice / 3.67);
  }

  // Search
  if (filters.search) {
    apiFilters.search = filters.search;
  }

  return apiFilters;
};

const ITEMS_PER_PAGE = 36;

// Helper functions to sync filters with URL
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
  return {
    type: (searchParams.get('type') as 'new' | 'secondary') || 'new',
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState<Filters>(() => {
    if (typeof window !== 'undefined' && searchParams.toString()) {
      return urlParamsToFilters(searchParams);
    }
    return {
      type: 'new',
      search: '',
      location: [],
      bedrooms: [],
      sizeFrom: '',
      sizeTo: '',
      priceFrom: '',
      priceTo: '',
      sort: 'newest',
    };
  });

  // Initialize page from URL
  const initialPage = searchParams.get('page') ? parseInt(searchParams.get('page') || '1', 10) : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Debounce search
  const debouncedSearch = useDebounce(filters.search, 500);

  // Load properties from API
  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiFilters = convertFiltersToApi(filters);
      // Override search with debounced value
      if (debouncedSearch) {
        apiFilters.search = debouncedSearch;
      } else {
        delete apiFilters.search;
      }
      
      // Debug: log sort parameters
      if (process.env.NODE_ENV === 'development') {
        console.log('Frontend sort value:', filters.sort);
        console.log('Converted to API filters:', {
          sortBy: apiFilters.sortBy,
          sortOrder: apiFilters.sortOrder,
          propertyType: apiFilters.propertyType,
        });
      }
      
      const data = await getProperties(apiFilters);
      setProperties(data);
    } catch (err: any) {
      console.error('Error loading properties:', err);
      setError(err.message || t('errorLoading') || 'Error loading properties');
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.location, filters.bedrooms, filters.sizeFrom, filters.sizeTo, filters.priceFrom, filters.priceTo, filters.sort, filters.developerId, filters.cityId, debouncedSearch, t]);

  useEffect(() => {
    loadProperties();
    setCurrentPage(1); // Reset to first page when filters change
  }, [loadProperties]);

  // Update URL when filters or page change
  const updateUrl = useCallback((newFilters: Filters, page?: number) => {
    const params = filtersToUrlParams(newFilters, page);
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [pathname, router]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    updateUrl(newFilters, 1); // Update URL (reset page to 1)
  };

  // Calculate pagination
  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProperties = properties.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl(filters, page); // Update URL with new page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className={styles.propertiesList}>
        <div className={styles.container}>
          <PropertyFilters filters={filters} onFilterChange={handleFilterChange} />
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={() => loadProperties()}>{t('retry') || 'Retry'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.propertiesList}>
      <div className={styles.container}>
        <PropertyFilters filters={filters} onFilterChange={handleFilterChange} />
        
        {loading ? (
          <>
            <div className={styles.resultsCount}>
              <div className={styles.skeletonText}></div>
            </div>
            <div className={styles.grid}>
              {Array.from({ length: 12 }).map((_, index) => (
                <PropertyCardSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          </>
        ) : properties.length === 0 ? (
          <div className={styles.empty}>
            <p>{t('noProperties') || 'No properties found'}</p>
          </div>
        ) : (
          <>
            <div className={styles.resultsCount}>
              {t('showing', { count: properties.length }) || `${properties.length} ${properties.length === 1 ? 'property' : 'properties'}`}
            </div>
            <div className={styles.grid}>
              {currentProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  {t('previous') || 'Previous'}
                </button>
                <div className={styles.paginationNumbers}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`${styles.paginationNumber} ${currentPage === page ? styles.active : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 3 || page === currentPage + 3) {
                      return <span key={page} className={styles.paginationEllipsis}>...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  className={styles.paginationButton}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {t('next') || 'Next'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
