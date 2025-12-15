'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  const t = useTranslations('header');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Перевіряємо чи ми на головній сторінці
  const isHomePage = pathname === `/${locale}` || pathname === '/';

  useEffect(() => {
    // Якщо не на головній сторінці, хедер завжди білий
    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // Закривати mobile menu при зміні сторінки
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Блокувати скрол під час відкритого mobile menu та зберігати scroll position
  useEffect(() => {
    if (isMobileMenuOpen) {
      // Зберігаємо поточну позицію скролу
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Відновлюємо скрол
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Закривати меню при натисканні ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { key: 'home', path: '/' },
    { key: 'properties', path: '/properties' },
    { key: 'map', path: '/map' },
    { key: 'areas', path: '/areas' },
    { key: 'developers', path: '/developers' },
    { key: 'aboutUs', path: '/about' },
    { key: 'news', path: '/news' },
  ];

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const switchLanguage = (newLocale: string) => {
    const segments = pathname.split('/');
    const pathWithoutLocale = segments.slice(2).join('/') || '';
    const newPath = pathWithoutLocale ? `/${newLocale}/${pathWithoutLocale}` : `/${newLocale}`;
    router.push(newPath);
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''} ${!isHomePage ? styles.alwaysWhite : ''}`}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href={getLocalizedPath('/')}>
            <img src={isScrolled || !isHomePage ? "/new logo blue.png" : "/new logo.png"} alt="Logo" />
          </Link>
        </div>
        
        <nav className={styles.mainNav}>
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={getLocalizedPath(item.path)}
              className={`${styles.navLink} ${item.key === 'developers' ? styles.hideOnMobile : ''}`}
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>
        
        <nav className={styles.authNav}>
          <Link href={getLocalizedPath('/register')} className={`${styles.glassButton} ${styles.register}`}>{t('register')}</Link>
          <div className={styles.languageSwitcher}>
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
        </nav>

        {/* Hamburger menu button for mobile */}
        <button 
          className={`${styles.hamburger} ${isMobileMenuOpen ? styles.hamburgerOpen : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div 
          className={styles.mobileMenuBackdrop}
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        {/* Close button */}
        <button 
          className={styles.mobileMenuClose}
          onClick={toggleMobileMenu}
          aria-label="Close menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M18 6L6 18M6 6L18 18" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
        
        <nav className={styles.mobileNav}>
          {navItems
            .filter((item) => item.key !== 'developers') // Приховати developers в mobile menu
            .map((item) => (
              <Link
                key={item.key}
                href={getLocalizedPath(item.path)}
                className={styles.mobileNavLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
        </nav>
        
        <div className={styles.mobileLanguageSwitcher}>
          <span className={styles.mobileLanguageLabel}>{locale === 'ru' ? 'Язык' : 'Language'}:</span>
          <div className={styles.mobileLanguageButtons}>
            <button
              onClick={() => {
                switchLanguage('en');
                setIsMobileMenuOpen(false);
              }}
              className={`${styles.mobileLanguageButton} ${locale === 'en' ? styles.mobileLanguageButtonActive : ''}`}
            >
              EN
            </button>
            <button
              onClick={() => {
                switchLanguage('ru');
                setIsMobileMenuOpen(false);
              }}
              className={`${styles.mobileLanguageButton} ${locale === 'ru' ? styles.mobileLanguageButtonActive : ''}`}
            >
              RU
            </button>
          </div>
        </div>
        
        <div className={styles.mobileAuth}>
          <Link 
            href={getLocalizedPath('/register')} 
            className={`${styles.mobileAuthButton} ${styles.mobileAuthButtonRegister}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('register')}
          </Link>
        </div>
      </div>
    </header>
  );
}
