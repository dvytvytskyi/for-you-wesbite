'use client';

import React, { useState, useEffect } from 'react';
import styles from './ProjectLanding.module.css';
import Image from 'next/image';
import CallbackModal from '../CallbackModal';

interface ProjectProps {
  project: {
    name: string;
    location: string;
    priceFrom: string;
    status: string;
    about: string;
    images: string[];
    paymentPlan: { stage: string; percent: string; details: string }[];
    developer: { name: string; bio: string; logo: string; projectsCount: number };
    area: { name: string; description: string; highlights: string[] };
    stats: { label: string; value: string; trend: string }[];
  };
  locale: string;
}

export default function ProjectLanding({ project, locale }: ProjectProps) {
  const [showPopup, setShowPopup] = useState(false);
  const isEn = locale !== 'ru';

  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 45000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <article className={styles.container}>

      {/* Breadcrumbs for SEO */}
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <ol>
          <li><a href={`/${locale}`}>{isEn ? 'Home' : 'Главная'}</a></li>
          <li><a href={`/${locale}/projects`}>{isEn ? 'Dubai Projects' : 'Проекты Дубая'}</a></li>
          <li aria-current="page">{project.name}</li>
        </ol>
      </nav>
      
      {/* 1. HERO - H1 is critical */}
      <section className={styles.hero}>
        <Image src={project.images[0]} alt={`${project.name} exterior view`} fill className={styles.heroImage} priority />
        <div className={styles.heroOverlay}>
          <span className={styles.badge}>{project.status}</span>
          <h1 className={styles.heroTitle}>{project.name}</h1>
          <p className={styles.heroSubtitle}>{project.location}</p>
          <div className={styles.heroPrice}>
            <span>{isEn ? 'Investment starts at' : 'Инвестиции от'}</span>
            <strong>{project.priceFrom} AED</strong>
          </div>
        </div>
      </section>

      {/* 2. ABOUT - Semantic Article */}
      <section className={styles.section}>
        <div className={styles.aboutGrid}>
          <article className={styles.textContent}>
            <h2 className={styles.sectionTitle}>{isEn ? 'Project Overview' : 'Про проект'}</h2>
            <div className={styles.bodyText} dangerouslySetInnerHTML={{ __html: project.about }} />
            <h3 className={styles.subTitle}>{isEn ? 'Exclusive Amenities' : 'Ексклюзивні зручності'}</h3>
            <ul className={styles.featureList}>
              {['Private Beach Club', 'Olympic Pool', 'Luxury Spa', '24/7 Concierge'].map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </article>
          <aside className={styles.imageContent}>
            <Image src={project.images[1]} width={600} height={400} alt={`${project.name} luxury architecture`} />
          </aside>
        </div>
      </section>

      {/* 3. UNITS & FLOOR PLANS - NEW SECTION */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>{isEn ? 'Available Units & Pricing' : 'Доступные планировки и цены'}</h2>
        <div className={styles.unitsGrid}>
           {(project as any).units?.map((u: any, i: number) => (
             <div key={i} className={styles.unitCard}>
                {u.planImage && (
                  <div className={styles.unitImage}>
                    <Image src={u.planImage} alt={`Floor plan ${u.type}`} fill style={{ objectFit: 'contain' }} />
                  </div>
                )}
                <div className={styles.unitInfo}>
                   <h4>{u.type === '0' ? (isEn ? 'Studio' : 'Студия') : `${u.type} BR`}</h4>
                   <p>{u.size}</p>
                   <div className={styles.unitPrice}>{u.price} AED</div>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* 4. PAYMENT PLAN - Structured data table */}

      {/* 4. INTERIOR GALLERY */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>{isEn ? 'Experience the Interiors' : 'Интерьеры и удобства'}</h2>
        <div className={styles.gallery}>
          {project.images.map((img, i) => {
            const altVariations = isEn 
              ? [`Exclusive view of ${project.name}`, `Luxury Interior in ${project.name} Dubai`, `World-class amenities at ${project.name}`, `Stunning architectural detail of ${project.name}`]
              : [`Эксклюзивный вид ${project.name}`, `Роскошный интерьер в ${project.name} Дубай`, `Инфраструктура мирового уровня в ${project.name}`, `Архитектурные детали ${project.name}`];
            const altText = altVariations[i % altVariations.length];
            
            return (
              <div key={i} className={styles.galleryItem}>
                <Image 
                  src={img} 
                  alt={altText} 
                  fill 
                  style={{ objectFit: 'cover' }} 
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. DEVELOPER - Trust Signal */}
      <section className={styles.devSection}>
        <div className={styles.section}>
          <div className={styles.devGrid}>
            <div className={styles.devInfo}>
              <h2>{project.developer.name}</h2>
              <p className={styles.devBio}>{project.developer.bio}</p>
            </div>
            <div className={styles.devMetric}>
              <span className={styles.metricVal}>{project.developer.projectsCount}+</span>
              <span className={styles.metricLabel}>{isEn ? 'Delivered Projects' : 'Здані об’єкти'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. AREA & ANALYTICS - Authority Section */}
      <section className={styles.section}>
        <div className={styles.areaGrid}>
          <div className={styles.areaText}>
            <h2 className={styles.sectionTitle}>{isEn ? 'Location Intelligence' : 'Аналіз локації'}</h2>
            <p>{project.area.description}</p>
            <div className={styles.areaHighlights}>
              {project.area.highlights.map((h, i) => <span key={i} className={styles.tag}>{h}</span>)}
            </div>
          </div>
          <div className={styles.statsCard}>
            <h3 className={styles.statsTitle}>{isEn ? 'Market Data' : 'Ринкові показники'}</h3>
            <div className={styles.statsList}>
              {project.stats.map((s, i) => (
                <div key={i} className={styles.statRow}>
                  <label>{s.label}</label>
                  <div className={styles.statData}>
                    <strong>{s.value}</strong>
                    <span className={styles.trend}>{s.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <section className={styles.cta}>
        <h2>{isEn ? 'Secure Your Unit Today' : 'Забронюйте юніт сьогодні'}</h2>
        <div className={styles.ctaGroup}>
          <button className={styles.btnPrimary}>{isEn ? 'Request Full Pricing' : 'Запит ціни'}</button>
          <button className={styles.btnSecondary} onClick={() => setShowPopup(true)}>{isEn ? 'Get PDF Catalog' : 'Отримати каталог'}</button>
        </div>
      </section>

      {/* STICKY SOCIAL */}
      <div className={styles.stickySocial}>
        <a href="https://wa.me/xxx" className={styles.wa}>WhatsApp</a>
        <a href="https://t.me/xxx" className={styles.tg}>Telegram</a>
      </div>

      <CallbackModal 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)} 
        projectName={project.name}
        source={`Project Landing: ${project.name}`}
        initialMessage={isEn ? `I would like to download the brochure and pricing for ${project.name}` : `Я хочу завантажити брошуру та прайс для ${project.name}`}
      />

    </article>
  );
}
