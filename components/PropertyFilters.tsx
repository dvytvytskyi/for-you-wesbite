'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getPublicData } from '@/lib/api';
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
}

interface Area {
  id: string;
  nameEn: string;
  nameRu: string;
  nameAr: string;
  cityId: string;
}

interface Developer {
  id: string;
  name: string;
  logo: string | null;
}

const sortOptions = [
  { value: 'price-desc', label: 'Price Higher', labelRu: 'Цена выше' },
  { value: 'price-asc', label: 'Price Lower', labelRu: 'Цена ниже' },
  { value: 'size-desc', label: 'Size Higher', labelRu: 'Площадь больше' },
  { value: 'size-asc', label: 'Size Lower', labelRu: 'Площадь меньше' },
  { value: 'newest', label: 'Newest First', labelRu: 'Сначала новые' },
];

export default function PropertyFilters({ filters, onFilterChange }: PropertyFiltersProps) {
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
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isDeveloperOpen, setIsDeveloperOpen] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const locationRef = useRef<HTMLDivElement>(null);
  const bedroomsRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const developerRef = useRef<HTMLDivElement>(null);

  // Load public data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getPublicData();
        setAreas(data.areas);
        setDevelopers(data.developers);
        setLoadingData(false);
      } catch (error) {
        console.error('Error loading public data:', error);
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

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
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (developerRef.current && !developerRef.current.contains(event.target as Node)) {
        setIsDeveloperOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (field: keyof Filters, value: any) => {
    const newFilters = { ...localFilters, [field]: value };
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

  const handleBedroomToggle = (bedrooms: number) => {
    const newBedrooms = localFilters.bedrooms.includes(bedrooms)
      ? localFilters.bedrooms.filter((b) => b !== bedrooms)
      : [...localFilters.bedrooms, bedrooms];
    handleChange('bedrooms', newBedrooms);
  };

  const getLocationLabel = () => {
    if (localFilters.location.length === 0) return t('location.placeholder');
    if (localFilters.location.length === 1) {
      const area = areas.find((a) => a.id === localFilters.location[0]);
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

  const getSortLabel = () => {
    const option = sortOptions.find((opt) => opt.value === localFilters.sort);
    if (!option) return t('sort.placeholder');
    return locale === 'ru' ? option.labelRu : option.label;
  };

  return (
    <div className={styles.filters}>
      <div className={styles.filtersRow}>
        {/* Off Plan / Secondary Toggle */}
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
        <div className={`${styles.dropdownWrapper} ${styles.locationDropdown}`} ref={locationRef}>
          <button
            className={styles.dropdownButton}
            onClick={() => setIsLocationOpen(!isLocationOpen)}
            disabled={loadingData}
          >
            <span>{getLocationLabel()}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isLocationOpen ? styles.rotated : ''}>
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isLocationOpen && !loadingData && (
            <div className={styles.dropdownMenu}>
              {areas.map((area) => (
                  <label key={area.id} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={localFilters.location.includes(area.id)}
                      onChange={() => handleLocationToggle(area.id)}
                    />
                    <span>{locale === 'ru' ? area.nameRu : area.nameEn}</span>
                  </label>
                ))}
            </div>
          )}
        </div>

        {/* Developer Dropdown */}
        <div className={`${styles.dropdownWrapper} ${styles.locationDropdown}`} ref={developerRef}>
          <button
            className={styles.dropdownButton}
            onClick={() => setIsDeveloperOpen(!isDeveloperOpen)}
            disabled={loadingData}
          >
            <span>{getDeveloperLabel()}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isDeveloperOpen ? styles.rotated : ''}>
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isDeveloperOpen && !loadingData && (
            <div className={styles.dropdownMenu}>
              <button
                className={`${styles.dropdownItem} ${!localFilters.developerId ? styles.active : ''}`}
                onClick={() => {
                  handleDeveloperToggle('');
                  setIsDeveloperOpen(false);
                }}
              >
                {t('developer.all') || 'All Developers'}
              </button>
              {developers.map((developer) => (
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
            </div>
          )}
        </div>

        {/* Bedrooms Dropdown */}
        <div className={`${styles.dropdownWrapper} ${styles.bedroomsDropdown}`} ref={bedroomsRef}>
          <button
            className={styles.dropdownButton}
            onClick={() => setIsBedroomsOpen(!isBedroomsOpen)}
          >
            <span>{getBedroomsLabel()}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isBedroomsOpen ? styles.rotated : ''}>
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isBedroomsOpen && (
            <div className={styles.dropdownMenu}>
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
        <div className={`${styles.dropdownWrapper} ${styles.sizeDropdown}`} ref={sizeRef}>
          <button
            className={styles.dropdownButton}
            onClick={() => setIsSizeOpen(!isSizeOpen)}
          >
            <span>{getSizeLabel()}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isSizeOpen ? styles.rotated : ''}>
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isSizeOpen && (
            <div className={styles.dropdownMenu}>
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
        <div className={`${styles.dropdownWrapper} ${styles.priceDropdown}`} ref={priceRef}>
          <button
            className={styles.dropdownButton}
            onClick={() => setIsPriceOpen(!isPriceOpen)}
          >
            <span>{getPriceLabel()}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isPriceOpen ? styles.rotated : ''}>
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isPriceOpen && (
            <div className={styles.dropdownMenu}>
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

        {/* Sort Dropdown */}
        <div className={`${styles.dropdownWrapper} ${styles.sortDropdown}`} ref={sortRef}>
          <button
            className={styles.dropdownButton}
            onClick={() => setIsSortOpen(!isSortOpen)}
          >
            <span>{getSortLabel()}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isSortOpen ? styles.rotated : ''}>
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isSortOpen && (
            <div className={styles.dropdownMenu}>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  className={`${styles.dropdownItem} ${localFilters.sort === option.value ? styles.active : ''}`}
                  onClick={() => {
                    handleChange('sort', option.value);
                    setIsSortOpen(false);
                  }}
                >
                  {locale === 'ru' ? option.labelRu : option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
