'use client';

import React from 'react';
import styles from './LuxuryUnitLanding.module.css';
import Image from 'next/image';

interface LuxuryUnitProps {
  unit: {
    projectName: string;
    type: string;
    price: string;
    totalSize: string;
    planImage: string | null;
    view: string;
    exposure: string;
    lifestyleHighlights: string[];
    investmentData: { yield: string; growth: string };
  };
  locale: string;
}

export default function LuxuryUnitLanding({ unit, locale }: LuxuryUnitProps) {
  const isRu = locale === 'ru';
  
  return (
    <div className={styles.luxuryBody}>
      
      {/* 1. FLOATING NAV - Premium Bar */}
      <nav className={styles.floatingNav}>
         <div className={styles.navBrand}>{unit.projectName}</div>
         <div className={styles.navMetrics}>
            <div className={styles.metItem}><span>{isRu ? 'ОТ' : 'FROM'}</span> <strong>{unit.price} AED</strong></div>
            <div className={styles.metItem}><span>{isRu ? 'ПЛОЩАДЬ' : 'AREA'}</span> <strong>{unit.totalSize}</strong></div>
         </div>
         <button className={styles.reserveBtn}>{isRu ? 'ЗАБРОНИРОВАТЬ' : 'SECURE UNIT'}</button>
      </nav>

      {/* 2. THE CANVAS - Centered Floor Plan */}
      <section className={styles.canvasSection}>
         <div className={styles.canvasHeader}>
            <h1>{unit.type}</h1>
            <p className={styles.subtitle}>{isRu ? 'Архитектурное совершенство в каждой детали' : 'Architectural Excellence in Every Detail'}</p>
         </div>
         
         <div className={styles.mainCanvas}>
            <div className={styles.planHolder}>
               {unit.planImage ? (
                 <Image src={unit.planImage} alt="Luxury floor plan" fill style={{ objectFit: 'contain' }} />
               ) : (
                 <div className={styles.placeholder}>Plan Illustration TBA</div>
               )}
            </div>
            
            {/* Overlay Specs */}
            <div className={`${styles.specTag} ${styles.topRight}`}>
               <h5>{isRu ? 'ОРИЕНТАЦИЯ' : 'EXPOSURE'}</h5>
               <p>{unit.exposure}</p>
            </div>
            <div className={`${styles.specTag} ${styles.bottomLeft}`}>
               <h5>{isRu ? 'ВИД' : 'ORIENTATION'}</h5>
               <p>{unit.view}</p>
            </div>
         </div>
      </section>

      {/* 3. LIFESTYLE & VIBE - Emotional Content */}
      <section className={styles.lifestyleSection}>
         <div className={styles.contentWrapper}>
            <div className={styles.textSide}>
               <h2>{isRu ? 'Жить в стиле For You' : 'Living the For You Lifestyle'}</h2>
               <p className={styles.description}>
                 {isRu 
                   ? 'Это не просто квадратные метры. Это пространство, спроектированное для тех, кто ценит тишину, свет и приватность. Панорамное остекление наполняет каждый угол естественным светом Дубая.' 
                   : 'More than just square footage. This is a sanctuary designed for those who appreciate silence, light, and privacy. Floor-to-ceiling glass fills every corner with Dubai’s natural radiance.'}
               </p>
               <div className={styles.highlightGrid}>
                  {unit.lifestyleHighlights.map((h, i) => (
                    <div key={i} className={styles.highlightCard}>
                       <span className={styles.icon}>✨</span>
                       <p>{h}</p>
                    </div>
                  ))}
               </div>
            </div>
            <div className={styles.statsSide}>
               <div className={styles.luxuryStat}>
                  <strong>{unit.investmentData.yield}</strong>
                  <label>{isRu ? 'РЕНТНАЯ ДОХОДНОСТЬ' : 'RENTAL YIELD'}</label>
               </div>
               <div className={styles.luxuryStat}>
                  <strong>{unit.investmentData.growth}</strong>
                  <label>{isRu ? 'ПРОГНОЗ РОСТА' : 'GROWTH FORECAST'}</label>
               </div>
            </div>
         </div>
      </section>

      {/* 4. FAST CTA */}
      <footer className={styles.luxuryFooter}>
         <p>{isRu ? 'Готовы узнать больше об этом предложении?' : 'Ready to explore this exclusive opportunity?'}</p>
         <div className={styles.buttonGroup}>
            <button className={styles.whatsappBtn}>WHATSAPP</button>
            <button className={styles.callBtn}>{isRu ? 'ПОЗВОНИТЬ' : 'CALL AGENT'}</button>
         </div>
      </footer>

    </div>
  );
}
