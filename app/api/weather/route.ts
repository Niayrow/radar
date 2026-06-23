import { NextRequest, NextResponse } from "next/server";
import { WeatherData } from "../../../utils/weatherUtils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Latitude and longitude parameters are required" },
      { status: 400 }
    );
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      { error: "Invalid latitude or longitude format" },
      { status: 400 }
    );
  }

  // Fetch current and hourly conditions from Open-Meteo API
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,weather_code,pressure_msl,wind_speed_10m,uv_index&timezone=auto&forecast_days=10`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 900 }, // Cache response for 15 minutes (900 seconds)
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo API returned status ${res.status}`);
    }

    const data = await res.json();

    // Map response to WeatherData camelCase interface
    const formattedData: WeatherData = {
      timezone: data.timezone,
      elevation: data.elevation,
      current: {
        time: data.current.time,
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        apparentTemperature: data.current.apparent_temperature,
        isDay: data.current.is_day === 1,
        precipitation: data.current.precipitation,
        weatherCode: data.current.weather_code,
        cloudCover: data.current.cloud_cover,
        pressure: data.current.pressure_msl,
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        uvIndex: data.current.uv_index || 0, // Fallback to 0 if not returned
      },
      hourly: (data.hourly.time || []).map((timeStr: string, index: number) => ({
        time: timeStr,
        temperature: data.hourly.temperature_2m[index],
        humidity: data.hourly.relative_humidity_2m[index],
        apparentTemperature: data.hourly.apparent_temperature[index],
        precipitationProbability: data.hourly.precipitation_probability[index] || 0,
        precipitation: data.hourly.precipitation[index] || 0,
        weatherCode: data.hourly.weather_code[index],
        pressure: data.hourly.pressure_msl[index],
        windSpeed: data.hourly.wind_speed_10m[index],
        uvIndex: data.hourly.uv_index[index] || 0,
      })),
    };

    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error("Error in weather API route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch weather data from Open-Meteo" },
      { status: 500 }
    );
  }
}
