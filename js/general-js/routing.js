// Mapping locations to [longitude, latitude] coordinates (OSRM requires [lon, lat])
const LOCATION_COORDS = {
  "Douala Airport (DLA)": [9.719, 4.016],
  "Douala City Center": [9.767, 4.051],
  "Yaoundé Nsimalen Airport": [11.553, 3.722],
  "Limbe": [9.204, 4.024]
};

/**
 * Calculates driving distance and delivery fee between two locations
 * @param {string} pickupLoc 
 * @param {string} dropoffLoc 
 * @param {number} ratePerKm - Fee charged per km in XAF (default: 500 XAF)
 */
export async function calculateRouteDistance(pickupLoc, dropoffLoc, ratePerKm = 500) {
  const start = LOCATION_COORDS[pickupLoc];
  const end = LOCATION_COORDS[dropoffLoc];

  // If locations are missing or identical, no delivery fee applies
  if (!start || !end || pickupLoc === dropoffLoc) {
    return { distanceKm: 0, deliveryFeeXAF: 0 };
  }

  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=false`
    );
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const distanceKm = Math.round(data.routes[0].distance / 1000); // meters to kilometers
      const deliveryFeeXAF = distanceKm * ratePerKm;

      return { distanceKm, deliveryFeeXAF };
    }
  } catch (error) {
    console.error("OSRM Route Calculation Error:", error);
  }

  return { distanceKm: 0, deliveryFeeXAF: 0 };
}