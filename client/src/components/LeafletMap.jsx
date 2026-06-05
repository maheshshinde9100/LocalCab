import { useEffect, useRef, useState } from 'react';
import { resolveBookingCoords, fetchRouteGeometry } from '../utils/geocoding';

function LeafletMap({ booking, pickupLat, pickupLng, dropLat, dropLng, driverLat, driverLng }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);
  const [coords, setCoords] = useState({ pickupLat, pickupLng, dropLat, dropLng });

  useEffect(() => {
    if (booking) {
      resolveBookingCoords(booking).then(setCoords);
    } else {
      setCoords({ pickupLat, pickupLng, dropLat, dropLng });
    }
  }, [booking, pickupLat, pickupLng, dropLat, dropLng]);

  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;

    const { pickupLat: pLat, pickupLng: pLng, dropLat: dLat, dropLng: dLng } = coords;

    if (!mapRef.current) {
      mapRef.current = window.L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;
    const L = window.L;

    Object.values(markersRef.current).forEach((marker) => map.removeLayer(marker));
    markersRef.current = {};

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const bounds = [];

    const createIcon = (color, label) =>
      L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="background-color:${color};color:white;padding:4px 8px;border-radius:9999px;font-weight:bold;font-size:11px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${label}</div>`,
        iconAnchor: [14, 14],
      });

    if (pLat && pLng) {
      const pickupMarker = L.marker([pLat, pLng], { icon: createIcon('#000000', 'A') })
        .addTo(map)
        .bindPopup(booking?.pickupVillage || 'Pickup');
      markersRef.current.pickup = pickupMarker;
      bounds.push([pLat, pLng]);
    }

    if (dLat && dLng) {
      const dropMarker = L.marker([dLat, dLng], { icon: createIcon('#ef4444', 'B') })
        .addTo(map)
        .bindPopup(booking?.dropLocation || 'Drop');
      markersRef.current.drop = dropMarker;
      bounds.push([dLat, dLng]);
    }

    if (driverLat && driverLng) {
      const driverMarker = L.marker([driverLat, driverLng], { icon: createIcon('#10b981', '🚗') })
        .addTo(map)
        .bindPopup('Driver');
      markersRef.current.driver = driverMarker;
      bounds.push([driverLat, driverLng]);
    }

    const drawRoute = async () => {
      if (!pLat || !pLng || !dLat || !dLng) return;
      const routePoints = await fetchRouteGeometry(pLat, pLng, dLat, dLng);
      const points = routePoints || [[pLat, pLng], [dLat, dLng]];
      if (polylineRef.current) map.removeLayer(polylineRef.current);
      polylineRef.current = L.polyline(points, {
        color: '#6366f1',
        weight: 5,
        opacity: 0.85,
      }).addTo(map);
    };

    drawRoute();

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coords, driverLat, driverLng, booking]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full min-h-[300px] rounded-xl overflow-hidden"
      style={{ position: 'relative' }}
    />
  );
}

export default LeafletMap;
