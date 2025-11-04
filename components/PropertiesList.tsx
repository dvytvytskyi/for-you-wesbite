'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import styles from './PropertiesList.module.css';
import PropertyCard from './PropertyCard';
import PropertyFilters from './PropertyFilters';

interface Property {
  id: string;
  name: string;
  nameRu: string;
  location: {
    area: string;
    areaRu: string;
    city: string;
    cityRu: string;
  };
  price: {
    usd: number;
    aed: number;
    eur: number;
  };
  developer: {
    name: string;
    nameRu: string;
  };
  bedrooms: number;
  bathrooms: number;
  size: {
    sqm: number;
    sqft: number;
  };
  images: string[];
  type: 'new' | 'secondary';
}

// Mock data - замінити на реальні дані з API
const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Luxury Apartment in Downtown',
    nameRu: 'Роскошная квартира в Даунтауне',
    location: {
      area: 'Downtown Dubai',
      areaRu: 'Даунтаун Дубай',
      city: 'Dubai',
      cityRu: 'Дубай',
    },
    price: {
      usd: 500000,
      aed: 1836500,
      eur: 460000,
    },
    developer: {
      name: 'Emaar',
      nameRu: 'Эмаар',
    },
    bedrooms: 2,
    bathrooms: 2,
    size: {
      sqm: 120,
      sqft: 1292,
    },
    images: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop',
    ],
    type: 'new',
  },
  {
    id: '2',
    name: 'Modern Villa in Palm Jumeirah',
    nameRu: 'Современная вилла на Пальм Джумейра',
    location: {
      area: 'Palm Jumeirah',
      areaRu: 'Пальм Джумейра',
      city: 'Dubai',
      cityRu: 'Дубай',
    },
    price: {
      usd: 1200000,
      aed: 4407600,
      eur: 1104000,
    },
    developer: {
      name: 'Damac',
      nameRu: 'Дамак',
    },
    bedrooms: 4,
    bathrooms: 3,
    size: {
      sqm: 250,
      sqft: 2691,
    },
    images: [
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop',
    ],
    type: 'secondary',
  },
];

export default function PropertiesList() {
  const t = useTranslations('properties');
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(true); // Починаємо з true для швидшого відображення
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [filters, setFilters] = useState({
    type: 'new' as 'new' | 'secondary',
    search: '',
    location: [] as string[],
    bedrooms: [] as number[],
    sizeFrom: '',
    sizeTo: '',
    priceFrom: '',
    priceTo: '',
    sort: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 36;

  useEffect(() => {
    // Перевіряємо чи елемент вже видимий при монтуванні
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isInViewport) {
        setIsVisible(true);
        return;
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    // TODO: Apply filters to API call
  };

  const filteredProperties = properties.filter((property) => {
    if (filters.type && property.type !== filters.type) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      // TODO: Implement search logic
    }
    if (filters.bedrooms.length > 0 && !filters.bedrooms.includes(property.bedrooms)) {
      return false;
    }
    // TODO: Add size and price filters
    return true;
  });

  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  return (
    <section className={styles.propertiesList} ref={sectionRef}>
      <div className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
        <PropertyFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <div className={styles.results}>
          <p className={styles.resultsCount}>
            {t('resultsCount', { count: filteredProperties.length })}
          </p>
          
          <div className={styles.grid}>
            {paginatedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              {/* TODO: Add Pagination component */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                {t('pagination.previous')}
              </button>
              <span className={styles.paginationInfo}>
                {t('pagination.page', { current: currentPage, total: totalPages })}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                {t('pagination.next')}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

