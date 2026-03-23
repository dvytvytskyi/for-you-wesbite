'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getPropertyFinderProjects, PropertyFinderProject, PropertyFinderFilters } from '@/lib/api';
import PropertyFinderCard from './PropertyFinderCard';
import styles from './PropertyFinderList.module.css';

interface Props {
  anonymous?: boolean;
  initialData?: {
    projects: PropertyFinderProject[];
    total: number;
  };
}

import PropertyFinderFiltersBar, { Filters } from './PropertyFinderFiltersBar';
import FilterModal from './FilterModal';

const sortOptions = [
  { value: 'price-desc', label: 'Price Higher', labelRu: 'Цена выше' },
  { value: 'price-asc', label: 'Price Lower', labelRu: 'Цена ниже' },
  { value: 'newest', label: 'Newest First', labelRu: 'Сначала новые' },
];

const urlParamsToFilters = (searchParams: URLSearchParams): Filters => {
  return {
    type: (searchParams.get('status') === 'secondary' ? 'secondary' : 'new') as 'new' | 'secondary',
    search: searchParams.get('search') || '',
    location: searchParams.get('location')?.split(',').filter(Boolean) || [],
    bedrooms: searchParams.get('bedrooms')?.split(',').map(Number).filter(n => !isNaN(n)) || [],
    sizeFrom: searchParams.get('sizeFrom') || '',
    sizeTo: searchParams.get('sizeTo') || '',
    priceFrom: searchParams.get('priceFrom') || '',
    priceTo: searchParams.get('priceTo') || '',
    sort: searchParams.get('sort') || 'newest',
    developerId: searchParams.get('developerId') || undefined,
  };
};

export default function PropertyFinderList({ anonymous = false, initialData }: Props) {
  const t = useTranslations('properties');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<PropertyFinderProject[]>(initialData?.projects || []);
  const [total, setTotal] = useState(initialData?.total || 0);
  const [loading, setLoading] = useState(!initialData);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [filters, setFilters] = useState<Filters>(() => urlParamsToFilters(new URLSearchParams(searchParams.toString())));
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    
    const currentParams = new URLSearchParams(window.location.search);
    
    // Map sort
    const sort = currentParams.get('sort') || 'newest';
    let sortBy = 'createdAt';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';
    
    if (sort === 'price-desc') {
      sortBy = 'price';
      sortOrder = 'DESC';
    } else if (sort === 'price-asc') {
      sortBy = 'price';
      sortOrder = 'ASC';
    }

    const apiFilters: PropertyFinderFilters = {
      status: (currentParams.get('status') === 'secondary' ? 'secondary' : 'off-plan') as any,
      search: currentParams.get('search') || undefined,
      areaId: currentParams.get('location')?.split(',')[0] || undefined, 
      priceMin: currentParams.get('priceFrom') ? parseInt(currentParams.get('priceFrom')!, 10) : undefined,
      priceMax: currentParams.get('priceTo') ? parseInt(currentParams.get('priceTo')!, 10) : undefined,
      bedrooms: currentParams.get('bedrooms') || undefined,
      developer: currentParams.get('developerId') || undefined,
      sortBy,
      sortOrder,
      page: parseInt(currentParams.get('page') || '1', 10),
      limit: 24
    };

    const result = await getPropertyFinderProjects(apiFilters);
    setProjects(result.projects);
    setTotal(result.total);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, searchParams]);

  const updateUrl = useCallback((newFilters: Filters, newPage: number) => {
    const params = new URLSearchParams();
    if (newFilters.type !== 'new') params.set('status', 'secondary');
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.location.length > 0) params.set('location', newFilters.location.join(','));
    if (newFilters.bedrooms.length > 0) params.set('bedrooms', newFilters.bedrooms.join(','));
    if (newFilters.sizeFrom) params.set('sizeFrom', newFilters.sizeFrom);
    if (newFilters.sizeTo) params.set('sizeTo', newFilters.sizeTo);
    if (newFilters.priceFrom) params.set('priceFrom', newFilters.priceFrom);
    if (newFilters.priceTo) params.set('priceTo', newFilters.priceTo);
    if (newFilters.sort !== 'newest') params.set('sort', newFilters.sort);
    if (newFilters.developerId) params.set('developerId', newFilters.developerId);
    if (newPage > 1) params.set('page', newPage.toString());

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    updateUrl(newFilters, 1);
  };

  const handleResetFilters = () => {
    const defaultFilters: Filters = {
      type: 'new', search: '', location: [], bedrooms: [], sizeFrom: '', sizeTo: '', priceFrom: '', priceTo: '', sort: 'newest', developerId: undefined, 
    };
    handleFilterChange(defaultFilters);
    setIsFilterModalOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    updateUrl(filters, newPage);
    setPage(newPage);
  };

  const activeFiltersCount = [
    filters.location.length > 0,
    filters.bedrooms.length > 0,
    filters.sizeFrom,
    filters.sizeTo,
    filters.priceFrom,
    filters.priceTo,
    filters.developerId
  ].filter(Boolean).length;

  const totalPages = Math.ceil(total / 24);

  return (
    <div className={styles.container}>
      <FilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)} 
        filters={filters} 
        onApply={handleFilterChange} 
        onReset={handleResetFilters} 
      />

      <div className={styles.filterHeader}>
        <div className={styles.mobileFilterSection}>
          <div className={styles.mobileTopRow}>
            <div className={styles.mobileToggleContainer}>
              <button 
                className={`${styles.mobileToggleBtn} ${filters.type === 'new' ? styles.mobileToggleBtnActive : ''}`}
                onClick={() => handleFilterChange({ ...filters, type: 'new' })}
              >
                {locale === 'ru' ? 'Off-Plan' : 'Off Plan'}
              </button>
              <button 
                className={`${styles.mobileToggleBtn} ${filters.type === 'secondary' ? styles.mobileToggleBtnActive : ''}`}
                onClick={() => handleFilterChange({ ...filters, type: 'secondary' })}
              >
                {locale === 'ru' ? 'Secondary' : 'Secondary'}
              </button>
            </div>
          </div>
          <div className={styles.mobileActionsRow}>
            <div className={styles.mobileSearchWrapper}>
              <input 
                type="text" 
                placeholder={locale === 'ru' ? 'Поиск' : 'Find by project'}
                value={filters.search}
                onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                className={styles.mobileSearchInput}
              />
            </div>
            <button className={styles.filterButton} onClick={() => setIsFilterModalOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {locale === 'ru' ? 'Фильтры' : 'Filters'}
              {activeFiltersCount > 0 && <span className={styles.filterBadge}>{activeFiltersCount}</span>}
            </button>
          </div>
        </div>

        <div className={styles.newFiltersSection}>
          <PropertyFinderFiltersBar filters={filters} onFilterChange={handleFilterChange} />
        </div>

        <div className={styles.titleSection}>
          <div className={styles.titleRow}>
            <div className={styles.titleGroup}>
              <h2 className={styles.listTitle}>
                {filters.type === 'new' 
                  ? (locale === 'ru' ? 'Новостройки в ОАЭ' : 'New buildings in UAE')
                  : (locale === 'ru' ? 'Вторичная недвижимость в ОАЭ' : 'Completed properties in UAE')
                }
              </h2>
              <div className={styles.listCount}>
                {total.toLocaleString()} {locale === 'ru' ? 'объектов' : 'properties'}
              </div>
            </div>

            <div className={styles.sortContainer}>
              <span className={styles.sortLabel}>{locale === 'en' ? 'Sort:' : 'Сортировка:'}</span>
              <div className={styles.sortDropdownWrapper}>
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
                    style={{ transform: isSortOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
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
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <>
          <div className={styles.grid}>
            {projects.map((project) => (
              <PropertyFinderCard key={project.id} project={project} anonymous={anonymous} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className={styles.pageBtn}
              >
                Prev
              </button>
              <div className={styles.pageNumbers}>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                   const pageNum = i + 1;
                   return (
                     <button
                       key={pageNum}
                       onClick={() => handlePageChange(pageNum)}
                       className={`${styles.pageNum} ${page === pageNum ? styles.pageActive : ''}`}
                     >
                       {pageNum}
                     </button>
                   );
                })}
                {totalPages > 5 && <span className={styles.dots}>...</span>}
              </div>
              <button 
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={styles.pageBtn}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          <h3>{locale === 'ru' ? 'Нет проектов' : 'No projects found'}</h3>
          <p>{locale === 'ru' ? 'Попробуйте изменить параметры поиска' : 'Try changing your search parameters'}</p>
        </div>
      )}
    </div>
  );
}
