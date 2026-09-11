import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Clinical calculation based on "Cloudy with a Chance of Pain" logic
// High humidity + Low pressure = higher pain risk for arthritis/chronic pain
function calculatePainRisk(pressure: number, humidity: number, rainProb: number = 0): { risk: number; reason: string } {
  let risk = 2; // base normal risk (1-10 scale)
  let reasons = [];

  // Pressure impact (lower is worse)
  if (pressure < 1005) {
    risk += 4;
    reasons.push("Severe barometric drop");
  } else if (pressure < 1010) {
    risk += 2;
    reasons.push("Low barometric pressure");
  } else if (pressure < 1015) {
    risk += 1;
  }

  // Humidity impact (higher is worse)
  if (humidity > 80) {
    risk += 3;
    reasons.push("Critical Barometric Pain Pressure");
  } else if (humidity > 65) {
    risk += 1.5;
    reasons.push("Barometric Pain Pressure");
  }

  // Precipitation factor
  if (rainProb > 60) {
    risk += 1.5;
    reasons.push("Incoming precipitation");
  }

  risk = Math.min(10, Math.max(1, Math.round(risk)));

  let finalReason = reasons.length > 0 
    ? reasons.join(" and ") + " causing increased joint capsule expansion." 
    : "Stable atmospheric conditions. Low impact on joint pressure.";

  return { risk, reason: finalReason };
}

app.get('/api/weather', async (req, res) => {
  try {
    // Default to Atlanta if no coords provided
    const lat = req.query.lat || 33.7490;
    const lon = req.query.lon || -84.3880;
    
    // Reverse Geocoding via Nominatim
    let city = "Local Area";
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
        headers: {
          'User-Agent': 'BarometricPainPredictor/1.0'
        }
      });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county || "Local Area";
      }
    } catch (e) {
      console.error("Geocoding fetch error:", e);
    }

    // Open-Meteo API Call
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code&hourly=surface_pressure&daily=temperature_2m_max,temperature_2m_min,surface_pressure_mean,precipitation_probability_max,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo returned ${response.status}`);
    }
    const data = await response.json();

    // Calculate Current Impact
    const currentPain = calculatePainRisk(data.current.surface_pressure, data.current.relative_humidity_2m);
    
    // Extract next 24 hours of data starting from the current hour
    const currentHourString = data.current.time || new Date().toISOString().slice(0, 14) + "00";
    let startIndex = data.hourly.time.findIndex((t: string) => t >= currentHourString);
    if (startIndex === -1) startIndex = 0;
    
    const next24Hours = data.hourly.time.slice(startIndex, startIndex + 24).map((time: string, i: number) => ({
      time,
      pressure: Math.round(data.hourly.surface_pressure[startIndex + i])
    }));

    // Format response
    const formattedData = {
      city,
      lat: Number(lat),
      lon: Number(lon),
      current: {
        temperature: Math.round(data.current.temperature_2m),
        humidity: Math.round(data.current.relative_humidity_2m),
        pressure: Math.round(data.current.surface_pressure),
        windSpeed: Math.round(data.current.wind_speed_10m),
        weatherCode: data.current.weather_code,
        painRisk: currentPain.risk,
        impactReason: currentPain.reason
      },
      daily: data.daily.time.map((time: string, i: number) => {
        const dailyRisk = calculatePainRisk(
          data.daily.surface_pressure_mean[i],
          data.current.relative_humidity_2m, // Approximation for future humidity
          data.daily.precipitation_probability_max[i]
        );
        return {
          time,
          maxTemp: Math.round(data.daily.temperature_2m_max[i]),
          minTemp: Math.round(data.daily.temperature_2m_min[i]),
          pressure: Math.round(data.daily.surface_pressure_mean[i]),
          precipProb: Math.round(data.daily.precipitation_probability_max[i]),
          weatherCode: data.daily.weather_code[i],
          painRisk: dailyRisk.risk
        };
      }),
      hourly: next24Hours
    };

    res.json(formattedData);
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ error: err.message || 'Failed to fetch weather' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
