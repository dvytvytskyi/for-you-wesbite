'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import styles from './CallbackModal.module.css';

interface CallbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectName?: string;
}

export default function CallbackModal({ isOpen, onClose, projectName }: CallbackModalProps) {
    const t = useTranslations('callback');
    const locale = useLocale();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setIsSuccess(false);
            setName('');
            setPhone('');
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
            }, 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {!isSuccess ? (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <h2 className={styles.title}>
                            {locale === 'ru' ? 'Заказать звонок' : 'Request Callback'}
                        </h2>
                        <p className={styles.subtitle}>
                            {projectName
                                ? (locale === 'ru' ? `Оставьте контакты по проекту ${projectName}, и наш эксперт свяжется с вами.` : `Leave your contact details for ${projectName}, and our expert will contact you.`)
                                : (locale === 'ru' ? 'Оставьте ваши контакты, и наш эксперт свяжется с вами в ближайшее время.' : 'Leave your contact details, and our expert will contact you shortly.')
                            }
                        </p>

                        <div className={styles.inputGroup}>
                            <label htmlFor="name">{locale === 'ru' ? 'Ваше имя' : 'Your Name'}</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={locale === 'ru' ? 'Введите имя' : 'Enter your name'}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="phone">{locale === 'ru' ? 'Номер телефона' : 'Phone Number'}</label>
                            <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+971 --- --- -- --"
                                required
                            />
                        </div>

                        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                            {isSubmitting
                                ? (locale === 'ru' ? 'Отправка...' : 'Sending...')
                                : (locale === 'ru' ? 'Перезвоните мне' : 'Call me back')
                            }
                        </button>

                        <p className={styles.disclaimer}>
                            {locale === 'ru'
                                ? 'Нажимая на кнопку, вы соглашаетесь с политикой конфиденциальности.'
                                : 'By clicking the button, you agree to our privacy policy.'
                            }
                        </p>
                    </form>
                ) : (
                    <div className={styles.success}>
                        <div className={styles.successIcon}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h2 className={styles.title}>{locale === 'ru' ? 'Спасибо!' : 'Thank you!'}</h2>
                        <p className={styles.subtitle}>
                            {locale === 'ru'
                                ? 'Ваша заявка принята. Мы свяжемся с вами в ближайшее время.'
                                : 'Your request has been received. We will contact you shortly.'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
