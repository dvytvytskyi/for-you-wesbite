'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
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

// Create custom marker element with two circles
function createMarkerElement(): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'custom-marker';
  
  // Outer circle (border, no fill)
  const outerCircle = document.createElement('div');
  outerCircle.style.cssText = `
    width: 18px;
    height: 18px;
    border: 1.5px solid #003077;
    border-radius: 50%;
    background: transparent;
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
  `;
  
  // Inner circle (filled)
  const innerCircle = document.createElement('div');
  innerCircle.style.cssText = `
    width: 8px;
    height: 8px;
    background: #003077;
    border-radius: 50%;
    position: absolute;
    top: 5px;
    left: 5px;
    box-sizing: border-box;
  `;
  
  el.appendChild(outerCircle);
  el.appendChild(innerCircle);
  
  el.style.cssText = `
    width: 18px;
    height: 18px;
    cursor: pointer;
    pointer-events: auto;
  `;
  
  return el;
}

export default function MapboxMap({ accessToken, properties = [] }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const previousSelectedPropertyRef = useRef<Property | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = accessToken || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    if (!token) {
      console.warn('Mapbox access token is not set. Please set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local file');
      return;
    }

    if (map.current) return; // Initialize map only once

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/abiespana/cmcxiep98004r01quhxspf3w9',
        center: [55.2708, 25.2048], // Dubai coordinates [lng, lat]
        zoom: 11,
        accessToken: token,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup
    return () => {
      // Remove all markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [accessToken]);

  // Add markers when map is ready and properties are available
  useEffect(() => {
    if (!map.current) return;

    const addMarkers = () => {
      // Remove existing markers first
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      if (properties.length === 0) return;

      // Add new markers with precise coordinates
      properties.forEach(property => {
        // Validate coordinates
        const [lng, lat] = property.coordinates;
        if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
          console.warn('Invalid coordinates for property:', property.id, property.coordinates);
          return;
        }

        const el = createMarkerElement();
        
        // Add click handler
        el.addEventListener('click', (e) => {
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
        });
        
        // Create marker with center anchor - this ensures the center of the marker
        // is exactly at the coordinates, not moving during zoom
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'center'
        });
        
        // Set coordinates using the exact values
        marker.setLngLat([lng, lat]);
        marker.addTo(map.current!);
        
        markersRef.current.push(marker);
      });
    };

    // Wait for map to fully load
    if (map.current.loaded()) {
      addMarkers();
    } else {
      map.current.once('load', addMarkers);
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.off('load', addMarkers);
      }
    };
  }, [properties]);

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

  return (
    <>
      <div 
        ref={mapContainer} 
        style={{ width: '100%', height: '100%' }}
      />
      {selectedProperty && (
        <PropertyPopup
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </>
  );
}

