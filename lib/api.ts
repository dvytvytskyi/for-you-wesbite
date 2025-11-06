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
    
    config.headers['x-api-key'] = API_KEY;
    config.headers['x-api-secret'] = API_SECRET;
    
    // Add JWT token if available (for authenticated users)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      const apiKeyValue = config.headers['x-api-key'] as string;
      const apiSecretValue = config.headers['x-api-secret'] as string;
      
      console.log('API Request:', {
        url: `${config.baseURL}${config.url}`,
        method: config.method,
        headers: {
          'Content-Type': config.headers['Content-Type'],
          'x-api-key': apiKeyValue ? `${apiKeyValue.substring(0, 20)}...` : 'missing',
          'x-api-secret': apiSecretValue ? `${apiSecretValue.substring(0, 20)}...` : 'missing',
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
  priceFrom?: number; // USD
  priceTo?: number; // USD
  search?: string;
  sortBy?: 'createdAt' | 'name' | 'price' | 'priceFrom' | 'size' | 'sizeFrom';
  sortOrder?: 'ASC' | 'DESC';
}

export interface Property {
  id: string;
  propertyType: 'off-plan' | 'secondary';
  name: string;
  description: string;
  photos: string[];
  country: {
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    code: string;
  };
  city: {
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
  };
  // For off-plan properties: area is a string "areaName, cityName" (e.g., "JVC, Dubai")
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
  };
  developer: {
    id: string;
    name: string;
    logo: string | null;
    description?: string;
    images?: string[];
  } | null;
  latitude: number;
  longitude: number;
  
  // Off-plan fields
  priceFrom?: number;
  priceFromAED?: number;
  bedroomsFrom?: number;
  bedroomsTo?: number;
  bathroomsFrom?: number;
  bathroomsTo?: number;
  sizeFrom?: number;
  sizeFromSqft?: number;
  sizeTo?: number;
  sizeToSqft?: number;
  paymentPlan?: string;
  units?: Array<{
    id: string;
    unitId: string;
    type: 'apartment' | 'villa' | 'penthouse' | 'townhouse' | 'office';
    price: number;
    priceAED: number;
    totalSize: number;
    totalSizeSqft: number;
    balconySize: number;
    balconySizeSqft: number;
    planImage: string;
  }>;
  
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
    iconName: string;
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
export async function getProperties(filters?: PropertyFilters): Promise<Property[]> {
  try {
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
        console.log(`✅ Successfully loaded ${response.data.data?.length || 0} properties from /api/properties endpoint`);
        if (filters?.propertyType) {
          console.log(`Property type filter: ${filters.propertyType}`);
        }
      }
      let data = response.data.data;
      
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
      
      return data;
    } catch (error: any) {
      // If 403 or 401, user is not authenticated - use public endpoint
      // Note: /api/public/data now returns all properties including secondary (as per backend fix)
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
        const publicData = await getPublicData(hasAreaFilters || hasPropertyTypeFilter);
        
        // Extract properties from public data
        let properties: Property[] = [];
        if (publicData.properties && Array.isArray(publicData.properties)) {
          properties = publicData.properties;
          console.log(`Loaded ${properties.length} properties from /api/public/data`);
        } else {
          // If properties are not directly in publicData, it might be structured differently
          console.warn('Properties not found in public data structure. Actual structure:', Object.keys(publicData));
          return [];
        }
        
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
            area: properties[0].area ? {
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
              if (filters.propertyType === 'secondary') {
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
              areaId: typeof p.area === 'object' ? p.area?.id : null,
              areaName: typeof p.area === 'object' ? p.area?.nameEn : p.area,
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
            if (uniqueAreaIds.length === 1 && !filters.areaIds.includes(uniqueAreaIds[0])) {
              console.warn('⚠️ /api/public/data returned properties with only one area ID, but filter is looking for a different area ID.');
              console.warn(`Expected area IDs: ${filters.areaIds.join(', ')}`);
              console.warn(`Got area ID in data: ${uniqueAreaIds[0]}`);
            }
          }
          
          properties = properties.filter(p => {
            // Only filter by areaId for secondary properties (where area is an object)
            if (typeof p.area !== 'object' || !p.area.id) {
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
                areaId: p.area?.id,
                areaName: p.area?.nameEn,
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
            if (typeof p.area !== 'object' || !p.area.id) return false;
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
                p.bedroomsFrom !== undefined && p.bedroomsTo !== undefined &&
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
            return size !== undefined && size >= filters.sizeFrom!;
          });
        }
        
        if (filters?.sizeTo) {
          properties = properties.filter(p => {
            const size = p.propertyType === 'off-plan' ? p.sizeTo : p.size;
            return size !== undefined && size <= filters.sizeTo!;
          });
        }
        
        if (filters?.priceFrom) {
          // Filter values come in AED (from UI), so we need to compare with AED prices
          const priceFromFilter = typeof filters.priceFrom === 'string' 
            ? parseFloat(filters.priceFrom.replace(/[^0-9.-]/g, '')) || 0
            : filters.priceFrom;
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
        
        if (filters?.priceTo) {
          // Filter values come in AED (from UI), so we need to compare with AED prices
          const priceToFilter = typeof filters.priceTo === 'string'
            ? parseFloat(filters.priceTo.replace(/[^0-9.-]/g, '')) || Infinity
            : filters.priceTo;
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
        
        return properties;
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
    const response = await apiClient.get<ApiResponse<PublicData>>('/public/data');
    const data = response.data.data;
    
    // Cache the data
    publicDataCache = data;
    publicDataCacheTime = now;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Loaded and cached public data');
      if (data.properties && Array.isArray(data.properties)) {
        const uniqueAreaIds = [...new Set(data.properties.map(p => p.area?.id).filter(Boolean))];
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
          const areaIdsInProperties = uniqueAreaIds;
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

export default apiClient;

