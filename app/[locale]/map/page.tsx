import Header from '@/components/Header';
import MapboxMap from '@/components/MapboxMap';
import styles from './page.module.css';

// Mock properties with full data for testing
const mockProperties = [
  {
    id: '1',
    name: 'Ultra Premium Luxury Residential Complex with World-Class Amenities and Panoramic Views in the Heart of Downtown Dubai',
    nameRu: 'Ультра премиум роскошный жилой комплекс с удобствами мирового класса и панорамными видами в центре Даунтаун Дубай',
    location: {
      area: 'Downtown Dubai',
      areaRu: 'Даунтаун Дубай',
      city: 'Dubai',
      cityRu: 'Дубай',
    },
    price: {
      usd: 500000,
      aed: 1836500,
      eur: 460000,
    },
    developer: {
      name: 'Emaar',
      nameRu: 'Эмаар',
    },
    bedrooms: 2,
    bathrooms: 2,
    size: {
      sqm: 120,
      sqft: 1292,
    },
    images: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop',
    ],
    type: 'new' as const,
    coordinates: [55.2708, 25.2048] as [number, number],
    amenities: [
      'Swimming Pool',
      'Gym',
      'Parking',
      'Security',
      'Concierge Service',
      'Rooftop Garden',
      'Kids Playground',
      'Tennis Court',
      'Basketball Court',
      'Spa & Wellness Center',
      'Business Center',
      'Library',
      'Cinema Room',
      'BBQ Area',
      'Indoor Games Room',
      'Yoga Studio',
      'Running Track',
      'Pet Park',
      'Electric Car Charging',
      'Private Beach Access',
    ],
    units: [
      { bedrooms: 2, bathrooms: 2, size: { sqm: 120, sqft: 1292 }, price: { aed: 1836500 } },
      { bedrooms: 3, bathrooms: 2, size: { sqm: 150, sqft: 1615 }, price: { aed: 2200000 } },
    ],
    description: 'Luxury apartment in the heart of Downtown Dubai with stunning views and modern amenities. This exceptional property offers spacious living areas with floor-to-ceiling windows providing panoramic views of the city skyline. The building features state-of-the-art facilities including a fully equipped gym, infinity pool, and 24/7 concierge service. Located within walking distance of world-class shopping, dining, and entertainment venues. The apartment comes with premium finishes, high-end appliances, and smart home technology. Perfect for investors seeking a premium lifestyle in one of Dubai\'s most prestigious neighborhoods. The development offers excellent connectivity with easy access to major highways and public transportation.',
    descriptionRu: 'Роскошная квартира в центре Даунтаун Дубай с потрясающими видами и современными удобствами. Эта исключительная недвижимость предлагает просторные жилые зоны с окнами от пола до потолка, обеспечивающими панорамный вид на городской пейзаж. В здании есть современные удобства, включая полностью оборудованный тренажерный зал, бассейн с бесконечным краем и круглосуточный консьерж-сервис. Расположена в нескольких минутах ходьбы от магазинов мирового класса, ресторанов и развлекательных заведений. Квартира оснащена премиальной отделкой, техникой высокого класса и технологией умного дома. Идеально подходит для инвесторов, ищущих премиальный образ жизни в одном из самых престижных районов Дубая.',
  },
  {
    id: '2',
    name: 'Modern Villa in Palm Jumeirah',
    nameRu: 'Современная вилла на Пальм Джумейра',
    location: {
      area: 'Palm Jumeirah',
      areaRu: 'Пальм Джумейра',
      city: 'Dubai',
      cityRu: 'Дубай',
    },
    price: {
      usd: 1200000,
      aed: 4407600,
      eur: 1104000,
    },
    developer: {
      name: 'Damac',
      nameRu: 'Дамак',
    },
    bedrooms: 4,
    bathrooms: 3,
    size: {
      sqm: 250,
      sqft: 2691,
    },
    images: [
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop',
    ],
    type: 'secondary' as const,
    coordinates: [55.1378, 25.1128] as [number, number],
    amenities: [
      'Beach Access',
      'Private Pool',
      'Garden',
      'Swimming Pool',
      'Gym',
      'Parking',
      'Security',
      'Concierge Service',
      'Rooftop Garden',
      'Kids Playground',
      'Tennis Court',
      'Basketball Court',
      'Spa & Wellness Center',
      'Business Center',
      'Library',
      'Cinema Room',
      'BBQ Area',
      'Indoor Games Room',
      'Yoga Studio',
      'Running Track',
      'Pet Park',
      'Electric Car Charging',
      'Private Beach Access',
      'Marina Access',
      'Helipad',
    ],
    description: 'Modern villa with direct beach access on Palm Jumeirah. This stunning beachfront property offers unparalleled luxury living with private beach access and breathtaking views of the Arabian Gulf. The villa features contemporary architecture with spacious interiors, multiple terraces, and a private pool. The property includes a private garden, ample parking space, and direct access to the beach. The interior is designed with premium materials and finishes, featuring an open-plan living area, modern kitchen with high-end appliances, and multiple en-suite bedrooms. The location provides exclusive access to world-class amenities including private beach clubs, fine dining restaurants, and luxury shopping destinations. Perfect for those seeking privacy, luxury, and the ultimate beachfront lifestyle in one of Dubai\'s most iconic locations.',
    descriptionRu: 'Современная вилла с прямым доступом к пляжу на Пальм Джумейра. Эта потрясающая прибрежная недвижимость предлагает непревзойденную роскошную жизнь с частным доступом к пляжу и захватывающими видами на Аравийский залив. Вилла отличается современной архитектурой с просторными интерьерами, множественными террасами и частным бассейном. В собственности есть частный сад, просторная парковка и прямой доступ к пляжу. Интерьер оформлен премиальными материалами и отделкой, включает открытую гостиную, современную кухню с техникой высокого класса и несколько спален с индивидуальными ванными комнатами. Расположение обеспечивает эксклюзивный доступ к удобствам мирового класса, включая частные пляжные клубы, рестораны высокой кухни и роскошные торговые центры.',
  },
];

export default function MapPage() {
  return (
    <div className={styles.mapPageContainer}>
      <Header />
      <div className={styles.mapPage}>
        <MapboxMap properties={mockProperties} />
      </div>
    </div>
  );
}

