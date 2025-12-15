import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.foryou-realestate.com/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'fyr_8f968d115244e76d209a26f5177c5c998aca0e8dbce4a6e9071b2bc43b78f6d2';
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET || '5c8335f9c7e476cbe77454fd32532cc68f57baf86f7f96e6bafcf682f98b275bc579d73484cf5bada7f4cd7d071b122778b71f414fb96b741c5fe60394d1795f';

// API configuration logging removed for performance

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add authentication headers to requests
apiClient.interceptors.request.use(
  (config) => {
    // Always add API key and secret
    config.headers['Content-Type'] = 'application/json';
    
    // Ensure API key and secret are set
    if (!API_KEY || !API_SECRET) {
      // API keys validation - errors handled silently for performance
    }
    
    config.headers['X-Api-Key'] = API_KEY;
    config.headers['X-Api-Secret'] = API_SECRET;
    
    // Add JWT token if available (for authenticated users)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Debug logging removed for performance
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Error logging removed for performance
      
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          // Optionally redirect to login
          // window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// Properties API
export interface PropertyFilters {
  propertyType?: 'off-plan' | 'secondary';
  developerId?: string;
  cityId?: string;
  areaId?: string;
  areaIds?: string[]; // For client-side filtering with multiple areas
  bedrooms?: string; // Comma-separated: "1,2,3"
  sizeFrom?: number;
  sizeTo?: number;
  priceFrom?: number | string; // USD (can be number or string from URL params)
  priceTo?: number | string; // USD (can be number or string from URL params)
  search?: string;
  sortBy?: 'createdAt' | 'name' | 'price' | 'priceFrom' | 'size' | 'sizeFrom';
  sortOrder?: 'ASC' | 'DESC';
  page?: number; // Page number for server-side pagination
  limit?: number; // Items per page for server-side pagination
}

export interface Property {
  id: string;
  propertyType: 'off-plan' | 'secondary';
  name: string;
  description: string;
  photos: string[];
  
  // Country and city can be null for off-plan properties
  country: {
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    code: string;
  } | null;
  city: {
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
  } | null;
  
  // For off-plan properties: area is a string "areaName, cityName" (e.g., "Dubai Marina, Dubai") or null
  // For secondary properties: area is an object with full area details
  area: string | {
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    description?: {
      title?: string;
      description?: string;
    };
    infrastructure?: {
      title?: string;
      description?: string;
    };
    images?: string[];
  } | null;
  
  developer: {
    id: string;
    name: string;
    logo?: string | null;
    description?: string;
    images?: string[];
  } | null;
  latitude: number;
  longitude: number;
  
  // Off-plan fields
  priceFrom?: number | null;
  priceFromAED?: number | null;
  bedroomsFrom?: number | null;
  bedroomsTo?: number | null;
  bathroomsFrom?: number | null; // Always null for off-plan
  bathroomsTo?: number | null; // Always null for off-plan
  sizeFrom?: number | null;
  sizeFromSqft?: number | null;
  sizeTo?: number | null;
  sizeToSqft?: number | null;
  paymentPlan?: string | null;
  units?: Array<{
    id: string;
    unitId: string;
    type: 'apartment' | 'villa' | 'penthouse' | 'townhouse' | 'office';
    price: number;
    priceAED: number | null;
    totalSize: number;
    totalSizeSqft: number | null;
    balconySize: number | null;
    balconySizeSqft: number | null;
    planImage: string | null;
  }> | null;
  
  // Secondary fields (always null for off-plan)
  price?: number | null; // Always null for off-plan
  priceAED?: number | null; // Always null for off-plan
  bedrooms?: number;
  bathrooms?: number;
  size?: number | null; // Always null for off-plan
  sizeSqft?: number | null; // Always null for off-plan
  
  // Common fields
  facilities: Array<{
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    iconName: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Public Data API
export interface PublicData {
  properties?: Property[]; // Properties might be included in public data
  countries: Array<{
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    code: string;
  }>;
  cities: Array<{
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    countryId: string;
  }>;
  areas: Array<{
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    cityId: string;
  }>;
  developers: Array<{
    id: string;
    name: string;
    logo: string | null;
  }>;
  facilities: Array<{
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    iconName: string;
  }>;
}

// Investment API
export interface InvestmentRequest {
  propertyId: string;
  amount: number; // USD
  date: string; // ISO date
  notes?: string;
  // For non-registered users
  userEmail?: string;
  userPhone?: string;
  userFirstName?: string;
  userLastName?: string;
}

export interface Investment {
  id: string;
  userId: string | null;
  propertyId: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    name: string;
    propertyType: 'off-plan' | 'secondary';
    country: { id: string; nameEn: string; };
    city: { id: string; nameEn: string; };
    area: { id: string; nameEn: string; };
    developer: { id: string; name: string; };
  };
}

// API Functions

/**
 * Get properties with filters
 * Note: Since /api/properties requires JWT, we use /api/public/data and filter client-side
 */
export interface GetPropertiesResult {
  properties: Property[];
  total: number;
}

export async function getProperties(filters?: PropertyFilters, useCache: boolean = true): Promise<GetPropertiesResult> {
  try {
    // Create cache key from filters (including page and limit for server-side pagination)
    const cacheKey = JSON.stringify({
      propertyType: filters?.propertyType,
      developerId: filters?.developerId,
      cityId: filters?.cityId,
      areaId: filters?.areaId,
      bedrooms: filters?.bedrooms,
      sizeFrom: filters?.sizeFrom,
      sizeTo: filters?.sizeTo,
      priceFrom: filters?.priceFrom,
      priceTo: filters?.priceTo,
      search: filters?.search,
      sortBy: filters?.sortBy,
      sortOrder: filters?.sortOrder,
      page: filters?.page,
      limit: filters?.limit,
    });
    
    // Check cache
    if (useCache) {
      const cached = propertiesCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < PROPERTIES_CACHE_DURATION) {
        if (process.env.NODE_ENV === 'development') {
          
          
          
          
          
          // Check if cached data has old photo sources
          if (cached.result.properties.length > 0) {
            const firstProp = cached.result.properties[0];
            if (firstProp.photos && firstProp.photos.length > 0) {
              const hasAlnair = firstProp.photos.some((p: string) => p.includes('alnair'));
              const hasReelly = firstProp.photos.some((p: string) => p.includes('reelly'));
              if (hasAlnair && !hasReelly) {
                
                
                propertiesCache.delete(cacheKey);
                // Don't return cached result, fetch fresh data instead
              } else {
                return cached.result;
              }
            } else {
        return cached.result;
            }
          } else {
            return cached.result;
          }
        } else {
          return cached.result;
        }
      }
    }
    
    // First, try to get properties from /api/properties (if user is authenticated)
    const params = new URLSearchParams();
    
    if (filters?.propertyType) params.append('propertyType', filters.propertyType);
    if (filters?.developerId) params.append('developerId', filters.developerId);
    if (filters?.cityId) params.append('cityId', filters.cityId);
    if (filters?.areaId) params.append('areaId', filters.areaId);
    if (filters?.bedrooms) params.append('bedrooms', filters.bedrooms);
    if (filters?.sizeFrom) params.append('sizeFrom', filters.sizeFrom.toString());
    if (filters?.sizeTo) params.append('sizeTo', filters.sizeTo.toString());
    if (filters?.priceFrom) params.append('priceFrom', filters.priceFrom.toString());
    if (filters?.priceTo) params.append('priceTo', filters.priceTo.toString());
    if (filters?.search) params.append('search', filters.search);
    // Always include sort parameters (default to createdAt DESC if not specified)
    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'DESC';
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    
    // Use page and limit from filters if provided, otherwise default to 100 items for client-side pagination
    const frontendPage = filters?.page || 1;
    const frontendLimit = filters?.limit || 100;
    params.append('page', frontendPage.toString());
    params.append('limit', frontendLimit.toString());
    
    const url = `/properties?${params.toString()}`;
    const fullUrl = `${API_BASE_URL}${url}`;
    
    // Debug: log the sort parameters and headers
    if (process.env.NODE_ENV === 'development') {
      
      
      
      
      
      
      
      
      
      
      
      
      
      // Validate URL is properly encoded
      try {
        new URL(fullUrl);
        
      } catch (e) {
        
      }
    }
    
    // Try regular endpoint first (should work with API Key/Secret now)
    try {
      const response = await apiClient.get<ApiResponse<Property[]>>(url);
      
      if (process.env.NODE_ENV === 'development') {
        
        
        
        
        
        
        
        
        // Log FULL response structure to understand what backend returns
        
        
        if (response.data.data && typeof response.data.data === 'object') {
          
          if ('data' in response.data.data && Array.isArray(response.data.data.data)) {
            
            
            // Check photo sources in ALL properties
            const propertiesWithAlnairPhotos = response.data.data.data.filter((p: any) => 
              p.photos && Array.isArray(p.photos) && p.photos.some((photo: string) => photo && photo.includes('alnair'))
            );
            const propertiesWithReellyPhotos = response.data.data.data.filter((p: any) => 
              p.photos && Array.isArray(p.photos) && p.photos.some((photo: string) => photo && photo.includes('reelly'))
            );
            
            
            
            
            // Check bathroomsFrom/To for off-plan properties
            const offPlanProperties = response.data.data.data.filter((p: any) => p.propertyType === 'off-plan');
            const offPlanWithBathrooms = offPlanProperties.filter((p: any) => 
              p.bathroomsFrom !== null || p.bathroomsTo !== null
            );
            
            
            
            // Check priceFromAED for off-plan properties
            const offPlanWithNullPriceFromAED = offPlanProperties.filter((p: any) => 
              p.priceFrom !== null && p.priceFrom !== undefined && p.priceFrom > 0 &&
              (p.priceFromAED === null || p.priceFromAED === undefined || p.priceFromAED === 0)
            );
            
            
            // Summary removed for performance
            
            // Log first property in detail
            if (response.data.data.data.length > 0) {
              const firstProperty = response.data.data.data[0];
              
              
              
              
              
              
              if (Array.isArray(firstProperty.photos) && firstProperty.photos.length > 0) {
                
                
              }
              
              
              
              
              
              
              
              
              
              
              
              
              
            }
          }
        }
      }
      
      // Handle paginated response structure from /api/properties
      // Expected structure: { success: true, data: { data: Property[], pagination: { total, page, limit, totalPages } } }
      let data: any[] = [];
      let totalCount = 0;
      
      if (response.data.data) {
        // Check if response has pagination structure
        if (typeof response.data.data === 'object' && 'data' in response.data.data && Array.isArray(response.data.data.data)) {
          // New structure: { data: { data: Property[], pagination: { total, ... } } }
          data = response.data.data.data;
          
          // Extract total from pagination object
          if (response.data.data.pagination && typeof response.data.data.pagination.total === 'number') {
            totalCount = response.data.data.pagination.total;
          } else if (typeof response.data.data.total === 'number') {
            // Fallback: check if total is directly in data object
            totalCount = response.data.data.total;
          }
          
              if (process.env.NODE_ENV === 'development') {
            
            
            
            
            
            
          }
        } else if (Array.isArray(response.data.data)) {
          // Old structure: { data: Property[] } (direct array)
          data = response.data.data;
          totalCount = data.length;
          
        } else {
          
          
          throw new Error('Unexpected response structure from /api/properties endpoint');
        }
      }
      
      // Ensure data is always an array
      if (!Array.isArray(data)) {
        if (data === null || data === undefined) {
          data = [];
        } else {
          data = [];
        }
      }
      
      // Log RAW data from API BEFORE normalization (to see what API actually returns)
      if (process.env.NODE_ENV === 'development' && data.length > 0) {
        // Log first property with photos and first property without photos
        const propertyWithPhotos = data.find((p: any) => p.photos && Array.isArray(p.photos) && p.photos.length > 0);
        const propertyWithoutPhotos = data.find((p: any) => !p.photos || !Array.isArray(p.photos) || p.photos.length === 0);
        
      }
      
      // Normalize photos array for each property
      // API returns photos as string[] (array of URLs) or [] (empty array if no photos)
      // Ensure photos is always an array of strings
      data = data.map((property: any) => {
        // If photos is already a valid array, use it directly
        if (Array.isArray(property.photos)) {
          // Filter out empty strings, null, or undefined from photos array
          property.photos = property.photos.filter((photo: any) => {
            return photo && typeof photo === 'string' && photo.trim().length > 0;
          });
          // Return early - photos is already properly formatted
          return property;
        }
        
        // If photos is missing or not an array, try to normalize it
        if (!property.photos) {
          // Check for alternative photo fields
          if (property.image && typeof property.image === 'string' && property.image.trim().length > 0) {
            property.photos = [property.image];
          } else if (property.imageUrl && typeof property.imageUrl === 'string' && property.imageUrl.trim().length > 0) {
            property.photos = [property.imageUrl];
          } else if (property.gallery && Array.isArray(property.gallery) && property.gallery.length > 0) {
            property.photos = property.gallery.filter((photo: any) => photo && typeof photo === 'string' && photo.trim().length > 0);
          } else if (property.images && Array.isArray(property.images) && property.images.length > 0) {
            property.photos = property.images.filter((photo: any) => photo && typeof photo === 'string' && photo.trim().length > 0);
          } else {
            property.photos = [];
          }
        } else if (typeof property.photos === 'string') {
          // If it's a string, try to parse it as JSON or use it as single photo
          try {
            const parsed = JSON.parse(property.photos);
            property.photos = Array.isArray(parsed) ? parsed : [property.photos];
          } catch {
            property.photos = [property.photos];
          }
          // Filter out empty strings
          property.photos = property.photos.filter((photo: any) => {
            return photo && typeof photo === 'string' && photo.trim().length > 0;
          });
        } else {
          // Unknown format, set to empty array
          property.photos = [];
        }
        
        // Normalize numeric fields - ensure they are numbers, not strings
        // This is important because API might return strings
        if (property.bedroomsFrom !== null && property.bedroomsFrom !== undefined) {
          property.bedroomsFrom = typeof property.bedroomsFrom === 'string' ? parseInt(property.bedroomsFrom, 10) : property.bedroomsFrom;
        }
        if (property.bedroomsTo !== null && property.bedroomsTo !== undefined) {
          property.bedroomsTo = typeof property.bedroomsTo === 'string' ? parseInt(property.bedroomsTo, 10) : property.bedroomsTo;
        }
        if (property.sizeFrom !== null && property.sizeFrom !== undefined) {
          property.sizeFrom = typeof property.sizeFrom === 'string' ? parseFloat(property.sizeFrom) : property.sizeFrom;
        }
        if (property.sizeTo !== null && property.sizeTo !== undefined) {
          property.sizeTo = typeof property.sizeTo === 'string' ? parseFloat(property.sizeTo) : property.sizeTo;
        }
        if (property.sizeFromSqft !== null && property.sizeFromSqft !== undefined) {
          property.sizeFromSqft = typeof property.sizeFromSqft === 'string' ? parseFloat(property.sizeFromSqft) : property.sizeFromSqft;
        }
        if (property.sizeToSqft !== null && property.sizeToSqft !== undefined) {
          property.sizeToSqft = typeof property.sizeToSqft === 'string' ? parseFloat(property.sizeToSqft) : property.sizeToSqft;
        }
        if (property.priceFrom !== null && property.priceFrom !== undefined) {
          property.priceFrom = typeof property.priceFrom === 'string' ? parseFloat(property.priceFrom) : property.priceFrom;
        }
        if (property.priceFromAED !== null && property.priceFromAED !== undefined) {
          property.priceFromAED = typeof property.priceFromAED === 'string' ? parseFloat(property.priceFromAED) : property.priceFromAED;
        }
        
        // Calculate priceFromAED if missing but priceFrom exists (USD to AED conversion: 1 USD = 3.673 AED)
        if (property.propertyType === 'off-plan') {
          if ((property.priceFromAED === null || property.priceFromAED === undefined || property.priceFromAED === 0) && 
              property.priceFrom !== null && property.priceFrom !== undefined && property.priceFrom > 0) {
            property.priceFromAED = Math.round(property.priceFrom * 3.673);
          }
          
          // For off-plan properties, bathroomsFrom/To should always be null according to new schema
          // If API returns values, set them to null
          if (property.bathroomsFrom !== null || property.bathroomsTo !== null) {
            property.bathroomsFrom = null;
            property.bathroomsTo = null;
          }
          
          // Calculate sizeFromSqft/sizeToSqft if missing but sizeFrom/sizeTo exists (m² to sqft: 1 m² = 10.764 sqft)
          if (property.sizeFrom !== null && property.sizeFrom !== undefined && property.sizeFrom > 0) {
            if (property.sizeFromSqft === null || property.sizeFromSqft === undefined || property.sizeFromSqft === 0) {
              property.sizeFromSqft = Math.round(property.sizeFrom * 10.764 * 100) / 100; // Round to 2 decimals
            }
          }
          if (property.sizeTo !== null && property.sizeTo !== undefined && property.sizeTo > 0) {
            if (property.sizeToSqft === null || property.sizeToSqft === undefined || property.sizeToSqft === 0) {
              property.sizeToSqft = Math.round(property.sizeTo * 10.764 * 100) / 100; // Round to 2 decimals
            }
          }
          
          // Fix area if it's incomplete (e.g., "Du" instead of "areaName, cityName")
          if (typeof property.area === 'string' && property.area.length <= 3 && property.city) {
            // If area is too short (like "Du"), try to reconstruct it from city
            const cityName = property.city.nameEn || property.city.nameRu;
            if (cityName) {
              property.area = `${property.area}, ${cityName}`;
            }
          }
        }
        
        return property;
      });
      
      if (process.env.NODE_ENV === 'development') {
        
        
        
        // Log sample property to check photos (after normalization)
        if (data.length > 0) {
          const sampleProperty = data[0];
          
          
          // Check if photos are valid URLs
          if (Array.isArray(sampleProperty.photos) && sampleProperty.photos.length > 0) {
            sampleProperty.photos.forEach((photo: string, index: number) => {
              if (photo && !photo.startsWith('http://') && !photo.startsWith('https://') && !photo.startsWith('/')) {
                
              }
            });
          } else {
            
          }
          
          // Count properties with and without photos
          const propertiesWithPhotos = data.filter((p: any) => Array.isArray(p.photos) && p.photos.length > 0).length;
          const propertiesWithoutPhotos = data.length - propertiesWithPhotos;
          
          
          // Log full property data for first 3 properties to diagnose issues
          if (data.length > 0) {
            
            data.slice(0, 3).forEach((prop: any, index: number) => {
              
              
              
              
              
              
              
              
              
              // Check for alternative field names
              const altFields = [
                'bedroomFrom', 'bedroomTo', 'bedroom',
                'sizeFromM2', 'sizeToM2', 'sizeM2',
                'priceFromUSD', 'priceUSD',
              ];
              altFields.forEach(field => {
              });
            });
          }
        }
      }
      
      // Apply client-side sorting as backup (in case server doesn't sort correctly)
      // Always sort, even if server should have sorted (to ensure consistency)
      const sortBy = filters?.sortBy || 'createdAt';
      const sortOrder = filters?.sortOrder || 'DESC';
      
      if (data.length > 0) {
        // Create a stable copy for sorting
        const sortedData = [...data];
        
        sortedData.sort((a, b) => {
          let aValue: number | string, bValue: number | string;
          
          switch (sortBy) {
            case 'name':
              aValue = (a.name || '').toLowerCase();
              bValue = (b.name || '').toLowerCase();
              // String comparison
              if (sortOrder === 'ASC') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
              } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
              }
            
            case 'price':
            case 'priceFrom':
              // Use USD prices for comparison
              // IMPORTANT: priceFrom/price may come as strings from API, need to convert to number
              if (a.propertyType === 'off-plan') {
                const priceFrom = a.priceFrom;
                if (typeof priceFrom === 'number' && !isNaN(priceFrom)) {
                  aValue = priceFrom;
                } else if (typeof priceFrom === 'string') {
                  aValue = parseFloat(priceFrom) || 0;
                } else {
                  aValue = 0;
                }
              } else {
                const price = a.price;
                if (typeof price === 'number' && !isNaN(price)) {
                  aValue = price;
                } else if (typeof price === 'string') {
                  aValue = parseFloat(price) || 0;
                } else {
                  aValue = 0;
                }
              }
              
              if (b.propertyType === 'off-plan') {
                const priceFrom = b.priceFrom;
                if (typeof priceFrom === 'number' && !isNaN(priceFrom)) {
                  bValue = priceFrom;
                } else if (typeof priceFrom === 'string') {
                  bValue = parseFloat(priceFrom) || 0;
                } else {
                  bValue = 0;
                }
              } else {
                const price = b.price;
                if (typeof price === 'number' && !isNaN(price)) {
                  bValue = price;
                } else if (typeof price === 'string') {
                  bValue = parseFloat(price) || 0;
                } else {
                  bValue = 0;
                }
              }
              
              // Debug log for price sorting
              if (process.env.NODE_ENV === 'development') {
                const indexA = sortedData.indexOf(a);
                const indexB = sortedData.indexOf(b);
              }
              break;
            
            case 'size':
            case 'sizeFrom':
              // Use m² for comparison
              // IMPORTANT: sizeFrom/size may come as strings from API, need to convert to number
              if (a.propertyType === 'off-plan') {
                const sizeFrom = a.sizeFrom;
                if (typeof sizeFrom === 'number' && !isNaN(sizeFrom)) {
                  aValue = sizeFrom;
                } else if (typeof sizeFrom === 'string') {
                  aValue = parseFloat(sizeFrom) || 0;
                } else {
                  aValue = 0;
                }
              } else {
                const size = a.size;
                if (typeof size === 'number' && !isNaN(size)) {
                  aValue = size;
                } else if (typeof size === 'string') {
                  aValue = parseFloat(size) || 0;
                } else {
                  aValue = 0;
                }
              }
              
              if (b.propertyType === 'off-plan') {
                const sizeFrom = b.sizeFrom;
                if (typeof sizeFrom === 'number' && !isNaN(sizeFrom)) {
                  bValue = sizeFrom;
                } else if (typeof sizeFrom === 'string') {
                  bValue = parseFloat(sizeFrom) || 0;
                } else {
                  bValue = 0;
                }
              } else {
                const size = b.size;
                if (typeof size === 'number' && !isNaN(size)) {
                  bValue = size;
                } else if (typeof size === 'string') {
                  bValue = parseFloat(size) || 0;
                } else {
                  bValue = 0;
                }
              }
              break;
            
            case 'createdAt':
              aValue = new Date(a.createdAt || 0).getTime();
              bValue = new Date(b.createdAt || 0).getTime();
              break;
            
            default:
              // Default to createdAt if sortBy is unknown
              aValue = new Date(a.createdAt || 0).getTime();
              bValue = new Date(b.createdAt || 0).getTime();
              break;
          }
          
          // Handle null/undefined/NaN values for numeric comparisons
          if (typeof aValue === 'number') {
            if (isNaN(aValue) || aValue == null) aValue = 0;
          }
          if (typeof bValue === 'number') {
            if (isNaN(bValue) || bValue == null) bValue = 0;
          }
          
          // Numeric comparison
          if (sortOrder === 'ASC') {
            return (aValue as number) - (bValue as number);
          } else {
            return (bValue as number) - (aValue as number);
          }
        });
        
        // Replace the array
        data = sortedData;
      }
      
      // Debug: log first few properties to verify sorting
      // Return with total count
      const result: GetPropertiesResult = {
        properties: data,
        total: totalCount || data.length,
      };
      
      // Cache the result
      if (useCache) {
        propertiesCache.set(cacheKey, {
          result,
          timestamp: Date.now(),
        });
        // Limit cache size (keep only last 10 entries)
        if (propertiesCache.size > 10) {
          const firstKey = propertiesCache.keys().next().value;
          if (firstKey) {
            propertiesCache.delete(firstKey);
          }
        }
      }
      
      return result;
    } catch (error: any) {
      // ❌ FALLBACK DISABLED: Do not use /api/public/data as fallback
      // The /api/properties endpoint should always work with API Key/Secret
      // If it fails, it's a configuration issue that needs to be fixed
      
      
      
      
      if (error.response) {
        // Error response handling removed for performance
      } else {
        // Error handling removed for performance
      }
      
      // Throw error instead of using fallback
      throw new Error(`Failed to load properties from /api/properties endpoint: ${error.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    
    if (error.response) {
      
      
      
      
      // Check if the error message gives us a hint
    }
    throw error;
  }
}

/**
 * Get single property by ID
 */
export async function getProperty(id: string): Promise<Property> {
  try {
    const response = await apiClient.get<ApiResponse<Property>>(`/properties/${id}`);
    let property = response.data.data;
    
    // Normalize property data (same as in getProperties)
    property = normalizeProperty(property);
    
    return property;
  } catch (error: any) {
    // If 403 or 401, try to get from public data endpoint
    if (error.response?.status === 403 || error.response?.status === 401) {
      
      
      try {
        // Get all data from public endpoint
        const publicData = await getPublicData();
        
        if (publicData.properties && Array.isArray(publicData.properties)) {
          let property = publicData.properties.find(p => p.id === id);
          
          if (property) {
            // Normalize property data
            property = normalizeProperty(property);
          
            return property;
          } else {
            throw new Error('Property not found in public data');
          }
        } else {
          throw new Error('Properties not found in public data structure');
        }
      } catch (publicDataError: any) {
        
        throw new Error(`Property not found: ${publicDataError.message || 'Unknown error'}`);
      }
    }
    
    // For other errors, log and rethrow
    
    throw error;
  }
}

// Helper function to normalize property data
function normalizeProperty(property: any): Property {
  // Normalize numeric fields - ensure they are numbers, not strings
  if (property.bedroomsFrom !== null && property.bedroomsFrom !== undefined) {
    property.bedroomsFrom = typeof property.bedroomsFrom === 'string' ? parseInt(property.bedroomsFrom, 10) : property.bedroomsFrom;
  }
  if (property.bedroomsTo !== null && property.bedroomsTo !== undefined) {
    property.bedroomsTo = typeof property.bedroomsTo === 'string' ? parseInt(property.bedroomsTo, 10) : property.bedroomsTo;
  }
  if (property.sizeFrom !== null && property.sizeFrom !== undefined) {
    property.sizeFrom = typeof property.sizeFrom === 'string' ? parseFloat(property.sizeFrom) : property.sizeFrom;
  }
  if (property.sizeTo !== null && property.sizeTo !== undefined) {
    property.sizeTo = typeof property.sizeTo === 'string' ? parseFloat(property.sizeTo) : property.sizeTo;
  }
  if (property.sizeFromSqft !== null && property.sizeFromSqft !== undefined) {
    property.sizeFromSqft = typeof property.sizeFromSqft === 'string' ? parseFloat(property.sizeFromSqft) : property.sizeFromSqft;
  }
  if (property.sizeToSqft !== null && property.sizeToSqft !== undefined) {
    property.sizeToSqft = typeof property.sizeToSqft === 'string' ? parseFloat(property.sizeToSqft) : property.sizeToSqft;
  }
  if (property.priceFrom !== null && property.priceFrom !== undefined) {
    property.priceFrom = typeof property.priceFrom === 'string' ? parseFloat(property.priceFrom) : property.priceFrom;
  }
  if (property.priceFromAED !== null && property.priceFromAED !== undefined) {
    property.priceFromAED = typeof property.priceFromAED === 'string' ? parseFloat(property.priceFromAED) : property.priceFromAED;
  }
  if (property.price !== null && property.price !== undefined) {
    property.price = typeof property.price === 'string' ? parseFloat(property.price) : property.price;
  }
  if (property.priceAED !== null && property.priceAED !== undefined) {
    property.priceAED = typeof property.priceAED === 'string' ? parseFloat(property.priceAED) : property.priceAED;
  }
  if (property.size !== null && property.size !== undefined) {
    property.size = typeof property.size === 'string' ? parseFloat(property.size) : property.size;
  }
  if (property.sizeSqft !== null && property.sizeSqft !== undefined) {
    property.sizeSqft = typeof property.sizeSqft === 'string' ? parseFloat(property.sizeSqft) : property.sizeSqft;
  }
  
  // Calculate priceFromAED if missing but priceFrom exists (USD to AED conversion: 1 USD = 3.673 AED)
  if (property.propertyType === 'off-plan') {
    if ((property.priceFromAED === null || property.priceFromAED === undefined || property.priceFromAED === 0) && 
        property.priceFrom !== null && property.priceFrom !== undefined && property.priceFrom > 0) {
      property.priceFromAED = Math.round(property.priceFrom * 3.673);
    }
    
    // For off-plan properties, bathroomsFrom/To should always be null
    if (property.bathroomsFrom !== null || property.bathroomsTo !== null) {
      property.bathroomsFrom = null;
      property.bathroomsTo = null;
    }
    
    // Calculate sizeFromSqft/sizeToSqft if missing but sizeFrom/sizeTo exists (m² to sqft: 1 m² = 10.764 sqft)
    if (property.sizeFrom !== null && property.sizeFrom !== undefined && property.sizeFrom > 0) {
      if (property.sizeFromSqft === null || property.sizeFromSqft === undefined || property.sizeFromSqft === 0) {
        property.sizeFromSqft = Math.round(property.sizeFrom * 10.764 * 100) / 100;
      }
    }
    if (property.sizeTo !== null && property.sizeTo !== undefined && property.sizeTo > 0) {
      if (property.sizeToSqft === null || property.sizeToSqft === undefined || property.sizeToSqft === 0) {
        property.sizeToSqft = Math.round(property.sizeTo * 10.764 * 100) / 100;
      }
                }
              } else {
    // For secondary properties, calculate priceAED if missing but price exists
    if ((property.priceAED === null || property.priceAED === undefined || property.priceAED === 0) && 
        property.price !== null && property.price !== undefined && property.price > 0) {
      property.priceAED = Math.round(property.price * 3.673);
    }
    
    // Calculate sizeSqft if missing but size exists
    if (property.size !== null && property.size !== undefined && property.size > 0) {
      if (property.sizeSqft === null || property.sizeSqft === undefined || property.sizeSqft === 0) {
        property.sizeSqft = Math.round(property.size * 10.764 * 100) / 100;
      }
    }
  }
  
  // Normalize photos array
  if (!property.photos) {
    property.photos = [];
  } else if (typeof property.photos === 'string') {
    try {
      const parsed = JSON.parse(property.photos);
      property.photos = Array.isArray(parsed) ? parsed : [property.photos];
    } catch {
      property.photos = [property.photos];
    }
    property.photos = property.photos.filter((photo: any) => {
      return photo && typeof photo === 'string' && photo.trim().length > 0;
    });
  } else if (!Array.isArray(property.photos)) {
    property.photos = [];
  }
  
  // Normalize units if they exist
  if (property.units && Array.isArray(property.units)) {
    property.units = property.units.map((unit: any) => {
      // Normalize unit price fields
      if (unit.price !== null && unit.price !== undefined) {
        unit.price = typeof unit.price === 'string' ? parseFloat(unit.price) : unit.price;
      }
      if (unit.priceAED !== null && unit.priceAED !== undefined) {
        unit.priceAED = typeof unit.priceAED === 'string' ? parseFloat(unit.priceAED) : unit.priceAED;
      } else if (unit.price !== null && unit.price !== undefined && unit.price > 0) {
        // Calculate priceAED if missing
        unit.priceAED = Math.round(unit.price * 3.673);
      }
      
      // Normalize unit size fields
      if (unit.totalSize !== null && unit.totalSize !== undefined) {
        unit.totalSize = typeof unit.totalSize === 'string' ? parseFloat(unit.totalSize) : unit.totalSize;
      }
      if (unit.totalSizeSqft !== null && unit.totalSizeSqft !== undefined) {
        unit.totalSizeSqft = typeof unit.totalSizeSqft === 'string' ? parseFloat(unit.totalSizeSqft) : unit.totalSizeSqft;
      } else if (unit.totalSize !== null && unit.totalSize !== undefined && unit.totalSize > 0) {
        // Calculate totalSizeSqft if missing
        unit.totalSizeSqft = Math.round(unit.totalSize * 10.764 * 100) / 100;
      }
      
      if (unit.balconySize !== null && unit.balconySize !== undefined) {
        unit.balconySize = typeof unit.balconySize === 'string' ? parseFloat(unit.balconySize) : unit.balconySize;
      }
      if (unit.balconySizeSqft !== null && unit.balconySizeSqft !== undefined) {
        unit.balconySizeSqft = typeof unit.balconySizeSqft === 'string' ? parseFloat(unit.balconySizeSqft) : unit.balconySizeSqft;
      } else if (unit.balconySize !== null && unit.balconySize !== undefined && unit.balconySize > 0) {
        // Calculate balconySizeSqft if missing
        unit.balconySizeSqft = Math.round(unit.balconySize * 10.764 * 100) / 100;
      }
      
      return unit;
    });
  }
  
  return property as Property;
}

// Cache for public data to avoid multiple requests
let publicDataCache: PublicData | null = null;
let publicDataCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for properties requests
interface PropertiesCacheEntry {
  result: GetPropertiesResult;
  timestamp: number;
}

const propertiesCache = new Map<string, PropertiesCacheEntry>();
const PROPERTIES_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

/**
 * Get public data (countries, cities, areas, developers, facilities)
 * Uses cache to avoid multiple requests
 */
export async function getPublicData(forceRefresh = false): Promise<PublicData> {
  // Return cached data if available and not expired
  const now = Date.now();
  if (!forceRefresh && publicDataCache && (now - publicDataCacheTime) < CACHE_DURATION) {
    return publicDataCache;
  }

  try {
    // Use longer timeout for /public/data as it can be very large (26K+ properties)
    const response = await apiClient.get<ApiResponse<PublicData>>('/public/data', {
      timeout: 120000, // 2 minutes timeout for large data
    });
    const data = response.data.data;
    
    // Cache the data
    publicDataCache = data;
    publicDataCacheTime = now;
    
    if (process.env.NODE_ENV === 'development') {
      
      if (data.properties && Array.isArray(data.properties)) {
        const uniqueAreaIds = [...new Set(data.properties.map(p => {
          if (typeof p.area === 'object' && p.area !== null) {
            return p.area.id;
          }
          return null;
        }).filter(Boolean))];
        
        
        // Show all unique area IDs (for debugging)
        // Check if we have areas data and compare with properties
        if (data.areas && Array.isArray(data.areas)) {
          const areaIdsFromAreas = data.areas.map(a => a.id);
          
          
          
          // Check if properties use area IDs that exist in areas
          const areaIdsInProperties = uniqueAreaIds.filter((id): id is string => id !== null);
          const missingAreaIds = areaIdsInProperties.filter(id => !areaIdsFromAreas.includes(id));
        }
      }
    }
    
    return data;
  } catch (error: any) {
    
    throw error;
  }
}

/**
 * Clear public data cache (useful for testing or forced refresh)
 */
export function clearPublicDataCache(): void {
  publicDataCache = null;
  publicDataCacheTime = 0;
}

/**
 * Clear properties cache (useful for testing or forced refresh)
 */
export function clearPropertiesCache(): void {
  const cacheSize = propertiesCache.size;
  propertiesCache.clear();
}

/**
 * Clear ALL caches (properties + public data)
 */
export function clearAllCaches(): void {
  clearPropertiesCache();
  clearPublicDataCache();
}

/**
 * Submit investment (for registered users)
 */
export async function submitInvestment(data: InvestmentRequest): Promise<Investment> {
  try {
    const response = await apiClient.post<ApiResponse<Investment>>('/investments', data);
    
    return response.data.data;
  } catch (error: any) {
    
    if (error.response) {
      
      
      
      // Throw a more user-friendly error
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to submit investment';
      throw new Error(errorMessage);
    }
    throw error;
  }
}

/**
 * Area interface
 */
export interface Area {
  id: string;
  nameEn: string;
  nameRu: string;
  nameAr: string;
  cityId: string;
  city: {
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    countryId: string;
    country: {
      id: string;
      nameEn: string;
      nameRu: string;
      nameAr: string;
      code: string;
    } | null;
  };
  projectsCount: {
    total: number;
    offPlan: number;
    secondary: number;
  };
  description: {
    title: string;
    description: string;
  } | null;
  infrastructure: {
    title: string;
    description: string;
  } | null;
  images: string[] | null;
}

/**
 * Get all areas
 * Falls back to /public/data if /public/areas is not available
 */
// Cache for areas requests
interface AreasCacheEntry {
  areas: Area[];
  timestamp: number;
  cityId?: string;
}

const areasCache = new Map<string, AreasCacheEntry>();
const AREAS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function clearAreasCache(): void {
  areasCache.clear();
}

export async function getAreas(cityId?: string, useCache: boolean = true): Promise<Area[]> {
  try {
    const cacheKey = cityId || 'all';
    
    // Check cache first
    if (useCache) {
      const cached = areasCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < AREAS_CACHE_DURATION) {
        return cached.areas;
      }
    }
    
    const params = cityId ? { cityId } : {};
    const url = '/public/areas';
    
    const response = await apiClient.get<ApiResponse<Area[]>>(url, { params });
    let areas = response.data.data;
    
    // Log only image-related info
    if (process.env.NODE_ENV === 'development') {
      const areasWithImages = areas.filter(a => a.images && Array.isArray(a.images) && a.images.length > 0).length;
      
    }
    
    // If most areas don't have images, try to get them from properties
    const areasWithoutImages = areas.filter(a => !a.images || !Array.isArray(a.images) || a.images.length === 0);
    if (areasWithoutImages.length > areas.length * 0.8) { // If more than 80% don't have images
      try {
        // Load properties to get area images - use reasonable limit for performance
        const result = await getProperties({ limit: 1000 }, true); // Reduced to 1000 for better performance
        const properties = result.properties || [];
        
        // Build area name to ID map with multiple variations
        const areaNameToIdMap = new Map<string, string>();
        areas.forEach(area => {
          const nameLower = area.nameEn.toLowerCase().trim();
          areaNameToIdMap.set(nameLower, area.id);
          
          // Also add variations without "Dubai, " prefix
          const nameWithoutDubai = nameLower.replace(/^dubai,\s*/, '').trim();
          if (nameWithoutDubai !== nameLower) {
            areaNameToIdMap.set(nameWithoutDubai, area.id);
          }
          
          // Add variation with "Dubai, " prefix
          if (!nameLower.startsWith('dubai,')) {
            areaNameToIdMap.set(`dubai, ${nameLower}`, area.id);
          }
        });
        
        // Group properties by area and get first image
        const areaImagesMap = new Map<string, string>();
        const areaPropertiesCount = new Map<string, number>();
        
        properties.forEach(property => {
          if (property.photos && property.photos.length > 0) {
            let areaId: string | null = null;
            let matchedAreaName = '';
            
            if (typeof property.area === 'string') {
              // Off-plan: area is "areaName, cityName"
              const areaName = property.area.split(',')[0].trim();
              const areaNameLower = areaName.toLowerCase();
              
              // Try direct lookup
              areaId = areaNameToIdMap.get(areaNameLower) || null;
              
              if (!areaId) {
                // Try to find by matching
                const area = areas.find(a => {
                  const aNameLower = a.nameEn.toLowerCase().trim();
                  const aNameNoDubai = aNameLower.replace(/^dubai,\s*/, '').trim();
                  return aNameLower === areaNameLower || 
                         aNameNoDubai === areaNameLower ||
                         aNameLower.includes(areaNameLower) ||
                         areaNameLower.includes(aNameNoDubai);
                });
                areaId = area?.id || null;
                matchedAreaName = area?.nameEn || '';
              } else {
                const area = areas.find(a => a.id === areaId);
                matchedAreaName = area?.nameEn || '';
              }
            } else if (property.area && typeof property.area === 'object') {
              // Secondary: area is an object
              areaId = property.area.id;
              matchedAreaName = property.area.nameEn || '';
              
              // Also try to match by name (for cases where area.nameEn has "Dubai, " prefix)
              if (!areaId && property.area.nameEn) {
                const propertyAreaName = property.area.nameEn;
                const areaNameWithoutPrefix = propertyAreaName.replace(/^Dubai,\s*/i, '').trim();
                
                // Try exact match first
                let matchedArea = areas.find(a => 
                  a.nameEn.toLowerCase() === propertyAreaName.toLowerCase() ||
                  a.nameEn.toLowerCase() === areaNameWithoutPrefix.toLowerCase()
                );
                
                // If no exact match, try partial match
                if (!matchedArea) {
                  matchedArea = areas.find(a => {
                    const aNameLower = a.nameEn.toLowerCase();
                    const propNameLower = propertyAreaName.toLowerCase();
                    const propNameNoPrefix = areaNameWithoutPrefix.toLowerCase();
                    
                    return aNameLower.includes(propNameNoPrefix) || 
                           propNameNoPrefix.includes(aNameLower) ||
                           aNameLower.includes(propNameLower) ||
                           propNameLower.includes(aNameLower);
                  });
                }
                
                if (matchedArea) {
                  areaId = matchedArea.id;
                  matchedAreaName = matchedArea.nameEn;
                }
              }
            }
            
            if (areaId) {
              // Count properties per area
              areaPropertiesCount.set(areaId, (areaPropertiesCount.get(areaId) || 0) + 1);
              
              // Only set image if we don't have one yet (first property wins)
              if (!areaImagesMap.has(areaId)) {
                areaImagesMap.set(areaId, property.photos[0]);
              }
            }
          }
        });
        
        if (process.env.NODE_ENV === 'development') {
      const areasWithoutImages = areas.filter(a => !a.images || !Array.isArray(a.images) || a.images.length === 0);
          const areasGettingImagesFromProperties = areasWithoutImages.filter(a => areaImagesMap.has(a.id)).length;
          }
        
        // Add images to areas that don't have them
        let imagesAdded = 0;
        areas = areas.map(area => {
          if ((!area.images || !Array.isArray(area.images) || area.images.length === 0) && areaImagesMap.has(area.id)) {
            imagesAdded++;
            return {
              ...area,
              images: [areaImagesMap.get(area.id)!]
            };
          }
          return area;
        });
        
        } catch (propError: any) {
      }
    }
    
    // Cache the result
    if (useCache) {
      areasCache.set(cacheKey, {
        areas,
        timestamp: Date.now(),
        cityId,
      });
      
      // Limit cache size
      if (areasCache.size > 10) {
        const firstKey = areasCache.keys().next().value;
        if (firstKey) {
          areasCache.delete(firstKey);
        }
      }
      
    }
    
    return areas;
  } catch (error: any) {
    // If 404, fallback to /public/data
    if (error.response?.status === 404) {
      try {
        // Get areas from public data
        const publicData = await getPublicData(true);
        const areasFromData = publicData.areas || [];
        
        if (process.env.NODE_ENV === 'development') {
          // Check how many areas already have images from /public/data
          // Note: Areas from /public/data don't have images field in the type, but might have it in actual data
          const areasWithImagesFromData = areasFromData.filter(a => (a as any).images && Array.isArray((a as any).images) && (a as any).images.length > 0);
          
          
          
        }
        
        // Try to get properties ONLY if we need images (not for counts - counts should come from backend)
        let properties: Property[] = [];
        const areasWithoutImages = areasFromData.filter(a => !(a as any).images || !Array.isArray((a as any).images) || (a as any).images.length === 0);
        
        if (areasWithoutImages.length > 0) {
          try {
            // Load only a limited number of properties for images (not all 26K!)
            // Use limit to avoid loading all secondary properties
            const result = await getProperties({ limit: 1000 });
            properties = result.properties || [];
          
        } catch (propError: any) {
            // If properties fail, continue without images
          }
        } else {
        }
        
        // Get best property image for each area
        // Use the first property with photos for each area
        const areaImagesMap = new Map<string, string>();
        const areaPropertiesMap = new Map<string, Property[]>();
        const areaNameToIdMap = new Map<string, string>(); // For faster lookup by name
        
        // Build name to ID map
        areasFromData.forEach(area => {
          areaNameToIdMap.set(area.nameEn.toLowerCase(), area.id);
        });
        
        let matchedCount = 0;
        let unmatchedCount = 0;
        const unmatchedAreaNames = new Set<string>();
        
        // Group properties by area using improved matching
        properties.forEach(property => {
          if (property.photos && property.photos.length > 0) {
            let areaId: string | null = null;
            if (typeof property.area === 'string') {
              // Off-plan: area is "areaName, cityName"
              const areaName = property.area.split(',')[0].trim();
              
              // Try multiple matching strategies (same as main logic)
              // 1. Exact lowercase match
              areaId = areaNameToIdMap.get(areaName.toLowerCase()) || null;
              
              // 2. Try exact match (case-sensitive)
              if (!areaId) {
              const area = areasFromData.find(a => a.nameEn === areaName);
              areaId = area?.id || null;
              }
              
              // 3. Try case-insensitive match
              if (!areaId) {
                const area = areasFromData.find(a => a.nameEn.toLowerCase() === areaName.toLowerCase());
                areaId = area?.id || null;
              }
              
              // 4. Try partial match
              if (!areaId) {
                const area = areasFromData.find(a => 
                  a.nameEn.toLowerCase().includes(areaName.toLowerCase()) ||
                  areaName.toLowerCase().includes(a.nameEn.toLowerCase())
                );
                areaId = area?.id || null;
              }
              
              // 5. Try removing "Area" prefix
              if (!areaId) {
                const normalizedName = areaName.replace(/^Area\s+/i, '').trim();
                areaId = areaNameToIdMap.get(normalizedName.toLowerCase()) || null;
                if (!areaId) {
                  const area = areasFromData.find(a => 
                    a.nameEn.toLowerCase() === normalizedName.toLowerCase() ||
                    a.nameEn.toLowerCase().replace(/^area\s+/, '') === normalizedName.toLowerCase()
                  );
                  areaId = area?.id || null;
                }
              }
              
              if (!areaId) {
                unmatchedAreaNames.add(areaName);
                if (process.env.NODE_ENV === 'development' && unmatchedCount < 5) {
                  
                  unmatchedCount++;
                }
              }
            } else if (typeof property.area === 'object' && property.area !== null) {
              // Secondary: area is an object
              areaId = property.area.id || null;
              
              // Also try to match by name if ID doesn't match
              if (!areaId && property.area && typeof property.area === 'object' && property.area.nameEn) {
                const areaName = property.area.nameEn;
                const areaByName = areasFromData.find(a => 
                  a.nameEn === areaName || 
                  a.nameEn.toLowerCase() === areaName.toLowerCase()
                );
                areaId = areaByName?.id || null;
              }
            }
            
            if (areaId) {
              if (!areaPropertiesMap.has(areaId)) {
                areaPropertiesMap.set(areaId, []);
              }
              areaPropertiesMap.get(areaId)!.push(property);
              
              // Use first property's first photo for the area
              if (!areaImagesMap.has(areaId)) {
                areaImagesMap.set(areaId, property.photos[0]);
                matchedCount++;
                if (process.env.NODE_ENV === 'development' && matchedCount <= 10) {
                  const area = areasFromData.find(a => a.id === areaId);
                  
                }
              }
            }
          }
        });
        
        if (process.env.NODE_ENV === 'development') {
          
        }
        
        // Calculate projectsCount for each area
        // NOTE: This is a fallback - ideally backend should provide counts
        // We only use loaded properties (limited to 1000) for counts, which may be inaccurate
        const areasWithCounts: Area[] = areasFromData.map(area => {
          // Use cached properties if available, otherwise filter
          let areaProperties: Property[] = [];
          if (areaPropertiesMap.has(area.id)) {
            areaProperties = areaPropertiesMap.get(area.id)!;
          } else {
            // Only filter if we have properties loaded (limited set)
            if (properties.length > 0) {
            areaProperties = properties.filter(p => {
              if (typeof p.area === 'string') {
                // Off-plan: area is "areaName, cityName"
                const areaName = p.area.split(',')[0].trim();
                return areaName === area.nameEn;
              } else {
                // Secondary: area is an object
                return p.area?.id === area.id;
              }
            });
            }
          }
          
          // Counts are approximate since we only loaded 1000 properties
          const offPlanCount = areaProperties.filter(p => p.propertyType === 'off-plan').length;
          const secondaryCount = areaProperties.filter(p => p.propertyType === 'secondary').length;
          
          // If we have limited properties, counts may be inaccurate
          // Set to 0 if we don't have enough data to be confident
          const totalCount = properties.length < 100 ? 0 : areaProperties.length;
          
          // Get image - FIRST check if area already has images from /public/data
          let areaImages: string[] | null = null;
          
          // Priority 1: Use images from /public/data if available
          const areaImagesFromData = (area as any).images;
          if (areaImagesFromData && Array.isArray(areaImagesFromData) && areaImagesFromData.length > 0) {
            areaImages = areaImagesFromData;
          } 
          // Priority 2: Use images from properties (areaImagesMap)
          else if (areaImagesMap.has(area.id)) {
            areaImages = [areaImagesMap.get(area.id)!];
          } 
          // Priority 3: Try to find from areaProperties
          else if (areaProperties.length > 0) {
            const propertyWithPhoto = areaProperties.find(p => p.photos && p.photos.length > 0);
            if (propertyWithPhoto && propertyWithPhoto.photos) {
              areaImages = [propertyWithPhoto.photos[0]];
            }
          }
          
          return {
            id: area.id,
            nameEn: area.nameEn,
            nameRu: area.nameRu,
            nameAr: area.nameAr,
            cityId: area.cityId,
            city: (() => {
              const city = publicData.cities.find(c => c.id === area.cityId);
              const country = city ? publicData.countries.find(c => c.id === city.countryId) : null;
              return {
                id: city?.id || '',
                nameEn: city?.nameEn || '',
                nameRu: city?.nameRu || '',
                nameAr: city?.nameAr || '',
                countryId: city?.countryId || '',
                country: country ? {
                  id: country.id,
                  nameEn: country.nameEn,
                  nameRu: country.nameRu,
                  nameAr: country.nameAr,
                  code: country.code,
                } : null,
              };
            })(),
            projectsCount: {
              total: totalCount,
              offPlan: offPlanCount,
              secondary: secondaryCount,
            },
            description: (area as any).description || null,
            infrastructure: (area as any).infrastructure || null,
            images: areaImages,
          };
        });
        
        // Filter by cityId if provided
        const filteredAreas = cityId 
          ? areasWithCounts.filter(a => a.cityId === cityId)
          : areasWithCounts;
        
        return filteredAreas;
      } catch (fallbackError: any) {
        
        throw fallbackError;
      }
    }
    
    // For other errors, throw as usual
    
    throw error;
  }
}

/**
 * Get area by ID
 */
export async function getAreaById(areaIdOrSlug: string): Promise<Area | null> {
  try {
    const areas = await getAreas();
    // Try to find by ID first
    let area = areas.find(a => a.id === areaIdOrSlug);
    
    // If not found by ID, try to find by slug (nameEn converted to slug)
    if (!area) {
      const slug = areaIdOrSlug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      area = areas.find(a => {
        const areaSlug = (a.nameEn || '')
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        return areaSlug === slug || a.id === areaIdOrSlug;
      });
    }
    
    return area || null;
  } catch (error: any) {
    
    return null;
  }
}

/**
 * Developer interface
 */
export interface Developer {
  id: string;
  name: string;
  logo: string | null;
  description: {
    title: string;
    description: string;
  } | null;
  images: string[] | null;
  projectsCount: {
    total: number;
    offPlan: number;
    secondary: number;
  };
  createdAt?: string;
}

/**
 * Get all developers
 * Falls back to /public/data if /public/developers is not available
 */
export async function getDevelopers(): Promise<Developer[]> {
  try {
    const url = '/public/developers';
    
    const response = await apiClient.get<ApiResponse<any[]>>(url);
    let developers = response.data.data;
    
    // Process developers: handle description (can be JSON string or object)
    const processedDevelopers: Developer[] = developers.map((dev: any) => {
      let description: { title: string; description: string } | null = null;
      
      if (dev.description) {
        // If description is a string, try to parse it as JSON
        if (typeof dev.description === 'string') {
          try {
            const parsed = JSON.parse(dev.description);
            if (parsed && (parsed.title || parsed.description)) {
              description = {
                title: parsed.title || '',
                description: parsed.description || '',
              };
            }
          } catch {
            // If parsing fails, treat as plain text
            description = {
              title: '',
              description: dev.description,
            };
          }
        } else if (typeof dev.description === 'object') {
          // Already an object
          description = {
            title: dev.description.title || '',
            description: dev.description.description || '',
          };
        }
      }
      
      return {
        id: dev.id,
        name: dev.name,
        logo: dev.logo,
        description,
        images: dev.images || null,
        projectsCount: dev.projectsCount || {
          total: 0,
          offPlan: 0,
          secondary: 0,
        },
        createdAt: dev.createdAt,
      };
    });
    
    if (process.env.NODE_ENV === 'development') {
      const developersWithImages = processedDevelopers.filter(d => d.images && Array.isArray(d.images) && d.images.length > 0).length;
      const developersWithDescription = processedDevelopers.filter(d => d.description).length;
      const developersWithLogo = processedDevelopers.filter(d => d.logo).length;
      
      
      
      
      
    }
    
    return processedDevelopers;
  } catch (error: any) {
    // If 404, fallback to /public/data
    if (error.response?.status === 404) {
      
      
      try {
        // Get developers from public data
        
        const publicData = await getPublicData(true);
        
        
        const developersFromData = publicData.developers || [];
        
        
        
        if (!Array.isArray(developersFromData)) {
          
          return [];
        }
        
        if (developersFromData.length === 0) {
          
          
          return [];
        }
        
        
        
        // Try to get properties to calculate counts (optional - don't fail if this fails)
        let properties: Property[] = [];
        try {
          
          // Load only a limited number of properties for counts (not all 26K!)
          const result = await getProperties({ limit: 1000 });
          properties = result.properties || [];
          
          
        } catch (propError: any) {
          
          // Continue without properties - counts will be 0
        }
        
        // Calculate projectsCount for each developer
        
        const developersWithCounts: Developer[] = developersFromData.map(developer => {
          const developerProperties = properties.filter(p => p.developer?.id === developer.id);
          
          const offPlanCount = developerProperties.filter(p => p.propertyType === 'off-plan').length;
          const secondaryCount = developerProperties.filter(p => p.propertyType === 'secondary').length;
          
          // Counts are approximate since we only loaded 1000 properties
          const totalCount = properties.length < 100 ? 0 : developerProperties.length;
          
          return {
            id: developer.id,
            name: developer.name,
            logo: developer.logo,
            description: null, // Not available in /public/data
            images: null, // Not available in /public/data
            projectsCount: {
              total: totalCount,
              offPlan: offPlanCount,
              secondary: secondaryCount,
            },
          };
        });
        
        
        
        return developersWithCounts;
      } catch (fallbackError: any) {
        
        
        // Return empty array instead of throwing, so page can still render
        
        return [];
      }
    }
    
    // For other errors, throw as usual
    
    throw error;
  }
}

/**
 * Get developer by ID
 */
export async function getDeveloperById(developerId: string): Promise<Developer | null> {
  try {
    const developers = await getDevelopers();
    const developer = developers.find(d => d.id === developerId);
    return developer || null;
  } catch (error: any) {
    
    return null;
  }
}

/**
 * Submit investment (for non-registered users)
 */
export async function submitInvestmentPublic(data: InvestmentRequest): Promise<Investment> {
  try {
    const response = await apiClient.post<ApiResponse<Investment>>('/investments/public', data);
    
    return response.data.data;
  } catch (error: any) {
    
    if (error.response) {
      
      
      
      // Throw a more user-friendly error
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to submit investment';
      throw new Error(errorMessage);
    }
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}

/**
 * Set authentication token
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

/**
 * Remove authentication token
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

// ============================================
// News API
// ============================================

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  titleRu: string;
  description?: string;
  descriptionRu?: string;
  image: string;
  publishedAt: string; // ISO date string
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsContent {
  id: string;
  newsId: string;
  type: 'text' | 'image' | 'video';
  title: string;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  order: number;
}

export interface NewsDetail extends NewsItem {
  contents?: NewsContent[];
}

export interface GetNewsResult {
  news: NewsItem[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get list of news articles
 * @param page - Page number (starts from 1)
 * @param limit - Items per page (default: 12)
 * @returns News list with pagination info
 */
export async function getNews(page: number = 1, limit: number = 12): Promise<GetNewsResult> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sortBy', 'publishedAt');
    params.append('sortOrder', 'DESC');

    const url = `/public/news?${params.toString()}`;

    const response = await apiClient.get<ApiResponse<{
      data: NewsItem[];
      total: number;
      page: number;
      limit: number;
    }>>(url);

    if (!response.data.success) {
      throw new Error('Failed to fetch news');
    }

    const data = response.data.data;
    
    // Handle different response structures
    let newsArray: NewsItem[] = [];
    let total = 0;
    let currentPage = page;
    let currentLimit = limit;

    if (Array.isArray(data)) {
      // Direct array response
      newsArray = data;
      total = data.length;
    } else if (data && typeof data === 'object') {
      // Paginated response: { data: NewsItem[], total: number, page: number, limit: number }
      if ('data' in data && Array.isArray((data as any).data)) {
        newsArray = (data as any).data;
        total = (data as any).total || newsArray.length;
        currentPage = (data as any).page || page;
        currentLimit = (data as any).limit || limit;
      } else {
        // Try to find array in other keys
        const possibleKeys = ['news', 'items', 'results', 'list'];
        for (const key of possibleKeys) {
          if (Array.isArray((data as any)[key])) {
            newsArray = (data as any)[key];
            total = (data as any).total || newsArray.length;
            break;
          }
        }
        if (newsArray.length === 0) {
          newsArray = [];
          total = 0;
        }
      }
    }

    // Convert publishedAt from string to Date for compatibility
    const newsWithDates = newsArray.map(item => ({
      ...item,
      publishedAt: item.publishedAt,
    }));

    return {
      news: newsWithDates,
      total,
      page: currentPage,
      limit: currentLimit,
    };
  } catch (error) {
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      
      if (axiosError.response?.status === 404) {
        // No news found, return empty result
        return {
          news: [],
          total: 0,
          page,
          limit,
        };
      }
      
      // CORS error or network error
      if (axiosError.code === 'ERR_NETWORK' || axiosError.message.includes('CORS') || axiosError.message.includes('Access-Control')) {
        throw new Error('CORS error: Backend server is not allowing requests from this origin. Please check CORS configuration on the backend.');
      }
      
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch news');
    }
    throw error;
  }
}

/**
 * Get news article by slug
 * @param slug - News article slug or ID
 * @returns News article details with contents
 */
export async function getNewsBySlug(slug: string): Promise<NewsDetail | null> {
  try {
    const url = `/public/news/${slug}`;

    const response = await apiClient.get<ApiResponse<NewsDetail>>(url);

    if (!response.data.success) {
      throw new Error('Failed to fetch news article');
    }

    const news = response.data.data;

    // Sort contents by order if present
    if (news.contents && Array.isArray(news.contents)) {
      news.contents.sort((a, b) => a.order - b.order);
    }

    return news;
  } catch (error) {
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      if (axiosError.response?.status === 404) {
        return null;
      }
      throw new Error(axiosError.response?.data?.message || 'Failed to fetch news article');
    }
    throw error;
  }
}

export default apiClient;


