'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { submitInvestment, submitInvestmentPublic, isAuthenticated } from '@/lib/api';
import { aedToUsd } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';
import styles from './InvestmentForm.module.css';

interface InvestmentFormProps {
  propertyId: string;
  propertyPriceFrom?: number; // AED
  propertyPrice?: number; // AED
  propertyType: 'off-plan' | 'secondary';
}

// Schema for registered users
const investmentSchemaRegistered = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

// Schema for non-registered users
const investmentSchemaPublic = investmentSchemaRegistered.extend({
  userEmail: z.string().email('Invalid email address'),
  userPhone: z.string().min(10, 'Phone number must be at least 10 characters'),
  userFirstName: z.string().min(1, 'First name is required'),
  userLastName: z.string().min(1, 'Last name is required'),
});

type InvestmentFormData = z.infer<typeof investmentSchemaRegistered> | z.infer<typeof investmentSchemaPublic>;

export default function InvestmentForm({ 
  propertyId, 
  propertyPriceFrom, 
  propertyPrice,
  propertyType 
}: InvestmentFormProps) {
  const t = useTranslations('investment');
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formattedAmount, setFormattedAmount] = useState<string>('');
  const authenticated = isAuthenticated();

  const schema = authenticated ? investmentSchemaRegistered : investmentSchemaPublic;
  const defaultAmount = propertyPriceFrom || propertyPrice || 0;
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: defaultAmount,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  // Initialize formatted amount
  useEffect(() => {
    if (defaultAmount > 0) {
      setFormattedAmount(formatNumber(defaultAmount));
    }
  }, [defaultAmount]);

  const onSubmit = async (data: InvestmentFormData) => {
    setLoading(true);
    setError(null);

    try {
      const amountUSD = aedToUsd(data.amount);
      const requestData = {
        propertyId,
        amount: amountUSD,
        date: new Date(data.date).toISOString(),
        notes: data.notes || undefined,
        ...(authenticated ? {} : {
          userEmail: (data as any).userEmail,
          userPhone: (data as any).userPhone,
          userFirstName: (data as any).userFirstName,
          userLastName: (data as any).userLastName,
        }),
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('Submitting investment form:', {
          propertyId,
          amountAED: data.amount,
          amountUSD,
          date: requestData.date,
          authenticated,
        });
      }

      let result;
      if (authenticated) {
        result = await submitInvestment(requestData);
      } else {
        result = await submitInvestmentPublic(requestData);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Investment submitted successfully:', result);
      }

      setSuccess(true);
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        // Optionally redirect or show success message
      }, 3000);
    } catch (err: any) {
      console.error('Error submitting investment form:', err);
      
      // Extract error message
      let errorMessage = t('submitError') || 'Failed to submit investment';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. Please check your API credentials.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Unauthorized. Please log in.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid data. Please check your input.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.success}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <h3>{t('successTitle') || 'Investment Submitted!'}</h3>
        <p>{t('successMessage') || 'Your investment request has been submitted successfully. We will contact you soon.'}</p>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.title}>{t('title') || 'Submit Investment Request'}</h3>
      <p className={styles.description}>
        {t('description') || 'Fill out the form below to submit your investment request.'}
      </p>

      {/* Agent Section */}
      <div className={styles.agentSection}>
        <div className={styles.agentAvatar}>
          <Image
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face"
            alt={t('agentName') || 'Agent'}
            fill
            style={{ objectFit: 'cover' }}
            onError={(e) => {
              // Fallback to initials if image fails
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.textContent) {
                const name = t('agentName') || 'A';
                parent.textContent = name.charAt(0).toUpperCase();
              }
            }}
          />
        </div>
        <div className={styles.agentInfo}>
          <div className={styles.agentName}>{t('agentName') || 'Contact Agent'}</div>
          <div className={styles.agentRole}>{t('agentRole') || 'Real Estate Specialist'}</div>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {!authenticated && (
          <>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label htmlFor="userFirstName" className={styles.label}>
                  {t('firstName') || 'First Name'}
                </label>
                <input
                  id="userFirstName"
                  type="text"
                  {...register('userFirstName')}
                  className={`${styles.input} ${errors.userFirstName ? styles.inputError : ''}`}
                  placeholder={t('firstNamePlaceholder') || 'Name'}
                />
                {errors.userFirstName && (
                  <span className={styles.errorMessage}>{errors.userFirstName.message}</span>
                )}
              </div>

              <div className={styles.formField}>
                <label htmlFor="userLastName" className={styles.label}>
                  {t('lastName') || 'Last Name'}
                </label>
                <input
                  id="userLastName"
                  type="text"
                  {...register('userLastName')}
                  className={`${styles.input} ${errors.userLastName ? styles.inputError : ''}`}
                  placeholder={t('lastNamePlaceholder') || 'Surname'}
                />
                {errors.userLastName && (
                  <span className={styles.errorMessage}>{errors.userLastName.message}</span>
                )}
              </div>
            </div>

            <div className={styles.formField}>
              <label htmlFor="userEmail" className={styles.label}>
                {t('email') || 'Email'}
              </label>
              <input
                id="userEmail"
                type="email"
                {...register('userEmail')}
                className={`${styles.input} ${errors.userEmail ? styles.inputError : ''}`}
                placeholder={t('emailPlaceholder') || 'your.email@example.com'}
              />
              {errors.userEmail && (
                <span className={styles.errorMessage}>{errors.userEmail.message}</span>
              )}
            </div>

            <div className={styles.formField}>
              <label htmlFor="userPhone" className={styles.label}>
                {t('phone') || 'Phone'}
              </label>
              <input
                id="userPhone"
                type="tel"
                {...register('userPhone')}
                className={`${styles.input} ${errors.userPhone ? styles.inputError : ''}`}
                placeholder={t('phonePlaceholder') || '+971501234567'}
              />
              {errors.userPhone && (
                <span className={styles.errorMessage}>{errors.userPhone.message}</span>
              )}
            </div>
          </>
        )}

        <div className={styles.formField}>
          <label htmlFor="amount" className={styles.label}>
            {t('amount') || 'Investment Amount'} (AED)
          </label>
          <input
            id="amount"
            type="text"
            value={formattedAmount}
            onChange={(e) => {
              // Remove all non-digit characters
              const rawValue = e.target.value.replace(/[^0-9]/g, '');
              const numValue = rawValue ? parseInt(rawValue, 10) : 0;
              
              // Format with commas
              if (rawValue) {
                setFormattedAmount(formatNumber(numValue));
              } else {
                setFormattedAmount('');
              }
              
              // Set the numeric value for form validation
              setValue('amount', numValue, { shouldValidate: true });
            }}
            className={`${styles.input} ${errors.amount ? styles.inputError : ''}`}
            placeholder={defaultAmount > 0 ? formatNumber(defaultAmount) : ''}
          />
          {errors.amount && (
            <span className={styles.errorMessage}>{errors.amount.message}</span>
          )}
        </div>

        <div className={styles.formField}>
          <label htmlFor="date" className={styles.label}>
            {t('date') || 'Investment Date'}
          </label>
          <input
            id="date"
            type="date"
            {...register('date')}
            className={`${styles.input} ${errors.date ? styles.inputError : ''}`}
          />
          {errors.date && (
            <span className={styles.errorMessage}>{errors.date.message}</span>
          )}
        </div>

        <div className={styles.formField}>
          <label htmlFor="notes" className={styles.label}>
            {t('notes') || 'Notes'} ({t('optional') || 'Optional'})
          </label>
          <textarea
            id="notes"
            {...register('notes')}
            className={`${styles.input} ${styles.textarea} ${errors.notes ? styles.inputError : ''}`}
            placeholder={t('notesPlaceholder') || 'Any additional information...'}
            rows={4}
          />
          {errors.notes && (
            <span className={styles.errorMessage}>{errors.notes.message}</span>
          )}
        </div>

        <div className={styles.termsMessage}>
          {t('termsMessage') || 'When sending, I agree to terms and conditions.'}
        </div>

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? (t('submitting') || 'Submitting...') : (t('submit') || 'Submit Investment')}
        </button>
      </form>
    </div>
  );
}

