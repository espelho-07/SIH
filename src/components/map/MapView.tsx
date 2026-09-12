import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Facility } from '@/types/facility';
import { cn } from '@/lib/utils';

interface MapViewProps {
  facilities: Facility[];
  selectedFacilityId?: string;
  onSelectFacility?: (facility: Facility) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
  showHeatmap?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  facilities,
  selectedFacilityId,
  onSelectFacility,
  center = [23.2156, 72.6369], // Gandhinagar district center
  zoom = 12,
  className,
  showHeatmap = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if container already initialized
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const tileUrl =
      import.meta.env.VITE_MAP_TILE_URL ||
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
    });

    L.tileLayer(tileUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when facilities change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    facilities.forEach((facility) => {
      const isSelected = facility.id === selectedFacilityId;
      const isCritical = facility.availableBeds <= 5;
      const isBusy = facility.availableBeds > 5 && facility.availableBeds <= 15;

      const markerColor = isCritical ? '#dc2626' : isBusy ? '#d97706' : '#0f766e';

      const customIcon = L.divIcon({
        className: 'custom-facility-marker',
        html: `
          <div style="
            background-color: ${markerColor};
            width: ${isSelected ? '36px' : '28px'};
            height: ${isSelected ? '36px' : '28px'};
            border-radius: 50%;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: bold;
            transition: all 0.2s ease;
          ">
            +
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([facility.coordinates.lat, facility.coordinates.lng], { icon: customIcon }).addTo(map);

      const popupContent = document.createElement('div');
      popupContent.className = 'p-2 text-slate-800 font-sans text-xs space-y-1.5 min-w-[200px]';
      popupContent.innerHTML = `
        <div class="font-bold text-sm text-slate-900 border-b pb-1">${facility.name}</div>
        <div class="text-[11px] text-slate-500">${facility.type.replace(/_/g, ' ')} • ${facility.distanceKm || 2} km away</div>
        <div class="grid grid-cols-2 gap-1 text-[11px] pt-1">
          <span class="font-medium">Total Beds: <strong>${facility.availableBeds} / ${facility.totalBeds}</strong></span>
          <span class="font-medium text-red-700">ICU: <strong>${facility.icuBedsAvailable} free</strong></span>
        </div>
        <div class="text-[11px] text-teal-800 font-medium">Est. Wait Time: ${facility.currentWaitTimeMinutes} mins</div>
        <div class="pt-2">
          <a href="https://maps.google.com/?q=${facility.coordinates.lat},${facility.coordinates.lng}" target="_blank" class="text-xs text-teal-700 font-bold hover:underline">Open in Google Maps →</a>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        onSelectFacility?.(facility);
      });

      markersRef.current.push(marker);
    });

    // Optional epidemic cluster circles
    if (showHeatmap) {
      const clusterCircle = L.circle([23.235, 72.65], {
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.18,
        radius: 3500,
      }).addTo(map);
      clusterCircle.bindPopup('<b>Epidemic Cluster Watch</b><br/>Sector 24 / Pethapur - Vector Surge Alert');
    }
  }, [facilities, selectedFacilityId, onSelectFacility, showHeatmap]);

  return (
    <div className={cn('relative w-full h-[380px] sm:h-[480px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100', className)}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
