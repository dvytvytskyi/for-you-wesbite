'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@/lib/utils';
import { getProperties, Property, PropertyFilters as ApiPropertyFilters } from '@/lib/api';
import styles from './PropertiesList.module.css';
import PropertyCard from './PropertyCard';
import PropertyFilters from './PropertyFilters';

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
const mapSortToBackend = (frontendSort: string, propertyType: 'off-plan' | 'secondary'): { sortBy: ApiPropertyFilters['sortBy'], sortOrder: ApiPropertyFilters['sortOrder'] } => {
  const mapping: Record<string, { sortBy: ApiPropertyFilters['sortBy'], sortOrder: ApiPropertyFilters['sortOrder'] }> = {
    'price-desc': { sortBy: propertyType === 'off-plan' ? 'priceFrom' : 'price', sortOrder: 'DESC' },
    'price-asc': { sortBy: propertyType === 'off-plan' ? 'priceFrom' : 'price', sortOrder: 'ASC' },
    'size-desc': { sortBy: propertyType === 'off-plan' ? 'sizeFrom' : 'size', sortOrder: 'DESC' },
    'size-asc': { sortBy: propertyType === 'off-plan' ? 'sizeFrom' : 'size', sortOrder: 'ASC' },
    'newest': { sortBy: 'createdAt', sortOrder: 'DESC' },
  };
  return mapping[frontendSort] || mapping['newest'];
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

export default function PropertiesList() {
  const t = useTranslations('properties');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [filters, setFilters] = useState<Filters>({
    type: 'new',
    search: '',
    location: [],
    bedrooms: [],
    sizeFrom: '',
    sizeTo: '',
    priceFrom: '',
    priceTo: '',
    sort: 'newest',
  });

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

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Calculate pagination
  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProperties = properties.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          <div className={styles.loading}>
            <p>{t('loading') || 'Loading properties...'}</p>
          </div>
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
