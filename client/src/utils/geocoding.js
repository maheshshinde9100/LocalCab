const GEOCODE_CACHE = new Map();

export async function geocodePlace(placeName) {
  if (!placeName?.trim()) return null;
  const key = placeName.trim().toLowerCase();
  if (GEOCODE_CACHE.has(key)) return GEOCODE_CACHE.get(key);

  try {
    const query = encodeURIComponent(`${placeName.trim()}, India`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (!data?.length) return null;
    const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    GEOCODE_CACHE.set(key, coords);
    return coords;
  } catch {
    return null;
  }
}

export async function resolveBookingCoords(booking) {
  let pickupLat = booking.pickupLatitude;
  let pickupLng = booking.pickupLongitude;
  let dropLat = booking.dropLatitude;
  let dropLng = booking.dropLongitude;

  if (!pickupLat || !pickupLng) {
    const pickup = await geocodePlace(booking.pickupVillage);
    if (pickup) {
      pickupLat = pickup.lat;
      pickupLng = pickup.lng;
    }
  }
  if (!dropLat || !dropLng) {
    const drop = await geocodePlace(booking.dropLocation);
    if (drop) {
      dropLat = drop.lat;
      dropLng = drop.lng;
    }
  }
  return { pickupLat, pickupLng, dropLat, dropLng };
}

export async function fetchRouteGeometry(pickupLat, pickupLng, dropLat, dropLng) {
  if (!pickupLat || !pickupLng || !dropLat || !dropLng) return null;
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${pickupLng},${pickupLat};${dropLng},${dropLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.[0]?.geometry?.coordinates) return null;
    return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  } catch {
    return null;
  }
}
