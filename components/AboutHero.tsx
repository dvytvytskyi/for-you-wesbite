'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import styles from './AboutHero.module.css';

interface Leader {
  name: string;
  description: string;
  photo: string;
}

export default function AboutHero() {
  const t = useTranslations('aboutUs');
  const locale = useLocale();
  const milestonesRef = useRef<HTMLDivElement>(null);
  const topSectionRef = useRef<HTMLDivElement>(null);
  const [isMilestonesVisible, setIsMilestonesVisible] = useState(false);
  const [isTopSectionVisible, setIsTopSectionVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isTopSectionVisible) {
            setIsTopSectionVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (topSectionRef.current) {
      observer.observe(topSectionRef.current);
    }

    return () => {
      if (topSectionRef.current) {
        observer.unobserve(topSectionRef.current);
      }
    };
  }, [isTopSectionVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isMilestonesVisible) {
            setIsMilestonesVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (milestonesRef.current) {
      observer.observe(milestonesRef.current);
    }

    return () => {
      if (milestonesRef.current) {
        observer.unobserve(milestonesRef.current);
      }
    };
  }, [isMilestonesVisible]);

  return (
    <div className={styles.container}>
      {/* Top Section */}
      <div
        className={`${styles.topSection} ${isTopSectionVisible ? styles.visible : ''}`}
        ref={topSectionRef}
      >
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            {t('heroTitle1')}
            <br />
            {t('heroTitle2')}
          </h1>
        </div>
        <div className={styles.descriptionSection}>
          <p className={styles.description}>
            {t('heroDescription')}
          </p>
          <p className={styles.subDescription}>
            {t('heroSubDescription')}
          </p>
        </div>
      </div>

      {/* Image Section */}
      <div className={styles.imageSectionWrapper}>
        <div className={styles.imageSection}>
          <Image
            src="https://images.pexels.com/photos/10549888/pexels-photo-10549888.jpeg"
            alt={t('heroImageAlt')}
            unoptimized
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
            fill
            style={{ objectFit: 'cover' }}
            sizes="100vw"
            loading="lazy"
          />
        </div>
      </div>

      {/* Partners Section */}
      <div className={styles.partnersSection}>
        <div className={styles.partnersContainer}>
          <h2 className={styles.partnersTitle}>{t('partnersTitle')}</h2>
          <div className={styles.partnersScroll}>
            <div className={styles.partnersList}>
              {/* Banks and financial institutions from foryou-cb.com/about */}
              {[
                { name: 'TBC BANK', logo: 'https://static.tildacdn.com/tild3536-6263-4862-a136-393839396365/tbc.png' },
                { name: 'SOVCOMBANK WEALTH MANAGEMENT', logo: 'https://static.tildacdn.com/tild6332-6237-4237-b534-396137623233/Group_1597880355.png' },
                { name: 'CENTERCREDIT', logo: 'https://static.tildacdn.com/tild3134-3762-4138-b037-326633656431/image_2.png' },
                { name: 'Уралсиб', logo: 'https://static.tildacdn.com/tild6361-6530-4031-b237-616634306338/image_4.png' },
                { name: 'FREEDOM BANK PRIO', logo: 'https://static.tildacdn.com/tild6261-6465-4966-b733-333364393637/image_5.png' },
                { name: 'center home', logo: 'https://static.tildacdn.com/tild3637-6466-4433-a331-353137353864/Clip_path_group.svg' },
                { name: 'СБЕР', logo: 'https://static.tildacdn.com/tild3863-6130-4135-b138-653236663639/Clip_path_group.svg' },
                { name: 'А Клуб', logo: 'https://static.tildacdn.com/tild6435-3537-4064-a337-353763663232/Clip_path_group.svg' },
                { name: 'МТС БАНК', logo: 'https://static.tildacdn.com/tild6439-3131-4264-a239-656336656331/image_1808.png' },
                { name: 'Raiffeisen BANK', logo: 'https://static.tildacdn.com/tild3363-3334-4431-b337-313037376138/image_6.png' },
                { name: 'AT', logo: 'https://static.tildacdn.com/tild6536-6166-4731-a137-316139653139/Group_1597880269-rem.png' },
                { name: 'Береке', logo: 'https://static.tildacdn.com/tild3832-3534-4633-a332-353330333064/bereke.png' }
              ].map((bank, index) => (
                <div key={`partner-${index}`} className={styles.partnerLogo}>
                  <Image
                    src={bank.logo}
                    alt={bank.name}
                    width={200}
                    height={80}
                    style={{ objectFit: 'contain', maxHeight: '80px', width: 'auto' }}
                    unoptimized
                  />
                </div>
              ))}
              {/* Duplicate for seamless infinite loop */}
              {[
                { name: 'TBC BANK', logo: 'https://static.tildacdn.com/tild3536-6263-4862-a136-393839396365/tbc.png' },
                { name: 'SOVCOMBANK WEALTH MANAGEMENT', logo: 'https://static.tildacdn.com/tild6332-6237-4237-b534-396137623233/Group_1597880355.png' },
                { name: 'CENTERCREDIT', logo: 'https://static.tildacdn.com/tild3134-3762-4138-b037-326633656431/image_2.png' },
                { name: 'Уралсиб', logo: 'https://static.tildacdn.com/tild6361-6530-4031-b237-616634306338/image_4.png' },
                { name: 'FREEDOM BANK PRIO', logo: 'https://static.tildacdn.com/tild6261-6465-4966-b733-333364393637/image_5.png' },
                { name: 'center home', logo: 'https://static.tildacdn.com/tild3637-6466-4433-a331-353137353864/Clip_path_group.svg' },
                { name: 'СБЕР', logo: 'https://static.tildacdn.com/tild3863-6130-4135-b138-653236663639/Clip_path_group.svg' },
                { name: 'А Клуб', logo: 'https://static.tildacdn.com/tild6435-3537-4064-a337-353763663232/Clip_path_group.svg' },
                { name: 'МТС БАНК', logo: 'https://static.tildacdn.com/tild6439-3131-4264-a239-656336656331/image_1808.png' },
                { name: 'Raiffeisen BANK', logo: 'https://static.tildacdn.com/tild3363-3334-4431-b337-313037376138/image_6.png' },
                { name: 'AT', logo: 'https://static.tildacdn.com/tild6536-6166-4731-a137-316139653139/Group_1597880269-rem.png' },
                { name: 'Береке', logo: 'https://static.tildacdn.com/tild3832-3534-4633-a332-353330333064/bereke.png' }
              ].map((bank, index) => (
                <div key={`partner-duplicate-${index}`} className={styles.partnerLogo}>
                  <Image
                    src={bank.logo}
                    alt={bank.name}
                    width={200}
                    height={80}
                    style={{ objectFit: 'contain', maxHeight: '80px', width: 'auto' }}
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <TeamSection t={t} />

      {/* Office Section */}
      <OfficeSection t={t} />

      {/* Leadership Section */}
      <LeadershipSection t={t} />

      {/* FAQ Section */}
      <FAQSection t={t} />
    </div >
  );
}


export function TeamSection({ t }: { t: any }) {
  return (
    <div className={styles.teamSection}>
      <div className={styles.teamContainer}>
        <h2 className={styles.teamTitle}>{t('teamTitle')}</h2>
        <p className={styles.teamDescription}>{t('teamDescription')}</p>
        <div className={styles.teamGrid}>
          <div className={styles.teamMember}>
            <div className={styles.teamPhoto}>
              <Image
                src="/IMG_9273.JPG"
                alt={t('teamMembers.daniil')}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                loading="lazy"
                unoptimized
              />
            </div>
            <div className={styles.teamInfo}>
              <div className={styles.teamName}>{t('teamMembers.daniil')}</div>
              <div className={styles.teamRole}>{t('teamMembers.daniilRole')}</div>
            </div>
          </div>
          <div className={styles.teamMember}>
            <div className={styles.teamPhoto}>
              <Image
                src="https://res.cloudinary.com/dgv0rxd60/image/upload/v1765715854/photo_2025-12-14_15-36-43_jn55hm.jpg"
                alt={t('teamMembers.ruslan')}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                loading="lazy"
                unoptimized
                onError={(e) => {
                  if (process.env.NODE_ENV === 'development') {
                  }
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className={styles.teamInfo}>
              <div className={styles.teamName}>{t('teamMembers.ruslan')}</div>
              <div className={styles.teamRole}>{t('teamMembers.ruslanRole')}</div>
            </div>
          </div>
          <div className={styles.teamMember}>
            <div className={styles.teamPhoto}>
              <Image
                src="/IMG_9341.JPG"
                alt={t('teamMembers.kamila')}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                loading="lazy"
                unoptimized
              />
            </div>
            <div className={styles.teamInfo}>
              <div className={styles.teamName}>{t('teamMembers.kamila')}</div>
              <div className={styles.teamRole}>{t('teamMembers.kamilaRole')}</div>
            </div>
          </div>
          <div className={styles.teamMember}>
            <div className={styles.teamPhoto}>
              <Image
                src="/IMG_9345.JPG"
                alt={t('teamMembers.ekaterina')}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                loading="lazy"
                unoptimized
              />
            </div>
            <div className={styles.teamInfo}>
              <div className={styles.teamName}>{t('teamMembers.ekaterina')}</div>
              <div className={styles.teamRole}>{t('teamMembers.ekaterinaRole')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OfficeSection({ t }: { t: any }) {

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Load Mapbox when component mounts
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const loadMapbox = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        // CSS is imported globally in app/globals.css

        // Get token from environment variable or use hardcoded fallback
        const token = 'pk.eyJ1IjoiYWJpZXNwYW5hIiwiYSI6ImNsb3N4NzllYzAyOWYybWw5ZzNpNXlqaHkifQ.UxlTvUuSq9L5jt0jRtRR-A';

        if (!token || token.trim() === '') {
          if (mapContainerRef.current) {
            mapContainerRef.current.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-family: Inter, sans-serif; padding: 20px; text-align: center;">Mapbox token не налаштований</div>';
          }
          return;
        }

        if (process.env.NODE_ENV === 'development') {
        }

        mapboxgl.accessToken = token;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: 'mapbox://styles/abiespana/cmkdvczeg002301sdfd53hv5f',
          center: [55.1689534, 25.0964000], // Dubai office coordinates
          zoom: 16,
          interactive: true,
          accessToken: token, // Also pass as parameter
          // Optimize Mapbox loading - обмежуємо область та zoom для зменшення кількості тайлів
          maxZoom: 18,
          minZoom: 10,
          maxBounds: [
            [54.0, 24.0], // Southwest coordinates (Dubai area)
            [56.0, 26.0], // Northeast coordinates (Dubai area)
          ],
        });

        map.on('load', () => {
          try {
            map.addControl(new mapboxgl.NavigationControl(), 'top-right');

            // Create custom marker element
            const el = document.createElement('div');
            el.className = 'office-marker';
            el.style.position = 'relative';
            el.style.display = 'flex';
            el.style.flexDirection = 'column';
            el.style.alignItems = 'center';

            // SVG Icon
            const svgContainer = document.createElement('div');
            svgContainer.innerHTML = `
              <svg width="40" height="50" viewBox="0 0 384 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z" fill="#003077"/>
              </svg>
            `;
            el.appendChild(svgContainer);

            // Text Label
            const label = document.createElement('div');
            label.textContent = 'ForYou Office';
            label.style.marginTop = '10px';
            label.style.backgroundColor = 'white';
            label.style.color = '#003077';
            label.style.padding = '6px 12px';
            label.style.borderRadius = '8px';
            label.style.fontSize = '14px';
            label.style.fontWeight = '600';
            label.style.whiteSpace = 'nowrap';
            label.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            label.style.fontFamily = 'Inter, sans-serif';

            el.appendChild(label);

            // Add office marker with offset to account for label
            const marker = new mapboxgl.Marker({
              element: el,
              anchor: 'bottom',
              offset: [0, -42] // Shift up so the pin tip is at the coordinate (approx label height + margin)
            })
              .setLngLat([55.1689534, 25.0964000])
              .addTo(map);

            markerRef.current = marker;

          } catch (error) { }
        });

        map.on('error', (e: any) => {
          if (mapContainerRef.current) {
            const errorMsg = e.error?.message || 'Помилка завантаження карти';
            mapContainerRef.current.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #d32f2f; font-family: Inter, sans-serif; padding: 20px; text-align: center;">${errorMsg}</div>`;
          }
        });

        map.on('style.load', () => {
        });

        mapRef.current = map;
      } catch (error) {
        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-family: Inter, sans-serif;">Помилка завантаження карти</div>';
        }
      }
    };

    // Lazy load map when visible
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMapbox();
        observer.disconnect();
      }
    });

    if (mapContainerRef.current) {
      observer.observe(mapContainerRef.current);
    }

    return () => {
      observer.disconnect();
      if (markerRef.current) {
        markerRef.current.remove();
      }
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  // Generate time slots (9 AM to 6 PM, every hour)


  return (
    <div className={styles.officeSection}>
      <div className={styles.officeContainer}>
        <div className={styles.officeContent}>
          <div className={styles.officeMapContainer}>
            <div ref={mapContainerRef} className={styles.officeMap} />
          </div>
          <div className={styles.officeFormContainer}>
            <h2 className={styles.officeTitle}>{t('officeTitle')}</h2>
            <p className={styles.officeDescription}>{t('officeDescription')}</p>
            <form className={styles.officeForm} onSubmit={handleSubmit}>
              <h3 className={styles.formTitle}>{t('officeForm.title')}</h3>



              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label>{t('officeForm.nameLabel')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('officeForm.namePlaceholder')}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <label>{t('officeForm.phoneLabel')}</label>
                  <div className={styles.phoneInputWrapper}>
                    <span className={styles.phonePrefix}>+</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('officeForm.phonePlaceholder')}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formField}>
                <label>{t('officeForm.messageLabel')}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('officeForm.messagePlaceholder')}
                  rows={4}
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                {t('officeForm.submitButton')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQSection({ t }: { t: any }) {
  const faqRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (faqRef.current) {
      observer.observe(faqRef.current);
    }

    return () => {
      if (faqRef.current) {
        observer.unobserve(faqRef.current);
      }
    };
  }, [isVisible]);

  const faqItems = t.raw('faq') || [];

  return (
    <div
      className={`${styles.faqSection} ${isVisible ? styles.visible : ''}`}
      ref={faqRef}
    >
      <div className={styles.faqContainer}>
        <h2 className={styles.faqTitle}>{t('faqTitle')}</h2>
        <div className={styles.faqList}>
          {faqItems.map((item: any, index: number) => (
            <div
              key={index}
              className={`${styles.faqItem} ${openIndex === index ? styles.open : ''}`}
            >
              <button
                className={styles.faqQuestion}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span>{item.question}</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.faqIcon}
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className={styles.faqAnswer}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LeadershipSection({ t }: { t: any }) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleToggle = (name: string) => {
    setExpandedCard(expandedCard === name ? null : name);
  };

  return (
    <div className={styles.leadershipSection}>
      <div className={styles.leadershipContainer}>
        <h2 className={styles.leadershipTitle}>{t('leadersTitle')}</h2>
        <div className={styles.leadersGrid}>
          <LeaderCard
            name={t('leaders.artem.name')}
            description={t('leaders.artem.description')}
            photo="/Screenshot-2025-06-29-at-16.28.29.png"
            isExpanded={expandedCard === t('leaders.artem.name')}
            onToggle={() => handleToggle(t('leaders.artem.name'))}
          />
          <LeaderCard
            name={t('leaders.nikita.name')}
            description={t('leaders.nikita.description')}
            photo="/Screenshot-2025-06-29-at-13.30.47.png"
            isExpanded={expandedCard === t('leaders.nikita.name')}
            onToggle={() => handleToggle(t('leaders.nikita.name'))}
          />
          <LeaderCard
            name={t('leaders.antony.name')}
            description={t('leaders.antony.description')}
            photo="/photo_2024-09-23_15-49-10.webp"
            isExpanded={expandedCard === t('leaders.antony.name')}
            onToggle={() => handleToggle(t('leaders.antony.name'))}
          />
          <LeaderCard
            name={t('leaders.gulnoza.name')}
            description={t('leaders.gulnoza.description')}
            photo="/IMG_4539-1-scaled.webp"
            isExpanded={expandedCard === t('leaders.gulnoza.name')}
            onToggle={() => handleToggle(t('leaders.gulnoza.name'))}
          />
        </div>
      </div>
    </div>
  );
}

function LeaderCard({ name, description, photo, isExpanded, onToggle }: Leader & { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div
      className={`${styles.leaderCard} ${isExpanded ? styles.expanded : ''}`}
    >
      <div className={styles.leaderPhoto}>
        <Image
          src={photo}
          alt={name}
          fill
          style={{ objectFit: 'cover', filter: 'grayscale(100%)' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          loading="lazy"
          unoptimized
        />
      </div>
      <div className={styles.leaderContent}>
        <h3 className={styles.leaderName}>{name}</h3>
        <div className={styles.leaderDescription}>
          <p className={isExpanded ? styles.fullText : styles.shortText}>
            {description}
          </p>
        </div>
        <button
          className={styles.leaderToggle}
          onClick={onToggle}
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      </div>
    </div>
  );
}

