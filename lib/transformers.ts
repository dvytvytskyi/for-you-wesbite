import { Property as ApiProperty } from '@/lib/api';

// Defined to match MapboxMap expectation
export interface MapProperty {
    id: string;
    slug: string;
    name: string;
    nameRu: string;
    location: {
        area: string;
        areaRu: string;
        city: string;
        cityRu: string;
    };
    price: {
        usd: number;
        aed: number;
        eur: number;
    };
    developer: {
        name: string;
        nameRu: string;
    };
    bedrooms: number;
    bathrooms: number;
    size: {
        sqm: number;
        sqft: number;
    };
    images: string[];
    type: 'new' | 'secondary';
    propertyType: 'off-plan' | 'secondary';
    coordinates: [number, number]; // [lng, lat]
    amenities?: string[];
    units?: Array<{
        bedrooms: number;
        bathrooms: number;
        size: { sqm: number; sqft: number };
        price: { aed: number };
    }>;
    description?: string;
    descriptionRu?: string;
    isForYouChoice?: boolean;
}

export function convertPropertyToMapFormat(property: ApiProperty, locale: string): MapProperty | null {
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
                areaRu: property.area.nameRu || property.area.nameEn || '',
                city: property.city?.nameEn || '',
                cityRu: property.city?.nameRu || property.city?.nameEn || '',
            };
        } else {
            // Area is null
            return {
                area: '',
                areaRu: '',
                city: property.city?.nameEn || '',
                cityRu: property.city?.nameRu || property.city?.nameEn || '',
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
            return property.bathroomsFrom || 0;
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
                bedrooms: parseInt(unit.bedrooms || '0', 10),
                bathrooms: 0, // Individual units might still have null/missing bathrooms in some cases
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
    const amenities = (property.facilities || []).map(f =>
        locale === 'ru' && f.nameRu ? f.nameRu : f.nameEn
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
        slug: property.slug || '',
        name: property.name,
        nameRu: property.name, // Still using name as nameRu is usually handled in component
        location,
        price: getPrice(),
        developer: {
            name: property.developer?.name || '',
            nameRu: property.developer?.name || '',
        },
        bedrooms: getBedrooms(),
        bathrooms: getBathrooms(),
        size: getSize(),
        images: (property.images && property.images.length > 0) ? property.images.map(img => img.small) : (property.photos || []),
        type: property.propertyType === 'off-plan' ? 'new' : 'secondary',
        propertyType: property.propertyType,
        coordinates: [lng, lat] as [number, number], // [lng, lat]
        amenities,
        units: getUnits(),
        description: property.description,
        descriptionRu: property.descriptionRu || property.description,
        isForYouChoice: property.isForYouChoice,
    };
}
