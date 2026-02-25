'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getAreasSimple, getDevelopersSimple } from '@/lib/api';
import styles from './FilterModal.module.css';

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

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onApply: (filters: Filters) => void;
  onReset: () => void;
}

interface Area {
  id: string;
  nameEn: string;
  nameRu: string;
}

interface Developer {
  id: string;
  name: string;
}

export default function FilterModal({ isOpen, onClose, filters, onApply, onReset }: FilterModalProps) {
  const t = useTranslations('filters');
  const locale = useLocale();
  const [tempFilters, setTempFilters] = useState<Filters>(filters);
  const [areas, setAreas] = useState<Area[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isDeveloperOpen, setIsDeveloperOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTempFilters(filters);
      loadSelectionData();
    }
  }, [isOpen, filters]);

  const loadSelectionData = async () => {
    try {
      setLoadingData(true);
      const [areasData, developersData] = await Promise.all([
        getAreasSimple(),
        getDevelopersSimple()
      ]);
      setAreas(areasData);
      setDevelopers(developersData.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (e) {
      console.error('Failed to load filter data', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleApply = () => {
    onApply(tempFilters);
    onClose();
  };

  const handleReset = () => {
    onReset();
    // onClose is handled by reset in parent usually, or we can stay open
  };

  const updateFilter = (field: keyof Filters, value: any) => {
    setTempFilters(prev => ({ ...prev, [field]: value }));
  };

  const toggleBedroom = (num: number) => {
    const current = tempFilters.bedrooms;
    const next = current.includes(num)
      ? current.filter(b => b !== num)
      : [...current, num];
    updateFilter('bedrooms', next);
  };

  const formatWithCommas = (val: string) => {
    const raw = val.replace(/\D/g, '');
    if (!raw) return '';
    return new Intl.NumberFormat('en-US').format(parseInt(raw, 10));
  };

  const handleNumInput = (field: 'sizeFrom' | 'sizeTo' | 'priceFrom' | 'priceTo', val: string) => {
    updateFilter(field, val.replace(/\D/g, ''));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.fullscreenOverlay}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('title') || 'Filters'}</h2>
        <button className={styles.closeBtn} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className={styles.scrollContent}>
        {/* Type Selector */}
        <div className={styles.section}>
          <div className={styles.typeSelector}>
            <button
              className={`${styles.typeBtn} ${tempFilters.type === 'new' ? styles.active : ''}`}
              onClick={() => updateFilter('type', 'new')}
            >
              {t('type.offPlan')}
            </button>
            <button
              className={`${styles.typeBtn} ${tempFilters.type === 'secondary' ? styles.active : ''}`}
              onClick={() => updateFilter('type', 'secondary')}
            >
              {t('type.secondary')}
            </button>
          </div>
        </div>

        {/* Location Select */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('location.placeholder') || 'Location'}</h3>
          <div className={styles.fakeSelect} onClick={() => setIsLocationOpen(!isLocationOpen)}>
            <span>{tempFilters.location.length > 0 ? `${tempFilters.location.length} selected` : (locale === 'ru' ? 'Выберите из списка' : 'Select multiple from list')}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${styles.arrow} ${isLocationOpen ? styles.rotated : ''}`}>
              <path d="M6 9L12 15L18 9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {isLocationOpen && (
            <div className={styles.dropList}>
              {areas.map(area => (
                <label key={area.id} className={styles.checkItem}>
                  <input
                    type="checkbox"
                    checked={tempFilters.location.includes(area.id)}
                    onChange={() => {
                      const locs = tempFilters.location;
                      updateFilter('location', locs.includes(area.id) ? locs.filter(id => id !== area.id) : [...locs, area.id]);
                    }}
                  />
                  <span>{locale === 'ru' ? area.nameRu : area.nameEn}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Developer Select */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('developer.placeholder') || 'Developer'}</h3>
          <div className={styles.fakeSelect} onClick={() => setIsDeveloperOpen(!isDeveloperOpen)}>
            <span>{tempFilters.developerId ? developers.find(d => d.id === tempFilters.developerId)?.name : (locale === 'ru' ? 'Выберите из списка' : 'Select from list')}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${styles.arrow} ${isDeveloperOpen ? styles.rotated : ''}`}>
              <path d="M6 9L12 15L18 9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {isDeveloperOpen && (
            <div className={styles.dropList}>
              <div className={styles.dropItem} onClick={() => { updateFilter('developerId', undefined); setIsDeveloperOpen(false); }}>All Developers</div>
              {developers.map(dev => (
                <div
                  key={dev.id}
                  className={`${styles.dropItem} ${tempFilters.developerId === dev.id ? styles.dropActive : ''}`}
                  onClick={() => { updateFilter('developerId', dev.id); setIsDeveloperOpen(false); }}
                >
                  {dev.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bedrooms */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('bedrooms.placeholder')}</h3>
          <div className={styles.btnScroll}>
            {[0, 1, 2, 3, 4, 5, 6].map(num => (
              <button
                key={num}
                className={`${styles.pillBtn} ${tempFilters.bedrooms.includes(num) ? styles.pillActive : ''}`}
                onClick={() => toggleBedroom(num)}
              >
                {num === 0 ? 'Studio' : num === 6 ? '6+' : num}
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('size.placeholder')}</h3>
          <div className={styles.inputPair}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                inputMode="numeric"
                placeholder={t('size.from')}
                value={formatWithCommas(tempFilters.sizeFrom)}
                onChange={(e) => handleNumInput('sizeFrom', e.target.value)}
              />
              <span className={styles.inputUnit}>sq.ft</span>
            </div>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                inputMode="numeric"
                placeholder={t('size.to')}
                value={formatWithCommas(tempFilters.sizeTo)}
                onChange={(e) => handleNumInput('sizeTo', e.target.value)}
              />
              <span className={styles.inputUnit}>sq.ft</span>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('price.placeholder')}</h3>
          <div className={styles.inputPair}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                inputMode="numeric"
                placeholder={t('price.from')}
                value={formatWithCommas(tempFilters.priceFrom)}
                onChange={(e) => handleNumInput('priceFrom', e.target.value)}
              />
              <span className={styles.inputUnit}>AED</span>
            </div>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                inputMode="numeric"
                placeholder={t('price.to')}
                value={formatWithCommas(tempFilters.priceTo)}
                onChange={(e) => handleNumInput('priceTo', e.target.value)}
              />
              <span className={styles.inputUnit}>AED</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.applyBtn} onClick={handleApply}>
          Show results
        </button>
        <button className={styles.resetIconBtn} onClick={handleReset} aria-label="Reset">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
