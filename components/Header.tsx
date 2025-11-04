'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  const t = useTranslations('header');
  const locale = useLocale();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  
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

  const navItems = [
    { key: 'home', path: '/' },
    { key: 'properties', path: '/properties' },
    { key: 'map', path: '/map' },
    { key: 'areas', path: '/areas' },
    { key: 'developers', path: '/developers' },
    { key: 'aboutUs', path: '/about' },
    { key: 'news', path: '/blog' },
  ];

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
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
              className={styles.navLink}
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>
        
        <nav className={styles.authNav}>
          <button className={styles.glassButton}>{t('signIn')}</button>
          <button className={`${styles.glassButton} ${styles.register}`}>{t('register')}</button>
        </nav>
      </div>
    </header>
  );
}
