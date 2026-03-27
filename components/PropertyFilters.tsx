'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getAreasSimple, getDevelopersSimple, getPropertyFinderLocations } from '@/lib/api';
import styles from './PropertyFilters.module.css';

interface Filters {
  type: 'new' | 'secondary';
  search: string;
  location: string[]; // areaId[]
  bedrooms: number[];
  sizeFrom: string;
  sizeTo: string;
  priceFrom: string;
  priceTo: string;
  sort: string;
  developerId?: string;
  cityId?: string;
}

interface PropertyFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  isModal?: boolean;
  viewMode?: 'list' | 'map';
}

interface Area {
  id: string;
  slug: string;
  nameEn: string;
  nameRu: string;
  nameAr: string;
  cityId: string;
  projectsCount?: {
    total: number;
    offPlan: number;
    secondary: number;
  };
}

interface Developer {
  id: string;
  name: string;
  logo: string | null;
}


export default function PropertyFilters({ filters, onFilterChange, isModal = false, viewMode = 'list' }: PropertyFiltersProps) {
  const t = useTranslations('filters');
  const locale = useLocale();
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  // Sync localFilters with external filters prop
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isBedroomsOpen, setIsBedroomsOpen] = useState(false);
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isDeveloperOpen, setIsDeveloperOpen] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [areaSearch, setAreaSearch] = useState('');
  const [developerSearch, setDeveloperSearch] = useState('');
  const locationRef = useRef<HTMLDivElement>(null);
  const bedroomsRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const developerRef = useRef<HTMLDivElement>(null);

  // State for dropdown direction (openUp/openDown)
  const [dropdownDirections, setDropdownDirections] = useState<Record<string, boolean>>({});

  // Load public data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        // Load simple data in parallel
        const [areasData, developersData, pfLocations] = await Promise.all([
          getAreasSimple(),
          getDevelopersSimple(),
          getPropertyFinderLocations()
        ]);

        // Map PF locations to standard Area format
        const mappedPF = (pfLocations || []).map(loc => {
          const name = typeof loc === 'string' ? loc : (loc.name || loc.label || '');
          const id = typeof loc === 'string' ? loc : (loc.id || loc.name || '');
          return { id, nameEn: name, nameRu: name, slug: id };
        });

        // Merge regular areas with PF areas, prioritizing regular ones for name uniqueness
        const combinedAreas = [...areasData];
        mappedPF.forEach(pf => {
          if (pf.nameEn && !combinedAreas.some(a => a.nameEn?.toLowerCase() === pf.nameEn.toLowerCase())) {
            combinedAreas.push(pf as any);
          }
        });

        // Filter areas (we can take top 30 or filter by Dubai if we know the ID)
        // Since we don't have projectsCount in 'simple' version, we just show alphabetical or provided order
        const sortedAreas = combinedAreas
          .sort((a, b) => {
            const nameA = locale === 'ru' ? (a as any).nameRu || a.nameEn : a.nameEn;
            const nameB = locale === 'ru' ? (b as any).nameRu || b.nameEn : b.nameEn;
            return (nameA || '').localeCompare(nameB || '');
          });

        const sortedDevelopers = [...developersData].sort((a, b) =>
          (a.name || '').localeCompare(b.name || '')
        );

        setAreas(sortedAreas as any);
        setDevelopers(sortedDevelopers as any);
        setLoadingData(false);
      } catch (error) {
        setLoadingData(false);
      }
    };
    loadData();
  }, [locale]);

  // Функція для форматування числа з розділювачами тисяч
  const formatNumber = (value: string): string => {
    if (!value) return '';
    // Прибираємо всі нечислові символи окрім цифр
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    // Форматуємо з розділювачами тисяч
    return new Intl.NumberFormat('en-US').format(parseInt(numbers, 10));
  };

  // Функція для парсингу числа (прибирає коми)
  const parseNumber = (value: string): string => {
    return value.replace(/\D/g, '');
  };

  // Function to check if dropdown should open upward
  const checkDropdownDirection = (ref: React.RefObject<HTMLDivElement>, dropdownId: string) => {
    if (!ref.current) return false;

    const rect = ref.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedDropdownHeight = 320; // Approximate height of dropdown with padding

    // In modal mode, check relative to modal container or modal body
    if (isModal) {
      // Find modal container - look for modal backdrop or dialog
      let modalContainer = ref.current.closest('[role="dialog"]');
      if (!modalContainer) {
        // Try to find modal body by traversing up
        let parent = ref.current.parentElement;
        while (parent && parent !== document.body) {
          if (parent.classList && (
            parent.classList.toString().includes('modal') ||
            parent.classList.toString().includes('Modal')
          )) {
            modalContainer = parent;
            break;
          }
          parent = parent.parentElement;
        }
      }

      if (modalContainer) {
        const modalRect = modalContainer.getBoundingClientRect();
        const spaceBelowInModal = modalRect.bottom - rect.bottom;
        const spaceAboveInModal = rect.top - modalRect.top;

        // Add some padding for better UX
        const padding = 20;

        // Open upward if not enough space below in modal but enough space above
        const shouldOpenUp = (spaceBelowInModal < estimatedDropdownHeight + padding) && (spaceAboveInModal > estimatedDropdownHeight + padding);

        setDropdownDirections(prev => ({
          ...prev,
          [dropdownId]: shouldOpenUp
        }));

        return shouldOpenUp;
      }
    }

    // For non-modal or if modal container not found, use viewport
    // Open upward if not enough space below but enough space above
    const shouldOpenUp = spaceBelow < estimatedDropdownHeight && spaceAbove > estimatedDropdownHeight;

    setDropdownDirections(prev => ({
      ...prev,
      [dropdownId]: shouldOpenUp
    }));

    return shouldOpenUp;
  };

  // Handle dropdown toggle with direction check
  const handleDropdownToggle = (dropdownId: string, ref: React.RefObject<HTMLDivElement>, isOpen: boolean, setIsOpen: (value: boolean) => void) => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // Check direction after state update
    if (newIsOpen) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        checkDropdownDirection(ref, dropdownId);
      }, 0);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
      if (bedroomsRef.current && !bedroomsRef.current.contains(event.target as Node)) {
        setIsBedroomsOpen(false);
      }
      if (sizeRef.current && !sizeRef.current.contains(event.target as Node)) {
        setIsSizeOpen(false);
      }
      if (priceRef.current && !priceRef.current.contains(event.target as Node)) {
        setIsPriceOpen(false);
      }
      if (developerRef.current && !developerRef.current.contains(event.target as Node)) {
        setIsDeveloperOpen(false);
      }
    };

    if (!isLocationOpen) setAreaSearch('');
    if (!isDeveloperOpen) setDeveloperSearch('');

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLocationOpen, isDeveloperOpen]);

  const handleChange = (field: keyof Filters, value: any) => {
    const newFilters = { ...localFilters, [field]: value };
    if (field === 'type' && value === 'secondary') {
      newFilters.developerId = undefined;
    }
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleLocationToggle = (areaId: string) => {
    const newLocations = localFilters.location.includes(areaId)
      ? localFilters.location.filter((l) => l !== areaId)
      : [...localFilters.location, areaId];
    handleChange('location', newLocations);
  };

  const handleDeveloperToggle = (developerId: string) => {
    handleChange('developerId', localFilters.developerId === developerId ? undefined : developerId);
  };

  const filteredAreas = areas.filter(area => {
    if (!areaSearch) return true;
    const search = areaSearch.toLowerCase();
    return (area.nameEn?.toLowerCase().includes(search) || area.nameRu?.toLowerCase().includes(search));
  });

  const filteredDevelopers = developers.filter(dev => {
    if (!developerSearch) return true;
    const search = developerSearch.toLowerCase();
    return dev.name?.toLowerCase().includes(search);
  });

  const handleBedroomToggle = (bedrooms: number) => {
    const newBedrooms = localFilters.bedrooms.includes(bedrooms)
      ? localFilters.bedrooms.filter((b) => b !== bedrooms)
      : [...localFilters.bedrooms, bedrooms];
    handleChange('bedrooms', newBedrooms);
  };

  const getLocationLabel = () => {
    if (localFilters.location.length === 0) return t('location.placeholder');
    if (localFilters.location.length === 1) {
      const locId = localFilters.location[0];
      const area = areas.find((a) => a.id === locId || a.slug === locId);
      return locale === 'ru' ? area?.nameRu || area?.nameEn : area?.nameEn || '';
    }
    return `${localFilters.location.length} ${t('location.selected')}`;
  };

  const getDeveloperLabel = () => {
    if (!localFilters.developerId) return t('developer.placeholder') || 'Developer';
    const developer = developers.find((d) => d.id === localFilters.developerId);
    return developer?.name || '';
  };

  const getBedroomsLabel = () => {
    if (localFilters.bedrooms.length === 0) return t('bedrooms.placeholder');
    if (localFilters.bedrooms.length === 1) {
      return `${localFilters.bedrooms[0]} ${t('bedrooms.bedroom')}`;
    }
    return `${localFilters.bedrooms.length} ${t('bedrooms.selected')}`;
  };

  const getSizeLabel = () => {
    if (!localFilters.sizeFrom && !localFilters.sizeTo) return t('size.placeholder');
    const from = localFilters.sizeFrom ? formatNumber(localFilters.sizeFrom) : '0';
    const to = localFilters.sizeTo ? formatNumber(localFilters.sizeTo) : '∞';
    const unit = locale === 'ru' ? 'м²' : 'sq.ft';
    return (
      <>
        {from} - {to} <span className={styles.unitInLabel}>{unit}</span>
      </>
    );
  };

  const getPriceLabel = () => {
    if (!localFilters.priceFrom && !localFilters.priceTo) return t('price.placeholder');
    const from = localFilters.priceFrom ? formatNumber(localFilters.priceFrom) : '0';
    const to = localFilters.priceTo ? formatNumber(localFilters.priceTo) : '∞';
    return (
      <>
        {from} - {to} <span className={styles.unitInLabel}>AED</span>
      </>
    );
  };

  const handleNumberChange = (field: 'sizeFrom' | 'sizeTo' | 'priceFrom' | 'priceTo', value: string) => {
    const parsed = parseNumber(value);
    handleChange(field, parsed);
  };


  return (
    <div className={`${styles.filters} ${isModal ? styles.filtersModal : ''} ${viewMode === 'map' ? styles.withMap : ''}`}>
      <div className={`${styles.filtersRow} ${isModal ? styles.filtersRowModal : ''} ${viewMode === 'map' ? styles.withMap : ''}`}>
        {/* Off Plan / Secondary Toggle */}
        {viewMode !== 'map' && (
          <div className={styles.typeToggle}>
            <button
              className={`${styles.typeButton} ${localFilters.type === 'new' ? styles.active : ''}`}
              onClick={() => handleChange('type', 'new')}
            >
              {t('type.offPlan')}
            </button>
            <button
              className={`${styles.typeButton} ${localFilters.type === 'secondary' ? styles.active : ''}`}
              onClick={() => handleChange('type', 'secondary')}
            >
              {t('type.secondary')}
            </button>
          </div>
        )}

        {/* Search */}
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder={t('search.placeholder')}
            value={localFilters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Location Dropdown */}
        <div
          className={`${styles.dropdownWrapper} ${styles.locationDropdown} ${isModal ? styles.dropdownWrapperModal : ''}`}
          ref={locationRef}
          data-dropdown-open={isLocationOpen ? 'true' : 'false'}
        >
          <button
            className={styles.dropdownButton}
            onClick={() => handleDropdownToggle('location', locationRef, isLocationOpen, setIsLocationOpen)}
            title="To be made soon"
          >
            <span>{getLocationLabel()}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isLocationOpen ? styles.rotated : ''}>
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {isLocationOpen && (
            <div className={`${styles.dropdownMenu} ${dropdownDirections.location ? styles.dropdownMenuUp : styles.dropdownMenuDown} ${isModal ? styles.dropdownMenuModal : ''}`}>
              <div className={styles.stickySearch}>
                <input
                  type="text"
                  placeholder={locale === 'ru' ? 'Поиск района...' : 'Search location...'}
                  value={areaSearch}
                  onChange={(e) => setAreaSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className={styles.dropdownSearchInput}
                />
              </div>
              {loadingData ? (
                <div className={styles.dropdownItem}>Loading...</div>
              ) : filteredAreas.length === 0 ? (
                <div className={styles.dropdownItem}>No areas found</div>
              ) : (
                filteredAreas.map((area) => (
                  <div
                    key={area.id}
                    className={styles.dropdownItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Support both ID and slug for selection logic
                      const locId = area.slug || area.id;
                      handleLocationToggle(locId);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={localFilters.location.includes(area.id) || localFilters.location.includes(area.slug)}
                      onChange={() => { }}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxLabel}>
                      {locale === 'ru' ? area.nameRu : area.nameEn}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Developer Dropdown */}
        {localFilters.type === 'new' && (
          <div
            className={`${styles.dropdownWrapper} ${styles.locationDropdown} ${isModal ? styles.dropdownWrapperModal : ''}`}
            ref={developerRef}
            data-dropdown-open={isDeveloperOpen ? 'true' : 'false'}
          >
            <button
              className={styles.dropdownButton}
              onClick={() => handleDropdownToggle('developer', developerRef, isDeveloperOpen, setIsDeveloperOpen)}
            >
              <span>{getDeveloperLabel()}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isDeveloperOpen ? styles.rotated : ''}>
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isDeveloperOpen && (
              <div className={`${styles.dropdownMenu} ${dropdownDirections.developer ? styles.dropdownMenuUp : styles.dropdownMenuDown} ${isModal ? styles.dropdownMenuModal : ''}`}>
                <div className={styles.stickySearch}>
                  <input
                    type="text"
                    placeholder={locale === 'ru' ? 'Поиск девелопера...' : 'Search developer...'}
                    value={developerSearch}
                    onChange={(e) => setDeveloperSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={styles.dropdownSearchInput}
                  />
                </div>
                {loadingData ? (
                  <div className={styles.dropdownItem}>Loading...</div>
                ) : filteredDevelopers.length === 0 ? (
                  <div className={styles.dropdownItem}>No developers found</div>
                ) : (
                  <>
                    <button
                      className={`${styles.dropdownItem} ${!localFilters.developerId ? styles.active : ''}`}
                      onClick={() => {
                        handleDeveloperToggle('');
                        setIsDeveloperOpen(false);
                      }}
                    >
                      {t('developer.all') || 'All Developers'}
                    </button>
                    {filteredDevelopers.map((developer) => (
                      <button
                        key={developer.id}
                        className={`${styles.dropdownItem} ${localFilters.developerId === developer.id ? styles.active : ''}`}
                        onClick={() => {
                          handleDeveloperToggle(developer.id);
                          setIsDeveloperOpen(false);
                        }}
                      >
                        {developer.name}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bedrooms Dropdown */}
        <div
          className={`${styles.dropdownWrapper} ${styles.bedroomsDropdown} ${isModal ? styles.dropdownWrapperModal : ''}`}
          ref={bedroomsRef}
          data-dropdown-open={isBedroomsOpen ? 'true' : 'false'}
        >
          <button
            className={styles.dropdownButton}
            onClick={() => handleDropdownToggle('bedrooms', bedroomsRef, isBedroomsOpen, setIsBedroomsOpen)}
          >
            <span>{getBedroomsLabel()}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isBedroomsOpen ? styles.rotated : ''}>
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {isBedroomsOpen && (
            <div className={`${styles.dropdownMenu} ${dropdownDirections.bedrooms ? styles.dropdownMenuUp : styles.dropdownMenuDown} ${isModal ? styles.dropdownMenuModal : ''}`}>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <label key={num} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={localFilters.bedrooms.includes(num)}
                    onChange={() => handleBedroomToggle(num)}
                  />
                  <span>{num === 6 ? '6+' : num}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Size Dropdown */}
        <div
          className={`${styles.dropdownWrapper} ${styles.sizeDropdown} ${isModal ? styles.dropdownWrapperModal : ''}`}
          ref={sizeRef}
          data-dropdown-open={isSizeOpen ? 'true' : 'false'}
        >
          <button
            className={styles.dropdownButton}
            onClick={() => handleDropdownToggle('size', sizeRef, isSizeOpen, setIsSizeOpen)}
          >
            <span>{getSizeLabel()}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isSizeOpen ? styles.rotated : ''}>
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {isSizeOpen && (
            <div className={`${styles.dropdownMenu} ${dropdownDirections.size ? styles.dropdownMenuUp : styles.dropdownMenuDown} ${isModal ? styles.dropdownMenuModal : ''}`}>
              <div className={styles.rangeInputs}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={t('size.from')}
                  value={localFilters.sizeFrom ? formatNumber(localFilters.sizeFrom) : ''}
                  onChange={(e) => handleNumberChange('sizeFrom', e.target.value)}
                  className={styles.rangeInput}
                />
                <span className={styles.rangeSeparator}>-</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={t('size.to')}
                  value={localFilters.sizeTo ? formatNumber(localFilters.sizeTo) : ''}
                  onChange={(e) => handleNumberChange('sizeTo', e.target.value)}
                  className={styles.rangeInput}
                />
                <span className={styles.rangeUnit}>{locale === 'ru' ? 'м²' : 'sq.ft'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Price Dropdown */}
        <div
          className={`${styles.dropdownWrapper} ${styles.priceDropdown} ${isModal ? styles.dropdownWrapperModal : ''}`}
          ref={priceRef}
          data-dropdown-open={isPriceOpen ? 'true' : 'false'}
        >
          <button
            className={styles.dropdownButton}
            onClick={() => handleDropdownToggle('price', priceRef, isPriceOpen, setIsPriceOpen)}
          >
            <span>{getPriceLabel()}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isPriceOpen ? styles.rotated : ''}>
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {isPriceOpen && (
            <div className={`${styles.dropdownMenu} ${dropdownDirections.price ? styles.dropdownMenuUp : styles.dropdownMenuDown} ${isModal ? styles.dropdownMenuModal : ''}`}>
              <div className={styles.rangeInputs}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={t('price.from')}
                  value={localFilters.priceFrom ? formatNumber(localFilters.priceFrom) : ''}
                  onChange={(e) => handleNumberChange('priceFrom', e.target.value)}
                  className={styles.rangeInput}
                />
                <span className={styles.rangeSeparator}>-</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={t('price.to')}
                  value={localFilters.priceTo ? formatNumber(localFilters.priceTo) : ''}
                  onChange={(e) => handleNumberChange('priceTo', e.target.value)}
                  className={styles.rangeInput}
                />
                <span className={styles.rangeUnit}>AED</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
