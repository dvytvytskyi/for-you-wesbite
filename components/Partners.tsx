'use client';

import { useTranslations } from 'next-intl';
import styles from './Partners.module.css';

export default function Partners() {
  const t = useTranslations('aboutUs');

  return (
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
  );
}

