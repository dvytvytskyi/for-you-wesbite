import React from 'react';
import ProjectLanding from '@/components/landing/ProjectLanding';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params: { locale, slug } }: any) {
  const isEn = locale !== 'ru';
  const title = isEn ? `Exclusive Investment | ${slug.toUpperCase()} Dubai` : `Ексклюзивна інвестиція | ${slug.toUpperCase()} Дубай`;
  const description = isEn 
    ? `Market-first pricing, detailed floor plans, and expert ROI analysis for ${slug} on Palm Jumeirah. Direct from developer.`
    : `Прайс-листи, детальні плани та аналіз окупності для ${slug} на Пальм Джумейра. Напряму від забудовника.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://foryou-realestate.com/${locale}/landing/${slug}`,
    },
    keywords: [`${slug} Dubai`, `${slug} ROI`, `Palm Jumeirah apartments`, `Buy property in Dubai`],
  };
}

export default async function ProjectLandingPage({ params: { locale, slug } }: any) {
  
  const isEn = locale !== 'ru';

  const mockProject = {
    name: 'Serenia Living on Palm Jumeirah',
    location: 'Palm Jumeirah East Crescent',
    priceFrom: '4,200,000',
    status: isEn ? 'Off-plan Excellence' : 'Ексклюзивний Off-plan',
    about: isEn 
      ? '<h4>Architectural Masterpiece of Modern Dubai</h4><p>Serenia Living is not just a residence; it is a profound statement of luxury. Nestled on the most sought-after plot of the Palm Jumeirah, this project redefined waterfront living. Every apartment features floor-to-ceiling windows, Italian marble flooring, and smart home systems that synchronize with your lifestyle. Experience the quiet confidence of the worlds most prestigious address.</p>'
      : '<h4>Архітектурний шедевр сучасного Дубаю</h4><p>Serenia Living — це не просто резиденція, це маніфест розкоші. Розташований на найбажанішій ділянці Пальм Джумейра, цей проект переосмислює життя біля води. Кожна квартира має панорамні вікна, підлогу з італійського мармуру та системи "розумний дім", які синхронізуються з вашим способом життя.</p>',
    images: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200',
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=800',
      'https://images.unsplash.com/photo-1628592102751-ba83b0314276?q=80&w=600',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600'
    ],
    paymentPlan: [
      { stage: 'At Booking', percent: '20%', details: isEn ? 'Secure your exclusive unit' : 'Забронювати юніт' },
      { stage: 'During Construction', percent: '40%', details: isEn ? 'Paid in installments over 2.5 years' : 'Розстрочка на 2.5 роки' },
      { stage: 'On Completion', percent: '40%', details: isEn ? 'Key handover in Q4 2026' : 'Отримання ключів у Q4 2026' }
    ],
    developer: {
      name: 'Select Group',
      bio: isEn 
        ? 'Select Group is one of the region’s largest privately-owned real estate development and investment companies. With a portfolio spanning the United Arab Emirates and Europe, Select Group has delivered over 7,000 residential homes and 20 million square feet of property.'
        : 'Select Group — одна з найбільших приватних інвестиційно-девелоперських компаній регіону. Портфель компанії охоплює ОАЕ та Європу. Select Group успішно здала понад 7 000 житлових об’єктів площею понад 20 мільйонів квадратних футів.',
      logo: '/icons/select-group.png',
      projectsCount: 24
    },
    area: {
      name: 'Palm Jumeirah',
      description: isEn 
        ? 'The world’s largest man-made island, Palm Jumeirah is Dubai’s true icon. Home to ultra-luxury villas and premium apartments, it offers a resort-style lifestyle with access to the world’s best beach clubs, restaurants, and retail destinations.'
        : 'Найбільший у світі штучно створений острів, Пальм Джумейра — справжня ікона Дубаю. Тут розташовані ультрарозкішні вілли та апартаменти преміум-класу, що пропонують стиль життя курорту з доступом до найкращих пляжних клубів та ресторанів світу.',
      highlights: isEn 
        ? ['Private Access to the Beach', '5-minute walk to Nakheel Mall', 'Home to Atlantis The Royal', 'Monorail connectivity']
        : ['Приватний доступ до пляжу', '5 хвилин до Nakheel Mall', 'Поруч з Atlantis The Royal', 'Власна лінія монорейки']
    },
    stats: [
      { label: isEn ? 'Price Appreciation' : 'Зростання ціни', value: '+14%', trend: '↑ Yearly' },
      { label: isEn ? 'Average ROI' : 'Середній ROI', value: '8.2%', trend: '↑ High Demand' },
      { label: isEn ? 'Rental Yield' : 'Дохід від оренди', value: '7.5%', trend: '↑ Short-term' }
    ]
  };

  if (!mockProject) {
    notFound();
  }

  return <ProjectLanding project={mockProject} locale={locale} />;
}
