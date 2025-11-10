'use client';

import { useState, useEffect, useCallback, useRef, startTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebounce } from '@/lib/utils';
import { getProperties, Property, PropertyFilters as ApiPropertyFilters } from '@/lib/api';
import { restoreScrollState } from '@/lib/scrollRestoration';
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
const convertFiltersToApi = (filters: Filters, page: number): ApiPropertyFilters => {
  const propertyType = filters.type === 'new' ? 'off-plan' : 'secondary';
  const sort = mapSortToBackend(filters.sort, propertyType);
  
  const apiFilters: ApiPropertyFilters = {
    propertyType,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    // Server-side pagination: request only the current page
    page: page,
    limit: ITEMS_PER_PAGE, // 36 items per page
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
  // Always include page parameter if provided (even for page 1)
  if (page !== undefined && page !== null) {
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      // For page 1, remove page parameter if it exists (cleaner URL)
      params.delete('page');
    }
  }
  
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Create a new searchParams object for URL updates
  const createSearchParams = useCallback((newFilters: Filters, page?: number): URLSearchParams => {
    return filtersToUrlParams(newFilters, page);
  }, []);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState<Filters>(() => {
    return urlParamsToFilters(searchParams);
  });

  // Sync filters with URL when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const urlFilters = urlParamsToFilters(searchParams);
    setFilters(prevFilters => {
      // Only update if filters actually changed
      if (JSON.stringify(prevFilters) !== JSON.stringify(urlFilters)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Syncing filters from URL:', urlFilters);
        }
        return urlFilters;
      }
      return prevFilters;
    });
  }, [searchParams]);

  // Initialize page from URL
  const initialPage = searchParams.get('page') ? parseInt(searchParams.get('page') || '1', 10) : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [scrollRestored, setScrollRestored] = useState(false);

  // Sync page with URL when URL changes (e.g., browser back/forward)
  // Use a ref to track if we're updating URL ourselves to avoid loops
  const isUpdatingUrlRef = useRef(false);
  
  useEffect(() => {
    // Skip if we're the ones updating the URL
    if (isUpdatingUrlRef.current) {
      // Reset flag after a delay
      setTimeout(() => {
        isUpdatingUrlRef.current = false;
      }, 100);
      return;
    }
    
    const urlPage = searchParams.get('page') ? parseInt(searchParams.get('page') || '1', 10) : 1;
    setCurrentPage((prevPage) => {
      // Only update if URL page is different from current page
      if (urlPage !== prevPage && urlPage >= 1) {
        console.log('Syncing page from URL:', urlPage, 'prev:', prevPage);
        return urlPage;
      }
      return prevPage;
    });
  }, [searchParams]);

  // Debounce search
  const debouncedSearch = useDebounce(filters.search, 500);

  // Load properties from API with server-side pagination
  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert filters and pass current page for server-side pagination
      const apiFilters = convertFiltersToApi(filters, currentPage);
      
      // Override search with debounced value
      if (debouncedSearch) {
        apiFilters.search = debouncedSearch;
      } else {
        delete apiFilters.search;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Loading properties (server-side pagination):', {
          propertyType: apiFilters.propertyType,
          page: apiFilters.page,
          limit: apiFilters.limit,
          currentPage,
        });
      }
      
      // Request only the current page from API (36 items)
      const result = await getProperties(apiFilters);
      const loadedProperties = Array.isArray(result.properties) ? result.properties : [];
      
      // Use total from API - this is the total count of ALL properties matching filters
      let total = result.total || 0;
      
      // If total is 0 or equals loaded count and we got a full page, estimate there are more
      // This handles cases where API doesn't return correct total
      if ((total === 0 || total === loadedProperties.length) && loadedProperties.length === ITEMS_PER_PAGE) {
        // For secondary properties, estimate conservatively (26K+)
        if (apiFilters.propertyType === 'secondary') {
          total = 26000; // Conservative estimate for secondary
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ API total is 0 or equals loaded count for secondary. Using estimated total:', total);
          }
        } else {
          // For off-plan, estimate 1000
          total = 1000;
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ API total is 0 or equals loaded count for off-plan. Using estimated total:', total);
          }
        }
      }
      
      setTotalProperties(total);
      
      // Set properties directly (no slicing needed - API returns only this page)
      setProperties(loadedProperties);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Properties loaded:', {
          loaded: loadedProperties.length,
          totalFromAPI: total,
          currentPage,
          totalPages: Math.ceil(total / ITEMS_PER_PAGE),
        });
      }
    } catch (err: any) {
      console.error('Error loading properties:', err);
      setError(err.message || t('errorLoading') || 'Error loading properties');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, debouncedSearch, t]);

  // Update URL when filters or page change
  const updateUrl = useCallback((newFilters: Filters, page?: number) => {
    isUpdatingUrlRef.current = true; // Mark that we're updating URL ourselves
    const params = createSearchParams(newFilters, page);
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    console.log('updateUrl called:', { page, newUrl, params: queryString, currentUrl: window.location.href });
    
    // Use router.replace with the full URL including query string
    // Next.js App Router should handle this correctly
    const urlWithQuery = queryString ? `${pathname}?${queryString}` : pathname;
    
    // Use startTransition for non-urgent URL updates
    startTransition(() => {
      router.replace(urlWithQuery, { scroll: false });
    });
    
    // Force URL update in browser address bar immediately
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState(null, '', urlWithQuery);
      
      // Reset flag after a delay
      setTimeout(() => {
        isUpdatingUrlRef.current = false;
      }, 100);
    } else {
      setTimeout(() => {
        isUpdatingUrlRef.current = false;
      }, 100);
    }
  }, [pathname, router, createSearchParams]);

  useEffect(() => {
    // Reset loading state when filters or page change
    setLoading(true);
    setError(null);
    loadProperties();
  }, [loadProperties]);

  // Restore scroll position and page when returning from property detail page
  useEffect(() => {
    if (scrollRestored || loading) return;
    
    const restoredState = restoreScrollState();
    if (restoredState) {
      // Update page if it was restored and different from current
      if (restoredState.page !== currentPage) {
        setCurrentPage(restoredState.page);
        updateUrl(filters, restoredState.page);
      }
      // Scroll position is restored automatically by restoreScrollState function
      setScrollRestored(true);
    }
  }, [loading, scrollRestored, currentPage, filters, updateUrl]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    setScrollRestored(false); // Reset scroll restoration flag when filters change
    updateUrl(newFilters, 1); // Update URL (reset page to 1)
  };

  // Calculate pagination based on total from API
  // Server-side pagination: API returns total count of all matching properties
  const totalPages = totalProperties > 0 
    ? Math.ceil(totalProperties / ITEMS_PER_PAGE) 
    : Math.ceil(properties.length / ITEMS_PER_PAGE) || 1;
  
  // Ensure properties is always an array
  const propertiesArray = Array.isArray(properties) ? properties : [];
  
  // Ensure currentPage is within valid range
  const validPage = totalPages > 0 ? Math.min(Math.max(1, currentPage), totalPages) : 1;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Pagination info:', {
      totalProperties,
      propertiesCount: propertiesArray.length,
      totalPages,
      currentPage,
      validPage,
    });
  }
  
  // Sync currentPage if it's out of bounds
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      console.log(`Current page ${currentPage} is out of bounds (total: ${totalPages}), resetting to 1`);
      setCurrentPage(1);
      updateUrl(filters, 1);
    }
  }, [totalPages, currentPage, filters, updateUrl]);
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) {
      console.warn('Invalid page number:', page, 'Total pages:', totalPages);
      return; // Validate page number
    }
    
    console.log('handlePageChange called with page:', page, 'Total pages:', totalPages);
    setCurrentPage(page);
    setScrollRestored(false); // Reset scroll restoration when manually changing page
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
        ) : propertiesArray.length === 0 ? (
          <div className={styles.empty}>
            <p>{t('noProperties') || 'No properties found'}</p>
          </div>
        ) : (
          <>
            <div className={styles.resultsCount}>
              {t('showing', { count: totalProperties }) || `${totalProperties} ${totalProperties === 1 ? 'property' : 'properties'}`}
            </div>
            <div className={styles.grid}>
              {propertiesArray.map((property) => (
                <PropertyCard key={property.id} property={property} currentPage={validPage} />
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  onClick={() => handlePageChange(validPage - 1)}
                  disabled={validPage === 1}
                  aria-label="Previous page"
                >
                  ← {t('previous') || 'Previous'}
                </button>
                <div className={styles.paginationNumbers}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= validPage - 2 && page <= validPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`${styles.paginationNumber} ${validPage === page ? styles.active : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === validPage - 3 || page === validPage + 3) {
                      return <span key={page} className={styles.paginationEllipsis}>...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  className={styles.paginationButton}
                  onClick={() => handlePageChange(validPage + 1)}
                  disabled={validPage >= totalPages}
                  aria-label="Next page"
                >
                  {t('next') || 'Next'} →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

