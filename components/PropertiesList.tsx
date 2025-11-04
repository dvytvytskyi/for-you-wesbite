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
  {
    id: '3',
    name: 'Elegant Penthouse in Business Bay',
    nameRu: 'Элегантный пентхаус в Бизнес Бей',
    location: {
      area: 'Business Bay',
      areaRu: 'Бізнес Бей',
      city: 'Dubai',
      cityRu: 'Дубай',
    },
    price: {
      usd: 850000,
      aed: 3122050,
      eur: 782000,
    },
    developer: {
      name: 'Emaar',
      nameRu: 'Эмаар',
    },
    bedrooms: 3,
    bathrooms: 2,
    size: {
      sqm: 180,
      sqft: 1938,
    },
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    ],
    type: 'new',
  },
  {
    id: '4',
    name: 'Beachfront Apartment in Dubai Marina',
    nameRu: 'Апартаменты на берегу в Дубай Марина',
    location: {
      area: 'Dubai Marina',
      areaRu: 'Дубай Марина',
      city: 'Dubai',
      cityRu: 'Дубай',
    },
    price: {
      usd: 650000,
      aed: 2387450,
      eur: 598000,
    },
    developer: {
      name: 'Damac',
      nameRu: 'Дамак',
    },
    bedrooms: 2,
    bathrooms: 2,
    size: {
      sqm: 140,
      sqft: 1507,
    },
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
    ],
    type: 'secondary',
  },
  {
    id: '5',
    name: 'Spacious Family Home in Dubai Hills',
    nameRu: 'Просторный семейный дом в Дубай Хиллз',
    location: {
      area: 'Dubai Hills',
      areaRu: 'Дубай Хіллз',
      city: 'Dubai',
      cityRu: 'Дубай',
    },
    price: {
      usd: 950000,
      aed: 3489350,
      eur: 874000,
    },
    developer: {
      name: 'Emaar',
      nameRu: 'Эмаар',
    },
    bedrooms: 5,
    bathrooms: 4,
    size: {
      sqm: 320,
      sqft: 3444,
    },
    images: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=800&h=600&fit=crop',
    ],
    type: 'new',
  },
  {
    id: '6',
    name: 'Luxury Studio in JBR',
    nameRu: 'Роскошная студия в JBR',
    location: {
      area: 'JBR',
      areaRu: 'JBR',
      city: 'Dubai',
      cityRu: 'Дубай',
    },
    price: {
      usd: 350000,
      aed: 1285550,
      eur: 322000,
    },
    developer: {
      name: 'Damac',
      nameRu: 'Дамак',
    },
    bedrooms: 1,
    bathrooms: 1,
    size: {
      sqm: 65,
      sqft: 700,
    },
    images: [
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop',
    ],
    type: 'secondary',
  },
  {
    id: '7',
    name: 'Premium Apartment in Downtown',
    nameRu: 'Премиум квартира в Даунтауне',
    location: {
      area: 'Downtown Dubai',
      areaRu: 'Даунтаун Дубай',
      city: 'Dubai',
      cityRu: 'Дубай',
    },
    price: {
      usd: 720000,
      aed: 2644560,
      eur: 662400,
    },
    developer: {
      name: 'Emaar',
      nameRu: 'Эмаар',
    },
    bedrooms: 3,
    bathrooms: 3,
    size: {
      sqm: 200,
      sqft: 2153,
    },
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop',
    ],
    type: 'new',
  },
  {
    id: '8',
    name: 'Modern Townhouse in Business Bay',
    nameRu: 'Современный таунхаус в Бизнес Бей',
    location: {
      area: 'Business Bay',
      areaRu: 'Бізнес Бей',
      city: 'Dubai',
      cityRu: 'Дубай',
    },
    price: {
      usd: 1100000,
      aed: 4040300,
      eur: 1012000,
    },
    developer: {
      name: 'Damac',
      nameRu: 'Дамак',
    },
    bedrooms: 4,
    bathrooms: 3,
    size: {
      sqm: 280,
      sqft: 3014,
    },
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
    ],
    type: 'secondary',
  },
];

// Generate more test properties to test pagination (deterministic)
const generateTestProperties = (): Property[] => {
  const areas = [
    { area: 'Downtown Dubai', areaRu: 'Даунтаун Дубай' },
    { area: 'Palm Jumeirah', areaRu: 'Пальм Джумейра' },
    { area: 'Business Bay', areaRu: 'Бізнес Бей' },
    { area: 'Dubai Marina', areaRu: 'Дубай Марина' },
    { area: 'Dubai Hills', areaRu: 'Дубай Хіллз' },
    { area: 'JBR', areaRu: 'JBR' },
  ];
  const developers = [
    { name: 'Emaar', nameRu: 'Эмаар' },
    { name: 'Damac', nameRu: 'Дамак' },
    { name: 'Binghatti', nameRu: 'Бингатти' },
  ];
  const types: ('new' | 'secondary')[] = ['new', 'secondary'];
  
  const newProperties: Property[] = [];
  for (let i = 9; i <= 50; i++) {
    // Use deterministic selection based on index
    const areaIndex = (i - 9) % areas.length;
    const developerIndex = (i - 9) % developers.length;
    const typeIndex = (i - 9) % types.length;
    const area = areas[areaIndex];
    const developer = developers[developerIndex];
    const type = types[typeIndex];
    const bedrooms = ((i - 9) % 5) + 1;
    const bathrooms = Math.max(1, bedrooms - ((i - 9) % 2));
    const sqm = bedrooms * 60 + ((i - 9) % 40);
    const sqft = Math.round(sqm * 10.764);
    const aedPrice = (sqm * 15000) + ((i - 9) * 20000);
    const usdPrice = Math.round(aedPrice / 3.673);
    const eurPrice = Math.round(usdPrice * 0.92);
    
    newProperties.push({
      id: String(i),
      name: `Property ${i} in ${area.area}`,
      nameRu: `Недвижимость ${i} в ${area.areaRu}`,
      location: {
        area: area.area,
        areaRu: area.areaRu,
        city: 'Dubai',
        cityRu: 'Дубай',
      },
      price: {
        usd: usdPrice,
        aed: aedPrice,
        eur: eurPrice,
      },
      developer: developer,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      size: {
        sqm: sqm,
        sqft: sqft,
      },
      images: [
        `https://images.unsplash.com/photo-${1512453979798 + i}?w=800&h=600&fit=crop`,
        `https://images.unsplash.com/photo-${1480714378408 + i}?w=800&h=600&fit=crop`,
      ],
      type: type,
    });
  }
  return newProperties;
};

const allProperties = [...mockProperties, ...generateTestProperties()];

export default function PropertiesList() {
  const t = useTranslations('properties');
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(true); // Починаємо з true для швидшого відображення
  const [properties, setProperties] = useState<Property[]>(allProperties);
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
  const itemsPerPage = 40;

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
    // Type filter
    if (filters.type === 'new' && property.type !== 'new') return false;
    if (filters.type === 'secondary' && property.type !== 'secondary') return false;

    // Search filter (by project name)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !property.name.toLowerCase().includes(searchLower) &&
        !property.nameRu.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Location filter
    if (filters.location.length > 0) {
      const propertyLocationId = property.location.area.toLowerCase().replace(/\s/g, '-');
      if (!filters.location.includes(propertyLocationId)) {
        return false;
      }
    }

    // Bedrooms filter
    if (filters.bedrooms.length > 0) {
      const maxBedrooms = Math.max(...filters.bedrooms);
      if (maxBedrooms === 6) {
        if (property.bedrooms < 6) return false;
      } else if (!filters.bedrooms.includes(property.bedrooms)) {
        return false;
      }
    }

    // Size filter
    const sizeFrom = parseFloat(filters.sizeFrom.replace(/,/g, ''));
    const sizeTo = parseFloat(filters.sizeTo.replace(/,/g, ''));
    if (sizeFrom && property.size.sqft < sizeFrom) return false;
    if (sizeTo && property.size.sqft > sizeTo) return false;

    // Price filter
    const priceFrom = parseFloat(filters.priceFrom.replace(/,/g, ''));
    const priceTo = parseFloat(filters.priceTo.replace(/,/g, ''));
    if (priceFrom && property.price.aed < priceFrom) return false;
    if (priceTo && property.price.aed > priceTo) return false;

    return true;
  }).sort((a, b) => {
    switch (filters.sort) {
      case 'price-asc':
        return a.price.aed - b.price.aed;
      case 'price-desc':
        return b.price.aed - a.price.aed;
      case 'size-asc':
        return a.size.sqft - b.size.sqft;
      case 'size-desc':
        return b.size.sqft - a.size.sqft;
      case 'newest':
        return 0;
      default:
        return 0;
    }
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

          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              {t('pagination.previous')}
            </button>
            {totalPages > 0 && (
              <div className={styles.paginationNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`${styles.paginationNumber} ${currentPage === page ? styles.active : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={styles.paginationButton}
            >
              {t('pagination.next')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

