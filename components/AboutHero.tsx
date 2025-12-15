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
  const [stat1Value, setStat1Value] = useState(0);
  const [stat2Value, setStat2Value] = useState(0);
  const [stat3Value, setStat3Value] = useState(0);
  const [stat4Value, setStat4Value] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const milestonesRef = useRef<HTMLDivElement>(null);
  const topSectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
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
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [isVisible]);

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

  useEffect(() => {
    if (!isVisible) return;

    const animateValue = (
      setter: (value: number) => void,
      start: number,
      end: number,
      duration: number,
      suffix: string = ''
    ) => {
      const startTime = Date.now();
      const endTime = startTime + duration;

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeOutQuart);
        
        setter(current);

        if (now < endTime) {
          requestAnimationFrame(animate);
        } else {
          setter(end);
        }
      };

      animate();
    };

    // Parse numbers from stat strings
    const parseStat = (stat: string): number => {
      if (stat.includes('%')) {
        return parseInt(stat.replace('%', ''));
      }
      if (stat.includes('+')) {
        return parseInt(stat.replace('+', ''));
      }
      return parseInt(stat);
    };

    const stat1Num = parseStat(t('stat1Number'));
    const stat2Num = parseStat(t('stat2Number'));
    const stat3Num = parseStat(t('stat3Number'));
    const stat4Num = parseStat(t('stat4Number'));

    animateValue(setStat1Value, 0, stat1Num, 2000);
    animateValue(setStat2Value, 0, stat2Num, 2000);
    animateValue(setStat3Value, 0, stat3Num, 2000);
    animateValue(setStat4Value, 0, stat4Num, 2000);
  }, [isVisible, t]);

  const formatStat = (value: number, original: string): string => {
    if (original.includes('%')) {
      return `${value}%`;
    }
    if (original.includes('+')) {
      return `${value}+`;
    }
    return value.toString().padStart(2, '0');
  };

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
            unoptimized
          />
        </div>
      </div>

      {/* Statistics Section */}
      <div className={styles.statsSection} ref={statsRef}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{formatStat(stat1Value, t('stat1Number'))}</div>
          <div className={styles.statLabel}>{t('stat1Label')}</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{formatStat(stat2Value, t('stat2Number'))}</div>
          <div className={styles.statLabel}>{t('stat2Label')}</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{formatStat(stat3Value, t('stat3Number'))}</div>
          <div className={styles.statLabel}>{t('stat3Label')}</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{formatStat(stat4Value, t('stat4Number'))}</div>
          <div className={styles.statLabel}>{t('stat4Label')}</div>
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
    </div>
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
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
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
        
        // Get token from environment variable (available on client side)
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

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
          style: 'mapbox://styles/abiespana/cmcxiep98004r01quhxspf3w9',
          center: [55.2708, 25.2048], // Dubai office coordinates
          zoom: 15,
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

            // Add office marker
            const marker = new mapboxgl.Marker({
              color: '#003077',
            })
              .setLngLat([55.2708, 25.2048])
              .addTo(map);

            markerRef.current = marker;
            
            } catch (error) {}
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

    // Small delay to ensure container is rendered
    const timer = setTimeout(() => {
      loadMapbox();
    }, 100);

    return () => {
      clearTimeout(timer);
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
  const timeSlots = [];
  for (let hour = 9; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

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
                  <label>{t('officeForm.dateLabel')}</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className={styles.formField}>
                  <label>{t('officeForm.timeLabel')}</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    required
                  >
                    <option value="">{t('officeForm.timeLabel')}</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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

