import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
let ADMIN_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.foryou-realestate.com/api';
if (ADMIN_API_BASE.includes('api.foryou-realestate.co')) {
  ADMIN_API_BASE = 'https://admin.foryou-realestate.com/api';
}

// On the client, we use our local next.js proxy to bypass CORS
// On the server, we go direct for performance
const IS_BROWSER = typeof window !== 'undefined';
const API_BASE_URL = IS_BROWSER ? '' : ADMIN_API_BASE;
const API_PROXY_PREFIX = '/api/proxy';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'fyr_7084daf35cf6427f60e06bccd675f133b8a19ce4866cf941156bb4f38fba4016';
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET || '2e9e9a3a8080f207cf1c684baaeff40dcd4404c10f4d2207340bb48ee8ccdccda3f4e2fde5bd74fa4d8f463e361c45c9437206a97abb772415263e3a69655a73';


// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Aggressive logging for ALL requests on server
apiClient.interceptors.request.use((config) => {
  (config as any)._startTime = Date.now();
  
  // Handle proxying for browser requests to bypass CORS
  if (IS_BROWSER && config.url && !config.url.startsWith('http') && !config.url.startsWith('/api/proxy')) {
    // Prefix relative or root-relative URLs with the proxy path
    const urlPath = config.url.startsWith('/') ? config.url : `/${config.url}`;
    config.url = `${API_PROXY_PREFIX}${urlPath}`;
    // Base URL is empty in browser, so it will hit current origin
  }
  
  return config;
});

// Add authentication headers to requests
apiClient.interceptors.request.use(
  (config) => {
    // Always add API key and secret
    // config.headers['Content-Type'] = 'application/json'; // Already set in axios.create

    // Ensure API key and secret are set
    if (!API_KEY || !API_SECRET) {
      // API keys validation - errors handled silently for performance
    }

    config.headers['x-api-key'] = API_KEY;
    config.headers['x-api-secret'] = API_SECRET;

    // Add JWT token if available (for authenticated users)
    if (typeof window !== 'undefined') {
      try {
        // Robust check for various possible token keys used in the ecosystem
        const token = localStorage.getItem('auth_token') || 
                      localStorage.getItem('token') || 
                      localStorage.getItem('foryou_token') ||
                      localStorage.getItem('broker_token');
                      
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        // Silent catch for localStorage issues
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
  (response) => {
    const duration = Date.now() - (response.config as any)._startTime;
    if (typeof window === 'undefined') {
      console.log(`%c[API-SUCCESS] ${response.config.method?.toUpperCase()} ${response.config.url} took ${duration}ms`, 'color: #27ae60');
    }
    return response;
  },
  (error: AxiosError) => {
    const duration = error.config ? Date.now() - (error.config as any)._startTime : 'unknown';
    if (typeof window === 'undefined') {
      console.error(`%c[API-FAILURE] ${error.config?.method?.toUpperCase()} ${error.config?.url} FAILED after ${duration}ms: ${error.message}`, 'color: #e74c3c');
    }

    if (error.response) {
      if (error.response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
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
  developerIds?: string[];
  cityId?: string;
  areaId?: string;
  areaSlug?: string;
  areaSlugs?: string[];
  areaIds?: string[]; // For client-side filtering with multiple areas
  bedrooms?: string; // Comma-separated: "1,2,3"
  sizeFrom?: number;
  sizeTo?: number;
  priceFrom?: number | string; // USD (can be number or string from URL params)
  priceTo?: number | string; // USD (can be number or string from URL params)
  search?: string;
  sortBy?: 'createdAt' | 'name' | 'price' | 'priceFrom' | 'size' | 'sizeFrom' | 'random';
  sortOrder?: 'ASC' | 'DESC';
  page?: number; // Page number for server-side pagination
  limit?: number; // Items per page for server-side pagination
  seed?: number | string; // For stable random sorting
  isForYouChoice?: boolean;
  summary?: boolean;
  locationIds?: string[];
  amenityIds?: string[];
  status?: string;
  completionDateFrom?: string;
  completionDateTo?: string;
}

export interface Property {
  id: string;
  slug?: string;
  propertyType: 'off-plan' | 'secondary';
  type?: 'new' | 'secondary';
  status: string;
  saleStatus: string;
  readiness?: string;
  completionDatetime?: string;
  name: string;
  description: string;
  descriptionRu?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoTitleRu?: string;
  seoDescriptionRu?: string;
  photos: string[];
  images?: Array<{
    small: string;
    full: string;
  }>;

  // Map Coordinates
  latitude: number;
  longitude: number;
  videoUrl?: string;

  // Country and city
  country: {
    id: string;
    nameEn: string;
    nameRu?: string;
    nameAr?: string;
    code?: string;
  } | null;
  city: {
    id: string;
    nameEn: string;
    nameRu?: string;
    nameAr?: string;
  } | null;

  // Area can be an object or a string
  area: string | {
    id: string;
    slug?: string;
    nameEn: string;
    nameRu?: string;
    nameAr?: string;
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
    slug?: string;
    nameEn?: string;
    nameRu?: string;
    logo?: string | null;
    description?: string;
    descriptionEn?: string;
    descriptionRu?: string;
    images?: string[];
  } | null;

  // Off-plan fields (Metrics & Specific Data)
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
  paymentPlan?: string;
  unitsCount?: number | null;
  
  paymentPlansJson?: Array<{
    Plan_name: string;
    months_after_handover: number;
    Payments: Array<{
      Payment_time: string;
      Percent_of_payment: string;
    }>;
  }> | null;
  
  units?: Array<{
    id?: string;
    unitId: string;
    type: string;
    price: number;
    priceAED?: number | null;
    totalSize: number;
    totalSizeSqft?: number | null;
    balconySize?: number | null;
    balconySizeSqft?: number | null;
    bedrooms?: string;
    floor?: string;
    planImage: string | null;
  }> | null;

  // Secondary fields
  price?: number | null;
  priceAED?: number | null;
  bedrooms?: number;
  bathrooms?: number;
  size?: number | null;
  sizeSqft?: number | null;
  buildingName?: string;
  communityName?: string;
  agentName?: string;
  agentPhone?: string;
  agentWhatsapp?: string;
  agentEmail?: string;
  agentPhoto?: string;
  brokerName?: string;
  brokerLogo?: string;
  reference?: string;
  rera?: string;
  verified?: boolean;
  displayAddress?: string;
  furnishing?: string;
  externalId?: string;
  listingDate?: string;

  // Common fields
  facilities: Array<{
    id: string;
    nameEn: string;
    nameRu?: string;
    nameAr?: string;
    iconName: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
  isForYouChoice?: boolean;
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
  amount: number | string; // USD
  date: string; // ISO date
  notes?: string;
  // For non-registered users
  userEmail?: string;
  userPhone?: string;
  userFirstName?: string;
  userLastName?: string;
  referenceId?: string;
}

// Property Finder API
export interface PropertyFinderFilters {
  category?: 'residential' | 'commercial';
  status?: 'off-plan' | 'secondary' | 'completed' | 'off_plan';
  developer?: string | string[];
  developerId?: string | string[];
  search?: string | string[];
  areaId?: string | string[];
  location?: string | string[];
  priceMin?: number | string | string[];
  priceMax?: number | string | string[];
  bedrooms?: string | number | string[] | number[];
  sizeMin?: number | string | string[];
  sizeMax?: number | string | string[];
  furnishingType?: 'furnished' | 'unfurnished' | 'partly-furnished' | string | string[];
  sortBy?: string | string[];
  sortOrder?: 'ASC' | 'DESC' | string | string[];
  listingType?: 'sale' | 'rent' | string;
  page?: number | string | string[];
  limit?: number | string | string[];
  locale?: string;
}

export interface PropertyFinderProject {
  id: string;
  name: string;
  category: string;
  status: string;
  developer: string;
  location: string;
  price?: number | string;
  priceAED?: number;
  minPrice?: string | number;
  maxPrice?: string | number;
  minPriceAed?: string | number;
  maxPriceAed?: string | number;
  readiness?: string;
  type?: string;
  saleStatus?: string;
  completionDatetime?: string;
  views?: string[];
  listingType?: 'sale' | 'rent';
  images: string[];
  fullData: any;
  createdAt?: string;
  // Technical details
  parkingSlots?: number;
  availableFrom?: string;
  finishingType?: string;
  furnishingType?: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  size?: number | string;
  yearBuilt?: string | number;
  projectStatus?: string;
}

// Investment API continues

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
  meta?: {
    seo?: {
      canonicalUrl?: string;
    };
  };
}

export interface GetDevelopersResult {
  developers: Developer[];
  total: number;
}

export interface MapMarker {
  id: string;
  name?: string;
  image?: string;
  area?: string;
  lat: number | string;
  lng: number | string;
  priceAED: number | string;
  propertyType: 'off-plan' | 'secondary';
  completionDate?: string;
  previewImage?: string;
  mainImage?: string;
  image?: string;
  photo?: string;
  thumbnail?: string;
  nameEn?: string;
  nameRu?: string;
}

// Cache for map markers (partitioned by type)
const markersCache = new Map<string, { data: MapMarker[], timestamp: number }>();
const MARKERS_CACHE_DURATION = 60 * 1000; // 1 minute

export async function getMapMarkers(filters?: PropertyFilters): Promise<MapMarker[]> {
  try {
    const normalizedParams: Record<string, any> = {};

    if (filters?.propertyType) normalizedParams.propertyType = filters.propertyType;
    if (filters?.search) normalizedParams.search = filters.search;
    if (filters?.bedrooms) normalizedParams.bedrooms = filters.bedrooms;
    if (filters?.priceFrom !== undefined && filters?.priceFrom !== '') normalizedParams.priceFrom = filters.priceFrom;
    if (filters?.priceTo !== undefined && filters?.priceTo !== '') normalizedParams.priceTo = filters.priceTo;

    if (filters?.areaSlug) {
      normalizedParams.areaSlug = filters.areaSlug;
    } else if (Array.isArray(filters?.areaSlugs) && filters.areaSlugs.length > 1) {
      normalizedParams.areaSlugs = filters.areaSlugs.join(',');
    } else if (Array.isArray(filters?.areaSlugs) && filters.areaSlugs.length === 1) {
      normalizedParams.areaSlug = filters.areaSlugs[0];
    } else if (Array.isArray(filters?.areaIds) && filters!.areaIds.length > 1) {
      normalizedParams.areaIds = filters!.areaIds.join(',');
    } else if (Array.isArray(filters?.areaIds) && filters!.areaIds.length === 1) {
      normalizedParams.areaId = filters!.areaIds[0];
    } else if (typeof filters?.areaId === 'string' && filters.areaId) {
      normalizedParams.areaId = filters.areaId;
    }

    if (Array.isArray(filters?.locationIds) && filters.locationIds.length > 0) {
      normalizedParams.locationId = filters.locationIds.join(',');
    }

    if (filters?.cityId) normalizedParams.cityId = filters.cityId;

    if (filters?.developerId) {
      normalizedParams.developerId = filters.developerId;
    } else if (Array.isArray(filters?.developerIds) && filters.developerIds.length > 1) {
      normalizedParams.developerIds = filters.developerIds.join(',');
    } else if (Array.isArray(filters?.developerIds) && filters.developerIds.length === 1) {
      normalizedParams.developerId = filters.developerIds[0];
    }

    const cacheKey = filters ? JSON.stringify(normalizedParams) : 'all';

    // Check cache
    const cached = markersCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < MARKERS_CACHE_DURATION) {
      return cached.data;
    }

    const response = await apiClient.get<any>('/public/map', { params: normalizedParams });

    let data: MapMarker[] = [];
    if (Array.isArray(response.data)) {
      data = response.data;
    } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
      data = response.data.data;
    }

    data = (Array.isArray(data) ? data : []).map((item: any) => {
      const resolvedImage = ensureAbsoluteUrl(item?.image || item?.mainImage || item?.previewImage || item?.photo || item?.thumbnail);
      return {
        ...item,
        image: resolvedImage || item?.image,
      } as MapMarker;
    });

    if (data.length > 0 || Array.isArray(data)) {
      markersCache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });
      return data;
    }
    return [];
  } catch (error) {
    console.error('Failed to get map markers', error);
    return [];
  }
}

export async function getProperties(filters?: PropertyFilters, useCache: boolean = true): Promise<GetPropertiesResult> {
  const startTime = Date.now();
  try {
    const cacheKey = JSON.stringify({
      ...filters,
      v: '2.5' // Cache invalidation
    });

    if (useCache) {
      const cached = propertiesCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < PROPERTIES_CACHE_DURATION) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API] getProperties CACHE HIT (${Date.now() - startTime}ms)`);
        }
        return cached.result;
      }
    }

    const url = `/public/properties`;
    // We pass filters directly as query parameters via axios config object
    const axiosParams: any = { ...filters };
    
    // Clean up empty filters and join arrays for the backend if needed
    Object.keys(axiosParams).forEach(key => {
      if (axiosParams[key] === undefined || axiosParams[key] === '' || (Array.isArray(axiosParams[key]) && axiosParams[key].length === 0)) {
        delete axiosParams[key];
      } else if (Array.isArray(axiosParams[key])) {
        // Support multiple common array formats for the backend
        const joined = axiosParams[key].join(',');
        axiosParams[key] = joined;
        
        // Add redundant plural forms if they don't exist
        if (key === 'areaIds' && !axiosParams['areaIds']) axiosParams['areaIds'] = joined;
      }
    });

    // Final sanity check: if areaId is present but areaIds is not, add it
    if (axiosParams.areaId && !axiosParams.areaIds) axiosParams.areaIds = axiosParams.areaId;
    if (axiosParams.areaIds && !axiosParams.areaId) axiosParams.areaId = axiosParams.areaIds.split(',')[0];
    
    // Some backends use 'area' or 'district' or 'neighborhood'
    if (axiosParams.locationIds) {
      axiosParams.location_ids = axiosParams.locationIds;
      axiosParams.areaIds = axiosParams.locationIds;
    }
    if (axiosParams.amenityIds) {
      axiosParams.amenity_ids = axiosParams.amenityIds;
      axiosParams.amenities = axiosParams.amenityIds;
    }
    
    // Explicit type mapping for strict off-plan/secondary separation
    if (axiosParams.type === 'new' || axiosParams.type === 'new-building') {
      axiosParams.type = 'off-plan';
      axiosParams.propertyType = 'off-plan';
    } else if (axiosParams.type === 'secondary' || axiosParams.type === 'resale') {
      axiosParams.type = 'secondary';
      axiosParams.propertyType = 'secondary';
    }
    
    if (axiosParams.status) {
      axiosParams.projectStatus = axiosParams.status;
    }

    const sortBy = axiosParams.sortBy || 'createdAt';
    const sortOrder = axiosParams.sortOrder || 'DESC';
    
    // Simplify parameters for the backend to avoid 500 errors
    if (sortBy === 'random') {
      // Use standard names that the backend expects after the recent fix
      axiosParams.sortBy = 'random';
      // If we have any form of seed, ensure it's just 'seed' for the backend
      const seedValue = axiosParams.seed || axiosParams.random_seed || axiosParams.randomSeed;
      if (seedValue) {
        axiosParams.seed = seedValue;
      }
      // Remove aliases to keep URL clean and avoid parsing conflicts
      delete axiosParams.random_seed;
      delete axiosParams.randomSeed;
      delete axiosParams.sort;
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        const queryParams = new URLSearchParams();
        Object.entries(axiosParams).forEach(([key, val]: [string, any]) => {
          if (val !== undefined) queryParams.append(key, val.toString());
        });
        console.log(`[API] Fetching properties: ${url}?${queryParams.toString()}`);
      }
      
      const response = await apiClient.get<ApiResponse<Property[]>>(url, { params: axiosParams });
      const apiResponse = response.data as any;

      const requestTime = Date.now() - startTime;
      if (process.env.NODE_ENV === 'development' || requestTime > 1000) {
        console.log(`[API] getProperties request took ${requestTime}ms for URL: ${url}`);
      }

      let data: any[] = [];
      let totalCount = 0;

      if (apiResponse.data) {
        if (Array.isArray(apiResponse.data)) {
          data = apiResponse.data;
        } else if (apiResponse.data.properties && Array.isArray(apiResponse.data.properties)) {
          data = apiResponse.data.properties;
          totalCount = apiResponse.data.pagination?.total || apiResponse.data.total || 0;
        } else if (apiResponse.data.data && Array.isArray(apiResponse.data.data)) {
          data = apiResponse.data.data;
        }
      } else if (Array.isArray(apiResponse.properties)) {
        data = apiResponse.properties;
      }

      if (!totalCount) {
        totalCount = apiResponse.total ||
          apiResponse.totalCount ||
          apiResponse.total_items ||
          apiResponse.totalItems ||
          apiResponse.meta?.total ||
          apiResponse.meta?.pagination?.total ||
          apiResponse.pagination?.total ||
          apiResponse.pagination?.totalCount ||
          apiResponse.recordCount ||
          apiResponse.total_records ||
          apiResponse.total_count ||
          apiResponse.rows_count ||
          apiResponse.full_count ||
          apiResponse.count ||
          apiResponse.resultsCount ||
          (apiResponse.data && (
            apiResponse.data.total || 
            apiResponse.data.totalCount || 
            apiResponse.data.meta?.total || 
            apiResponse.data.pagination?.total ||
            apiResponse.data.recordCount
          )) ||
          data.length;
      }

      // Pure total detection from standard backend fields
      if (!totalCount) {
        totalCount = apiResponse.total || 
                   apiResponse.meta?.total || 
                   apiResponse.data?.total ||
                   apiResponse.data?.meta?.total ||
                   data.length;
      }

      totalCount = Number(totalCount) || 0;

      const normalizedData = (Array.isArray(data) ? data : []).map(p => normalizeProperty(p));

      // ONLY sort if data is small (sanity check)
      // Skip if random sorting is requested (backend handles it)
      let finalData = normalizedData;
      if (normalizedData.length < 500 && sortBy !== 'random') {
        finalData = [...normalizedData].sort((a, b) => {
          let aVal: any, bVal: any;
          switch (sortBy) {
            case 'price':
            case 'priceFrom':
              aVal = a.propertyType === 'off-plan' ? (a.priceFrom || 0) : (a.price || 0);
              bVal = b.propertyType === 'off-plan' ? (b.priceFrom || 0) : (b.price || 0);
              break;
            case 'size':
            case 'sizeFrom':
              aVal = a.propertyType === 'off-plan' ? (a.sizeFrom || 0) : (a.size || 0);
              bVal = b.propertyType === 'off-plan' ? (b.sizeFrom || 0) : (b.size || 0);
              break;
            case 'name':
              aVal = (a.name || '').toLowerCase();
              bVal = (b.name || '').toLowerCase();
              return sortOrder === 'ASC' ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1);
            case 'createdAt':
            default:
              aVal = new Date(a.createdAt || 0).getTime();
              bVal = new Date(b.createdAt || 0).getTime();
          }
          return sortOrder === 'ASC' ? aVal - bVal : bVal - aVal;
        });
      } else {
        if (sortBy !== 'random') {
          console.warn(`[API] getProperties returned too many results (${normalizedData.length}), skipping client-side sort`);
          // Limit to 100 for safety if somehow we got 24k
          finalData = normalizedData.slice(0, 100);
        }
      }

      const canonicalUrl = apiResponse?.meta?.seo?.canonicalUrl
        || apiResponse?.data?.meta?.seo?.canonicalUrl
        || apiResponse?.seo?.canonicalUrl;

      const result: GetPropertiesResult = {
        properties: finalData,
        total: totalCount || normalizedData.length,
        meta: canonicalUrl ? { seo: { canonicalUrl } } : undefined,
      };
      if (useCache) propertiesCache.set(cacheKey, { result, timestamp: Date.now() });
      return result;
    } catch (error: any) {
      console.error('[API] getProperties error:', error.message);
      // Return empty result instead of trying to load and filter 24k properties in browser memory
      return { properties: [], total: 0, meta: undefined };
    }
  } catch (error: any) {
    console.error('[API] getProperties failed completely:', error);
    throw error;
  }
}

export async function getProperty(id: string): Promise<Property> {
  const startTime = Date.now();
  try {
    // Try the new dedicated public detail endpoint
    const response = await apiClient.get<ApiResponse<Property>>(`/public/properties/${id}`);

    if (response.data && response.data.success && response.data.data) {
      const took = Date.now() - startTime;
      if (took > 500) console.log(`[API] getProperty(${id}) public detail took ${took}ms`);
      return normalizeProperty(response.data.data);
    }

    // If response returned but marked as failure, throw to trigger fallback
    throw new Error(response.data?.message || 'Property fetch failed');
  } catch (error: any) {
    console.error(`[API] Failed to fetch full property ${id} (${Date.now() - startTime}ms):`, error.message);

    // Fallback 1: Try the summary endpoint (more robust against column errors)
    try {
      const summaryStart = Date.now();
      const summaryResponse = await apiClient.get<ApiResponse<Property>>(`/public/properties/${id}/summary`);
      if (summaryResponse.data && summaryResponse.data.data) {
        console.log(`[API] Fallback to summary for property ${id} took ${Date.now() - summaryStart}ms`);
        return normalizeProperty(summaryResponse.data.data);
      }
    } catch (summaryError) {
      // Continue to next fallback
    }

    // Fallback 2: Legacy endpoint
    try {
      const legacyStart = Date.now();
      const legacyResponse = await apiClient.get<ApiResponse<Property>>(`/properties/${id}`);
      if (legacyResponse.data && legacyResponse.data.data) {
        console.log(`[API] Fallback to legacy for property ${id} took ${Date.now() - legacyStart}ms`);
        return normalizeProperty(legacyResponse.data.data);
      }
    } catch (legacyError) { }

    throw error;
  }
}

// Cache for property summaries
const summaryCache = new Map<string, { data: Property, timestamp: number }>();
const SUMMARY_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get single property summary by ID (optimized for map popups)
 */
export async function getPropertySummary(id: string): Promise<Property> {
  try {
    // Check cache
    const cached = summaryCache.get(id);
    if (cached && (Date.now() - cached.timestamp) < SUMMARY_CACHE_DURATION) {
      return cached.data;
    }

    const response = await apiClient.get<ApiResponse<any>>(`/public/properties/${id}/summary`);
    let property = response.data.data;

    // Use normalization to ensure data consistency
    const normalized = normalizeProperty(property);

    // Save to cache
    summaryCache.set(id, { data: normalized, timestamp: Date.now() });

    return normalized;
  } catch (error) {
    console.warn(`[API] Failed to fetch property summary for ${id}, falling back to full getProperty`, error);
    return getProperty(id);
  }
}


// Helper: extract absolute URL and handle S3 bucket links
export const ensureAbsoluteUrl = (url: any) => {
  if (typeof url !== 'string' || !url) return '';
  if (url.startsWith('http')) return url;

  const MEDIA_BASE_URL = 'https://admin.foryou-realestate.com';
  let cleanUrl = url.trim();
  if (cleanUrl.startsWith('./')) cleanUrl = cleanUrl.substring(2);
  if (cleanUrl.startsWith('/')) return `${MEDIA_BASE_URL}${cleanUrl}`;

  return `${MEDIA_BASE_URL}/${cleanUrl}`;
};

/**
 * Robust normalization for Property Finder projects.
 * Handles parsing fullData, extracting localized names, and finding images in various structures.
 */
function normalizePFProject(p: any, locale: string = 'en'): PropertyFinderProject {
  if (!p) return {} as PropertyFinderProject;

  // 1. Parse fullData if it's a string
  let fdRaw = p.fullData;
  if (typeof fdRaw === 'string') {
    try { fdRaw = JSON.parse(fdRaw); } catch (e) { fdRaw = {}; }
  } else if (!fdRaw) {
    fdRaw = {};
  }

  // 2. Merge root level fields into a unified fullData object for components
  const fullData = { 
    ...p, 
    ...fdRaw,
    ...p.specifications,
    ...p.status,
    compliance: p.legal_compliance || fdRaw.compliance || fdRaw.legal_compliance
  };

  // 3. Helper for localized names/titles
  const getName = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      // Priority list for localized fields
      return val.en || val.ru || val.nameEn || val.nameRu || val.name || val.title || val.id || '';
    }
    return '';
  };

  // 4. Helper for extracting all possible images
  const extractImages = (item: any, fd: any): string[] => {
    const raw: any[] = [];
    
    // Helper to process media objects (common in PF data)
    const processMedia = (media: any) => {
      if (!media) return;
      const images = media.images || media.gallery || media.photos || [];
      if (Array.isArray(images)) {
        images.forEach((img: any) => {
          if (typeof img === 'string') raw.push(img);
          else if (img?.original?.url) raw.push(img.original.url);
          else if (img?.full?.url) raw.push(img.full.url);
          else if (img?.url) raw.push(img.url);
          else if (img?.link) raw.push(img.link);
        });
      }
    };

    // Try various possible locations for media/images
    processMedia(item.media);
    processMedia(fd.media);
    processMedia(item.fullData?.media);

    if (item.coverImage) raw.push(item.coverImage);
    if (fd.coverImage) raw.push(fd.coverImage);
    if (item.cover_image) raw.push(item.cover_image);

    // Root level arrays
    if (Array.isArray(item.images)) item.images.forEach((img: any) => raw.push(typeof img === 'string' ? img : (img.url || img.link || img.original)));
    if (Array.isArray(fd.images)) fd.images.forEach((img: any) => raw.push(typeof img === 'string' ? img : (img.url || img.link || img.original)));
    
    // Photos fallback
    if (item.photos) {
      if (Array.isArray(item.photos)) (item.photos as any[]).forEach(ph => raw.push(typeof ph === 'string' ? ph : (ph.url || ph.link)));
      else raw.push(item.photos);
    }
    
    // Check common field names directly
    const commonFields = ['coverImage', 'cover_image', 'mainImage', 'main_image', 'thumbnail', 'photo', 'image', 'picture'];
    commonFields.forEach(f => {
      if (item[f]) raw.push(item[f]);
      if (fd[f]) raw.push(fd[f]);
    });

    // Deep search inside fullData - increased depth and robustness
    const deepSearch = (obj: any, depth = 0) => {
      if (!obj || typeof obj !== 'object' || depth > 4) return;
      Object.keys(obj).forEach(key => {
        const lowerKey = key.toLowerCase();
        const value = obj[key];
        
        if (lowerKey === 'url' || lowerKey === 'link' || lowerKey === 'original' || lowerKey === 'original_url' || lowerKey === 'full') {
           if (typeof value === 'string' && value.startsWith('http')) raw.push(value);
           else if (value?.url) raw.push(value.url);
           else if (value?.full) raw.push(value.full);
        }
        
        if (lowerKey.includes('image') || lowerKey.includes('photo') || lowerKey.includes('media') || lowerKey.includes('gallery')) {
           if (typeof value === 'string' && value.startsWith('http')) raw.push(value);
           else if (Array.isArray(value)) {
             value.forEach((v: any) => {
               if (typeof v === 'string') raw.push(v);
               else if (v?.url || v?.link || v?.original?.url || v?.full) raw.push(v.url || v.link || v.original?.url || v.full);
             });
           } else if (typeof value === 'object' && value !== null) {
              if (value.url) raw.push(value.url);
              if (value.link) raw.push(value.link);
              if (value.full) raw.push(value.full);
              if (value.original?.url) raw.push(value.original.url);
              if (depth < 3) deepSearch(value, depth + 1);
           }
        } else if (typeof value === 'object' && value !== null && depth < 2) {
           deepSearch(value, depth + 1);
        }
      });
    };
    deepSearch(fd);

    // Filter out duplicates and invalid URLs
    return [...new Set(raw)].map(ensureAbsoluteUrl).filter(Boolean);
  };

  const images = extractImages(p, fullData);
  const finalName = getName(p.name || p.projectName || p.title || fullData.name || fullData.projectName || fullData.title) || `Project ${p.pfId || p.id}`;
  
  // Prioritize our own Hetzner storage URLs over external PF CDN (which blocks hotlinking)
  const sortedImages = [
    ...images.filter((u: string) => u.includes('objectstorage.com') || u.includes('foryou')),
    ...images.filter((u: string) => !u.includes('objectstorage.com') && !u.includes('foryou')),
  ];

  return {
    id: p.id,
    name: finalName,
    category: p.category || fullData.category || 'residential',
    status: (typeof p.status === 'object' && p.status?.projectStatus) || p.projectStatus || p.completion_status || (typeof p.status === 'string' ? p.status : '') || fullData.projectStatus || fullData.completion_status || 'off_plan',
    listingType: p.offeringType || p.offering_type || ((p.price?.type === 'rent' || p.price?.type === 'yearly' || (p.price?.amounts?.yearly > 0 && !(p.price?.amounts?.sale > 0))) ? 'rent' : 'sale'),
    developer: getName(p.developer?.name || p.developer || p.developer_name || fullData.developer?.name || fullData.developer || fullData.developer_name),
    location: (() => {
      const tree = p.location?.tree || fdRaw?.location?.tree || [];
      const districtItem = tree.find((t: any) => t.type === 'COMMUNITY' || t.type === 'DISTRICT' || t.type === 'AREA');
      const district = districtItem ? districtItem.name : '';
      
      const building = p.location?.name || fdRaw?.location?.name || (typeof p.location === 'string' ? p.location : '');
      const pathName = p.location?.path_name || fdRaw?.location?.path_name || "";

      if (district && building && district !== building && typeof building === 'string') {
        return `${building}, ${district}`;
      }
      
      return district || building || pathName || (locale === 'ru' ? 'Дубай' : 'Dubai');
    })(),
    price: (p.price?.type === 'rent' || p.price?.type === 'yearly') 
      ? (p.price?.amounts?.yearly || p.startingPrice || p.min_price || 0)
      : (p.price?.amounts?.sale || p.startingPrice || p.min_price || 0),
    minPriceAed: (p.price?.type === 'rent' || p.price?.type === 'yearly')
      ? (p.price?.amounts?.yearly || p.minPriceAed || p.priceAED || 0)
      : (p.price?.amounts?.sale || p.minPriceAed || p.priceAED || 0),
    maxPriceAed: p.maxPriceAed || p.price?.amounts?.sale || p.price?.amounts?.yearly || fullData.maxPriceAed || 0,
    images: sortedImages,
    fullData: fullData,
    createdAt: p.createdAt || p.lastSyncAt || fullData.lastSyncAt,
    // Technical details - pulled from root-level or fullData (supporting new structure)
    parkingSlots: p.parkingSlots ?? fullData.parkingSlots ?? p.specifications?.parkingSlots,
    availableFrom: p.availableFrom || fullData.availableFrom || p.status?.availableFrom,
    finishingType: p.finishingType || fullData.finishingType || p.specifications?.finishingType,
    furnishingType: p.furnishingType || fullData.furnishingType || p.specifications?.furnishingType,
    bedrooms: p.bedrooms || p.specifications?.bedrooms || fullData.bedrooms,
    bathrooms: p.bathrooms || p.specifications?.bathrooms || fullData.bathrooms,
    size: p.size || p.specifications?.size || fullData.size,
    yearBuilt: p.status?.age || p.status?.yearBuilt || p.age || fullData.age,
    projectStatus: p.status?.projectStatus || p.projectStatus || fullData.projectStatus,
  };
}

export async function getPropertyFinderProjects(filters?: PropertyFinderFilters): Promise<{ projects: PropertyFinderProject[], total: number }> {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    
    if (filters?.status) {
      let mappedStatus = filters.status;
      if (mappedStatus === 'off-plan') mappedStatus = 'off_plan';
      if (mappedStatus === 'secondary') mappedStatus = 'completed';
      params.append('status', mappedStatus);
    }
    if (filters?.developer) {
      const devs = Array.isArray(filters.developer) ? filters.developer : [filters.developer];
      params.append('developer', devs.join(','));
    }
    if (filters?.developerId) {
      const devIds = Array.isArray(filters.developerId) ? filters.developerId : [filters.developerId];
      params.append('developerId', devIds.join(','));
    }
    if (filters?.search) {
      const searches = Array.isArray(filters.search) ? filters.search : [filters.search];
      params.append('search', searches.join(','));
    }
    if (filters?.areaId) {
      const areaIds = Array.isArray(filters.areaId) ? filters.areaId : [filters.areaId];
      areaIds.forEach(id => params.append('areaId', id));
    }
    
    if (filters?.location) {
      const locations = typeof filters.location === 'string' ? filters.location.split(',') : (Array.isArray(filters.location) ? filters.location : [filters.location]);
      params.append('location', locations.join(','));
    }

    if (filters?.priceMin) params.append('priceMin', filters.priceMin.toString());
    if (filters?.priceMax) params.append('priceMax', filters.priceMax.toString());
    if (filters?.sizeMin) params.append('sizeMin', filters.sizeMin.toString());
    if (filters?.sizeMax) params.append('sizeMax', filters.sizeMax.toString());
    
    // Multiple bedrooms support
    if (filters?.bedrooms) {
      const bds = typeof filters.bedrooms === 'string' ? filters.bedrooms.split(',') : (Array.isArray(filters.bedrooms) ? filters.bedrooms : [filters.bedrooms]);
      params.append('bedrooms', bds.join(','));
    }

    if (filters?.furnishingType) {
      const types = Array.isArray(filters.furnishingType) ? filters.furnishingType : [filters.furnishingType];
      types.forEach(t => params.append('furnishingType', t));
    }
    if (filters?.listingType) {
      params.append('type', filters.listingType.toString());
    }
    if (filters?.sortBy) {
      if (filters.sortBy === 'price-desc') {
        params.append('sortBy', 'price');
        params.append('sortOrder', 'DESC');
      } else if (filters.sortBy === 'price-asc') {
        params.append('sortBy', 'price');
        params.append('sortOrder', 'ASC');
      } else if (filters.sortBy === 'newest') {
        params.append('sortBy', 'createdAt');
        params.append('sortOrder', 'DESC');
      } else if (filters.sortBy === 'size-desc') {
        params.append('sortBy', 'size');
        params.append('sortOrder', 'DESC');
      } else if (filters.sortBy === 'size-asc') {
        params.append('sortBy', 'size');
        params.append('sortOrder', 'ASC');
      } else {
        const sb = Array.isArray(filters.sortBy) ? filters.sortBy[0] : filters.sortBy;
        params.append('sortBy', sb);
        
        if (filters.sortOrder) {
          const so = Array.isArray(filters.sortOrder) ? filters.sortOrder[0] : filters.sortOrder;
          params.append('sortOrder', so);
        }
      }
    }
    
    const pageValue = Array.isArray(filters?.page) ? filters.page[0] : filters?.page;
    params.append('page', (parseInt(pageValue?.toString() || '1', 10)).toString());
    
    const limitValue = Array.isArray(filters?.limit) ? filters.limit[0] : filters?.limit;
    const limit = parseInt(limitValue?.toString() || '24', 10);
    params.append('limit', limit.toString());
    params.append('perPage', limit.toString());

    const apiUrl = `/property-finder/projects?${params.toString()}`;
    const response = await apiClient.get<ApiResponse<any>>(apiUrl);
    if (response.data && response.data.success) {
      const payload = response.data.data;
      let rawProjects: any[] = [];
      let totalCount = 0;

      if (Array.isArray(payload)) {
        rawProjects = payload;
        totalCount = (response.data as any).total || (response.data as any).totalCount || payload.length;
      } else if (payload && typeof payload === 'object') {
        rawProjects = payload.projects || payload.data || payload.items || [];
        const pagination = payload.pagination || payload.meta;
        totalCount = pagination?.total || pagination?.totalCount || payload.total || payload.totalCount || (response.data as any).total || (response.data as any).totalCount || rawProjects.length;
      }

      return {
        projects: (rawProjects || []).map(p => normalizePFProject(p, (filters?.locale as string) || 'en')),
        total: totalCount
      };
    }
    return { projects: [], total: 0 };
  } catch (error) {
    console.error('Failed to get Property Finder projects', error);
    return { projects: [], total: 0 };
  }
}

export async function getPropertyFinderProject(id: string, locale: string = 'en'): Promise<PropertyFinderProject | null> {
  try {
    const url = `/property-finder/projects/${id}`;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] getPropertyFinderProject: ${url} (locale: ${locale})`);
    }
    
    const response = await apiClient.get<ApiResponse<any>>(url);
    
    if (response.data && response.data.success && response.data.data) {
      const normalized = normalizePFProject(response.data.data, locale);
      if (!normalized) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`[API] normalizePFProject returned NULL for ID: ${id}`);
        }
      }
      return normalized;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[API] getPropertyFinderProject ${id} NOT FOUND or success:false`, response.data);
    }
    return null;
  } catch (error: any) {
    console.error(`Failed to get Property Finder project ${id}`, error?.response?.data || error.message);
    return null;
  }
}

/**
 * Get unique locations present in Property Finder projects
 */
export async function getPropertyFinderLocations(): Promise<any[]> {
  try {
    const response = await apiClient.get<any>('/property-finder/locations');
    const result = response.data;
    
    if (!result) return [];
    
    // Check various possible response formats
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }
    if (result.success && typeof result.data === 'object' && Array.isArray(result.data.locations)) {
      return result.data.locations;
    }
    if (Array.isArray(result)) {
      return result;
    }
    
    return [];
  } catch (error) {
    console.error('Failed to get Property Finder locations', error);
    return [];
  }
}

/**
 * Get map markers for Property Finder projects (optimized endpoint)
 */
export async function getPropertyFinderMapMarkers(status?: string): Promise<any[]> {
  try {
    console.log('[API] Fetching PF map markers...', status ? `with status: ${status}` : '');
    const params = new URLSearchParams();
    if (status) {
      let mappedStatus = status;
      if (mappedStatus === 'off-plan') mappedStatus = 'off_plan';
      params.append('status', mappedStatus);
    }
    
    const url = `/property-finder/map?${params.toString()}`;
    const response = await apiClient.get<any>(url);
    const result = response.data;
    
    if (result.success && Array.isArray(result.data)) {
      console.log(`[API] Received ${result.data.length} markers`);
      return result.data;
    }
    
    if (Array.isArray(result)) {
      console.log(`[API] Received ${result.length} markers (direct array)`);
      return result;
    }

    console.error('[API] PF Map response failed or data not array:', result);
    return [];
  } catch (error) {
    console.error('[API] Failed to get Property Finder map markers', error);
    return [];
  }
}

/**
 * Helper function to format price for Property Finder projects.
 * @param project The PropertyFinderProject object.
 * @param locale The current locale ('en' or 'ru').
 * @returns Formatted price string.
 */
export function getPriceDisplay(project: PropertyFinderProject, locale: string): string {
  const formatNum = (num: number) => {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const minPrice = typeof project.minPriceAed === 'string' ? parseFloat(project.minPriceAed) : (project.minPriceAed || 0);
  const maxPrice = typeof project.maxPriceAed === 'string' ? parseFloat(project.maxPriceAed) : (project.maxPriceAed || 0);

  const suffix = project.listingType === 'rent' ? (locale === 'ru' ? ' / год' : ' / year') : '';

  if (minPrice === 0 && maxPrice === 0) return locale === 'ru' ? 'Цена по запросу' : 'Price on request';
  if (minPrice === 0 && maxPrice > 0) return `${formatNum(maxPrice)} AED${suffix}`;

  if (maxPrice > minPrice) {
    return `${formatNum(minPrice)} - ${formatNum(maxPrice)} AED${suffix}`;
  }

  return `${formatNum(minPrice)} AED${suffix}`;
}

/**
 * Helper function to get a single price value for Property Finder projects.
 * @param project The PropertyFinderProject object.
 * @param locale The current locale ('en' or 'ru').
 * @returns Formatted price string or null if no price.
 */
export function getPrice(project: PropertyFinderProject, locale: string): string | null {
  const formatNumber = (num: number) => new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US').format(num);
  const rawPrice = project.minPriceAed || project.maxPriceAed || 0;
  const price = typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice;

  if (!price || price === 0) return null;
  return `${formatNumber(Math.round(price))} AED${project.listingType === 'rent' ? (locale === 'ru' ? ' / год' : ' / yr') : ''}`;
}

/**
 * UNIT NORMALIZATION
 */
function normalizeUnit(unit: any): any {

  if (!unit) return unit;

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

  // Normalize bedrooms and floor for units (new fields)
  if (unit.bedrooms !== null && unit.bedrooms !== undefined) {
    unit.bedrooms = String(unit.bedrooms);
  }
  if (unit.floor !== null && unit.floor !== undefined) {
    unit.floor = String(unit.floor);
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
}

// Helper function to normalize property data
export function normalizeProperty(property: any): Property {
  if (!property) return {} as Property;

  // Ensure basic fields exist
  // Improve name logic for off-plan properties from main properties table
  if (property.propertyType === 'off-plan' || property.status === 'off-plan') {
    const rawName = property.projectName || property.buildingName || property.nameEn || property.nameRu || property.name;
    if (rawName && rawName !== 'Property') {
      property.name = rawName;
    } else {
      property.name = property.nameEn || property.nameRu || 'Property';
    }
  } else if (!property.name) {
    property.name = property.nameEn || property.nameRu || 'Property';
  }

  if (!property.descriptionRu) {
    property.descriptionRu = property.description_ru || property.description;
  }

  if (!property.propertyType) {
    property.propertyType = 'off-plan'; // Default fallback
  }

  // Ensure slug exists - Backend should provide it, but fallback just in case
  if (!property.slug || property.slug.endsWith('-foryou-realestate')) {
    // If backend didn't provide a real slug, we must use the ID as the slug
    // Otherwise the property detail page will throw 404 because backend cannot find fake slugs.
    property.slug = property.id;
  }

  // Ensure facilities is always an array
  if (!property.facilities) {
    property.facilities = [];
  }

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

    // For off-plan properties, normalize bathroomsFrom/To (now supported in API)
    if (property.bathroomsFrom !== null && property.bathroomsFrom !== undefined) {
      property.bathroomsFrom = typeof property.bathroomsFrom === 'string' ? parseInt(property.bathroomsFrom, 10) : property.bathroomsFrom;
    }
    if (property.bathroomsTo !== null && property.bathroomsTo !== undefined) {
      property.bathroomsTo = typeof property.bathroomsTo === 'string' ? parseInt(property.bathroomsTo, 10) : property.bathroomsTo;
    }

    // Calculate sizeFromSqft/sizeToSqft if missing but sizeFrom/sizeTo exists (m² to sqft: 1 m² = 10.764 sqft)
    if (property.sizeFrom !== null && property.sizeFrom !== undefined && property.sizeFrom > 0) {
      if (property.sizeFromSqft === null || property.sizeFromSqft === undefined || property.sizeFromSqft === 0) {
        property.sizeFromSqft = property.sizeFrom;
      }
    }
    if (property.sizeTo !== null && property.sizeTo !== undefined && property.sizeTo > 0) {
      if (property.sizeToSqft === null || property.sizeToSqft === undefined || property.sizeToSqft === 0) {
        property.sizeToSqft = property.sizeTo;
      }
    }

  } else {
    // For secondary properties, calculate priceAED if missing but price exists
    if ((property.priceAED === null || property.priceAED === undefined || property.priceAED === 0) &&
      property.price !== null && property.price !== undefined && property.price > 0) {
      property.priceAED = Math.round(property.price * 3.673);
    }

    // Normalize bathrooms for secondary
    if (property.bathrooms !== null && property.bathrooms !== undefined) {
      property.bathrooms = typeof property.bathrooms === 'string' ? parseInt(property.bathrooms, 10) : property.bathrooms;
    }

    // Calculate sizeSqft if missing but size exists
    if (property.size !== null && property.size !== undefined && property.size > 0) {
      if (property.sizeSqft === null || property.sizeSqft === undefined || property.sizeSqft === 0) {
        property.sizeSqft = property.size;
      }
    }
  }

  // Ensure area has a slug if it's an object
  if (property.area && typeof property.area === 'object' && !property.area.slug) {
    property.area.slug = (property.area.nameEn || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Initial fallback if photos is missing/empty
  if (!property.photos || (Array.isArray(property.photos) && property.photos.length === 0)) {
    const altPhotos = property.images || property.image || property.imageUrl || property.gallery;
    if (Array.isArray(altPhotos) && altPhotos.length > 0) {
      if (typeof altPhotos[0] === 'string') {
        property.photos = altPhotos;
      } else if (typeof altPhotos[0] === 'object') {
        property.photos = altPhotos.map((p: any) => p.small || p.url || p.full);
      }
    } else if (typeof altPhotos === 'string' && altPhotos.length > 0) {
      property.photos = [altPhotos];
    }
  }

  // Handle flattened fields from list response (e.g. city: "Dubai", developer: "Emaar")
  if (typeof property.city === 'string' && property.city) {
    const cityName = property.city;
    property.city = { 
      id: '', 
      nameEn: cityName, 
      nameRu: cityName === 'Dubai' ? 'Дубай' : (cityName === 'Abu Dhabi' ? 'Абу-Даби' : cityName)
    };
  }

  if (typeof property.area === 'string' && property.area && !property.area.includes(',')) {
    property.area = { id: '', nameEn: property.area, nameRu: property.area };
  }

  if (typeof property.developer === 'string' && property.developer) {
    property.developer = { id: '', name: property.developer, nameEn: property.developer, nameRu: property.developer };
  }

  // Map list response fields to metrics for both types
  if (property.propertyType === 'off-plan') {
    // Map 'bedrooms' -> 'bedroomsFrom'
    if (property.bedrooms !== null && property.bedrooms !== undefined && 
        (property.bedroomsFrom === null || property.bedroomsFrom === undefined || property.bedroomsFrom === 0)) {
      property.bedroomsFrom = typeof property.bedrooms === 'string' ? parseInt(property.bedrooms, 10) : property.bedrooms;
    }
    // Map 'bathrooms' -> 'bathroomsFrom'
    if (property.bathrooms !== null && property.bathrooms !== undefined && 
        (property.bathroomsFrom === null || property.bathroomsFrom === undefined || property.bathroomsFrom === 0)) {
      property.bathroomsFrom = typeof property.bathrooms === 'string' ? parseInt(property.bathrooms, 10) : property.bathrooms;
    }
    // Map 'size' -> 'sizeFrom' and 'sizeSqft' -> 'sizeFromSqft'
    if (property.size && !property.sizeFrom) property.sizeFrom = property.size;
    if (property.sizeSqft && !property.sizeFromSqft) property.sizeFromSqft = property.sizeSqft;

    // Also map 'priceAED' to 'priceFromAED' if missing
    if (property.priceAED && !property.priceFromAED) {
      property.priceFromAED = property.priceAED;
    }
  } else {
    // Secondary: ensure bathrooms and size are numbers
    if (property.bathrooms !== null && property.bathrooms !== undefined) {
      property.bathrooms = typeof property.bathrooms === 'string' ? parseInt(property.bathrooms, 10) : property.bathrooms;
    }
    if (property.size !== null && property.size !== undefined) {
      property.size = typeof property.size === 'string' ? parseFloat(property.size) : property.size;
    }
    if (property.sizeSqft !== null && property.sizeSqft !== undefined) {
      property.sizeSqft = typeof property.sizeSqft === 'string' ? parseFloat(property.sizeSqft) : property.sizeSqft;
    }
  }

  // Handle new area string format "Area, City"
  if (typeof property.area === 'string' && property.area.includes(',')) {
    // Keep it as string, transformer will split it
  } else if (property.area && typeof property.area === 'object') {
    // Ensure object has required name fields
    property.area.nameEn = property.area.nameEn || property.area.name || 'Unknown Area';
    property.area.nameRu = property.area.nameRu || property.area.nameEn || 'Неизвестный район';
  } else if (!property.area) {
    property.area = { id: '', nameEn: '', nameRu: '' };
  }

  // Ensure city is an object
  if (property.city && typeof property.city === 'object') {
    property.city.nameEn = property.city.nameEn || property.city.name || 'Dubai';
    property.city.nameRu = property.city.nameRu || property.city.nameEn || 'Дубай';
  } else if (!property.city) {
    property.city = { id: '', nameEn: '', nameRu: '' };
  }

  // Ensure developer has logo and names
  if (property.developer && typeof property.developer === 'object') {
    if (!property.developer.logo && property.developer.logoEn) {
      property.developer.logo = property.developer.logoEn;
    }
    property.developer.name = property.developer.name || property.developer.nameEn || 'Developer';
    property.developer.nameEn = property.developer.nameEn || property.developer.name;
    property.developer.nameRu = property.developer.nameRu || property.developer.nameEn;
  } else if (!property.developer) {
    property.developer = { id: '', name: '' };
  }

  // Comprehensive image field detection
  let rawPhotos: any[] = [];
  
  // Try all possible image field variations (prioritize the new direct links)
  const possibleImageFields = [
    property.mainImage,
    property.previewImage,
    property.main_image,
    property.preview_image,
    property.photos,
    property.images,
    property.image,
    property.imageUrl,
    property.image_url,
    property.banner,
    property.banners,
    property.preview,
    property.thumbnail,
    property.gallery,
    property.cover,
    property.first_photo,
    property.poster
  ];

  // Find the first field that has valid data
  for (const field of possibleImageFields) {
    if (!field) continue;
    
    if (Array.isArray(field) && field.length > 0) {
      rawPhotos = field;
      break;
    } else if (typeof field === 'string' && field.length > 0) {
      if (field.startsWith('[') && field.endsWith(']')) {
        try {
          const parsed = JSON.parse(field);
          if (Array.isArray(parsed)) {
            rawPhotos = parsed;
            break;
          }
        } catch (e) {}
      }
      rawPhotos = [field];
      break;
    }
  }

  // Final fallback: check inside fullData if available
  if (rawPhotos.length === 0 && property.fullData) {
    let fd = property.fullData;
    if (typeof fd === 'string') {
      try { fd = JSON.parse(fd); } catch (e) { fd = {}; }
    }
    if (fd.images && Array.isArray(fd.images)) rawPhotos = fd.images;
    else if (fd.photos && Array.isArray(fd.photos)) rawPhotos = fd.photos;
    else if (fd.main_image) rawPhotos = [fd.main_image];
  }

  // Map to absolute URLs and cleanup
  property.photos = rawPhotos
    .filter(Boolean)
    .map(p => {
      let url = '';
      if (typeof p === 'string') url = p;
      else if (p && typeof p === 'object') {
        url = p.full || p.small || p.url || p.link || p.original || p.linkEn || p.link_en;
      }
      return url ? ensureAbsoluteUrl(url) : null;
    })
    .filter(Boolean);

  // 2. Ensure images is always an array and populated
  if (!property.images || !Array.isArray(property.images) || property.images.length === 0) {
    property.images = property.photos.map((url: string) => ({
      small: url,
      full: url
    }));
  } else {
    // Also ensure URLs in existing images are absolute
    property.images = property.images.map((img: any) => {
      if (typeof img === 'string') {
        return {
          small: ensureAbsoluteUrl(img),
          full: ensureAbsoluteUrl(img)
        };
      }
      return {
        small: ensureAbsoluteUrl(img?.small || img?.url || img?.link || ''),
        full: ensureAbsoluteUrl(img?.full || img?.url || img?.link || '')
      };
    });
  }

  // FORCE WEBP: Backend converted images to webp but database might still have old extensions
  // Only applies to off-plan properties as per recent changes (135.181.201.185)
  if (property.propertyType === 'off-plan') {
    const replaceExtension = (url: string) => {
      if (typeof url !== 'string') return url;
      return url.replace(/\.(jpg|jpeg|png)(?=\?|$)/i, '.webp');
    };

    if (Array.isArray(property.photos)) {
      property.photos = property.photos.map(replaceExtension);
    }

    if (Array.isArray(property.images)) {
      property.images = property.images.map((img: any) => {
        if (!img) return img;
        return {
          ...img,
          small: replaceExtension(img.small),
          full: replaceExtension(img.full)
        };
      });
    }
  }



  // Normalize units if they exist
  if (property.units && Array.isArray(property.units)) {
    property.units = property.units.map(normalizeUnit);
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
    // Timeout reduced as properties are no longer bundled
    const response = await apiClient.get<ApiResponse<PublicData>>('/public/data', {
      timeout: 30000, // 30 seconds
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

export function clearAllCaches(): void {
  clearPropertiesCache();
  clearPublicDataCache();
}

/**
 * Get simple list of areas (ID and name only)
 */
export async function getAreasSimple(): Promise<Array<{ id: string; nameEn: string; nameRu: string; nameAr: string; cityId: string; slug: string }>> {
  try {
    const response = await apiClient.get<ApiResponse<any[]>>('/public/areas-simple');
    const data = response.data.data || [];

    return data.map((area: any) => ({
      ...area,
      slug: area.slug || (area.nameEn || '')
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }));
  } catch (error) {
    console.error('Failed to fetch simple areas', error);
    return [];
  }
}

/**
 * Get simple list of developers (ID and name only)
 */
export async function getDevelopersSimple(): Promise<Array<{ id: string; name: string; logo?: string | null; projectsCount?: number; count?: number }>> {
  try {
    const response = await apiClient.get<ApiResponse<any[]>>('/public/developers-simple');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch simple developers', error);
    return [];
  }
}

/**
 * Get unified list of locations (cities and areas)
 */
export async function getPublicLocations(): Promise<Array<{ id: string; nameEn: string; nameRu: string; type: 'city' | 'area'; parentId?: string }>> {
  try {
    const response = await apiClient.get<ApiResponse<any[]>>('/public/locations');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch public locations', error);
    return [];
  }
}

/**
 * Get full list of amenities
 */
export async function getPublicAmenities(propertyType?: string): Promise<Array<{ id: string; nameEn: string; nameRu: string; projectsCount?: number }>> {
  try {
    const params: any = {};
    if (propertyType) {
      params.propertyType = propertyType;
      params.type = propertyType;
    }
    
    const response = await apiClient.get<any>('/public/amenities-list', { params });
    
    // Support various response structures from different backend versions
    let rawData = [];
    if (response.data) {
      if (Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        rawData = response.data.data;
      } else if (response.data.amenities && Array.isArray(response.data.amenities)) {
        rawData = response.data.amenities;
      }
    }

    // Fallback to facilities if still empty
    if (rawData.length === 0) {
      const facResponse = await apiClient.get<any>('/public/facilities-list', { params });
      if (facResponse.data) {
        if (Array.isArray(facResponse.data)) {
          rawData = facResponse.data;
        } else if (facResponse.data.data && Array.isArray(facResponse.data.data)) {
          rawData = facResponse.data.data;
        }
      }
    }
    
    return rawData;
  } catch (error) {
    console.error('Failed to fetch public amenities', error);
    return [];
  }
}

/**
 * Get optimized list of facilities
 */
export async function getFacilitiesSimple(): Promise<Array<{ id: string; nameEn: string; nameRu: string; nameAr: string; iconName: string }>> {
  try {
    const response = await apiClient.get<ApiResponse<any[]>>('/public/facilities-list');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch simple facilities', error);
    return [];
  }
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
  slug: string;
  nameEn: string;
  nameRu: string;
  nameAr: string;
  mainImage?: string | null;
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
  descriptionRu?: {
    title?: string;
    description?: string;
  } | null;
  infrastructure: {
    title: string;
    description: string;
  } | {
    en?: {
      title?: string;
      description?: string;
    };
    ru?: {
      title?: string;
      description?: string;
    };
  } | null;
  content?: {
    generalInformation?: {
      en?: string;
      ru?: string;
    };
    quickAccessDescription?: {
      en?: string;
      ru?: string;
    };
  } | null;
  proximityPoints?: Array<{
    id: string;
    titleEn: string;
    titleRu: string;
    coordinates: [number, number];
  }>;
  images: string[] | null;
}

function normalizeArea(item: any): Area {
  // Prioritize mainImage from admin, then fallback to images array.
  const areaImages: string[] = [];
  if (item?.mainImage && typeof item.mainImage === 'string') {
    areaImages.push(item.mainImage);
  }

  if (Array.isArray(item?.images)) {
    item.images.forEach((img: any) => {
      const value = typeof img === 'string' ? img : (img?.full || img?.small || '');
      if (value && value !== item?.mainImage) areaImages.push(value);
    });
  }

  const rawPoints = Array.isArray(item?.proximityPoints) ? item.proximityPoints : [];
  const proximityPoints = rawPoints
    .map((point: any) => {
      const lng = Number(point?.coordinates?.[0]);
      const lat = Number(point?.coordinates?.[1]);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
      return {
        id: String(point?.id || ''),
        titleEn: String(point?.titleEn || ''),
        titleRu: String(point?.titleRu || ''),
        coordinates: [lng, lat] as [number, number],
      };
    })
    .filter((point): point is { id: string; titleEn: string; titleRu: string; coordinates: [number, number] } => Boolean(point));

  return {
    id: item?.id,
    nameEn: item?.nameEn,
    nameRu: item?.nameRu,
    nameAr: item?.nameAr || item?.nameEn,
    cityId: item?.cityId || (item?.city?.id) || '',
    city: item?.city || {
      id: '', nameEn: '', nameRu: '', nameAr: '', countryId: '', country: null
    },
    projectsCount: item?.projectsCount || { total: 0, offPlan: 0, secondary: 0 },
    description: item?.description || (item?.descriptionEn ? { title: item?.nameEn, description: item?.descriptionEn } : null),
    descriptionRu: item?.descriptionRu || null,
    infrastructure: item?.infrastructure || null,
    content: item?.content || null,
    proximityPoints,
    mainImage: item?.mainImage || null,
    images: areaImages.length > 0 ? areaImages.map(ensureAbsoluteUrl) : null,
    slug: item?.slug,
  };
}

/**
 * Featured Area interface from the new optimized endpoint
 */
export interface FeaturedArea {
  id: string;
  slug: string | null;
  nameEn: string;
  nameRu: string;
  mainImage: string | null;
  propertiesCount: number;
  isFeatured: boolean;
  priority: number;
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

/**
 * Get featured areas for home page using optimized endpoint
 */
export async function getFeaturedAreas(): Promise<FeaturedArea[]> {
  try {
    const response = await apiClient.get<ApiResponse<FeaturedArea[]>>('/public/featured-areas');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch featured areas', error);
    return [];
  }
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

    const params = {
      limit: 100,
      ...(cityId ? { cityId } : {})
    };
    const url = '/public/areas';

    const response = await apiClient.get<ApiResponse<any>>(url, { params });

    let rawAreas: any[] = [];

    // Handle the new response structure: { success: true, data: { data: [...], meta: {...} } }
    if (response.data && response.data.success) {
      if (response.data.data && Array.isArray(response.data.data.data)) {
        rawAreas = response.data.data.data;
      } else if (Array.isArray(response.data.data)) {
        rawAreas = response.data.data;
      } else if (Array.isArray(response.data)) {
        rawAreas = response.data;
      }
    }

    let areas: Area[] = rawAreas.map((item) => normalizeArea(item));

    // FORCE WEBP: Backend converted images to webp but database might still have old extensions
    areas = areas.map(area => {
      if (!area) return area;
      if (area.images && Array.isArray(area.images)) {
        area.images = area.images.map((img: any) => typeof img === 'string' ? img.replace(/\.(jpg|jpeg|png)$/i, '.webp') : img);
      }
      return area;
    });

    // Cache the result
    if (useCache && areas.length > 0) {
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
    console.error('[API] getAreas error:', error.message);
    if (error.response?.status === 404) {
      try {
        const publicData = await getPublicData(true);
        return (publicData.areas || []) as any;
      } catch (dataError) {
        return [];
      }
    }
    return [];
  }
}

export async function getAreaById(areaIdOrSlug: string): Promise<Area | null> {
  try {
    // Prefer detail endpoint because it contains full area payload (content/proximity/localized fields).
    try {
      const response = await apiClient.get<ApiResponse<any>>(`/public/areas/${areaIdOrSlug}`);
      const raw = response?.data?.data;
      if (raw && typeof raw === 'object') {
        return normalizeArea(raw);
      }
    } catch {
      // Fallback to list lookup below.
    }

    const areas = await getAreas();
    // Try to find by slug first
    let area = areas.find(a => a.slug === areaIdOrSlug);

    // If not found by slug, try to find by ID
    if (!area) {
      area = areas.find(a => a.id === areaIdOrSlug);
    }

    // If still not found, try to find by comparing normalized nameEn as a last resort fallback
    if (!area) {
      const targetSlug = areaIdOrSlug.toLowerCase().trim();
      area = areas.find(a => {
        const areaSlug = (a.slug || (a.nameEn || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
        return areaSlug === targetSlug;
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
export interface AvgPrice {
  text: string;
  price: string;
}

export interface Community {
  id: string;
  title: string;
  area: {
    id: string;
    nameEn: string;
    slug: string;
  };
  mapPoint: string;
  priceRange: {
    from: number;
    to: number;
  };
  unitAvailabilities: string[];
  propertyTypes: string[];
  icp: string[];
  description: string;
  images: {
    general: string[];
    exterior: string[];
    interior: string[];
  };
}

export interface Developer {
  id: string;
  slug?: string;
  name?: string; // legacy
  nameEn?: string;
  nameRu?: string;
  nameAr?: string;
  logo: string | null;
  previewImage?: string | null;
  shortDescription?: string | null;
  description?: { // legacy object format
    title: string;
    description: string;
  } | null;
  descriptionEn?: string;
  descriptionRu?: string;
  avgPricesDescription?: string;
  avgPrices?: AvgPrice[];
  images: string[] | null;
  areas?: {
    id: string;
    nameEn: string;
    nameRu: string;
    slug: string;
  }[];
  communities?: Community[];
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
export async function getDevelopers(params?: { summary?: boolean; page?: number; limit?: number }): Promise<GetDevelopersResult> {
  try {
    const url = '/public/developers';

    const response = await apiClient.get<ApiResponse<any>>(url, { params });
    const apiResponse = response.data;

    let developersData: any[] = [];
    if (apiResponse.data) {
      if (Array.isArray(apiResponse.data)) {
        developersData = apiResponse.data;
      } else if (apiResponse.data.data && Array.isArray(apiResponse.data.data)) {
        developersData = apiResponse.data.data;
      } else if (apiResponse.data.developers && Array.isArray(apiResponse.data.developers)) {
        developersData = apiResponse.data.developers;
      }
    }

    // Process developers: handle description (can be JSON string or object)
    const processedDevelopers: Developer[] = developersData.map((dev: any) => {
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
        slug: dev.slug,
        name: dev.nameEn || dev.name_en || dev.name,
        nameEn: dev.nameEn || dev.name_en,
        nameRu: dev.nameRu || dev.name_ru,
        logo: ensureAbsoluteUrl(dev.logo),
        previewImage: ensureAbsoluteUrl(dev.previewImage || dev.preview_image || dev.mainImage || dev.main_image),
        shortDescription: dev.shortDescription || dev.short_description,
        description,
        descriptionEn: dev.descriptionEn || dev.description_en,
        descriptionRu: dev.descriptionRu || dev.description_ru,
        images: Array.isArray(dev.images) ? dev.images.map(ensureAbsoluteUrl) : null,
        projectsCount: dev.projectsCount || {
          total: 0,
          offPlan: 0,
          secondary: 0,
        },
        createdAt: dev.createdAt,
      };
    });

    const apiRes = apiResponse as any;
    let totalCount = apiRes.total ||
      apiRes.totalCount ||
      (apiRes.pagination && apiRes.pagination.total) ||
      (apiRes.data && (apiRes.data.total || apiRes.data.totalCount)) ||
      processedDevelopers.length;

    return { developers: processedDevelopers, total: totalCount };
  } catch (error: any) {
    // If 404, fallback to /public/data
    if (error.response?.status === 404) {
      try {
        // Get developers from public data
        const publicData = await getPublicData(true);
        const developersFromData = publicData.developers || [];

        if (!Array.isArray(developersFromData)) {
          return { developers: [], total: 0 };
        }

        if (developersFromData.length === 0) {
          return { developers: [], total: 0 };
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



        return { developers: developersWithCounts, total: developersWithCounts.length };
      } catch (fallbackError: any) {
        // Return empty result instead of throwing, so page can still render
        return { developers: [], total: 0 };
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
    // Try direct endpoint first
    try {
      const response = await apiClient.get<ApiResponse<any>>(`/public/developers/${developerId}`);
      if (response.data && response.data.success) {
        // Handle potential nested data structure
        const dev = response.data.data?.data || response.data.data;
        if (dev) {
          let description: { title: string; description: string } | null = null;
          if (dev.description) {
            if (typeof dev.description === 'string') {
              try {
                const parsed = JSON.parse(dev.description);
                description = { title: parsed.title || '', description: parsed.description || '' };
              } catch {
                description = { title: '', description: dev.description };
              }
            } else {
              description = { title: dev.description.title || '', description: dev.description.description || '' };
            }
          }
          return {
            id: dev.id,
            slug: dev.slug,
            name: dev.nameEn || dev.name_en || dev.name,
            nameEn: dev.nameEn || dev.name_en,
            nameRu: dev.nameRu || dev.name_ru,
            nameAr: dev.nameAr || dev.name_ar,
            logo: ensureAbsoluteUrl(dev.logo),
            previewImage: ensureAbsoluteUrl(dev.previewImage || dev.preview_image || dev.mainImage || dev.main_image),
            shortDescription: dev.shortDescription || dev.short_description,
            description,
            descriptionEn: dev.descriptionEn || dev.description_en || (typeof dev.description === 'string' ? dev.description : ''),
            descriptionRu: dev.descriptionRu || dev.description_ru,
            avgPricesDescription: dev.avgPricesDescription,
            avgPrices: dev.avgPrices,
            images: Array.isArray(dev.images) ? dev.images.map(ensureAbsoluteUrl) : null,
            areas: dev.areas,
            communities: dev.communities,
            projectsCount: dev.projectsCount || { total: 0, offPlan: 0, secondary: 0 },
            createdAt: dev.createdAt,
          };
        }
      }
    } catch (e) {
      // If direct endpoint fails, continue to fallback search below
    }

    const { developers } = await getDevelopers();
    return developers.find((d: any) => d.id === developerId || d.slug === developerId) || null;
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
 * Initialize user session
 */
export interface UserSessionPayload {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  locale?: string;
  userAgent?: string;
}

export async function initUserSession(payload: UserSessionPayload): Promise<{ referenceId: string; sessionId: string } | null> {
  try {
    const response = await apiClient.post<ApiResponse<{ referenceId: string; sessionId: string }>>('/user-activity/init', payload);
    return response.data?.data || null;
  } catch (error: any) {
    console.error('Failed to initialize user session:', error);
    // Silent fail for tracker
    return null;
  }
}

/**
 * Track user activity
 */
export interface UserActivityPayload {
  referenceId: string;
  action: string;
  propertyId?: string;
  url?: string;
}

export async function trackUserActivity(payload: UserActivityPayload): Promise<void> {
  try {
    if (!payload.referenceId) return;
    await apiClient.post('/user-activity/track', payload);
  } catch (error: any) {
    console.error('Failed to track user activity:', error);
  }
}

export async function trackVisit(visitorId: string, url: string): Promise<void> {
  try {
    await apiClient.post('/tracking/visit', { visitorId, url });
  } catch (error: any) {
    // Silent fail for tracking to not disturb user
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
// Property Slugs
// ============================================

/**
 * Generate a URL-friendly slug from property name
 * Format: {projectname}-foryou-realestate
 */
export function generatePropertySlug(name: string, id?: string): string {
  if (!name) return '';
  const cleanName = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // If we have an ID, extract first 8 chars to match your new DB format
  if (id && id.length >= 8) {
    const shortId = id.split('-')[0]; // Takes '6db985eb' from UUID
    return `${cleanName}-${shortId}-foryou-realestate`;
  }

  return `${cleanName}-foryou-realestate`;
}

/**
 * Extract property name from slug
 * Basically removes "-foryou-realestate" suffix
 */
export function extractNameFromSlug(slug: string): string {
  if (!slug) return '';
  return slug.replace(/-foryou-realestate$/, '');
}

const propertyBySlugCache = new Map<string, { property: Property; timestamp: number }>();
const SLUG_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Map to collapse duplicate pending requests for the same slug
const pendingSlugRequests = new Map<string, Promise<Property>>();

/**
 * Get property by slug
 */
export async function getPropertyBySlug(slug: string): Promise<Property> {
  const startTime = Date.now();
  if (!slug) throw new Error('Slug is required');

  // Skip cache/pending for deep analysis to see absolute timing every time
  // (We'll re-enable it after diagnostics)

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DIAGNOSTIC] getPropertyBySlug START for: ${slug}`);
    }

    // Call getProperty which hits /public/properties/${slug}
    // and has its own logging for the network request
    const property = await getProperty(slug);

    const totalTime = Date.now() - startTime;
    if (typeof window === 'undefined') {
      console.log(`[DIAGNOSTIC] getPropertyBySlug TOTAL for ${slug}: ${totalTime}ms`);
    }
    return property;
  } catch (err: any) {
    if (typeof window === 'undefined') {
      console.error(`[DIAGNOSTIC] getPropertyBySlug ERROR for ${slug} after ${Date.now() - startTime}ms:`, err.message);
    }
    throw err;
  }
}

// ============================================
// News API
// ============================================

export interface Author {
  id: string;
  name: string;
  nameRu?: string;
  role: string;
  roleRu?: string;
  specialization?: string;
  specializationRu?: string;
  languages?: string;
  photo?: string;
  bio?: string;
  bioRu?: string;
  socials?: {
    whatsapp?: string;
    telegram?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  titleRu: string;
  description?: string;
  descriptionRu?: string;
  seoTitle?: string;
  seoDescription?: string;
  image: string;
  publishedAt: string; // ISO date string
  createdAt?: string;
  updatedAt?: string;
  author?: Author;
}

export interface NewsContent {
  id: string;
  newsId: string;
  type: 'text' | 'image' | 'video';
  title: string;
  titleRu?: string;
  description: string | null;
  descriptionRu?: string | null;
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
 * @param search - Optional search query to filter news (e.g., project name or area)
 * @returns News list with pagination info
 */
export async function getNews(page: number = 1, limit: number = 12, search?: string): Promise<GetNewsResult> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sortBy', 'publishedAt');
    params.append('sortOrder', 'DESC');
    if (search) params.append('search', search);

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
 * Get latest news (top 3)
 * @returns List of 3 latest news items
 */
export async function getLatestNews(): Promise<NewsItem[]> {
  try {
    const response = await apiClient.get<ApiResponse<NewsItem[] | { data: NewsItem[] }>>('/public/news/latest');

    if (!response.data.success) {
      throw new Error('Failed to fetch latest news');
    }

    const data = response.data.data;
    let newsArray: NewsItem[] = [];

    if (Array.isArray(data)) {
      newsArray = data;
    } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
      newsArray = (data as any).data;
    }

    // Ensure slug is populated (backend might return null)
    return newsArray.map(item => ({
      ...item,
      slug: item.slug || item.id
    }));
  } catch (error) {
    console.error('Failed to get latest news', error);
    return [];
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

    // Normalize localized content fields and keep stable order.
    if (news.contents && Array.isArray(news.contents)) {
      news.contents = news.contents
        .map((content: any) => ({
          ...content,
          title: content?.title || '',
          titleRu: content?.titleRu || content?.title_ru || content?.title || '',
          description: content?.description ?? null,
          descriptionRu: content?.descriptionRu ?? content?.description_ru ?? content?.description ?? null,
        }))
        .sort((a, b) => a.order - b.order);
    }

    return news;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      if (axiosError.response?.status !== 404) {
        console.error('[API] getNewsBySlug non-404 error:', axiosError.response?.status, axiosError.response?.data?.message || axiosError.message);
      }
      return null;
    }

    console.error('[API] getNewsBySlug unexpected error:', error);
    return null;
  }
}

// Vacancies API
export interface Vacancy {
  id: string;
  position: string;
  shortDescription: string;
  tasks: string;
  requirements: string;
  results: string;
  offers: string;
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
}

export interface VacancyApplication {
  name: string;
  email: string;
  phone: string;
  message?: string;
  cvUrl?: string;
}

export async function getVacancies(lang?: string): Promise<Vacancy[]> {
  try {
    const url = lang ? `/public/vacancies?lang=${lang}` : '/public/vacancies';
    const response = await apiClient.get<ApiResponse<Vacancy[]>>(url);
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch vacancies', error);
    return [];
  }
}

export async function getVacancyById(id: string, lang?: string): Promise<Vacancy | null> {
  try {
    const url = lang ? `/public/vacancies/${id}?lang=${lang}` : `/public/vacancies/${id}`;
    const response = await apiClient.get<ApiResponse<Vacancy>>(url);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch vacancy ${id}`, error);
    return null;
  }
}

export async function applyForVacancy(id: string, application: VacancyApplication): Promise<boolean> {
  try {
    const response = await apiClient.post<ApiResponse<any>>(`/public/vacancies/${id}/apply`, application);
    return response.data.success;
  } catch (error) {
    console.error(`Failed to apply for vacancy ${id}`, error);
    return false;
  }
}

export async function getPropertyUnits(slug: string): Promise<any[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<any[]>>(`/public/properties/${slug}/units`);
    if (data.success && Array.isArray(data.data)) {
      return data.data.map(normalizeUnit);
    }
    return [];
  } catch (error) {
    console.error('Failed to load property units:', error);
    return [];
  }
}

/**
 * Registration Interface
 */
export interface RegisterPayload {
  email: string;
  phone: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: 'CLIENT' | 'BROKER' | 'INVESTOR' | 'PARTNER';
  licenseNumber?: string;
  source?: string;
}

/**
 * Register a new user
 */
export async function registerUser(payload: RegisterPayload): Promise<ApiResponse<any>> {
  const response = await apiClient.post<ApiResponse<any>>('/auth/register', payload);
  return response.data;
}

/**
 * Callback Interface
 */
export interface CallbackPayload {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source?: string;
}

/**
 * Submit a callback request (Lead)
 */
export async function submitCallback(payload: CallbackPayload): Promise<ApiResponse<any>> {
  const response = await apiClient.post<ApiResponse<any>>('/callback', payload);
  return response.data;
}

/**
 * Meeting Interface
 */
export interface MeetingPayload {
  name: string;
  phone: string;
  email?: string;
  date?: string;
  time?: string;
  notes?: string;
  location?: string;
}

/**
 * Schedule a meeting
 */
export async function scheduleMeeting(payload: MeetingPayload): Promise<ApiResponse<any>> {
  const response = await apiClient.post<ApiResponse<any>>('/meetings', payload);
  return response.data;
}

export default apiClient;
