'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { getPublicData } from '@/lib/api';
import styles from './Hero.module.css';

interface Area {
  id: string;
  nameEn: string;
  nameRu: string;
  nameAr: string;
  cityId: string;
}

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const router = useRouter();
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>('all');
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [isBedroomsDropdownOpen, setIsBedroomsDropdownOpen] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const areaDropdownRef = useRef<HTMLDivElement>(null);
  const bedroomsDropdownRef = useRef<HTMLDivElement>(null);

  const bedroomsOptions = ['all', '1', '2', '3', '4', '5+'];

  // Load areas from API
  useEffect(() => {
    const loadAreas = async () => {
      try {
        const publicData = await getPublicData();
        if (publicData.areas && Array.isArray(publicData.areas)) {
          setAreas(publicData.areas);
        }
      } catch (error) {
        console.error('Error loading areas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAreas();
  }, []);

  const handleSearch = () => {
    if (!selectedArea) return;

    const params = new URLSearchParams();
    params.set('areaId', selectedArea.id);
    if (selectedBedrooms !== 'all') {
      params.set('bedrooms', selectedBedrooms);
    }

    const localePrefix = locale === 'en' ? '' : `/${locale}`;
    router.push(`${localePrefix}/properties?${params.toString()}`);
  };

  const handleAreaSelect = (area: Area) => {
    setSelectedArea(area);
    setIsAreaDropdownOpen(false);
  };

  const handleBedroomSelect = (value: string) => {
    setSelectedBedrooms(value);
    setIsBedroomsDropdownOpen(false);
  };

  const getAreaName = (area: Area | null) => {
    if (!area) return t('search.placeholder');
    return locale === 'ru' ? area.nameRu : area.nameEn;
  };

  const getBedroomLabel = (value: string) => {
    if (value === 'all') return t('search.bedroomsAll');
    return `${value} ${t('search.bedrooms')}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(event.target as Node)) {
        setIsAreaDropdownOpen(false);
      }
      if (bedroomsDropdownRef.current && !bedroomsDropdownRef.current.contains(event.target as Node)) {
        setIsBedroomsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.videoContainer}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className={styles.video}
        >
          <source src="/dubai-hero-video.mp4" type="video/mp4" />
        </video>
        <div className={styles.gradientTop}></div>
        <div className={styles.overlay}></div>
        <div className={styles.gradientBottom}></div>
      </div>
      
      <div className={styles.content}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.subtitle}>{t('subtitle')}</p>
        
        <div className={styles.searchBlock}>
          <div className={styles.searchInputWrapper} ref={areaDropdownRef}>
            <svg
              className={styles.searchIcon}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 19L14.65 14.65"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <button
              type="button"
              onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
              className={styles.areaSelect}
            >
              <span className={selectedArea ? '' : styles.placeholder}>
                {getAreaName(selectedArea)}
              </span>
              <svg
                className={`${styles.dropdownArrow} ${isAreaDropdownOpen ? styles.dropdownArrowOpen : ''}`}
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            
            {isAreaDropdownOpen && (
              <div className={styles.dropdownMenu}>
                {loading ? (
                  <div className={styles.dropdownItem}>Loading...</div>
                ) : areas.length === 0 ? (
                  <div className={styles.dropdownItem}>No areas available</div>
                ) : (
                  areas.map((area) => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => handleAreaSelect(area)}
                      className={`${styles.dropdownItem} ${selectedArea?.id === area.id ? styles.dropdownItemActive : ''}`}
                    >
                      {locale === 'ru' ? area.nameRu : area.nameEn}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          
          <div className={styles.dropdownWrapper} ref={bedroomsDropdownRef}>
            <button
              type="button"
              onClick={() => setIsBedroomsDropdownOpen(!isBedroomsDropdownOpen)}
              className={styles.bedroomsSelect}
            >
              <span>{getBedroomLabel(selectedBedrooms)}</span>
              <svg
                className={`${styles.dropdownArrow} ${isBedroomsDropdownOpen ? styles.dropdownArrowOpen : ''}`}
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            
            {isBedroomsDropdownOpen && (
              <div className={styles.dropdownMenu}>
                {bedroomsOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleBedroomSelect(option)}
                    className={`${styles.dropdownItem} ${selectedBedrooms === option ? styles.dropdownItemActive : ''}`}
                  >
                    {getBedroomLabel(option)}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleSearch} 
            className={styles.searchButton}
            disabled={!selectedArea}
          >
            {t('search.searchButton')}
          </button>
        </div>
      </div>
    </section>
  );
}
