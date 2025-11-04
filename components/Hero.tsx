'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import styles from './Hero.module.css';

export default function Hero() {
  const t = useTranslations('hero');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const bedroomsOptions = ['all', '1', '2', '3', '4', '5+'];

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Search:', searchQuery, 'Bedrooms:', selectedBedrooms);
  };

  const handleBedroomSelect = (value: string) => {
    setSelectedBedrooms(value);
    setIsDropdownOpen(false);
  };

  const getBedroomLabel = (value: string) => {
    if (value === 'all') return t('search.bedroomsAll');
    return `${value} ${t('search.bedrooms')}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
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
          <div className={styles.searchInputWrapper}>
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
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.dropdownWrapper} ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={styles.bedroomsSelect}
            >
              <span>{getBedroomLabel(selectedBedrooms)}</span>
              <svg
                className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.dropdownArrowOpen : ''}`}
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
            
            {isDropdownOpen && (
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
          
          <button onClick={handleSearch} className={styles.searchButton}>
            {t('search.searchButton')}
          </button>
        </div>
      </div>
    </section>
  );
}
