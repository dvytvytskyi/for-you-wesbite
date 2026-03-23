'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './AgentHeader.module.css';

export default function AgentHeader() {
  const t = useTranslations('header');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const getLocalizedPath = (path: string) => locale === 'en' ? path : `/${locale}${path}`;

  const switchLanguage = (newLocale: string) => {
    let path = pathname;
    if (path.startsWith(`/${locale}/`) || path === `/${locale}`) {
      path = path.replace(`/${locale}`, '');
    }
    if (!path.startsWith('/')) path = `/${path}`;
    router.push(`/${newLocale}${path}`);
  };

  const contactInfo = {
    phone: '+971 50 123 4567',
    whatsapp: 'https://wa.me/971501234567',
    telegram: 'https://t.me/foryourealestate'
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href={getLocalizedPath('/')}>
            <img
              src="https://res.cloudinary.com/dgv0rxd60/image/upload/f_auto,q_auto,w_400/v1768389720/new_logo_blue.png"
              alt="Logo"
              className={styles.logoImg}
            />
          </Link>
        </div>

        <div className={styles.contactContainer}>
          <div className={styles.phoneNumber}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
          </div>

          <div className={styles.socialButtons}>
            <a href={contactInfo.whatsapp} target="_blank" rel="noopener noreferrer" className={`${styles.socialBtn} ${styles.whatsapp}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              <span>WhatsApp</span>
            </a>
            <a href={contactInfo.telegram} target="_blank" rel="noopener noreferrer" className={`${styles.socialBtn} ${styles.telegram}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.89.03-.25.38-.51 1.07-.78 4.2-1.82 7-3.03 8.39-3.62 3.96-1.68 4.79-1.97 5.33-1.98.12 0 .38.03.55.17.14.12.18.28.2.43.01.12.02.26.01.4z"/></svg>
              <span>Telegram</span>
            </a>
          </div>

          <div className={styles.languageSwitcher}>
            <button onClick={() => switchLanguage('en')} className={`${styles.langBtn} ${locale === 'en' ? styles.active : ''}`}>EN</button>
            <button onClick={() => switchLanguage('ru')} className={`${styles.langBtn} ${locale === 'ru' ? styles.active : ''}`}>RU</button>
          </div>
        </div>
      </div>
    </header>
  );
}
