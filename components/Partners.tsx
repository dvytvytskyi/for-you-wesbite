'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import styles from './Partners.module.css';

// Banks and financial institutions from foryou-cb.com/about with logos
const banks = [
  {
    name: 'TBC BANK',
    logo: 'https://static.tildacdn.com/tild3536-6263-4862-a136-393839396365/tbc.png',
    alt: 'TBC BANK'
  },
  {
    name: 'SOVCOMBANK WEALTH MANAGEMENT',
    logo: 'https://static.tildacdn.com/tild6332-6237-4237-b534-396137623233/Group_1597880355.png',
    alt: 'SOVCOMBANK WEALTH MANAGEMENT'
  },
  {
    name: 'CENTERCREDIT',
    logo: 'https://static.tildacdn.com/tild3134-3762-4138-b037-326633656431/image_2.png',
    alt: 'CENTERCREDIT'
  },
  {
    name: 'Уралсиб',
    logo: 'https://static.tildacdn.com/tild6361-6530-4031-b237-616634306338/image_4.png',
    alt: 'Уралсиб'
  },
  {
    name: 'FREEDOM BANK PRIO',
    logo: 'https://static.tildacdn.com/tild6261-6465-4966-b733-333364393637/image_5.png',
    alt: 'FREEDOM BANK PRIO'
  },
  {
    name: 'center home',
    logo: 'https://static.tildacdn.com/tild3637-6466-4433-a331-353137353864/Clip_path_group.svg',
    alt: 'center home'
  },
  {
    name: 'СБЕР',
    logo: 'https://static.tildacdn.com/tild3863-6130-4135-b138-653236663639/Clip_path_group.svg',
    alt: 'СБЕР'
  },
  {
    name: 'А Клуб',
    logo: 'https://static.tildacdn.com/tild6435-3537-4064-a337-353763663232/Clip_path_group.svg',
    alt: 'А Клуб'
  },
  {
    name: 'МТС БАНК',
    logo: 'https://static.tildacdn.com/tild6439-3131-4264-a239-656336656331/image_1808.png',
    alt: 'МТС БАНК'
  },
  {
    name: 'Raiffeisen BANK',
    logo: 'https://static.tildacdn.com/tild3363-3334-4431-b337-313037376138/image_6.png',
    alt: 'Raiffeisen BANK'
  },
  {
    name: 'AT',
    logo: 'https://static.tildacdn.com/tild6536-6166-4731-a137-316139653139/Group_1597880269-rem.png',
    alt: 'AT'
  },
  {
    name: 'Береке',
    logo: 'https://static.tildacdn.com/tild3832-3534-4633-a332-353330333064/bereke.png',
    alt: 'Береке'
  }
];

export default function Partners() {
  const t = useTranslations('aboutUs');

  return (
    <div className={styles.partnersSection}>
      <div className={styles.partnersContainer}>
        <h2 className={styles.partnersTitle}>{t('partnersTitle')}</h2>
        <div className={styles.partnersScroll}>
          <div className={styles.partnersList}>
            {/* First set of partners */}
            {banks.map((bank, index) => (
              <div key={`partner-${index}`} className={styles.partnerLogo}>
                <Image
                  src={bank.logo}
                  alt={bank.alt}
                  width={200}
                  height={80}
                  style={{ objectFit: 'contain', maxHeight: '80px', width: 'auto' }}
                  unoptimized
                />
              </div>
            ))}
            {/* Duplicate for seamless infinite loop */}
            {banks.map((bank, index) => (
              <div key={`partner-duplicate-${index}`} className={styles.partnerLogo}>
                <Image
                  src={bank.logo}
                  alt={bank.alt}
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
  );
}

