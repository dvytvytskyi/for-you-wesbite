'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import styles from './DevelopersList.module.css';

interface Developer {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  images: string[] | null;
  createdAt: Date;
}

// TODO: Замінити на реальний API запит
// const fetchDevelopers = async (): Promise<Developer[]> => {
//   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/data`);
//   const data = await response.json();
//   return data.developers || [];
// };

// Mock data - замінити на реальні дані з API
// Генеруємо 490 девелоперів для тестування
const generateMockDevelopers = (): Developer[] => {
  const developers: Developer[] = [];
  const popularNames = [
    { name: 'Emaar Properties', logo: null },
    { name: 'Damac Properties', logo: null },
    { name: 'Nakheel', logo: null },
    { name: 'Dubai Properties', logo: null },
    { name: 'Meraas', logo: null },
    { name: 'Sobha Realty', logo: null },
    { name: 'MAG Properties', logo: null },
    { name: 'Azizi Developments', logo: null },
    { name: 'Select Group', logo: null },
    { name: 'Omniyat', logo: null },
  ];

  for (let i = 0; i < 490; i++) {
    const popularIndex = i % popularNames.length;
    const isPopular = i < popularNames.length;
    const baseName = isPopular 
      ? popularNames[i].name 
      : `Developer ${i + 1}`;
    
    developers.push({
      id: `dev-${i + 1}`,
      name: baseName,
      logo: isPopular ? popularNames[popularIndex].logo : null,
      description: i < 10 
        ? `Leading real estate developer in Dubai with a portfolio of luxury residential and commercial properties. Known for innovative design and world-class amenities.`
        : `Professional real estate development company specializing in high-quality residential and commercial projects across Dubai.`,
      images: i < 10 
        ? [
            'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop',
          ]
        : null,
      createdAt: new Date(2020 + (i % 5), (i % 12), (i % 28) + 1),
    });
  }
  
  return developers;
};

const mockDevelopers = generateMockDevelopers();

export default function DevelopersList() {
  const t = useTranslations('developers');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [developers, setDevelopers] = useState<Developer[]>(mockDevelopers);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(
    developers.length > 0 ? developers[0] : null
  );
  const [loading, setLoading] = useState(false);

  // TODO: Замінити на реальний API запит
  // useEffect(() => {
  //   const loadDevelopers = async () => {
  //     setLoading(true);
  //     try {
  //       const data = await fetchDevelopers();
  //       setDevelopers(data);
  //       if (data.length > 0) {
  //         setSelectedDeveloper(data[0]);
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch developers:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   loadDevelopers();
  // }, []);

  useEffect(() => {
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

  const handleDeveloperSelect = (developer: Developer) => {
    setSelectedDeveloper(developer);
  };

  if (loading) {
    return (
      <section className={styles.developersList}>
        <div className={styles.container}>
          <div className={styles.loading}>{t('loading')}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.developersList} ref={sectionRef}>
      <div className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.content}>
          {/* Ліва частина - список девелоперів (60%) */}
          <div className={styles.developersGrid}>
            {developers.map((developer) => (
              <div
                key={developer.id}
                className={`${styles.developerCard} ${
                  selectedDeveloper?.id === developer.id ? styles.selected : ''
                }`}
                onClick={() => handleDeveloperSelect(developer)}
              >
                {developer.logo ? (
                  <div className={styles.logoContainer}>
                    <Image
                      src={developer.logo}
                      alt={developer.name}
                      width={60}
                      height={60}
                      className={styles.logo}
                    />
                  </div>
                ) : (
                  <div className={styles.logoPlaceholder}>
                    <span className={styles.logoPlaceholderText}>
                      {developer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <h3 className={styles.developerName}>{developer.name}</h3>
                <button className={styles.viewButton}>
                  {t('viewButton')}
                </button>
              </div>
            ))}
          </div>

          {/* Права частина - інформація по девелоперу (40%) */}
          <div className={styles.developerDetails}>
            {selectedDeveloper ? (
              <>
                <div className={styles.detailsHeader}>
                  {selectedDeveloper.logo ? (
                    <div className={styles.detailsLogoContainer}>
                      <Image
                        src={selectedDeveloper.logo}
                        alt={selectedDeveloper.name}
                        width={120}
                        height={120}
                        className={styles.detailsLogo}
                      />
                    </div>
                  ) : (
                    <div className={styles.detailsLogoPlaceholder}>
                      <span className={styles.detailsLogoPlaceholderText}>
                        {selectedDeveloper.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <h2 className={styles.detailsName}>{selectedDeveloper.name}</h2>
                </div>

                {selectedDeveloper.description && (
                  <div className={styles.description}>
                    <p>{selectedDeveloper.description}</p>
                  </div>
                )}

                {selectedDeveloper.images && selectedDeveloper.images.length > 0 && (
                  <div className={styles.images}>
                    <h3 className={styles.imagesTitle}>{t('images')}</h3>
                    <div className={styles.imagesGrid}>
                      {selectedDeveloper.images.map((image, index) => (
                        <div key={index} className={styles.imageItem}>
                          <Image
                            src={image}
                            alt={`${selectedDeveloper.name} - Image ${index + 1}`}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.meta}>
                  <p className={styles.createdAt}>
                    {t('createdAt')}: {selectedDeveloper.createdAt.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US')}
                  </p>
                </div>
              </>
            ) : (
              <div className={styles.noSelection}>
                <p>{t('noSelection')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

