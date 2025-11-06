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
        city: parts[1] || property.city.nameEn,
        cityRu: parts[1] || property.city.nameRu,
      };
    } else {
      // Secondary: area is an object
      return {
        area: property.area.nameEn,
        areaRu: property.area.nameRu,
        city: property.city.nameEn,
        cityRu: property.city.nameRu,
      };
    }
  };

  const location = getLocation();

  // Get price
  const getPrice = () => {
    if (property.propertyType === 'off-plan') {
      const priceUSD = property.priceFrom || 0;
      const priceAED = property.priceFromAED || 0;
      return {
        usd: priceUSD,
        aed: priceAED,
        eur: Math.round(priceUSD * 0.92), // Approximate EUR conversion
      };
    } else {
      const priceUSD = property.price || 0;
      const priceAED = property.priceAED || 0;
      return {
        usd: priceUSD,
        aed: priceAED,
        eur: Math.round(priceUSD * 0.92),
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
      return property.bathroomsFrom || 0;
    }
    return property.bathrooms || 0;
  };

  // Get size
  const getSize = () => {
    if (property.propertyType === 'off-plan') {
      return {
        sqm: property.sizeFrom || 0,
        sqft: property.sizeFromSqft || 0,
      };
    } else {
      return {
        sqm: property.size || 0,
        sqft: property.sizeSqft || 0,
      };
    }
  };

  // Get units for off-plan
  const getUnits = () => {
    if (property.propertyType === 'off-plan' && property.units) {
      return property.units.map(unit => ({
        bedrooms: property.bedroomsFrom || 0,
        bathrooms: property.bathroomsFrom || 0,
        size: {
          sqm: unit.totalSize,
          sqft: unit.totalSizeSqft,
        },
        price: {
          aed: unit.priceAED,
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
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Skipping property ${property.id} - invalid coordinates:`, { 
        longitude: property.longitude, 
        latitude: property.latitude,
        parsedLng: lng,
        parsedLat: lat
      });
    }
    return null;
  }

  // Validate coordinate ranges (Dubai area approximately: lng 54-56, lat 24-26)
  if (lng < 50 || lng > 60 || lat < 20 || lat > 30) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Skipping property ${property.id} - coordinates out of Dubai range:`, { lng, lat });
    }
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load all properties (no filters)
        const apiProperties = await getProperties();
        
        // Convert to map format and filter out invalid ones
        const mapProperties = apiProperties
          .map(p => convertPropertyToMapFormat(p, locale))
          .filter((p): p is NonNullable<typeof p> => p !== null);

        setProperties(mapProperties);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Loaded ${mapProperties.length} properties with coordinates for map`);
        }
      } catch (err: any) {
        console.error('Error loading properties for map:', err);
        setError(err.message || 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [locale]);

  if (loading) {
    return (
      <div className={styles.mapPageContainer}>
        <Header />
        <div className={styles.mapPage}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: '#fff'
          }}>
            Loading map...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.mapPageContainer}>
        <Header />
        <div className={styles.mapPage}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: '#fff'
          }}>
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mapPageContainer}>
      <Header />
      <div className={styles.mapPage}>
        <MapboxMap properties={properties} />
      </div>
    </div>
  );
}

