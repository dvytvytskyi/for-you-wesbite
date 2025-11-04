'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLanguage = (newLocale: string) => {
    const segments = pathname.split('/');
    const pathWithoutLocale = segments.slice(2).join('/') || '';
    const newPath = pathWithoutLocale ? `/${newLocale}/${pathWithoutLocale}` : `/${newLocale}`;
    router.push(newPath);
    router.refresh();
  };

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.logoSection}>
            <Link href={getLocalizedPath('/')}>
              <img src="/new logo.png" alt="Logo" />
            </Link>
            <p className={styles.tagline}>
              Finding Spaces That Inspire Modern World in Dubai
            </p>
          </div>

          <div className={styles.navigationSection}>
            <h3 className={styles.sectionTitle}>{t('navigation.title')}</h3>
            <ul className={styles.navList}>
              <li>
                <Link href={getLocalizedPath('/')}>{t('navigation.home')}</Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/properties')}>{t('navigation.properties')}</Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/map')}>{t('navigation.map')}</Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/areas')}>{t('navigation.areas')}</Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/developers')}>{t('navigation.developers')}</Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/about')}>{t('navigation.about')}</Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/blog')}>{t('navigation.news')}</Link>
              </li>
            </ul>
          </div>

          <div className={styles.legalSection}>
            <h3 className={styles.sectionTitle}>{t('legal.title')}</h3>
            <ul className={styles.navList}>
              <li>
                <Link href={getLocalizedPath('/privacy')}>{t('legal.privacy')}</Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/terms')}>{t('legal.terms')}</Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/store')}>{t('legal.store')}</Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/login')}>{t('login')}</Link>
              </li>
            </ul>
          </div>

          <div className={styles.appSection}>
            <h3 className={styles.sectionTitle}>{t('download.title')}</h3>
            <div className={styles.appLinks}>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.appStoreLink}
                aria-label={t('download.appStore')}
              >
                <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                  <rect width="120" height="40" rx="8" fill="#000000"/>
                  <path d="M20 14L28 22L20 30" stroke="white" strokeWidth="2" fill="none"/>
                  <text x="35" y="26" fill="white" fontSize="12" fontFamily="Arial">App Store</text>
                </svg>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.googlePlayLink}
                aria-label={t('download.googlePlay')}
              >
                <svg width="135" height="40" viewBox="0 0 135 40" fill="none">
                  <rect width="135" height="40" rx="8" fill="#000000"/>
                  <path d="M15 12L25 20L15 28L15 12Z" fill="#34A853"/>
                  <path d="M25 20L35 12L35 28L25 20Z" fill="#FBBC04"/>
                  <path d="M35 12L15 12L25 20L35 12Z" fill="#EA4335"/>
                  <path d="M25 20L15 28L35 28L25 20Z" fill="#4285F4"/>
                  <text x="42" y="26" fill="white" fontSize="12" fontFamily="Arial">Google Play</text>
                </svg>
              </a>
            </div>
          </div>

          <div className={styles.socialSection}>
            <h3 className={styles.sectionTitle}>{t('followUs')}</h3>
            <div className={styles.socialLinks}>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Facebook"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Instagram"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Twitter"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="LinkedIn"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
            <div className={styles.languageSwitcher}>
              <span className={styles.languageLabel}>{t('language')}:</span>
              <button
                onClick={() => switchLanguage('en')}
                className={`${styles.languageButton} ${locale === 'en' ? styles.languageButtonActive : ''}`}
              >
                EN
              </button>
              <button
                onClick={() => switchLanguage('ru')}
                className={`${styles.languageButton} ${locale === 'ru' ? styles.languageButtonActive : ''}`}
              >
                RU
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.copyright}>
          <p>{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
