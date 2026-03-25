'use client';

import React from 'react';
import styles from './PremiumPropertyLanding.module.css';
import baseStyles from './PropertyLanding.module.css';
import Image from 'next/image';

interface PremiumProps {
  data: {
    project: any;
    analytics: {
      roi: string;
      rentalYield: string;
      priceAppreciation: string;
      demandScore: string;
    };
    areaInfo: {
      name: string;
      highlights: string[];
      description: string;
      stats: { schools: number; hospitals: number; entertainment: number };
    };
    developerStats: {
      completedProjects: number;
      ongoingProjects: number;
      trustScore: string;
    };
  };
  locale: string;
}

export default function PremiumPropertyLanding({ data, locale }: PremiumProps) {
  const { project, analytics, areaInfo, developerStats } = data;
  const isEn = locale !== 'ru';

  return (
    <div className={styles.premiumContainer}>
      
      {/* 1. ADVANCED HERO - High Impact Metrics */}
      <section className={baseStyles.hero}>
        <h1 className={baseStyles.h1}>{project.name} {isEn ? 'Premium Investment Opportunity' : 'Преміальна інвестиційна можливість'}</h1>
        <div className={styles.analyticsGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricValue}>{analytics.roi}</span>
            <span className={styles.metricLabel}>{isEn ? 'Expected ROI' : 'Очікуваний ROI'}</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricValue}>{analytics.rentalYield}</span>
            <span className={styles.metricLabel}>{isEn ? 'Rental Yield' : 'Дохідність від оренди'}</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricValue}>{analytics.priceAppreciation}</span>
            <span className={styles.metricLabel}>{isEn ? 'Annual Appreciation' : 'Річний приріст'}</span>
          </div>
        </div>
      </section>

      {/* 2. AREA INSIGHTS - Semantic article for Wiki-style ranking */}
      <section className={baseStyles.section}>
        <h2 className={baseStyles.sectionTitle}>{isEn ? `Living in ${areaInfo.name}` : `Життя в ${areaInfo.name}`}</h2>
        <div className={styles.insightBox}>
          <p>{areaInfo.description}</p>
          <div className={styles.analyticsGrid}>
            <div className={styles.metricCard}>
               <span className={styles.metricValue}>{areaInfo.stats.schools}+</span>
               <span className={styles.metricLabel}>{isEn ? 'Schools' : 'Школи'}</span>
            </div>
            <div className={styles.metricCard}>
               <span className={styles.metricValue}>{areaInfo.stats.hospitals}+</span>
               <span className={styles.metricLabel}>{isEn ? 'Hospitals' : 'Лікарні'}</span>
            </div>
            <div className={styles.metricCard}>
               <span className={styles.metricValue}>{areaInfo.stats.entertainment}+</span>
               <span className={styles.metricLabel}>{isEn ? 'Leisure Spots' : 'Місця відпочинку'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DEVELOPER TRUST - Dynamic Portfolio Insight */}
      <section className={styles.developerDeepDive}>
        <div className={styles.devLogo}>
           <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0b1a31', fontWeight: 'bold' }}>
             LOGO
           </div>
        </div>
        <div>
           <h3>{isEn ? 'About the Developer' : 'Про забудовника'}</h3>
           <p style={{ marginTop: '10px', opacity: 0.9 }}>
             {isEn 
               ? `Successfully delivered ${developerStats.completedProjects} projects in Dubai with a trust score of ${developerStats.trustScore}.`
               : `Успішно реалізовано ${developerStats.completedProjects} проектів у Дубаї з показником довіри ${developerStats.trustScore}.`}
           </p>
           <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
              <div><strong>{developerStats.completedProjects}</strong> {isEn ? 'Delivered' : 'Здано'}</div>
              <div><strong>{developerStats.ongoingProjects}</strong> {isEn ? 'Under Const.' : 'Будується'}</div>
           </div>
        </div>
      </section>

      {/* 4. OUR ADVANTAGE (FOR YOU REAL ESTATE) - Personalization */}
      <section className={styles.advantageSection}>
        <h2 className={baseStyles.sectionTitle}>{isEn ? 'Why Buy With Us?' : 'Чому купувати з нами?'}</h2>
        <div className={styles.advantageGrid}>
           <div className={styles.advantageItem}>
              <div className={styles.advantageIcon}>🛡️</div>
              <h4>{isEn ? 'Professional Advisory' : 'Професійна консультація'}</h4>
              <p>{isEn ? 'We provide unbiased advice based on 10+ years of Dubai market data.' : 'Надаємо об\'єктивні поради на основі 10-річних даних ринку Дубаю.'}</p>
           </div>
           <div className={styles.advantageItem}>
              <div className={styles.advantageIcon}>🔑</div>
              <h4>{isEn ? 'End-to-End Service' : 'Повний супровід'}</h4>
              <p>{isEn ? 'From Golden Visa assistance to property management after handover.' : 'Від допомоги з Золотою Візою до управління нерухомістю після здачі.'}</p>
           </div>
           <div className={styles.advantageItem}>
              <div className={styles.advantageIcon}>💎</div>
              <h4>{isEn ? 'Exclusive Access' : 'Ексклюзивний доступ'}</h4>
              <p>{isEn ? 'Get pre-launch offers and units not available on the open market.' : 'Отримайте спеціальні умови до офіційного старту продажів.'}</p>
           </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className={baseStyles.section} style={{ textAlign: 'center' }}>
         <h3>{isEn ? 'Get the Full Market Report' : 'Отримайте повний звіт ринку'}</h3>
         <p style={{ margin: '20px 0' }}>Request a detailed analytical PDF for {project.name}</p>
         <button style={{ background: '#0b1a31', color: '#fff', padding: '15px 40px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            DOWNLOAD ANALYTICS
         </button>
      </section>

    </div>
  );
}
