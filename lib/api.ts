import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.foryou-realestate.com/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'fyr_7084daf35cf6427f60e06bccd675f133b8a19ce4866cf941156bb4f38fba4016';
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET || '2e9e9a3a8080f207cf1c684baaeff40dcd4404c10f4d2207340bb48ee8ccdccda3f4e2fde5bd74fa4d8f463e361c45c9437206a97abb772415263e3a69655a73';

if (typeof window !== 'undefined') {
  console.log('🌐 API Client Initialized:');
  console.log('   Base URL:', API_BASE_URL);
  console.log('   Key starts with:', API_KEY.substring(0, 10));
}

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
  if (typeof window === 'undefined') {
    console.log(`%c[API-REQ] ${config.method?.toUpperCase()} ${config.url}`, 'color: #3498db');
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
  cityId?: string;
  areaId?: string;
  areaSlug?: string;
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
  isForYouChoice?: boolean;
  summary?: boolean;
}

export interface Property {
  id: string;
  slug?: string;
  propertyType: 'off-plan' | 'secondary';
  status: string;
  saleStatus: string;
  readiness?: string;
  completionDatetime?: string;
  name: string;
  description: string;
  descriptionRu?: string;
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
  
  paymentPlansJson?: Array<{
    Plan_name: string;
    months_after_handover: number;
    Payments: Array<Array<{
      Payment_time: string;
      Percent_of_payment: string;
    }>>;
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
  amount: number; // USD
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
  developer?: string;
  search?: string;
  areaId?: string;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: string | number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
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
  images: string[];
  fullData?: any;
  createdAt?: string;
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
}

export interface GetDevelopersResult {
  developers: Developer[];
  total: number;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  priceAED: number;
  propertyType: 'off-plan' | 'secondary';
}

// Cache for map markers (partitioned by type)
const markersCache = new Map<string, { data: MapMarker[], timestamp: number }>();
const MARKERS_CACHE_DURATION = 60 * 1000; // 1 minute

export async function getMapMarkers(filters?: PropertyFilters): Promise<MapMarker[]> {
  try {
    const cacheKey = filters ? JSON.stringify(filters) : 'all';

    // Check cache
    const cached = markersCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < MARKERS_CACHE_DURATION) {
      return cached.data;
    }

    const response = await apiClient.get<any>('/public/map', { params: filters });

    let data: MapMarker[] = [];
    if (Array.isArray(response.data)) {
      data = response.data;
    } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
      data = response.data.data;
    }

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

    const params = new URLSearchParams();
    if (filters?.propertyType) params.append('propertyType', filters.propertyType);
    if (filters?.developerId) params.append('developerId', filters.developerId);
    if (filters?.cityId) params.append('cityId', filters.cityId);
    if (filters?.areaId) params.append('areaId', filters.areaId);
    if (filters?.areaSlug) params.append('areaSlug', filters.areaSlug);
    if (filters?.bedrooms) params.append('bedrooms', filters.bedrooms);
    if (filters?.sizeFrom) params.append('sizeFrom', filters.sizeFrom.toString());
    if (filters?.sizeTo) params.append('sizeTo', filters.sizeTo.toString());
    if (filters?.priceFrom) params.append('priceFrom', filters.priceFrom.toString());
    if (filters?.priceTo) params.append('priceTo', filters.priceTo.toString());
    if (filters?.search) params.append('search', filters.search);

    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'DESC';
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);

    params.append('page', (filters?.page || 1).toString());
    params.append('limit', (filters?.limit || 100).toString());

    if (filters?.isForYouChoice !== undefined) params.append('isForYouChoice', filters.isForYouChoice.toString());
    if (filters?.summary) params.append('summary', 'true');

    const url = `/public/properties?${params.toString()}`;

    try {
      const response = await apiClient.get<ApiResponse<Property[]>>(url);
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
          (apiResponse.pagination && apiResponse.pagination.total) ||
          (apiResponse.data && (apiResponse.data.total || apiResponse.data.totalCount)) ||
          data.length;
      }

      const normalizedData = (Array.isArray(data) ? data : []).map(p => normalizeProperty(p));

      // ONLY sort if data is small (sanity check)
      let finalData = normalizedData;
      if (normalizedData.length < 500) {
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
        console.warn(`[API] getProperties returned too many results (${normalizedData.length}), skipping client-side sort`);
        // Limit to 100 for safety if somehow we got 24k
        finalData = normalizedData.slice(0, 100);
      }

      const result = { properties: finalData, total: totalCount || normalizedData.length };
      if (useCache) propertiesCache.set(cacheKey, { result, timestamp: Date.now() });
      return result;
    } catch (error: any) {
      console.error('[API] getProperties error:', error.message);
      // Return empty result instead of trying to load and filter 24k properties in browser memory
      return { properties: [], total: 0 };
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


export async function getPropertyFinderProjects(filters?: PropertyFinderFilters): Promise<{ projects: PropertyFinderProject[], total: number }> {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    
    // Map status from frontend ('off-plan', 'secondary') to backend ('off_plan', 'completed')
    if (filters?.status) {
      let mappedStatus = filters.status;
      if (mappedStatus === 'off-plan') mappedStatus = 'off_plan';
      if (mappedStatus === 'secondary') mappedStatus = 'completed';
      params.append('status', mappedStatus);
    }
    if (filters?.developer) params.append('developer', filters.developer);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.areaId) params.append('areaId', filters.areaId);
    if (filters?.priceMin) params.append('priceMin', filters.priceMin.toString());
    if (filters?.priceMax) params.append('priceMax', filters.priceMax.toString());
    if (filters?.bedrooms) params.append('bedrooms', filters.bedrooms.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    params.append('page', (filters?.page || 1).toString());
    const limit = filters?.limit || 24;
    params.append('limit', limit.toString());
    params.append('perPage', limit.toString()); // Backend uses perPage

    // NEW ENDPOINT: Removed 'public' prefix as per user request for authenticated routes
    const response = await apiClient.get<ApiResponse<any>>(`/property-finder/projects?${params.toString()}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Property Finder Listing Response:', response.data);
    }

    if (response.data && response.data.success) {
      const payload = response.data.data;
      let rawProjects: any[] = [];
      let totalCount = 0;

      // Robust check for different response structures
      if (Array.isArray(payload)) {
        rawProjects = payload;
        totalCount = payload.length;
      } else if (payload && typeof payload === 'object') {
        // Check for nested .data or .projects or .items
        rawProjects = payload.projects || payload.data || payload.items || [];
        
        // Handle pagination
        const pagination = payload.pagination || payload.meta;
        totalCount = pagination?.total || pagination?.totalCount || payload.total || payload.totalCount || rawProjects.length;
      }

      // Helper: extract a string from a value that may be a localized object
      const getName = (val: any): string => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'object') {
          // Check for title.en structure or name property
          return val.en || val.ru || val.nameEn || val.nameRu || val.name || val.id || '';
        }
        return '';
      };

      // Helper: collect all images from every possible field (supporting media.images structure)
      const extractImages = (p: any): string[] => {
        const raw: any[] = [];
        // Priority 1: media.images (new structure)
        const mediaImages = p.media?.images || p.fullData?.media?.images;
        if (Array.isArray(mediaImages)) {
          mediaImages.forEach((img: any) => {
            if (img.original?.url) raw.push(img.original.url);
            else if (img.url) raw.push(img.url);
          });
        }
        // Priority 2: coverImage
        if (p.coverImage) raw.push(p.coverImage);
        // Priority 3: root images array
        if (Array.isArray(p.images)) {
          p.images.forEach((img: any) => {
            if (typeof img === 'string') raw.push(img);
            else if (img.url) raw.push(img.url);
          });
        }
        // Deduplicate, convert all to absolute URLs, filter empty
        return [...new Set(raw)].map(ensureAbsoluteUrl).filter(Boolean);
      };

      return {
        projects: (rawProjects || []).map((p: any) => ({
          id: p.id,
          name: getName(p.title || p.name),
          category: p.category || p.fullData?.category,
          status: p.projectStatus || p.completion_status || p.status || p.fullData?.projectStatus || 'off_plan',
          developer: getName(p.developer) || getName(p.developer_name),
          location: getName(p.location),
          price: p.startingPrice || p.min_price || p.price,
          priceAED: p.startingPrice || p.min_price_aed || p.priceAED,
          images: extractImages(p),
          fullData: p.fullData,
          createdAt: p.createdAt || p.lastSyncAt
        })),
        total: totalCount
      };
    }
    return { projects: [], total: 0 };
  } catch (error) {
    console.error('Failed to get Property Finder projects', error);
    return { projects: [], total: 0 };
  }
}

export async function getPropertyFinderProject(id: string): Promise<PropertyFinderProject | null> {
  try {
    // NEW ENDPOINT: Removed 'public' prefix
    const response = await apiClient.get<ApiResponse<any>>(`/property-finder/projects/${id}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Property Finder Detail Response:', response.data);
    }

    if (response.data && response.data.success && response.data.data) {
      const p = response.data.data;

      const getName = (val: any): string => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'object') {
          return val.en || val.ru || val.nameEn || val.nameRu || val.name || val.id || '';
        }
        return '';
      };

      const extractImages = (p: any): string[] => {
        const raw: any[] = [];
        const mediaImages = p.media?.images || p.fullData?.media?.images;
        if (Array.isArray(mediaImages)) {
          mediaImages.forEach((img: any) => {
            if (img.original?.url) raw.push(img.original.url);
            else if (img.url) raw.push(img.url);
          });
        }
        if (p.coverImage) raw.push(p.coverImage);
        if (Array.isArray(p.images)) {
          p.images.forEach((img: any) => {
            if (typeof img === 'string') raw.push(img);
            else if (img.url) raw.push(img.url);
          });
        }
        return [...new Set(raw)].map(ensureAbsoluteUrl).filter(Boolean);
      };

      return {
        id: p.id,
        name: getName(p.title || p.name),
        category: p.category || p.fullData?.category,
        status: p.projectStatus || p.completion_status || p.status || p.fullData?.projectStatus || 'off_plan',
        developer: getName(p.developer) || getName(p.developer_name),
        location: getName(p.location),
        price: p.startingPrice || p.min_price || p.price,
        priceAED: p.startingPrice || p.min_price_aed || p.priceAED,
        images: extractImages(p),
        fullData: p.fullData,
        createdAt: p.createdAt || p.lastSyncAt
      };
    }
    return null;
  } catch (error) {
    console.error(`Failed to get Property Finder project ${id}`, error);
    return null;
  }
}

const MEDIA_BASE_URL = 'https://admin.foryou-realestate.com';
const ensureAbsoluteUrl = (url: any) => {
  if (typeof url !== 'string' || !url) return '';
  if (url.startsWith('http')) return url;

  let cleanUrl = url.trim();
  if (cleanUrl.startsWith('./')) cleanUrl = cleanUrl.substring(2);
  if (cleanUrl.startsWith('/')) return `${MEDIA_BASE_URL}${cleanUrl}`;

  return `${MEDIA_BASE_URL}/${cleanUrl}`;
};

// Helper function to normalize unit data
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
  if (!property.name) {
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

    // Normalize bathrooms for secondary
    if (property.bathrooms !== null && property.bathrooms !== undefined) {
      property.bathrooms = typeof property.bathrooms === 'string' ? parseInt(property.bathrooms, 10) : property.bathrooms;
    }

    // Calculate sizeSqft if missing but size exists
    if (property.size !== null && property.size !== undefined && property.size > 0) {
      if (property.sizeSqft === null || property.sizeSqft === undefined || property.sizeSqft === 0) {
        property.sizeSqft = Math.round(property.size * 10.764 * 100) / 100;
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

  // 1. Normalize photos field first
  let rawPhotos: any[] = [];
  if (Array.isArray(property.photos) && property.photos.length > 0) {
    rawPhotos = property.photos;
  } else if (typeof property.photos === 'string' && property.photos.length > 0) {
    try {
      const parsed = JSON.parse(property.photos);
      rawPhotos = Array.isArray(parsed) ? parsed : [property.photos];
    } catch {
      rawPhotos = [property.photos];
    }
  } else {
    // Try alternative fields one last time
    const altPhotosFiltered = [
      property.images,
      property.image,
      property.imageUrl,
      property.gallery,
      property.mainImage,
      property.thumbnail
    ].filter(Boolean);

    if (altPhotosFiltered.length > 0) {
      const firstAlt = altPhotosFiltered[0];
      if (Array.isArray(firstAlt) && firstAlt.length > 0) {
        rawPhotos = firstAlt;
      } else if (typeof firstAlt === 'string' && firstAlt.length > 0) {
        rawPhotos = [firstAlt];
      }
    }
  }

  // Map to absolute URLs and cleanup
  property.photos = rawPhotos
    .map(p => {
      if (typeof p === 'string') return p;
      if (p && typeof p === 'object') return (p.full || p.small || p.url || p.link || p.original);
      return null;
    })
    .map(ensureAbsoluteUrl)
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
export async function getDevelopersSimple(): Promise<Array<{ id: string; name: string }>> {
  try {
    const response = await apiClient.get<ApiResponse<any[]>>('/public/developers-simple');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch simple developers', error);
    return [];
  }
}

/**
 * Get simple list of facilities
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

    let areas: Area[] = rawAreas.map(item => {
      // Prioritize mainImage from admin, then fallback to images array
      let areaImages: string[] = [];
      if (item.mainImage) {
        areaImages.push(item.mainImage);
      }
      if (Array.isArray(item.images)) {
        item.images.forEach((img: string) => {
          if (img && img !== item.mainImage) areaImages.push(img);
        });
      }

      return {
        id: item.id,
        nameEn: item.nameEn,
        nameRu: item.nameRu,
        nameAr: item.nameAr || item.nameEn,
        cityId: item.cityId || (item.city?.id) || '',
        city: item.city || {
          id: '', nameEn: '', nameRu: '', nameAr: '', countryId: '', country: null
        },
        projectsCount: item.projectsCount || { total: 0, offPlan: 0, secondary: 0 },
        description: item.description || (item.descriptionEn ? { title: item.nameEn, description: item.descriptionEn } : null),
        infrastructure: item.infrastructure || null,
        images: areaImages.length > 0 ? areaImages.map(ensureAbsoluteUrl) : null,
        slug: item.slug
      };
    });

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
