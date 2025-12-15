'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Header from '@/components/Header';
import MapboxMap from '@/components/MapboxMap';
import { getProperties, Property as ApiProperty } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import styles from './page.module.css';

// Convert API Property to MapboxMap Property format
function convertPropertyToMapFormat(property: ApiProperty, locale: string): any {
  // Get location
  const getLocation = () => {
    if (typeof property.area === 'string') {
      // Off-plan: area is "areaName, cityName"
      const parts = property.area.split(',').map(p => p.trim());
      return {
        area: parts[0] || '',
        areaRu: parts[0] || '',
        city: parts[1] || (property.city?.nameEn || ''),
        cityRu: parts[1] || (property.city?.nameRu || ''),
      };
    } else if (property.area) {
      // Secondary: area is an object
      return {
        area: property.area.nameEn,
        areaRu: property.area.nameRu,
        city: property.city?.nameEn || '',
        cityRu: property.city?.nameRu || '',
      };
    } else {
      // Area is null
      return {
        area: '',
        areaRu: '',
        city: property.city?.nameEn || '',
        cityRu: property.city?.nameRu || '',
      };
    }
  };

  const location = getLocation();

  // Get price - always use AED, return 0 if price is null or 0
  const getPrice = () => {
    if (property.propertyType === 'off-plan') {
      const priceAED = (property.priceFromAED && property.priceFromAED > 0) ? property.priceFromAED : 0;
      const priceUSD = (property.priceFrom && property.priceFrom > 0) ? property.priceFrom : 0;
      return {
        usd: priceUSD,
        aed: priceAED,
        eur: priceUSD > 0 ? Math.round(priceUSD * 0.92) : 0, // Approximate EUR conversion
      };
    } else {
      const priceAED = (property.priceAED && property.priceAED > 0) ? property.priceAED : 0;
      const priceUSD = (property.price && property.price > 0) ? property.price : 0;
      return {
        usd: priceUSD,
        aed: priceAED,
        eur: priceUSD > 0 ? Math.round(priceUSD * 0.92) : 0,
      };
    }
  };

  // Get bedrooms/bathrooms
  const getBedrooms = () => {
    if (property.propertyType === 'off-plan') {
      return property.bedroomsFrom || 0;
    }
    return property.bedrooms || 0;
  };

  const getBathrooms = () => {
    if (property.propertyType === 'off-plan') {
      // For off-plan properties, bathroomsFrom/To are always null
      return 0;
    }
    return property.bathrooms || 0;
  };

  // Get size
  const getSize = () => {
    if (property.propertyType === 'off-plan') {
      return {
        sqm: property.sizeFrom || 0,
        sqft: property.sizeFromSqft || (property.sizeFrom ? property.sizeFrom * 10.764 : 0),
      };
    } else {
      return {
        sqm: property.size || 0,
        sqft: property.sizeSqft || (property.size ? property.size * 10.764 : 0),
      };
    }
  };

  // Get units for off-plan
  const getUnits = () => {
    if (property.propertyType === 'off-plan' && property.units) {
      return property.units.map(unit => ({
        bedrooms: property.bedroomsFrom || 0,
        bathrooms: 0, // For off-plan, bathrooms are always null
        size: {
          sqm: unit.totalSize,
          sqft: unit.totalSizeSqft || (unit.totalSize * 10.764), // Convert if not provided
        },
        price: {
          aed: unit.priceAED || (unit.price * 3.673), // Convert if not provided
        },
      }));
    }
    return undefined;
  };

  // Convert facilities to amenities
  const amenities = property.facilities.map(f => 
    locale === 'ru' ? f.nameRu : f.nameEn
  );

  // Validate and convert coordinates (handle both number and string formats)
  let lng: number | null = null;
  let lat: number | null = null;

  if (property.longitude !== null && property.longitude !== undefined) {
    if (typeof property.longitude === 'string') {
      lng = parseFloat(property.longitude);
    } else if (typeof property.longitude === 'number') {
      lng = property.longitude;
    }
  }

  if (property.latitude !== null && property.latitude !== undefined) {
    if (typeof property.latitude === 'string') {
      lat = parseFloat(property.latitude);
    } else if (typeof property.latitude === 'number') {
      lat = property.latitude;
    }
  }

  // Skip if coordinates are invalid
  if (lng === null || lat === null || isNaN(lng) || isNaN(lat) || lng === 0 || lat === 0) {
    return null;
  }

  // Validate coordinate ranges (Dubai area approximately: lng 54-56, lat 24-26)
  if (lng < 50 || lng > 60 || lat < 20 || lat > 30) {
    return null;
  }

  return {
    id: property.id,
    name: property.name,
    nameRu: property.name, // API doesn't have separate nameRu, using name
    location,
    price: getPrice(),
    developer: {
      name: property.developer?.name || '',
      nameRu: property.developer?.name || '',
    },
    bedrooms: getBedrooms(),
    bathrooms: getBathrooms(),
    size: getSize(),
    images: property.photos || [],
    type: property.propertyType === 'off-plan' ? 'new' : 'secondary',
    coordinates: [lng, lat] as [number, number], // [lng, lat]
    amenities,
    units: getUnits(),
    description: property.description,
    descriptionRu: property.description,
  };
}

export default function MapPage() {
  const locale = useLocale();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load only off-plan properties for map
        // For map, we need all off-plan properties, so request a large limit
        const result = await getProperties({ propertyType: 'off-plan', limit: 1000 });
        const apiProperties = result.properties || [];
        
        if (process.env.NODE_ENV === 'development') {
          }
        
        // Convert to map format and filter out invalid ones
        const mapProperties = apiProperties
          .map(p => convertPropertyToMapFormat(p, locale))
          .filter((p): p is NonNullable<typeof p> => p !== null);

        setProperties(mapProperties);
        setIsInitialLoad(false);
        
        if (process.env.NODE_ENV === 'development') {
          }
      } catch (err: any) {
        setError(err.message || 'Failed to load properties');
        setIsInitialLoad(false);
      } finally {
        setLoading(false);
      }
    };

    // Load properties asynchronously - don't block map rendering
    loadProperties();
  }, [locale]);

  return (
    <div className={styles.mapPageContainer}>
      <Header />
      <div className={styles.mapPage}>
        {/* Show loading indicator only while loading properties, not blocking map */}
        {isInitialLoad && (
          <div style={{ 
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: 'rgba(0, 48, 119, 0.9)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            pointerEvents: 'none'
          }}>
            Loading properties...
          </div>
        )}
        {error && (
          <div style={{ 
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: 'rgba(220, 38, 38, 0.9)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            pointerEvents: 'none'
          }}>
            Error: {error}
          </div>
        )}
        <MapboxMap properties={properties} />
      </div>
    </div>
  );
}

