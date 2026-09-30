// Mapping major cities/airports to coordinates
const LOCATION_COORDS = {
  "Douala Airport (DLA)": { lat: 4.016, lon: 9.719 },
  "Douala City Center": { lat: 4.051, lon: 9.767 },
  "Yaoundé Nsimalen Airport": { lat: 3.722, lon: 11.553 },
  "Limbe": { lat: 4.024, lon: 9.204 }
};

// Weather WMO codes interpreter
function getWeatherCondition(code) {
  if (code === 0) return { text: "Sunny & Clear", icon: "☀️" };
  if (code >= 1 && code <= 3) return { text: "Partly Cloudy", icon: "⛅" };
  if (code >= 51 && code <= 67) return { text: "Rainy", icon: "🌧️" };
  if (code >= 80 && code <= 82) return { text: "Heavy Showers", icon: "⛈️" };
  return { text: "Clear Skies", icon: "🌤️" };
}

/**
 * Fetches forecast for a specific location and date
 */
export async function getBookingWeather(locationName, pickupDate) {
  const coords = LOCATION_COORDS[locationName] || LOCATION_COORDS["Douala City Center"];
  
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
    );
    const data = await response.json();
    
    // Find index for the requested date or fallback to today
    const dateIndex = data.daily.time.indexOf(pickupDate);
    const index = dateIndex !== -1 ? dateIndex : 0;

    const weatherInfo = getWeatherCondition(data.daily.weathercode[index]);
    const maxTemp = Math.round(data.daily.temperature_2m_max[index]);

    return {
      temp: `${maxTemp}°C`,
      condition: weatherInfo.text,
      icon: weatherInfo.icon
    };
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return null;
  }
}