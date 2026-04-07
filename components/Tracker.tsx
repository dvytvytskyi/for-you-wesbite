'use client';

import { useEffect } from 'react';
import { initUserSession } from '@/lib/api';

export default function Tracker() {
    useEffect(() => {
        // Only run once when mounted
        const trackSession = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);

                const payload = {
                    utmSource: urlParams.get('utm_source') || undefined,
                    utmMedium: urlParams.get('utm_medium') || undefined,
                    utmCampaign: urlParams.get('utm_campaign') || undefined,
                    referrer: document.referrer || undefined,
                    locale: window.location.pathname.split('/')[1] || 'en',
                    userAgent: window.navigator.userAgent,
                };

                const result = await initUserSession(payload);

                if (result && result.referenceId) {
                    // Store reference ID in localStorage for frontend utilities
                    localStorage.setItem('fyr_lead_ref', result.referenceId);

                    // Use document.cookie to set it for the backend as requested
                    // 365 days expiration
                    const date = new Date();
                    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
                    document.cookie = `referenceId=${result.referenceId}; expires=${date.toUTCString()}; path=/`;

                    // Notify CRM that this user is here
                    const { trackVisit } = await import('@/lib/api');
                    trackVisit(result.referenceId, window.location.href);
                }
            } catch (error) {
                console.error('Failed to initialize tracking:', error);
            }
        };

        trackSession();
    }, []);

    return null;
}
