import { useEffect, useRef } from 'react';

function LeafletMap({ pickupLat, pickupLng, dropLat, dropLng, driverLat, driverLng }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);

  useEffect(() => {
    // If Leaflet is loaded on window
    if (!window.L || !mapContainerRef.current) return;

    // Initialize map if not already done
    if (!mapRef.current) {
      mapRef.current = window.L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;
    const L = window.L;

    // Clear old markers
    Object.values(markersRef.current).forEach(marker => map.removeLayer(marker));
    markersRef.current = {};

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const bounds = [];

    // Custom Icon helper
    const createIcon = (color, text) => {
      return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="background-color: ${color}; color: white; padding: 6px; border-radius: 9999px; font-weight: bold; font-size: 12px; white-space: nowrap; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;"><i class="fas ${text}"></i></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
    };

    // Add pickup marker
    if (pickupLat && pickupLng) {
      const pickupMarker = L.marker([pickupLat, pickupLng], {
        icon: createIcon('#3b82f6', 'fa-map-marker-alt')
      }).addTo(map).bindPopup('Pickup Location');
      markersRef.current.pickup = pickupMarker;
      bounds.push([pickupLat, pickupLng]);
    }

    // Add drop marker
    if (dropLat && dropLng) {
      const dropMarker = L.marker([dropLat, dropLng], {
        icon: createIcon('#ef4444', 'fa-flag')
      }).addTo(map).bindPopup('Drop Location');
      markersRef.current.drop = dropMarker;
      bounds.push([dropLat, dropLng]);
    }

    // Add driver marker
    if (driverLat && driverLng) {
      const driverMarker = L.marker([driverLat, driverLng], {
        icon: createIcon('#10b981', 'fa-car')
      }).addTo(map).bindPopup('Driver Location');
      markersRef.current.driver = driverMarker;
      bounds.push([driverLat, driverLng]);
    }

    // Draw routing line between pickup and drop
    if (pickupLat && pickupLng && dropLat && dropLng) {
      const points = [
        [pickupLat, pickupLng],
        [dropLat, dropLng]
      ];
      const polyline = L.polyline(points, { color: '#6366f1', weight: 4, dashArray: '5, 10' }).addTo(map);
      polylineRef.current = polyline;
    }

    // Fit map bounds
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [pickupLat, pickupLng, dropLat, dropLng, driverLat, driverLng]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-80 rounded-xl overflow-hidden shadow-inner border border-gray-200 z-10" 
      style={{ minHeight: '320px', position: 'relative' }}
    />
  );
}

export default LeafletMap;
