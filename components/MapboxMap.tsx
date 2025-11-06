'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import PropertyPopup from './PropertyPopup';

interface Property {
  id: string;
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
}

interface MapboxMapProps {
  accessToken?: string;
  properties?: Property[];
}

// Format price for marker display (e.g., 132000 -> "AED 132K")
function formatPriceForMarker(priceAED: number): string {
  if (!priceAED || priceAED === 0) return 'AED 0';
  
  if (priceAED >= 1000000) {
    // Millions: 1.5M, 2.3M, etc.
    const millions = priceAED / 1000000;
    if (millions % 1 === 0) {
      return `AED ${millions}M`;
    }
    return `AED ${millions.toFixed(1)}M`;
  } else if (priceAED >= 1000) {
    // Thousands: 132K, 1.5K, etc.
    const thousands = priceAED / 1000;
    if (thousands % 1 === 0) {
      return `AED ${thousands}K`;
    }
    return `AED ${thousands.toFixed(1)}K`;
  } else {
    return `AED ${priceAED}`;
  }
}

// Create custom marker element with price
function createMarkerElement(priceAED: number): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'custom-marker';
  
  const priceText = formatPriceForMarker(priceAED);
  
  // Orange color for properties >= AED 5M, blue for others
  const backgroundColor = priceAED >= 5000000 ? '#EBA44E' : '#003077';
  
  // Use CSS classes instead of inline styles for better performance
  el.className = 'custom-marker custom-marker-price';
  
  el.style.cssText = `
    background: ${backgroundColor};
    color: #ffffff;
    padding: 4px 8px;
    border-radius: 4px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transform-origin: center center;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  `;
  
  el.textContent = priceText;
  
  return el;
}

// Helper function to check if point is inside polygon
function isPointInPolygon(point: [number, number], polygon: number[][]): boolean {
  const [x, y] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
}

export default function MapboxMap({ accessToken, properties = [] }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const markersMapRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const previousSelectedPropertyRef = useRef<Property | null>(null);
  const [mapStyle, setMapStyle] = useState<'map' | 'satellite'>('map');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState<number[][] | null>(null);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter properties by polygon
  const filterPropertiesByPolygon = (polygon: number[][]) => {
    const filtered = properties.filter(property => {
      if (!property.coordinates || !Array.isArray(property.coordinates) || property.coordinates.length !== 2) {
        return false;
      }
      const [lng, lat] = property.coordinates;
      return isPointInPolygon([lng, lat], polygon);
    });
    setFilteredProperties(filtered);
  };

  // Update URL with polygon
  const updateUrlWithPolygon = (polygon: number[][]) => {
    const polygonString = encodeURIComponent(JSON.stringify(polygon));
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('polygon', polygonString);
    router.replace(currentUrl.pathname + currentUrl.search, { scroll: false });
  };

  // Clear polygon from URL
  const clearPolygonFromUrl = () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('polygon');
    router.replace(currentUrl.pathname + currentUrl.search, { scroll: false });
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = accessToken || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    if (!token) {
      console.warn('Mapbox access token is not set. Please set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local file');
      return;
    }

    if (map.current) return; // Initialize map only once

    try {
      // UAE bounds: approximate coordinates
      // Southwest corner: [50.5, 22.5] (west of UAE, south of UAE)
      // Northeast corner: [56.5, 26.5] (east of UAE, north of UAE)
      const uaeBounds = [
        [50.5, 22.5], // Southwest [lng, lat]
        [56.5, 26.5]  // Northeast [lng, lat]
      ] as [[number, number], [number, number]];

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/abiespana/cmcxiep98004r01quhxspf3w9',
        center: [55.2708, 25.2048], // Dubai coordinates [lng, lat]
        zoom: 11,
        minZoom: 8, // Prevent zooming out too far
        maxZoom: 18, // Optional: limit max zoom
        maxBounds: uaeBounds, // Restrict panning to UAE area
        accessToken: token,
      });

      // Initialize MapboxDraw (but don't activate it by default)
      drawRef.current = new MapboxDraw({
        displayControlsDefault: false,
        defaultMode: 'simple_select', // Start in simple_select mode (not drawing)
      });
      map.current.addControl(drawRef.current);

      // Hide Mapbox logo and attribution
      map.current.on('load', () => {
        setIsMapLoading(false);
        
        // Hide Mapbox logo
        const mapboxLogo = map.current!.getContainer().querySelector('.mapboxgl-ctrl-logo');
        if (mapboxLogo) {
          (mapboxLogo as HTMLElement).style.display = 'none';
        }
        
        // Hide "Improve this map" and other Mapbox attribution
        const attribution = map.current!.getContainer().querySelector('.mapboxgl-ctrl-attrib');
        if (attribution) {
          (attribution as HTMLElement).style.display = 'none';
        }

        // Check URL for polygon parameter
        const polygonParam = searchParams.get('polygon');
        if (polygonParam) {
          try {
            const polygon = JSON.parse(decodeURIComponent(polygonParam));
            if (Array.isArray(polygon) && polygon.length > 0) {
              drawRef.current?.add({
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Polygon',
                  coordinates: [polygon]
                }
              });
              setDrawnPolygon(polygon);
              setIsDrawing(true);
              filterPropertiesByPolygon(polygon);
            }
          } catch (e) {
            console.error('Error parsing polygon from URL:', e);
          }
        }
      });

      // Handle draw events
      map.current.on('draw.create', (e) => {
        const feature = e.features[0];
        if (feature.geometry.type === 'Polygon') {
          const coordinates = feature.geometry.coordinates[0];
          setDrawnPolygon(coordinates);
          setIsDrawing(true);
          
          // Filter properties and update markers
          const filtered = properties.filter(property => {
            if (!property.coordinates || !Array.isArray(property.coordinates) || property.coordinates.length !== 2) {
              return false;
            }
            const [lng, lat] = property.coordinates;
            const isInside = isPointInPolygon([lng, lat], coordinates);
            return isInside;
          });
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Polygon drawn with coordinates:', coordinates);
            console.log(`Total properties: ${properties.length}`);
            console.log(`Properties inside polygon: ${filtered.length}`);
            if (filtered.length > 0) {
              console.log('Filtered properties:', filtered.map(p => ({ id: p.id, coordinates: p.coordinates })));
            }
          }
          
          setFilteredProperties(filtered);
          updateUrlWithPolygon(coordinates);
          
          // Force markers update
          setTimeout(() => {
            if (map.current) {
              // Remove all existing markers
              markersRef.current.forEach(marker => marker.remove());
              markersRef.current = [];
              markersMapRef.current.clear();
              
              // Add filtered markers
              filtered.forEach(property => {
                if (!property.coordinates || !Array.isArray(property.coordinates) || property.coordinates.length !== 2) {
                  return;
                }

                const [lng, lat] = property.coordinates;
                if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
                  return;
                }

                if (lng < 50 || lng > 60 || lat < 20 || lat > 30) {
                  return;
                }

                const priceAED = property.price?.aed || 0;
                const el = createMarkerElement(priceAED);
                
                const handleClick = (e: MouseEvent) => {
                  e.stopPropagation();
                  if (!map.current) return;
                  
                  const offsetX = 280;
                  const offsetY = 100;
                  
                  map.current.flyTo({
                    center: [lng, lat],
                    zoom: 14,
                    offset: [offsetX, offsetY],
                    duration: 1000,
                    essential: true
                  });

                  setSelectedProperty(property);
                };
                
                el.addEventListener('click', handleClick);
                
                const marker = new mapboxgl.Marker({
                  element: el,
                  anchor: 'center',
                  offset: [0, 0]
                });
                
                marker.setLngLat([lng, lat]);
                marker.addTo(map.current!);
                
                markersRef.current.push(marker);
                markersMapRef.current.set(property.id, marker);
              });
            }
          }, 100);
        }
      });

      map.current.on('draw.delete', () => {
        setDrawnPolygon(null);
        setIsDrawing(false);
        setFilteredProperties(properties);
        clearPolygonFromUrl();
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup
    return () => {
      // Remove all markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      markersMapRef.current.clear();
      
      if (drawRef.current && map.current) {
        map.current.removeControl(drawRef.current);
      }
      
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [accessToken, searchParams]);

  // Update filtered properties when properties change
  useEffect(() => {
    if (!drawnPolygon) {
      setFilteredProperties(properties);
    }
  }, [properties, drawnPolygon]);

  // Toggle draw mode
  const toggleDrawMode = () => {
    if (!map.current || !drawRef.current) return;

    if (isDrawing && drawnPolygon) {
      // Clear selection
      drawRef.current.deleteAll();
      drawRef.current.changeMode('simple_select'); // Return to simple select mode
      setDrawnPolygon(null);
      setIsDrawing(false);
      setFilteredProperties(properties);
      clearPolygonFromUrl();
    } else {
      // Start drawing
      drawRef.current.changeMode('draw_polygon');
      setIsDrawing(true);
    }
  };


  // Add markers when map is ready and properties are available
  useEffect(() => {
    if (!map.current) return;

    const addMarkers = () => {
      if (!map.current) return;
      
      // Use filtered properties if polygon is drawn, otherwise use all properties
      const propsToShow = drawnPolygon ? filteredProperties : properties;

      if (process.env.NODE_ENV === 'development') {
        console.log('Adding markers:', {
          totalProperties: properties.length,
          filteredProperties: filteredProperties.length,
          drawnPolygon: !!drawnPolygon,
          propsToShow: propsToShow.length,
          mapLoaded: map.current.loaded()
        });
      }

      if (propsToShow.length === 0) {
        // Remove all markers if no properties
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        markersMapRef.current.clear();
        return;
      }

      // Create a set of current property IDs
      const currentPropertyIds = new Set(propsToShow.map(p => p.id));
      
      // Remove markers for properties that no longer exist
      markersMapRef.current.forEach((marker, propertyId) => {
        if (!currentPropertyIds.has(propertyId)) {
          marker.remove();
          markersMapRef.current.delete(propertyId);
          const index = markersRef.current.indexOf(marker);
          if (index > -1) {
            markersRef.current.splice(index, 1);
          }
        }
      });

      // Add or update markers for current properties
      propsToShow.forEach(property => {
        // Skip if marker already exists
        if (markersMapRef.current.has(property.id)) {
          return;
        }
        // Validate coordinates
        if (!property.coordinates || !Array.isArray(property.coordinates) || property.coordinates.length !== 2) {
          console.warn('Invalid coordinates format for property:', property.id, property.coordinates);
          return;
        }

        const [lng, lat] = property.coordinates;
        if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
          console.warn('Invalid coordinates for property:', property.id, property.coordinates);
          return;
        }

        // Validate coordinate ranges (Dubai area approximately: lng 54-56, lat 24-26)
        if (lng < 50 || lng > 60 || lat < 20 || lat > 30) {
          console.warn('Coordinates out of Dubai range for property:', property.id, { lng, lat });
          return;
        }

        const priceAED = property.price?.aed || 0;
        const el = createMarkerElement(priceAED);
        
        // Add click handler with stopPropagation to prevent map interactions
        const handleClick = (e: MouseEvent) => {
          e.stopPropagation();
          if (!map.current) return;
          
          // Zoom to property with offset
          const offsetX = 280;
          const offsetY = 100;
          
          map.current.flyTo({
            center: [lng, lat],
            zoom: 14,
            offset: [offsetX, offsetY],
            duration: 1000,
            essential: true
          });

          // Show popup
          setSelectedProperty(property);
        };
        
        el.addEventListener('click', handleClick);
        
        // Create marker with center anchor for stable positioning
        // This prevents markers from moving during zoom
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'center',
          offset: [0, 0]
        });
        
        // Set coordinates using the exact values
        marker.setLngLat([lng, lat]);
        marker.addTo(map.current!);
        
        markersRef.current.push(marker);
        markersMapRef.current.set(property.id, marker);
      });
    };

    // Wait for map to fully load
    const loadMarkers = () => {
      // Use a small delay to ensure map is fully ready
      setTimeout(() => {
        requestAnimationFrame(() => {
          addMarkers();
        });
      }, 100);
    };

    // Load markers when map is ready
    if (map.current.loaded()) {
      loadMarkers();
    } else {
      map.current.once('load', () => {
        loadMarkers();
      });
    }

    // Also add markers when style changes (e.g., satellite toggle)
    map.current.on('style.load', () => {
      // Re-hide Mapbox elements
      const mapboxLogo = map.current!.getContainer().querySelector('.mapboxgl-ctrl-logo');
      if (mapboxLogo) {
        (mapboxLogo as HTMLElement).style.display = 'none';
      }
      
      const attribution = map.current!.getContainer().querySelector('.mapboxgl-ctrl-attrib');
      if (attribution) {
        (attribution as HTMLElement).style.display = 'none';
      }

      // Reload markers after style change
      loadMarkers();
    });

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.off('load', loadMarkers);
        map.current.off('style.load', loadMarkers);
      }
      // Note: Don't remove markers on cleanup here, only on unmount
    };
  }, [properties, filteredProperties, drawnPolygon]);

  // Handle map zoom out and shift right when popup closes
  useEffect(() => {
    if (!map.current) return;

    // If popup was open and now is closed (selectedProperty becomes null)
    if (previousSelectedPropertyRef.current && !selectedProperty) {
      const previousProperty = previousSelectedPropertyRef.current;
      const [lng, lat] = previousProperty.coordinates;
      
      // Zoom out slightly and shift right
      map.current.flyTo({
        center: [lng, lat],
        zoom: 12.4, // Zoom out from 14 to 12.4 (20% less zoom out)
        offset: [100, 0], // Shift 100px to the right
        duration: 800,
        essential: true
      });
    }

    // Update previous reference
    previousSelectedPropertyRef.current = selectedProperty;
  }, [selectedProperty]);

  // Toggle between map and satellite view
  const toggleMapStyle = () => {
    if (!map.current) return;
    
    const newStyle = mapStyle === 'map' ? 'satellite' : 'map';
    setMapStyle(newStyle);
    
    if (newStyle === 'satellite') {
      map.current.setStyle('mapbox://styles/mapbox/satellite-v9');
    } else {
      map.current.setStyle('mapbox://styles/abiespana/cmcxiep98004r01quhxspf3w9');
    }
    
    // Re-hide Mapbox elements and reload markers after style change
    map.current.once('style.load', () => {
      // Hide Mapbox logo
      const mapboxLogo = map.current!.getContainer().querySelector('.mapboxgl-ctrl-logo');
      if (mapboxLogo) {
        (mapboxLogo as HTMLElement).style.display = 'none';
      }
      
      // Hide attribution
      const attribution = map.current!.getContainer().querySelector('.mapboxgl-ctrl-attrib');
      if (attribution) {
        (attribution as HTMLElement).style.display = 'none';
      }
      
      // Reload markers after style change
      if (properties.length > 0) {
        // Remove existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        markersMapRef.current.clear();
        
        // Re-add markers
        properties.forEach(property => {
          if (!property.coordinates || !Array.isArray(property.coordinates) || property.coordinates.length !== 2) {
            return;
          }

          const [lng, lat] = property.coordinates;
          if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
            return;
          }

          if (lng < 50 || lng > 60 || lat < 20 || lat > 30) {
            return;
          }

          const priceAED = property.price?.aed || 0;
          const el = createMarkerElement(priceAED);
          
          const handleClick = (e: MouseEvent) => {
            e.stopPropagation();
            if (!map.current) return;
            
            const offsetX = 280;
            const offsetY = 100;
            
            map.current.flyTo({
              center: [lng, lat],
              zoom: 14,
              offset: [offsetX, offsetY],
              duration: 1000,
              essential: true
            });

            setSelectedProperty(property);
          };
          
          el.addEventListener('click', handleClick);
          
          const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'center',
            offset: [0, 0]
          });
          
          marker.setLngLat([lng, lat]);
          marker.addTo(map.current!);
          
          markersRef.current.push(marker);
          markersMapRef.current.set(property.id, marker);
        });
      }
    });
  };

  return (
    <>
      <div 
        ref={mapContainer} 
        style={{ width: '100%', height: '100%', position: 'relative' }}
      />
      
      {/* Map loading skeleton */}
      {isMapLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          zIndex: 1,
          pointerEvents: 'none',
        }}>
          <style jsx>{`
            @keyframes shimmer {
              0% {
                background-position: -200% 0;
              }
              100% {
                background-position: 200% 0;
              }
            }
          `}</style>
        </div>
      )}
      
      {/* Button container */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        gap: '12px',
        zIndex: 1000,
      }}>
        {/* Draw on map button */}
        <button
          onClick={toggleDrawMode}
          style={{
            position: 'relative',
            background: isDrawing && drawnPolygon ? '#dc2626' : '#003077',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDrawing && drawnPolygon ? '#b91c1c' : '#003f94';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDrawing && drawnPolygon ? '#dc2626' : '#003077';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {isDrawing && drawnPolygon ? 'Clear selection' : 'Draw on map'}
        </button>

        {/* Satellite toggle button */}
        <button
          onClick={toggleMapStyle}
          style={{
            position: 'relative',
            background: '#003077',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#003f94';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#003077';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {mapStyle === 'map' ? 'Satellite' : 'Map'}
        </button>
      </div>
      
      {selectedProperty && (
        <PropertyPopup
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </>
  );
}

