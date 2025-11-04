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
            src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1400&h=800&fit=crop"
            alt={t('heroImageAlt')}
            fill
            style={{ objectFit: 'cover' }}
            sizes="100vw"
            priority
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

      {/* Milestones Section */}
      <div 
        className={`${styles.milestonesSection} ${isMilestonesVisible ? styles.visible : ''}`}
        ref={milestonesRef}
      >
        <div className={styles.milestonesContainer}>
          <h2 className={styles.milestonesTitle}>{t('milestonesTitle')}</h2>
          <p className={styles.milestonesDescription}>{t('milestonesDescription')}</p>
          
          <div className={styles.timeline}>
            <div className={styles.timelineLine}></div>
            
            <div className={styles.milestoneItem}>
              <div className={styles.milestoneMarker}>
                <div className={styles.milestoneCircle}></div>
                <div className={styles.milestoneYear}>{t('milestone2022.year')}</div>
              </div>
              <div className={styles.milestoneContent}>
                <div className={styles.milestoneShortTitle}>{t('milestone2022.shortTitle')}</div>
                <div className={styles.milestoneBoldTitle}>{t('milestone2022.boldTitle')}</div>
                <div className={styles.milestoneDescription}>{t('milestone2022.description')}</div>
              </div>
            </div>

            <div className={styles.milestoneItem}>
              <div className={styles.milestoneMarker}>
                <div className={styles.milestoneCircle}></div>
                <div className={styles.milestoneYear}>{t('milestone2023.year')}</div>
              </div>
              <div className={styles.milestoneContent}>
                <div className={styles.milestoneShortTitle}>{t('milestone2023.shortTitle')}</div>
                <div className={styles.milestoneBoldTitle}>{t('milestone2023.boldTitle')}</div>
                <div className={styles.milestoneDescription}>{t('milestone2023.description')}</div>
              </div>
            </div>

            <div className={styles.milestoneItem}>
              <div className={styles.milestoneMarker}>
                <div className={styles.milestoneCircle}></div>
                <div className={styles.milestoneYear}>{t('milestone2024.year')}</div>
              </div>
              <div className={styles.milestoneContent}>
                <div className={styles.milestoneShortTitle}>{t('milestone2024.shortTitle')}</div>
                <div className={styles.milestoneBoldTitle}>{t('milestone2024.boldTitle')}</div>
                <div className={styles.milestoneDescription}>{t('milestone2024.description')}</div>
              </div>
            </div>

            <div className={styles.milestoneItem}>
              <div className={styles.milestoneMarker}>
                <div className={styles.milestoneCircle}></div>
                <div className={styles.milestoneYear}>{t('milestone2025.year')}</div>
              </div>
              <div className={styles.milestoneContent}>
                <div className={styles.milestoneShortTitle}>{t('milestone2025.shortTitle')}</div>
                <div className={styles.milestoneBoldTitle}>{t('milestone2025.boldTitle')}</div>
                <div className={styles.milestoneDescription}>{t('milestone2025.description')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className={styles.partnersSection}>
        <div className={styles.partnersContainer}>
          <h2 className={styles.partnersTitle}>{t('partnersTitle')}</h2>
          <div className={styles.partnersScroll}>
            <div className={styles.partnersList}>
              {/* Placeholder logos - will be replaced with actual logos */}
              <div className={styles.partnerLogo}>Emaar</div>
              <div className={styles.partnerLogo}>Damac</div>
              <div className={styles.partnerLogo}>Nakheel</div>
              <div className={styles.partnerLogo}>Dubai Properties</div>
              <div className={styles.partnerLogo}>Meraas</div>
              <div className={styles.partnerLogo}>Sobha</div>
              <div className={styles.partnerLogo}>MAG</div>
              <div className={styles.partnerLogo}>Azizi</div>
              {/* Duplicate for seamless infinite loop */}
              <div className={styles.partnerLogo}>Emaar</div>
              <div className={styles.partnerLogo}>Damac</div>
              <div className={styles.partnerLogo}>Nakheel</div>
              <div className={styles.partnerLogo}>Dubai Properties</div>
              <div className={styles.partnerLogo}>Meraas</div>
              <div className={styles.partnerLogo}>Sobha</div>
              <div className={styles.partnerLogo}>MAG</div>
              <div className={styles.partnerLogo}>Azizi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className={styles.teamSection}>
        <div className={styles.teamContainer}>
          <h2 className={styles.teamTitle}>{t('teamTitle')}</h2>
          <p className={styles.teamDescription}>{t('teamDescription')}</p>
          <div className={styles.teamGrid}>
            <div className={styles.teamMember}>
              <div className={styles.teamPhoto}>
                <Image
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop"
                  alt="Team member"
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              <div className={styles.teamInfo}>
                <div className={styles.teamName}>Sarah Johnson</div>
                <div className={styles.teamRole}>Head of Marketing</div>
              </div>
            </div>
            <div className={styles.teamMember}>
              <div className={styles.teamPhoto}>
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop"
                  alt="Team member"
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              <div className={styles.teamInfo}>
                <div className={styles.teamName}>Michael Chen</div>
                <div className={styles.teamRole}>Chief Executive Officer</div>
              </div>
            </div>
            <div className={styles.teamMember}>
              <div className={styles.teamPhoto}>
                <Image
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop"
                  alt="Team member"
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              <div className={styles.teamInfo}>
                <div className={styles.teamName}>Emma Williams</div>
                <div className={styles.teamRole}>Head of Sales</div>
              </div>
            </div>
            <div className={styles.teamMember}>
              <div className={styles.teamPhoto}>
                <Image
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop"
                  alt="Team member"
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              <div className={styles.teamInfo}>
                <div className={styles.teamName}>David Brown</div>
                <div className={styles.teamRole}>Head of Operations</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Office Section */}
      <OfficeSection t={t} />

      {/* Leadership Section */}
      <LeadershipSection t={t} />

      {/* FAQ Section */}
      <FAQSection t={t} />
    </div>
  );
}

function OfficeSection({ t }: { t: any }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const loadMapbox = async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      await import('mapbox-gl/dist/mapbox-gl.css');
      
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

      if (!token) {
        console.warn('Mapbox token is not set');
        return;
      }

      mapboxgl.accessToken = token;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: 'mapbox://styles/abiespana/cmcxiep98004r01quhxspf3w9',
        center: [55.2708, 25.2048], // Dubai office coordinates
        zoom: 15,
        interactive: true,
      });

      map.on('load', () => {
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add office marker
        const marker = new mapboxgl.Marker({
          color: '#003077',
        })
          .setLngLat([55.2708, 25.2048])
          .addTo(map);

        markerRef.current = marker;
      });

      mapRef.current = map;
    };

    loadMapbox();

    return () => {
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
    console.log({ selectedDate, selectedTime, selectedSpecialist, name, phone, message });
  };

  // Generate time slots (9 AM to 6 PM, every hour)
  const timeSlots = [];
  for (let hour = 9; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  // Get specialists list (can be from API or static)
  const specialists = [
    t('leaders.artem.name'),
    t('leaders.nikita.name'),
    t('leaders.antony.name'),
    t('leaders.gulnoza.name'),
  ];

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

              <div className={styles.formField}>
                <label>{t('officeForm.specialistLabel')}</label>
                <select
                  value={selectedSpecialist}
                  onChange={(e) => setSelectedSpecialist(e.target.value)}
                >
                  <option value="">{t('officeForm.specialistPlaceholder')}</option>
                  {specialists.map((specialist) => (
                    <option key={specialist} value={specialist}>
                      {specialist}
                    </option>
                  ))}
                </select>
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

function FAQSection({ t }: { t: any }) {
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

function LeadershipSection({ t }: { t: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.leadershipSection}>
      <div className={styles.leadershipContainer}>
        <h2 className={styles.leadershipTitle}>{t('leadersTitle')}</h2>
        <div className={styles.leadersGrid}>
          <LeaderCard
            name={t('leaders.artem.name')}
            description={t('leaders.artem.description')}
            photo="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&grayscale"
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
          />
          <LeaderCard
            name={t('leaders.nikita.name')}
            description={t('leaders.nikita.description')}
            photo="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&grayscale"
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
          />
          <LeaderCard
            name={t('leaders.antony.name')}
            description={t('leaders.antony.description')}
            photo="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&grayscale"
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
          />
          <LeaderCard
            name={t('leaders.gulnoza.name')}
            description={t('leaders.gulnoza.description')}
            photo="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&grayscale"
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
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

