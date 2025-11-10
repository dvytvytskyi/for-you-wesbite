import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.foryou-realestate.com/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'fyr_8f968d115244e76d209a26f5177c5c998aca0e8dbce4a6e9071b2bc43b78f6d2';
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET || '5c8335f9c7e476cbe77454fd32532cc68f57baf86f7f96e6bafcf682f98b275bc579d73484cf5bada7f4cd7d071b122778b71f414fb96b741c5fe60394d1795f';

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
      console.error('❌ CRITICAL: API_KEY or API_SECRET is missing!');
      console.error('API_KEY:', API_KEY ? 'present' : 'missing');
      console.error('API_SECRET:', API_SECRET ? 'present' : 'missing');
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
    
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      const apiKeyValue = config.headers['X-Api-Key'] as string;
      const apiSecretValue = config.headers['X-Api-Secret'] as string;
      
      console.log('API Request:', {
        url: `${config.baseURL}${config.url}`,
        method: config.method,
        headers: {
          'Content-Type': config.headers['Content-Type'],
          'X-Api-Key': apiKeyValue ? `${apiKeyValue.substring(0, 20)}...` : 'missing',
          'X-Api-Secret': apiSecretValue ? `${apiSecretValue.substring(0, 20)}...` : 'missing',
          'Authorization': config.headers.Authorization ? '***' : 'missing',
        },
        apiKeyLength: apiKeyValue?.length || 0,
        apiSecretLength: apiSecretValue?.length || 0,
        apiKeyStartsWith: apiKeyValue ? apiKeyValue.substring(0, 4) : 'N/A',
        apiSecretStartsWith: apiSecretValue ? apiSecretValue.substring(0, 4) : 'N/A',
      });
      
      // Validate API keys format
      if (apiKeyValue && !apiKeyValue.startsWith('fyr_')) {
        console.warn('⚠️ API Key does not start with "fyr_" - might be invalid format');
      }
      // Note: API Secret doesn't have a prefix, it's just a hash
    }
    
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
      // Log detailed error info in development
      if (process.env.NODE_ENV === 'development') {
        const errorData = error.response.data as any;
        const errorMessage = errorData?.message || errorData?.error || 'Unknown error';
        
        console.error('❌ API Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          message: errorMessage,
          data: error.response.data,
          requestUrl: error.config?.url,
          requestMethod: error.config?.method,
          requestHeaders: {
            'x-api-key': error.config?.headers?.['x-api-key'] ? 'present' : 'missing',
            'x-api-secret': error.config?.headers?.['x-api-secret'] ? 'present' : 'missing',
          },
        });
        
        // Special handling for 403 errors
        if (error.response.status === 403) {
          console.error('❌ 403 Forbidden - Possible causes:');
          console.error('   1. API Key/Secret are incorrect');
          console.error('   2. API Key/Secret are not active in the database');
          console.error('   3. Backend middleware is not properly checking API Key/Secret');
          console.error('   4. API Key/Secret format is incorrect');
          
          const apiKeyValue = error.config?.headers?.['x-api-key'] as string;
          const apiSecretValue = error.config?.headers?.['x-api-secret'] as string;
          
          if (apiKeyValue) {
            console.error('   API Key sent:', apiKeyValue.substring(0, 30) + '...');
            console.error('   API Key starts with:', apiKeyValue.substring(0, 4));
            console.error('   Expected: "fyr_"');
          }
          if (apiSecretValue) {
            console.error('   API Secret sent:', apiSecretValue.substring(0, 30) + '...');
            console.error('   API Secret length:', apiSecretValue.length);
            console.error('   Note: API Secret is a hash without prefix');
          }
        }
      }
      
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
  bathroomsFrom?: number | null;
  bathroomsTo?: number | null;
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
    totalSize: number;
    balconySize: number | null;
    planImage: string | null;
  }> | null;
  
  // Secondary fields
  price?: number;
  priceAED?: number;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  sizeSqft?: number;
  
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
          console.log('✅ Using cached properties');
        }
        return cached.result;
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
      console.log('Sorting params:', {
        sortBy: filters?.sortBy,
        sortOrder: filters?.sortOrder,
        propertyType: filters?.propertyType,
        fullUrl: fullUrl,
      });
      console.log('API Key/Secret headers:', {
        'x-api-key': API_KEY ? `${API_KEY.substring(0, 10)}...` : 'missing',
        'x-api-secret': API_SECRET ? `${API_SECRET.substring(0, 10)}...` : 'missing',
      });
      
      // Validate URL is properly encoded
      try {
        new URL(fullUrl);
        console.log('✅ URL is valid');
      } catch (e) {
        console.error('❌ Invalid URL:', fullUrl, e);
      }
    }
    
    // Try regular endpoint first (should work with API Key/Secret now)
    try {
      const response = await apiClient.get<ApiResponse<Property[]>>(url);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Full API response structure:', {
          success: response.data.success,
          dataType: typeof response.data.data,
          isArray: Array.isArray(response.data.data),
          dataValue: response.data.data,
        });
      }
      
      let data = response.data.data;
      
      // Handle paginated response structure: { data: Property[], total: number, page: number, limit: number }
      let totalCount = 0;
      
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Detected paginated response structure:', {
            keys: Object.keys(data),
            hasDataKey: 'data' in data,
            dataKeyIsArray: Array.isArray((data as any).data),
            total: (data as any).total,
            page: (data as any).page,
            limit: (data as any).limit,
          });
        }
        
        // Extract total count for pagination
        if ('total' in data && typeof (data as any).total === 'number') {
          totalCount = (data as any).total;
          if (process.env.NODE_ENV === 'development') {
            console.log(`📊 Extracted total from API response: ${totalCount}`);
            console.log(`📊 Full pagination data:`, {
              total: (data as any).total,
              page: (data as any).page,
              limit: (data as any).limit,
              dataLength: Array.isArray((data as any).data) ? (data as any).data.length : 'N/A',
            });
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Total not found in API response. Available keys:', Object.keys(data));
          }
        }
        
        // Check if it's a paginated response with nested data array
        if ('data' in data && Array.isArray((data as any).data)) {
          data = (data as any).data;
          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Extracted ${data.length} properties from paginated response (total available: ${totalCount})`);
          }
        } else {
          // Try other common keys
          const possibleArrayKeys = ['properties', 'items', 'results', 'list'];
          for (const key of possibleArrayKeys) {
            if (Array.isArray((data as any)[key])) {
              if (process.env.NODE_ENV === 'development') {
                console.log(`✅ Found array in nested property: ${key}`);
              }
              data = (data as any)[key];
              break;
            }
          }
        }
      }
      
      // Ensure data is always an array
      if (!Array.isArray(data)) {
        if (data === null || data === undefined) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ API returned null/undefined data, using empty array');
          }
          data = [];
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ API returned non-array data, using empty array:', {
              type: typeof data,
              value: data,
            });
          }
          data = [];
        }
      }
      
      // Log RAW data from API BEFORE normalization (to see what API actually returns)
      if (process.env.NODE_ENV === 'development' && data.length > 0) {
        // Log first property with photos and first property without photos
        const propertyWithPhotos = data.find((p: any) => p.photos && Array.isArray(p.photos) && p.photos.length > 0);
        const propertyWithoutPhotos = data.find((p: any) => !p.photos || !Array.isArray(p.photos) || p.photos.length === 0);
        
        if (propertyWithPhotos) {
          console.log(`🔍 RAW property WITH photos from API (BEFORE normalization):`, {
            propertyId: propertyWithPhotos.id,
            propertyName: propertyWithPhotos.name,
            photosType: typeof propertyWithPhotos.photos,
            photosIsArray: Array.isArray(propertyWithPhotos.photos),
            photosValue: propertyWithPhotos.photos,
            photosLength: Array.isArray(propertyWithPhotos.photos) ? propertyWithPhotos.photos.length : 'N/A',
            firstPhoto: Array.isArray(propertyWithPhotos.photos) && propertyWithPhotos.photos.length > 0 ? propertyWithPhotos.photos[0] : 'N/A',
          });
        }
        
        if (propertyWithoutPhotos) {
          console.log(`🔍 RAW property WITHOUT photos from API (BEFORE normalization):`, {
            propertyId: propertyWithoutPhotos.id,
            propertyName: propertyWithoutPhotos.name,
            hasPhotosField: 'photos' in propertyWithoutPhotos,
            photosType: typeof propertyWithoutPhotos.photos,
            photosValue: propertyWithoutPhotos.photos,
            photosIsArray: Array.isArray(propertyWithoutPhotos.photos),
            photosLength: Array.isArray(propertyWithoutPhotos.photos) ? propertyWithoutPhotos.photos.length : 'N/A',
            allKeys: Object.keys(propertyWithoutPhotos),
            // Check for alternative photo fields
            hasImage: 'image' in propertyWithoutPhotos,
            hasImageUrl: 'imageUrl' in propertyWithoutPhotos,
            hasGallery: 'gallery' in propertyWithoutPhotos,
            hasImages: 'images' in propertyWithoutPhotos,
            imageValue: (propertyWithoutPhotos as any).image,
            imageUrlValue: (propertyWithoutPhotos as any).imageUrl,
            galleryValue: (propertyWithoutPhotos as any).gallery,
            imagesValue: (propertyWithoutPhotos as any).images,
          });
        }
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
        
        return property;
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Successfully loaded ${data.length} properties from /api/properties endpoint`);
        console.log(`📊 Total from API: ${totalCount || 'not provided'}`);
        console.log(`📄 Requested page: ${filters?.page || 1}, limit: ${filters?.limit || 100}`);
        if (filters?.propertyType) {
          console.log(`Property type filter: ${filters.propertyType}`);
        }
        // Log sample property to check photos (after normalization)
        if (data.length > 0) {
          const sampleProperty = data[0];
          console.log(`📸 Sample property photos (after normalization):`, {
            propertyId: sampleProperty.id,
            propertyName: sampleProperty.name,
            photosIsArray: Array.isArray(sampleProperty.photos),
            photosLength: Array.isArray(sampleProperty.photos) ? sampleProperty.photos.length : 'N/A',
            firstPhoto: Array.isArray(sampleProperty.photos) && sampleProperty.photos.length > 0 ? sampleProperty.photos[0] : 'N/A',
            allPhotos: sampleProperty.photos,
          });
          
          // Check if photos are valid URLs
          if (Array.isArray(sampleProperty.photos) && sampleProperty.photos.length > 0) {
            sampleProperty.photos.forEach((photo: string, index: number) => {
              if (photo && !photo.startsWith('http://') && !photo.startsWith('https://') && !photo.startsWith('/')) {
                console.warn(`⚠️ Photo ${index} for property ${sampleProperty.name} is not a valid URL:`, photo);
              }
            });
          } else {
            console.warn(`⚠️ Property ${sampleProperty.name} has no photos after normalization`);
          }
          
          // Count properties with and without photos
          const propertiesWithPhotos = data.filter((p: any) => Array.isArray(p.photos) && p.photos.length > 0).length;
          const propertiesWithoutPhotos = data.length - propertiesWithPhotos;
          console.log(`📊 Properties with photos: ${propertiesWithPhotos} / ${data.length}, without photos: ${propertiesWithoutPhotos}`);
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
                if (indexA < 5 || indexB < 5) {
                  console.log(`Price sort (API): ${a.name} (${aValue}) vs ${b.name} (${bValue}), order: ${sortOrder}`);
                }
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
      if (process.env.NODE_ENV === 'development' && data.length > 0) {
        console.log('First 3 properties after sort:', data.slice(0, 3).map(p => ({
          name: p.name,
          price: p.propertyType === 'off-plan' ? p.priceFrom : p.price,
          size: p.propertyType === 'off-plan' ? p.sizeFrom : p.size,
          createdAt: p.createdAt,
        })));
      }
      
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
      // For secondary properties, we MUST use /api/properties endpoint with API Key/Secret
      // /api/public/data does not return secondary properties
      if (filters?.propertyType === 'secondary') {
        console.error('❌ Failed to load secondary properties from /api/properties endpoint');
        console.error('❌ Secondary properties are only available through /api/properties with API Key/Secret');
        if (error.response?.status === 403 || error.response?.status === 401) {
          console.error('❌ Authentication failed. Please check API Key/Secret configuration.');
        }
        throw new Error('Failed to load secondary properties. Please check API configuration.');
      }
      
      // If 403 or 401, user is not authenticated - use public endpoint
      // Note: /api/public/data returns off-plan properties only
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.warn(`Status ${error.response.status} on /properties, using /public/data endpoint...`);
        if (process.env.NODE_ENV === 'development') {
          console.warn('Request URL that failed:', error.config?.url);
          console.warn('Request params:', error.config?.params);
          console.warn('Request headers:', {
            'x-api-key': error.config?.headers?.['x-api-key'] ? 'present' : 'missing',
            'x-api-secret': error.config?.headers?.['x-api-secret'] ? 'present' : 'missing',
          });
        }
        
        // If we have area filters or propertyType filter, force refresh to get all properties
        // (cache might contain filtered data from previous requests)
        const hasAreaFilters = (filters?.areaIds && filters.areaIds.length > 0) || filters?.areaId;
        const hasPropertyTypeFilter = !!filters?.propertyType;
        
        // Clear cache if we have area filters or propertyType filter to ensure we get fresh data with all properties
        if (hasAreaFilters || hasPropertyTypeFilter) {
          clearPublicDataCache();
        }
        
        // Get all data from public endpoint (force refresh if area filters or propertyType filter are present)
        const publicData = await getPublicData(!!(hasAreaFilters || hasPropertyTypeFilter));
        
        // Extract properties from public data
        let properties: Property[] = [];
        if (publicData.properties && Array.isArray(publicData.properties)) {
          properties = publicData.properties;
          console.log(`Loaded ${properties.length} properties from /api/public/data`);
        } else {
          // If properties are not directly in publicData, it might be structured differently
          console.warn('Properties not found in public data structure. Actual structure:', Object.keys(publicData));
          return { properties: [], total: 0 };
        }
        
        // Ensure properties is always an array
        if (!Array.isArray(properties)) {
          console.warn('⚠️ Properties from /api/public/data is not an array, converting to array');
          properties = [];
        }
        
        // Normalize photos array for each property (same as in main endpoint)
        properties = properties.map((property: any) => {
          if (!property.photos) {
            property.photos = [];
          } else if (!Array.isArray(property.photos)) {
            // If photos is not an array, try to convert it
            if (typeof property.photos === 'string') {
              // If it's a string, try to parse it as JSON or use it as single photo
              try {
                const parsed = JSON.parse(property.photos);
                property.photos = Array.isArray(parsed) ? parsed : [property.photos];
              } catch {
                property.photos = [property.photos];
              }
            } else {
              property.photos = [];
            }
          }
          // Filter out empty strings, null, or undefined from photos array
          property.photos = property.photos.filter((photo: any) => photo && typeof photo === 'string' && photo.trim().length > 0);
          return property;
        });
        
        // Debug: Check if properties have area data
        if (properties.length > 0 && process.env.NODE_ENV === 'development') {
          const propertiesWithArea = properties.filter(p => typeof p.area === 'object' && p.area && p.area.id).length;
          console.log(`Properties with area data: ${propertiesWithArea} / ${properties.length}`);
          if (filters?.areaIds || filters?.areaId) {
            const sampleAreaIds = properties.slice(0, 10).map(p => {
              if (typeof p.area === 'object') return p.area?.id;
              return null;
            }).filter(Boolean);
            console.log('Sample area IDs from properties:', sampleAreaIds);
            console.log('Looking for areaIds:', filters?.areaIds || [filters?.areaId].filter(Boolean));
          }
        }
        
        // Debug: log sample property structure
        if (properties.length > 0 && process.env.NODE_ENV === 'development') {
          console.log('Sample property structure:', {
            id: properties[0].id,
            name: properties[0].name,
            propertyType: properties[0].propertyType,
            area: (properties[0].area && typeof properties[0].area === 'object') ? {
              id: properties[0].area.id,
              nameEn: properties[0].area.nameEn,
            } : null,
          });
          console.log('Filters applied:', {
            areaIds: filters?.areaIds,
            areaId: filters?.areaId,
            propertyType: filters?.propertyType,
          });
        }
        
        // Apply filters client-side
        let beforeFilters = properties.length;
        const propertiesBeforeFilter = [...properties]; // Keep copy for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log(`Starting with ${beforeFilters} properties before client-side filtering`);
          
          // Log property types distribution
          if (beforeFilters > 0) {
            const propertyTypes = properties.reduce((acc, p) => {
              acc[p.propertyType] = (acc[p.propertyType] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            console.log('Property types in loaded data:', propertyTypes);
          }
        }
        
        if (filters?.propertyType) {
          const before = properties.length;
          properties = properties.filter(p => p.propertyType === filters.propertyType);
          if (process.env.NODE_ENV === 'development') {
            console.log(`PropertyType filter (${filters.propertyType}): ${before} -> ${properties.length}`);
            if (properties.length === 0 && before > 0) {
              // Show sample property types to debug - use original properties array
              const sampleTypes = propertiesBeforeFilter.slice(0, 10).map(p => p.propertyType);
              const uniqueTypes = [...new Set(sampleTypes)];
              console.warn('⚠️ No properties match filter. Sample property types from loaded data:', uniqueTypes);
              console.warn('⚠️ Filter was looking for propertyType:', filters.propertyType);
              
              // Special warning for secondary properties
              // Note: TypeScript narrows the type after propertyType filter, so we use type assertion
              if ((filters.propertyType as string) === 'secondary') {
                console.error('❌ CRITICAL: /api/public/data does not contain secondary properties!');
                console.error('❌ This endpoint only returns off-plan properties.');
                console.error('❌ You need to use /api/properties?propertyType=secondary directly with API Key/Secret.');
                console.error('❌ Please check backend configuration for /api/public/data endpoint.');
              }
            }
          }
        }
        
        if (filters?.developerId) {
          const before = properties.length;
          properties = properties.filter(p => p.developer?.id === filters.developerId);
          if (process.env.NODE_ENV === 'development') {
            console.log(`Developer filter: ${before} -> ${properties.length}`);
          }
        }
        
        if (filters?.cityId) {
          const before = properties.length;
          properties = properties.filter(p => p.city?.id === filters.cityId);
          if (process.env.NODE_ENV === 'development') {
            console.log(`City filter: ${before} -> ${properties.length}`);
          }
        }
        
        // Area filter - support multiple areas for client-side filtering
        if (filters?.areaIds && filters.areaIds.length > 0) {
          const before = properties.length;
          const propertiesBeforeFilter = [...properties]; // Keep copy for debugging
          
          // Debug: Show sample area IDs BEFORE filtering
          if (process.env.NODE_ENV === 'development' && before > 0) {
            const sampleAreaIds = propertiesBeforeFilter.slice(0, 10).map(p => ({
              propertyId: p.id,
              propertyName: p.name,
            areaId: (typeof p.area === 'object' && p.area !== null) ? p.area.id : null,
            areaName: (typeof p.area === 'object' && p.area !== null) ? p.area.nameEn : (typeof p.area === 'string' ? p.area : ''),
            }));
            console.log('Sample area IDs from properties BEFORE filter:', sampleAreaIds);
            console.log('Looking for areaIds:', filters.areaIds);
            
            // Check if any property matches
            const matchingCount = propertiesBeforeFilter.filter(p => 
              typeof p.area === 'object' && p.area?.id && filters.areaIds!.includes(p.area.id)
            ).length;
            console.log(`Found ${matchingCount} properties that should match the area filter`);
            
            // Show all unique area IDs in the dataset
            const uniqueAreaIds = [...new Set(propertiesBeforeFilter.map(p => {
              if (typeof p.area === 'object') return p.area?.id;
              return null;
            }).filter(Boolean))];
            console.log(`Total unique area IDs in dataset: ${uniqueAreaIds.length}`);
            console.log('First 20 unique area IDs:', uniqueAreaIds.slice(0, 20));
            
            // Note: If all properties have the same area ID and it doesn't match the filter,
            // this might indicate that /api/public/data is not returning all properties.
            // But this should be fixed on the backend now.
            if (uniqueAreaIds.length === 1 && uniqueAreaIds[0] && !filters.areaIds.includes(uniqueAreaIds[0])) {
              console.warn('⚠️ /api/public/data returned properties with only one area ID, but filter is looking for a different area ID.');
              console.warn(`Expected area IDs: ${filters.areaIds.join(', ')}`);
              console.warn(`Got area ID in data: ${uniqueAreaIds[0]}`);
            }
          }
          
          properties = properties.filter(p => {
            // Only filter by areaId for secondary properties (where area is an object)
            if (typeof p.area !== 'object' || p.area === null || !p.area.id) {
              return false;
            }
            return filters.areaIds!.includes(p.area.id);
          });
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`Area filter: ${before} -> ${properties.length} properties (filtering by areaIds: ${filters.areaIds.join(', ')})`);
            if (properties.length === 0 && before > 0) {
              // Show first few properties with their area IDs to debug
              const sampleProperties = propertiesBeforeFilter.slice(0, 5).map(p => ({
                id: p.id,
                name: p.name,
                areaId: (typeof p.area === 'object' && p.area !== null) ? p.area.id : null,
                areaName: (typeof p.area === 'object' && p.area !== null) ? p.area.nameEn : (typeof p.area === 'string' ? p.area : ''),
              }));
              console.warn('No properties found after area filter. Sample properties with their area IDs:', sampleProperties);
            }
          }
        } else if (filters?.areaId) {
          // Fallback to single areaId for backward compatibility
          const before = properties.length;
          
          // Debug: Show sample area IDs BEFORE filtering
          if (process.env.NODE_ENV === 'development' && before > 0) {
            const sampleAreaIds = properties.slice(0, 10).map(p => {
              if (typeof p.area === 'object') return p.area?.id;
              return null;
            }).filter(Boolean);
            console.log('Sample area IDs from properties BEFORE filter:', sampleAreaIds);
            console.log('Looking for areaId:', filters.areaId);
          }
          
          properties = properties.filter(p => {
            // Only filter by areaId for secondary properties (where area is an object)
            if (typeof p.area !== 'object' || p.area === null || !p.area.id) return false;
            return p.area.id === filters.areaId;
          });
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`Area filter (single): ${before} -> ${properties.length} properties (filtering by areaId: ${filters.areaId})`);
          }
        }
        
        if (filters?.bedrooms) {
          const bedroomValues = filters.bedrooms.split(',').map(b => parseInt(b.trim()));
          properties = properties.filter(p => {
            if (p.propertyType === 'off-plan') {
              return bedroomValues.some(b => 
                p.bedroomsFrom !== null && p.bedroomsFrom !== undefined && 
                p.bedroomsTo !== null && p.bedroomsTo !== undefined &&
                b >= p.bedroomsFrom && b <= p.bedroomsTo
              );
            } else {
              return p.bedrooms !== undefined && bedroomValues.includes(p.bedrooms);
            }
          });
        }
        
        if (filters?.sizeFrom) {
          properties = properties.filter(p => {
            const size = p.propertyType === 'off-plan' ? p.sizeFrom : p.size;
            return size !== null && size !== undefined && size >= filters.sizeFrom!;
          });
        }
        
        if (filters?.sizeTo) {
          properties = properties.filter(p => {
            const size = p.propertyType === 'off-plan' ? p.sizeTo : p.size;
            return size !== null && size !== undefined && size <= filters.sizeTo!;
          });
        }
        
        if (filters?.priceFrom !== undefined && filters?.priceFrom !== null) {
          // Filter values come in AED (from UI), so we need to compare with AED prices
          const priceFromValue = filters.priceFrom;
          let priceFromFilter: number;
          if (typeof priceFromValue === 'string') {
            priceFromFilter = parseFloat(priceFromValue.replace(/[^0-9.-]/g, '')) || 0;
          } else if (typeof priceFromValue === 'number') {
            priceFromFilter = priceFromValue;
          } else {
            priceFromFilter = 0;
          }
          const before = properties.length;
          properties = properties.filter(p => {
            // Use AED prices for comparison since filter is in AED
            const priceAED = p.propertyType === 'off-plan' ? p.priceFromAED : p.priceAED;
            const priceValue = typeof priceAED === 'string' ? parseFloat(priceAED) || 0 : (priceAED || 0);
            
            if (process.env.NODE_ENV === 'development' && before > 0 && properties.length === before) {
              // Log first few properties for debugging
              const index = properties.indexOf(p);
              if (index < 3) {
                console.log(`PriceFrom filter check: ${p.name}, priceAED: ${priceValue}, filter: >= ${priceFromFilter}, match: ${priceValue >= priceFromFilter}`);
              }
            }
            
            return priceValue >= priceFromFilter;
          });
          if (process.env.NODE_ENV === 'development') {
            console.log(`PriceFrom filter (>= ${priceFromFilter} AED): ${before} -> ${properties.length}`);
          }
        }
        
        if (filters?.priceTo !== undefined && filters?.priceTo !== null) {
          // Filter values come in AED (from UI), so we need to compare with AED prices
          const priceToValue = filters.priceTo;
          let priceToFilter: number;
          if (typeof priceToValue === 'string') {
            priceToFilter = parseFloat(priceToValue.replace(/[^0-9.-]/g, '')) || Infinity;
          } else if (typeof priceToValue === 'number') {
            priceToFilter = priceToValue;
          } else {
            priceToFilter = Infinity;
          }
          const before = properties.length;
          properties = properties.filter(p => {
            // Use AED prices for comparison since filter is in AED
            // For off-plan, use priceToAED if available, otherwise priceFromAED
            // For secondary, use priceAED
            let priceAED: number | string | undefined;
            if (p.propertyType === 'off-plan') {
              priceAED = (p as any).priceToAED || p.priceFromAED;
            } else {
              priceAED = p.priceAED;
            }
            const priceValue = typeof priceAED === 'string' ? parseFloat(priceAED) || 0 : (priceAED || 0);
            
            if (process.env.NODE_ENV === 'development' && before > 0 && properties.length === before) {
              // Log first few properties for debugging
              const index = properties.indexOf(p);
              if (index < 3) {
                console.log(`PriceTo filter check: ${p.name}, priceAED: ${priceValue}, filter: <= ${priceToFilter}, match: ${priceValue <= priceToFilter}`);
              }
            }
            
            return priceValue <= priceToFilter;
          });
          if (process.env.NODE_ENV === 'development') {
            console.log(`PriceTo filter (<= ${priceToFilter} AED): ${before} -> ${properties.length}`);
          }
        }
        
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          properties = properties.filter(p => 
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply sorting (client-side when using public data)
        // Always sort, using provided sort or default
        const sortBy = filters?.sortBy || 'createdAt';
        const sortOrder = filters?.sortOrder || 'DESC';
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Applying client-side sort:', sortBy, sortOrder);
          console.log(`Total properties to sort: ${properties.length}`);
          console.log('Filters received:', {
            sortBy: filters?.sortBy,
            sortOrder: filters?.sortOrder,
            propertyType: filters?.propertyType,
          });
        }
        
        // Log detailed info about first 3 properties before sorting
        if (properties.length > 0 && process.env.NODE_ENV === 'development') {
          const sampleProps = properties.slice(0, 3).map(p => {
            const priceValue = p.propertyType === 'off-plan' ? p.priceFrom : p.price;
            return {
              name: p.name,
              propertyType: p.propertyType,
              priceFrom: p.priceFrom,
              price: p.price,
              priceFromAED: p.priceFromAED,
              priceAED: p.priceAED,
              priceValueForSort: priceValue,
              sizeFrom: p.sizeFrom,
              size: p.size,
            };
          });
          console.log('Properties before sort (first 3):', sampleProps);
        }
        
        // Create a stable copy for sorting
        const sortedProperties = [...properties];
        
        sortedProperties.sort((a, b) => {
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
              // Use USD prices for comparison (more consistent)
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
                const indexA = sortedProperties.indexOf(a);
                const indexB = sortedProperties.indexOf(b);
                if (indexA < 5 || indexB < 5) {
                  console.log(`Price sort: ${a.name} (${aValue}) vs ${b.name} (${bValue}), order: ${sortOrder}, result: ${sortOrder === 'ASC' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)}`);
                }
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
        properties.length = 0;
        properties.push(...sortedProperties);
        
        // Debug: log first few properties after sorting
        if (process.env.NODE_ENV === 'development' && properties.length > 0) {
          const sortedSample = properties.slice(0, 3).map(p => {
            const priceValue = p.propertyType === 'off-plan' ? p.priceFrom : p.price;
            return {
              name: p.name,
              propertyType: p.propertyType,
              priceUSD: priceValue,
              priceAED: p.propertyType === 'off-plan' ? p.priceFromAED : p.priceAED,
              size: p.propertyType === 'off-plan' ? p.sizeFrom : p.size,
              createdAt: p.createdAt,
            };
          });
          console.log('First 3 properties after client-side sort:', sortedSample);
          console.log(`Sort completed: ${sortBy} ${sortOrder}`);
        }
        
        const result: GetPropertiesResult = {
          properties,
          total: properties.length,
        };
        
        // Cache the result
        if (useCache) {
          propertiesCache.set(cacheKey, {
            result,
            timestamp: Date.now(),
          });
          // Limit cache size
          if (propertiesCache.size > 10) {
            const firstKey = propertiesCache.keys().next().value;
            if (firstKey) {
              propertiesCache.delete(firstKey);
            }
          }
        }
        
        return result;
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error fetching properties:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
      
      // Check if the error message gives us a hint
      if (error.response.data?.message) {
        console.error('Error message from server:', error.response.data.message);
      }
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
    return response.data.data;
  } catch (error: any) {
    // If 403 or 401, try to get from public data endpoint
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.warn(`Status ${error.response.status} on /properties/${id}, trying to find property in public data...`);
      
      try {
        // Get all data from public endpoint
        const publicData = await getPublicData();
        
        if (publicData.properties && Array.isArray(publicData.properties)) {
          const property = publicData.properties.find(p => p.id === id);
          
          if (property) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ Found property ${id} in public data`);
            }
            return property;
          } else {
            throw new Error('Property not found in public data');
          }
        } else {
          throw new Error('Properties not found in public data structure');
        }
      } catch (publicDataError: any) {
        console.error('Error fetching property from public data:', publicDataError);
        throw new Error(`Property not found: ${publicDataError.message || 'Unknown error'}`);
      }
    }
    
    // For other errors, log and rethrow
    console.error('Error fetching property:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
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
    if (process.env.NODE_ENV === 'development') {
      console.log('Using cached public data');
    }
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
      console.log('Loaded and cached public data');
      if (data.properties && Array.isArray(data.properties)) {
        const uniqueAreaIds = [...new Set(data.properties.map(p => {
          if (typeof p.area === 'object' && p.area !== null) {
            return p.area.id;
          }
          return null;
        }).filter(Boolean))];
        console.log(`Public data contains ${data.properties.length} properties with ${uniqueAreaIds.length} unique area IDs`);
        
        // Show all unique area IDs (for debugging)
        if (uniqueAreaIds.length > 0) {
          console.log('All unique area IDs in public data:', uniqueAreaIds);
        }
        
        // Check if we have areas data and compare with properties
        if (data.areas && Array.isArray(data.areas)) {
          const areaIdsFromAreas = data.areas.map(a => a.id);
          console.log(`Areas data contains ${areaIdsFromAreas.length} areas`);
          console.log('First 10 area IDs from areas:', areaIdsFromAreas.slice(0, 10));
          
          // Check if properties use area IDs that exist in areas
          const areaIdsInProperties = uniqueAreaIds.filter((id): id is string => id !== null);
          const missingAreaIds = areaIdsInProperties.filter(id => !areaIdsFromAreas.includes(id));
          if (missingAreaIds.length > 0) {
            console.warn('⚠️ Some area IDs in properties are not found in areas list:', missingAreaIds);
          }
        }
      }
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching public data:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Clear public data cache (useful for testing or forced refresh)
 */
export function clearPublicDataCache(): void {
  publicDataCache = null;
  publicDataCacheTime = 0;
  if (process.env.NODE_ENV === 'development') {
    console.log('Public data cache cleared');
  }
}

/**
 * Submit investment (for registered users)
 */
export async function submitInvestment(data: InvestmentRequest): Promise<Investment> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Submitting investment (authenticated):', {
        propertyId: data.propertyId,
        amount: data.amount,
        date: data.date,
        hasNotes: !!data.notes,
      });
    }
    
    const response = await apiClient.post<ApiResponse<Investment>>('/investments', data);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Investment submitted successfully:', response.data.data);
    }
    
    return response.data.data;
  } catch (error: any) {
    console.error('Error submitting investment:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
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
export async function getAreas(cityId?: string): Promise<Area[]> {
  try {
    const params = cityId ? { cityId } : {};
    const url = '/public/areas';
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Fetching areas from:', `${API_BASE_URL}${url}`, params);
    }
    
    const response = await apiClient.get<ApiResponse<Area[]>>(url, { params });
    let areas = response.data.data;
    
    if (process.env.NODE_ENV === 'development') {
      const areasWithImages = areas.filter(a => a.images && Array.isArray(a.images) && a.images.length > 0).length;
      const areasWithDescription = areas.filter(a => a.description).length;
      const areasWithInfrastructure = areas.filter(a => a.infrastructure).length;
      
      console.log(`✅ Successfully loaded ${areas.length} areas from /api/public/areas`);
      console.log(`📸 Areas with images: ${areasWithImages}/${areas.length}`);
      console.log(`📝 Areas with description: ${areasWithDescription}/${areas.length}`);
      console.log(`🏗️ Areas with infrastructure: ${areasWithInfrastructure}/${areas.length}`);
      
      if (areasWithImages > 0) {
        const sampleAreas = areas.filter(a => a.images && Array.isArray(a.images) && a.images.length > 0).slice(0, 5);
        console.log('✅ Sample areas with images:', sampleAreas.map(a => ({
          nameEn: a.nameEn,
          imagesCount: a.images?.length || 0,
          firstImage: a.images?.[0]?.substring(0, 60) + '...' || 'N/A'
        })));
      }
      
      const areasWithoutImages = areas.filter(a => !a.images || !Array.isArray(a.images) || a.images.length === 0);
      if (areasWithoutImages.length > 0) {
        console.warn(`⚠️ ${areasWithoutImages.length} areas without images from /api/public/areas`);
        if (areasWithoutImages.length <= 10) {
          console.warn('Areas without images:', areasWithoutImages.map(a => a.nameEn));
        }
      }
    }
    
    return areas;
  } catch (error: any) {
    // If 404, fallback to /public/data
    if (error.response?.status === 404) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ /public/areas endpoint not found (404), falling back to /public/data');
      }
      
      try {
        // Get areas from public data
        const publicData = await getPublicData(true);
        const areasFromData = publicData.areas || [];
        
        if (process.env.NODE_ENV === 'development') {
          // Check how many areas already have images from /public/data
          // Note: Areas from /public/data don't have images field in the type, but might have it in actual data
          const areasWithImagesFromData = areasFromData.filter(a => (a as any).images && Array.isArray((a as any).images) && (a as any).images.length > 0);
          console.log(`📊 Fallback: Loaded ${areasFromData.length} areas from /public/data`);
          console.log(`📸 Fallback: ${areasWithImagesFromData.length} areas already have images from /public/data`);
          
          if (areasWithImagesFromData.length > 0) {
            console.log('Sample areas with images from /public/data:', areasWithImagesFromData.slice(0, 5).map(a => ({
              nameEn: a.nameEn,
              imagesCount: ((a as any).images?.length || 0) as number
            })));
          }
        }
        
        // Try to get properties ONLY if we need images (not for counts - counts should come from backend)
        let properties: Property[] = [];
        const areasWithoutImages = areasFromData.filter(a => !(a as any).images || !Array.isArray((a as any).images) || (a as any).images.length === 0);
        
        if (areasWithoutImages.length > 0) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`⚠️ Fallback: ${areasWithoutImages.length} areas need images from properties`);
          }
          
          try {
            // Load only a limited number of properties for images (not all 26K!)
            // Use limit to avoid loading all secondary properties
            const result = await getProperties({ limit: 1000 });
            properties = result.properties || [];
          
          if (process.env.NODE_ENV === 'development') {
              console.log(`📦 Fallback: Loaded ${properties.length} properties for area images (limited to 1000)`);
          }
        } catch (propError: any) {
            // If properties fail, continue without images
          if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ Fallback: Could not load properties for area images:', propError);
            }
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Fallback: All areas already have images from /public/data, skipping properties loading');
          }
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
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🗺️ Fallback: Built area name map with ${areaNameToIdMap.size} areas`);
          console.log(`📦 Fallback: Processing ${properties.length} properties for area images`);
        }
        
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
                  console.warn(`⚠️ Fallback: Could not find area ID for property area name: "${areaName}" (property: ${property.name})`);
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
                  console.log(`✅ Fallback: Mapped image for area: ${area?.nameEn || areaId} (from property: ${property.name})`);
                }
              }
            }
          }
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`📸 Fallback: Created image map: ${areaImagesMap.size} areas have images from properties`);
          if (unmatchedAreaNames.size > 0) {
            console.warn(`⚠️ Fallback: Total unmatched area names: ${unmatchedAreaNames.size}`);
            console.warn('Sample unmatched names:', Array.from(unmatchedAreaNames).slice(0, 10));
          }
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
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ Fallback: Using images from /public/data for area: ${area.nameEn} (${areaImages.length} images)`);
            }
          } 
          // Priority 2: Use images from properties (areaImagesMap)
          else if (areaImagesMap.has(area.id)) {
            areaImages = [areaImagesMap.get(area.id)!];
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ Fallback: Using image from properties for area: ${area.nameEn}`);
            }
          } 
          // Priority 3: Try to find from areaProperties
          else if (areaProperties.length > 0) {
            const propertyWithPhoto = areaProperties.find(p => p.photos && p.photos.length > 0);
            if (propertyWithPhoto && propertyWithPhoto.photos) {
              areaImages = [propertyWithPhoto.photos[0]];
              if (process.env.NODE_ENV === 'development') {
                console.log(`✅ Fallback: Found image from area properties for: ${area.nameEn}`);
              }
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
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Loaded ${filteredAreas.length} areas from /public/data (fallback)`);
        }
        
        return filteredAreas;
      } catch (fallbackError: any) {
        console.error('❌ Error in fallback to /public/data:', fallbackError);
        throw fallbackError;
      }
    }
    
    // For other errors, throw as usual
    console.error('❌ Error fetching areas:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response URL:', error.response.config?.url);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Get area by ID
 */
export async function getAreaById(areaId: string): Promise<Area | null> {
  try {
    const areas = await getAreas();
    const area = areas.find(a => a.id === areaId);
    return area || null;
  } catch (error: any) {
    console.error('Error fetching area by ID:', error);
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
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Fetching developers from:', `${API_BASE_URL}${url}`);
    }
    
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
      
      console.log(`✅ Successfully loaded ${processedDevelopers.length} developers from /api/public/developers`);
      console.log(`📸 Developers with images: ${developersWithImages}/${processedDevelopers.length}`);
      console.log(`📝 Developers with description: ${developersWithDescription}/${processedDevelopers.length}`);
      console.log(`🖼️ Developers with logo: ${developersWithLogo}/${processedDevelopers.length}`);
    }
    
    return processedDevelopers;
  } catch (error: any) {
    // If 404, fallback to /public/data
    if (error.response?.status === 404) {
      console.warn('⚠️ /public/developers endpoint not found (404), falling back to /public/data');
      
      try {
        // Get developers from public data
        console.log('🔄 Fallback: Fetching public data...');
        const publicData = await getPublicData(true);
        console.log('✅ Fallback: Received public data:', {
          hasDevelopers: !!publicData.developers,
          developersType: Array.isArray(publicData.developers) ? 'array' : typeof publicData.developers,
          developersLength: Array.isArray(publicData.developers) ? publicData.developers.length : 'N/A',
        });
        
        const developersFromData = publicData.developers || [];
        
        console.log(`📊 Fallback: Loaded ${developersFromData.length} developers from /public/data`);
        
        if (!Array.isArray(developersFromData)) {
          console.error('❌ Fallback: developers is not an array:', developersFromData);
          return [];
        }
        
        if (developersFromData.length === 0) {
          console.warn('⚠️ Fallback: No developers found in /public/data');
          console.log('Available keys in publicData:', Object.keys(publicData));
          return [];
        }
        
        console.log('✅ Fallback: Sample developer:', developersFromData[0]);
        
        // Try to get properties to calculate counts (optional - don't fail if this fails)
        let properties: Property[] = [];
        try {
          console.log('🔄 Fallback: Loading properties for counts...');
          // Load only a limited number of properties for counts (not all 26K!)
          const result = await getProperties({ limit: 1000 });
          properties = result.properties || [];
          
          console.log(`📦 Fallback: Loaded ${properties.length} properties for developer counts (limited to 1000)`);
        } catch (propError: any) {
          console.warn('⚠️ Fallback: Could not load properties for developer counts (continuing without counts):', propError.message);
          // Continue without properties - counts will be 0
        }
        
        // Calculate projectsCount for each developer
        console.log('🔄 Fallback: Calculating projectsCount...');
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
        
        console.log(`✅ Fallback: Successfully loaded ${developersWithCounts.length} developers from /public/data`);
        
        return developersWithCounts;
      } catch (fallbackError: any) {
        console.error('❌ Error in fallback to /public/data:', fallbackError);
        console.error('Fallback error details:', {
          message: fallbackError.message,
          stack: fallbackError.stack,
          response: fallbackError.response?.data,
        });
        // Return empty array instead of throwing, so page can still render
        console.warn('⚠️ Returning empty developers array due to fallback error');
        return [];
      }
    }
    
    // For other errors, throw as usual
    console.error('❌ Error fetching developers:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response URL:', error.response.config?.url);
      console.error('Response data:', error.response.data);
    }
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
    console.error('Error fetching developer by ID:', error);
    return null;
  }
}

/**
 * Submit investment (for non-registered users)
 */
export async function submitInvestmentPublic(data: InvestmentRequest): Promise<Investment> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Submitting investment (public):', {
        propertyId: data.propertyId,
        amount: data.amount,
        date: data.date,
        userEmail: data.userEmail,
        userPhone: data.userPhone,
        hasNotes: !!data.notes,
      });
    }
    
    const response = await apiClient.post<ApiResponse<Investment>>('/investments/public', data);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Investment submitted successfully (public):', response.data.data);
    }
    
    return response.data.data;
  } catch (error: any) {
    console.error('Error submitting investment (public):', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
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
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Fetching news from:', `${API_BASE_URL}${url}`);
    }

    const response = await apiClient.get<ApiResponse<{
      data: NewsItem[];
      total: number;
      page: number;
      limit: number;
    }>>(url);

    if (process.env.NODE_ENV === 'development') {
      console.log('📰 News API response:', {
        success: response.data.success,
        dataType: typeof response.data.data,
        isArray: Array.isArray(response.data.data),
        keys: response.data.data && typeof response.data.data === 'object' ? Object.keys(response.data.data) : 'N/A',
        fullResponse: JSON.stringify(response.data, null, 2).substring(0, 500),
      });
    }

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
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ News: Direct array response, length:', data.length);
      }
    } else if (data && typeof data === 'object') {
      // Paginated response: { data: NewsItem[], total: number, page: number, limit: number }
      if ('data' in data && Array.isArray((data as any).data)) {
        newsArray = (data as any).data;
        total = (data as any).total || newsArray.length;
        currentPage = (data as any).page || page;
        currentLimit = (data as any).limit || limit;
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ News: Paginated response', {
            newsCount: newsArray.length,
            total,
            page: currentPage,
            limit: currentLimit,
          });
        }
      } else {
        // Try to find array in other keys
        const possibleKeys = ['news', 'items', 'results', 'list'];
        for (const key of possibleKeys) {
          if (Array.isArray((data as any)[key])) {
            newsArray = (data as any)[key];
            total = (data as any).total || newsArray.length;
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ News: Found array in key "${key}"`, newsArray.length);
            }
            break;
          }
        }
        if (newsArray.length === 0) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ News: No array found in response data');
          }
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
    console.error('❌ Error fetching news:', error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      
      if (process.env.NODE_ENV === 'development') {
        console.error('📰 News API Error Details:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          message: axiosError.message,
          code: axiosError.code,
          responseData: axiosError.response?.data,
          url: axiosError.config?.url,
          method: axiosError.config?.method,
        });
      }
      
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
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Fetching news article from:', `${API_BASE_URL}${url}`);
    }

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
    console.error('Error fetching news article:', error);
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


