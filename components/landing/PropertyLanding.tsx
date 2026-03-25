'use client';

import React from 'react';
import styles from './PropertyLanding.module.css';
import Image from 'next/image';

interface LandingProps {
  project: {
    id: string;
    name: string;
    description: string;
    location: string;
    priceFrom: string;
    developer: string;
    handover: string;
    units: Array<{ type: string; size: string; price: string }>;
    landmarks: Array<{ name: string; distance: string }>;
    paymentPlan: Array<{ stage: string; percent: string }>;
    faqs: Array<{ q: string; a: string }>;
    images: string[];
    amenities: string[];
  };
  locale: string;
}

export default function PropertyLanding({ project, locale }: LandingProps) {
  
  // JSON-LD Schema for Google Rich Snippets
  const schemaMarkup = {
    "@context": "https://schema.org/",
    "@type": "Accommodation",
    "name": project.name,
    "description": project.description,
    "address": {
        "@type": "PostalAddress",
        "addressLocality": project.location,
        "addressCountry": "AE"
    },
    "amenityFeature": project.amenities.map(a => ({ "@type": "LocationFeatureSpecification", "name": a, "value": "true" })),
    "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "AED",
        "lowPrice": project.priceFrom.replace(/[^0-9]/g, ''),
        "offerCount": project.units.length
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": project.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Internal Navigation Bar */}
      <nav className={styles.nav}>
        <a href="#overview" className={styles.navLink}>Overview</a>
        <a href="#location" className={styles.navLink}>Location</a>
        <a href="#payment-plan" className={styles.navLink}>Payment Plan</a>
        <a href="#faq" className={styles.navLink}>FAQ</a>
      </nav>

      <main className={styles.container}>
        
        {/* HERO SECTION */}
        <section className={styles.hero}>
          <h1 className={styles.h1}>
            {project.name} {locale === 'ru' ? 'в' : 'in'} {project.location}
          </h1>
          <p className={styles.heroPrice}>{locale === 'ru' ? 'Ціни від' : 'Prices from'} {project.priceFrom} AED</p>
        </section>

        {/* KEY FACTS SECTION - Semantic dl (Description List) */}
        <section id="facts" className={styles.section}>
          <div className={styles.factsGrid}>
            <div className={styles.factItem}>
               <span className={styles.factLabel}>Developer</span>
               <span className={styles.factValue}>{project.developer}</span>
            </div>
            <div className={styles.factItem}>
               <span className={styles.factLabel}>Handover</span>
               <span className={styles.factValue}>{project.handover}</span>
            </div>
            <div className={styles.factItem}>
               <span className={styles.factLabel}>Location</span>
               <span className={styles.factValue}>{project.location}</span>
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section id="gallery" className={styles.section}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {project.images.slice(0, 4).map((img, idx) => (
              <div key={idx} style={{ position: 'relative', height: '300px' }}>
                <Image src={img} alt={`${project.name} image ${idx}`} fill style={{ objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </section>

        {/* DESCRIPTION - Core SEO Content */}
        <section id="overview" className={styles.section}>
          <h2 className={styles.sectionTitle}>
             {locale === 'ru' ? `Обзор проекту ${project.name}` : `${project.name} Project Overview`}
          </h2>
          <article 
            className={styles.descriptionContent}
            dangerouslySetInnerHTML={{ __html: project.description }}
          />
        </section>

        {/* LOCATION & LANDMARKS */}
        <section id="location" className={styles.section}>
          <h2 className={styles.sectionTitle}>{locale === 'ru' ? 'Розташування' : 'Location & Landmarks'}</h2>
          <div className={styles.landmarksGrid}>
            <div>
              {/* Map Placeholder or Actual Component */}
              <div style={{ background: '#eee', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 Interactie Map Placeholder
              </div>
            </div>
            <div>
               {project.landmarks.map((l, i) => (
                 <div key={i} className={styles.landmarkItem}>
                    <span>{l.name}</span>
                    <strong>{l.distance}</strong>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* PAYMENT PLAN */}
        <section id="payment-plan" className={styles.section}>
           <h2 className={styles.sectionTitle}>{locale === 'ru' ? 'План оплат' : 'Payment Plan'}</h2>
           <table className={styles.planTable}>
             <thead>
               <tr>
                 <th>Stage</th>
                 <th>Percentage (%)</th>
               </tr>
             </thead>
             <tbody>
               {project.paymentPlan.map((p, i) => (
                 <tr key={i}>
                   <td>{p.stage}</td>
                   <td>{p.percent}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </section>

        {/* FAQ - SEO Friendly with schema markup above */}
        <section id="faq" className={styles.section}>
           <h2 className={styles.sectionTitle}>{locale === 'ru' ? 'Часті питання' : 'Frequently Asked Questions'}</h2>
           {project.faqs.map((f, i) => (
             <details key={i} className={styles.faqItem}>
                <summary className={styles.faqSummary}>{f.q}</summary>
                <div className={styles.faqContent}>{f.a}</div>
             </details>
           ))}
        </section>

        {/* LEAD GENERATION FORM */}
        <section id="contact" className={styles.section}>
           <div style={{ background: '#0b1a31', color: '#fff', padding: '60px', borderRadius: '15px', textAlign: 'center' }}>
              <h2>{locale === 'ru' ? 'Бажаєте дізнатися більше?' : 'Interested in this Project?'}</h2>
              <p>Get exclusive floor plans and full pricing details sent to your WhatsApp</p>
              <button style={{ background: '#d4a017', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '5px', marginTop: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
                 GET FULL DETAILS
              </button>
           </div>
        </section>

      </main>
    </>
  );
}
