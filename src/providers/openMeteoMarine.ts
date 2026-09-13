import { MarineConditions } from '../scoring/types';

export interface WeatherProvider {
  getConditionsForTown(townSlug: string, dateOffset?: number): Promise<MarineConditions[]>;
}

// Coordonnées GPS marines côtières par commune pour requêtes météo précises
const TOWN_COORDINATES: Record<string, { lat: number; lon: number }> = {
  'anglet': { lat: 43.515, lon: -1.535 },
  'biarritz': { lat: 43.483, lon: -1.565 },
  'bidart': { lat: 43.435, lon: -1.595 },
  'guethary': { lat: 43.425, lon: -1.610 },
  'saint-jean-de-luz': { lat: 43.395, lon: -1.665 },
  'hendaye': { lat: 43.375, lon: -1.775 },
};

// Cache en mémoire (TTL: 30 minutes)
const marineCache = new Map<string, { data: MarineConditions[]; timestamp: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000;

export class OpenMeteoMarineProvider implements WeatherProvider {
  async getConditionsForTown(townSlug: string, dateOffset: number = 0): Promise<MarineConditions[]> {
    const coords = TOWN_COORDINATES[townSlug] || TOWN_COORDINATES['biarritz'];
    const cacheKey = `${townSlug}_${dateOffset}`;

    const cached = marineCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      // Open-Meteo Marine API (Open access, pas de clé requise)
      // Paramètres : wave_height, wave_period, wave_direction, wind_wave_height, wind_speed_10m, wind_direction_10m
      const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${coords.lat}&longitude=${coords.lon}&hourly=wave_height,wave_period,wave_direction,wind_wave_height&forecast_days=8&timezone=Europe%2FParis`;
      const windUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&hourly=wind_speed_10m,wind_direction_10m&forecast_days=8&timezone=Europe%2FParis`;

      const [marineRes, windRes] = await Promise.all([
        fetch(url).then(r => r.ok ? r.json() : null),
        fetch(windUrl).then(r => r.ok ? r.json() : null),
      ]);

      if (marineRes?.hourly && windRes?.hourly) {
        const startIndex = dateOffset * 24;
        const conditions: MarineConditions[] = [];

        for (let h = 0; h < 24; h++) {
          const idx = startIndex + h;
          const timeRaw = marineRes.hourly.time[idx] || `2026-09-13T${h.toString().padStart(2, '0')}:00`;
          const timeStr = `${h.toString().padStart(2, '0')}:00`;

          const swellH = Number(marineRes.hourly.wave_height?.[idx] ?? 1.2);
          const swellT = Number(marineRes.hourly.wave_period?.[idx] ?? 12);
          const swellDir = Number(marineRes.hourly.wave_direction?.[idx] ?? 295);
          const windWaveH = Number(marineRes.hourly.wind_wave_height?.[idx] ?? 0.3);

          // Convertir km/h en nœuds (kts = km/h / 1.852)
          const windSpeedKmh = Number(windRes.hourly.wind_speed_10m?.[idx] ?? 12);
          const windSpeedKts = Number((windSpeedKmh / 1.852).toFixed(1));
          const windDir = Number(windRes.hourly.wind_direction_10m?.[idx] ?? 110);

          conditions.push({
            timestamp: new Date(timeRaw).getTime(),
            timeStr,
            swellHeight: swellH,
            swellPeriod: swellT,
            swellDirection: swellDir,
            windWaveHeight: windWaveH,
            windSpeedKts,
            windDirection: windDir,
            tideHeight: 2.2, // injecté par le service de marée
            tidePhase: 'incoming',
            tideCoefficient: 75
          });
        }

        marineCache.set(cacheKey, { data: conditions, timestamp: Date.now() });
        return conditions;
      }
    } catch (err) {
      console.warn(`[OpenMeteoMarineProvider] Échec réseau, passage en mode simulé dégradé :`, err);
    }

    // Mode dégradé si API inaccessible
    return this.getFallbackConditions(dateOffset);
  }

  private getFallbackConditions(dateOffset: number): MarineConditions[] {
    const hours: MarineConditions[] = [];
    for (let h = 0; h < 24; h++) {
      hours.push({
        timestamp: Date.now() + (dateOffset * 24 + h) * 3600 * 1000,
        timeStr: `${h.toString().padStart(2, '0')}:00`,
        swellHeight: 1.3,
        swellPeriod: 13,
        swellDirection: 290,
        windWaveHeight: 0.2,
        windSpeedKts: 6,
        windDirection: 110, // Est-Sud-Est
        tideHeight: 2.2,
        tidePhase: 'incoming',
        tideCoefficient: 72
      });
    }
    return hours;
  }
}

export const marineProvider = new OpenMeteoMarineProvider();
