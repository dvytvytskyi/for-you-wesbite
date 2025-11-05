import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.foryou-realestate.com/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'fyr_7af8658259b4663cdf953bb4d0dd0653493b0161eba325fa97c0e2f1b4f32c05';
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET || '11619acf961b30770814157357f0a566032fc15bf414d35fdf1eff072f4be5982f1300a2d3794f54674d0f1994f0497e7b0e269f0012daf5e6216699fdf348c0';

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
      console.log('API Request:', {
        url: `${config.baseURL}${config.url}`,
        method: config.method,
        headers: {
          'Content-Type': config.headers['Content-Type'],
          'x-api-key': config.headers['x-api-key'] ? `${config.headers['x-api-key'].substring(0, 10)}...` : 'missing',
          'x-api-secret': config.headers['x-api-secret'] ? `${config.headers['x-api-secret'].substring(0, 10)}...` : 'missing',
          'Authorization': config.headers.Authorization ? '***' : 'missing',
        },
        fullHeaders: Object.keys(config.headers),
      });
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
        console.error('API Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
        });
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
  area: {
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
  };
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
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const url = `/properties?${params.toString()}`;
    
    // Debug: log the sort parameters
    if (process.env.NODE_ENV === 'development') {
      console.log('Sorting params:', {
        sortBy: filters?.sortBy,
        sortOrder: filters?.sortOrder,
        fullUrl: `${API_BASE_URL}${url}`,
      });
    }
    
    // Try regular endpoint first (for authenticated users)
    try {
      const response = await apiClient.get<ApiResponse<Property[]>>(url);
      let data = response.data.data;
      
      // Apply client-side sorting as backup (in case server doesn't sort correctly)
      if (filters?.sortBy && filters?.sortOrder && data.length > 0) {
        data = [...data]; // Create a copy to avoid mutating original
        data.sort((a, b) => {
          let aValue: any, bValue: any;
          
          switch (filters.sortBy) {
            case 'name':
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
              break;
            case 'price':
            case 'priceFrom':
              aValue = a.propertyType === 'off-plan' ? (a.priceFrom || 0) : (a.price || 0);
              bValue = b.propertyType === 'off-plan' ? (b.priceFrom || 0) : (b.price || 0);
              break;
            case 'size':
            case 'sizeFrom':
              aValue = a.propertyType === 'off-plan' ? (a.sizeFrom || 0) : (a.size || 0);
              bValue = b.propertyType === 'off-plan' ? (b.sizeFrom || 0) : (b.size || 0);
              break;
            case 'createdAt':
              aValue = new Date(a.createdAt).getTime();
              bValue = new Date(b.createdAt).getTime();
              break;
            default:
              return 0;
          }
          
          // Handle null/undefined values
          if (aValue == null) aValue = 0;
          if (bValue == null) bValue = 0;
          
          if (filters.sortOrder === 'ASC') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
          }
        });
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
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.warn(`Status ${error.response.status} on /properties, using /public/data endpoint...`);
        
        // Get all data from public endpoint
        const publicData = await getPublicData();
        
        // Extract properties from public data
        let properties: Property[] = [];
        if (publicData.properties && Array.isArray(publicData.properties)) {
          properties = publicData.properties;
        } else {
          // If properties are not directly in publicData, it might be structured differently
          console.warn('Properties not found in public data structure. Actual structure:', Object.keys(publicData));
          return [];
        }
        
        // Apply filters client-side
        if (filters?.propertyType) {
          properties = properties.filter(p => p.propertyType === filters.propertyType);
        }
        
        if (filters?.developerId) {
          properties = properties.filter(p => p.developer.id === filters.developerId);
        }
        
        if (filters?.cityId) {
          properties = properties.filter(p => p.city.id === filters.cityId);
        }
        
        if (filters?.areaId) {
          properties = properties.filter(p => p.area.id === filters.areaId);
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
          properties = properties.filter(p => {
            const price = p.propertyType === 'off-plan' ? p.priceFrom : p.price;
            return price !== undefined && price >= filters.priceFrom!;
          });
        }
        
        if (filters?.priceTo) {
          properties = properties.filter(p => {
            const price = p.propertyType === 'off-plan' ? p.priceTo : p.price;
            return price !== undefined && price <= filters.priceTo!;
          });
        }
        
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          properties = properties.filter(p => 
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply sorting (client-side when using public data)
        if (filters?.sortBy && filters?.sortOrder) {
          console.log('Applying client-side sort:', filters.sortBy, filters.sortOrder);
          
          properties.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (filters.sortBy) {
              case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
              case 'price':
              case 'priceFrom':
                // Use USD prices for comparison
                aValue = a.propertyType === 'off-plan' ? (a.priceFrom || 0) : (a.price || 0);
                bValue = b.propertyType === 'off-plan' ? (b.priceFrom || 0) : (b.price || 0);
                break;
              case 'size':
              case 'sizeFrom':
                // Use m² for comparison
                aValue = a.propertyType === 'off-plan' ? (a.sizeFrom || 0) : (a.size || 0);
                bValue = b.propertyType === 'off-plan' ? (b.sizeFrom || 0) : (b.size || 0);
                break;
              case 'createdAt':
                aValue = new Date(a.createdAt).getTime();
                bValue = new Date(b.createdAt).getTime();
                break;
              default:
                return 0;
            }
            
            // Handle null/undefined values
            if (aValue == null) aValue = 0;
            if (bValue == null) bValue = 0;
            
            if (filters.sortOrder === 'ASC') {
              return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
              return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
          });
          
          // Debug: log first few properties after sorting
          if (process.env.NODE_ENV === 'development' && properties.length > 0) {
            console.log('First 3 properties after client-side sort:', properties.slice(0, 3).map(p => ({
              name: p.name,
              price: p.propertyType === 'off-plan' ? p.priceFrom : p.price,
              createdAt: p.createdAt,
            })));
          }
        } else {
          // Default sort by createdAt DESC if no sort specified
          properties.sort((a, b) => {
            const aDate = new Date(a.createdAt).getTime();
            const bDate = new Date(b.createdAt).getTime();
            return bDate - aDate;
          });
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
    console.error('Error fetching property:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Get public data (countries, cities, areas, developers, facilities)
 */
export async function getPublicData(): Promise<PublicData> {
  try {
    const response = await apiClient.get<ApiResponse<PublicData>>('/public/data');
    return response.data.data;
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
 * Submit investment (for registered users)
 */
export async function submitInvestment(data: InvestmentRequest): Promise<Investment> {
  try {
    const response = await apiClient.post<ApiResponse<Investment>>('/investments', data);
    return response.data.data;
  } catch (error) {
    console.error('Error submitting investment:', error);
    throw error;
  }
}

/**
 * Submit investment (for non-registered users)
 */
export async function submitInvestmentPublic(data: InvestmentRequest): Promise<Investment> {
  try {
    const response = await apiClient.post<ApiResponse<Investment>>('/investments/public', data);
    return response.data.data;
  } catch (error) {
    console.error('Error submitting investment:', error);
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

