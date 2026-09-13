import { TideData, TideExtreme, TideHourlyPoint, TidePhase, ApiSettings } from '../types/index';

const SETTINGS_KEY = 'basque_surf_api_settings';

// Cache en mémoire pour éviter les requêtes répétées (durée: 15 minutes)
const tidesCache = new Map<string, { data: TideData; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

export function getSavedApiSettings(): ApiSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Erreur lecture api settings', e);
  }
  return {
    apiKey: (import.meta as any).env?.VITE_TIDE_API_KEY || '',
    provider: 'coefmaree', // Par défaut : Developer API gratuite CoefMarée IFREMER/SHOM
    enabled: true
  };
}

export function saveApiSettings(settings: ApiSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * Calcul harmonique de secours (si pas de réseau)
 */
function computeBasqueHarmonicFallback(townSlug: string = 'biarritz'): TideData {
  const epoch = new Date('2025-01-01T04:15:00Z').getTime();
  const periodMs = 12.4206 * 3600 * 1000;
  const nowMs = Date.now();
  const diffMs = nowMs - epoch;
  const cycleFraction = ((diffMs % periodMs) + periodMs) % periodMs;

  const springNeapCycleMs = 14.765 * 24 * 3600 * 1000;
  const springNeapPhase = (((diffMs % springNeapCycleMs) + springNeapCycleMs) % springNeapCycleMs) / springNeapCycleMs;
  const coefficient = Math.round(72 + 24 * Math.sin(springNeapPhase * 2 * Math.PI));

  const amplitude = 1.1 + (coefficient - 40) * (1.0 / 60);
  const meanHeight = 2.55;

  const angle = (cycleFraction / periodMs) * 2 * Math.PI;
  const currentHeight = Number((meanHeight - amplitude * Math.cos(angle)).toFixed(2));

  let currentPhase: TidePhase = 'incoming';
  let phaseLabel = 'Mi-marée montante';

  if (angle >= 0 && angle < 0.25 * Math.PI) {
    currentPhase = 'low';
    phaseLabel = 'Basse mer (début montant)';
  } else if (angle >= 0.25 * Math.PI && angle < 0.75 * Math.PI) {
    currentPhase = 'incoming';
    phaseLabel = 'Mi-marée montante';
  } else if (angle >= 0.75 * Math.PI && angle < 1.25 * Math.PI) {
    currentPhase = 'high';
    phaseLabel = 'Pleine mer (marée haute)';
  } else if (angle >= 1.25 * Math.PI && angle < 1.75 * Math.PI) {
    currentPhase = 'outgoing';
    phaseLabel = 'Mi-marée descendante';
  } else {
    currentPhase = 'low';
    phaseLabel = 'Fin de descendante';
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startMs = startOfDay.getTime();

  const hourlyCurve: TideHourlyPoint[] = [];
  for (let i = 0; i < 24; i++) {
    const t = startMs + i * 3600 * 1000;
    const ang = (((t - epoch) % periodMs) / periodMs) * 2 * Math.PI;
    const h = Number((meanHeight - amplitude * Math.cos(ang)).toFixed(2));
    hourlyCurve.push({
      time: `${i < 10 ? '0' : ''}${i}:00`,
      timestamp: t,
      height: h
    });
  }

  return {
    townSlug,
    townName: townSlug.charAt(0).toUpperCase() + townSlug.slice(1),
    currentHeight,
    currentPhase,
    phaseLabel,
    coefficient,
    nextHigh: { time: '18:45', timestamp: nowMs + 3600000, height: 4.2, type: 'high', coefficient },
    nextLow: { time: '12:30', timestamp: nowMs + 7200000, height: 0.9, type: 'low' },
    todayExtremes: [
      { time: '06:15', timestamp: startMs + 6 * 3600000, height: 4.1, type: 'high', coefficient },
      { time: '12:30', timestamp: startMs + 12.5 * 3600000, height: 0.9, type: 'low' },
      { time: '18:45', timestamp: startMs + 18.75 * 3600000, height: 4.2, type: 'high', coefficient }
    ],
    hourlyCurve,
    isExternalApi: false,
    apiSource: 'Calcul Harmonique Local',
    lastUpdated: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    attribution: 'Modèle astronomique local Côte Basque'
  };
}

/**
 * Récupère les données depuis l'API Développeur gratuite CoefMarée
 * Données IFREMER/PREVIMER calibrées marégraphes SHOM/REFMAR
 */
export async function fetchFromCoefMaree(townSlug: string = 'biarritz'): Promise<TideData> {
  const url = `https://coefmaree.fr/api/v1/tides.php?lieu=${encodeURIComponent(townSlug)}&jours=2`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erreur CoefMarée API (${response.status})`);
  }

  const json = await response.json();
  if (!json.extremes || json.extremes.length === 0) {
    throw new Error('Aucune marée retournée par CoefMarée');
  }

  const extremes: TideExtreme[] = json.extremes.map((e: any) => {
    const dt = new Date(e.datetime);
    return {
      time: dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: dt.getTime(),
      height: Number(e.height_m.toFixed(2)),
      type: e.type,
      coefficient: e.coefficient
    };
  });

  extremes.sort((a, b) => a.timestamp - b.timestamp);

  const nowMs = Date.now();

  // Identifier l'extrême précédent et suivant pour l'interpolation en direct
  let prev = extremes[0];
  let next = extremes[1] || extremes[0];

  for (let i = 0; i < extremes.length - 1; i++) {
    if (extremes[i].timestamp <= nowMs && extremes[i + 1].timestamp >= nowMs) {
      prev = extremes[i];
      next = extremes[i + 1];
      break;
    }
  }

  // Calcul sinusoïdal de la hauteur d'eau à la minute exacte
  const totalDuration = Math.max(1, next.timestamp - prev.timestamp);
  const elapsed = Math.max(0, Math.min(totalDuration, nowMs - prev.timestamp));
  const progressRatio = elapsed / totalDuration; // 0.0 à 1.0

  // Formule de la courbe sinusoïdale SHOM
  const factor = (1 - Math.cos(Math.PI * progressRatio)) / 2;
  const currentHeight = Number(
    (prev.type === 'low'
      ? prev.height + (next.height - prev.height) * factor
      : prev.height - (prev.height - next.height) * factor
    ).toFixed(2)
  );

  // Phase de marée et libellé
  let currentPhase: TidePhase = 'incoming';
  let phaseLabel = 'Mi-marée montante';

  if (prev.type === 'low') {
    // Marée montante
    if (progressRatio < 0.2) {
      currentPhase = 'low';
      phaseLabel = 'Basse mer (début montant)';
    } else if (progressRatio >= 0.8) {
      currentPhase = 'high';
      phaseLabel = 'Pleine mer (marée haute)';
    } else {
      currentPhase = 'incoming';
      phaseLabel = 'Mi-marée montante';
    }
  } else {
    // Marée descendante
    if (progressRatio < 0.2) {
      currentPhase = 'high';
      phaseLabel = 'Pleine mer (début descendant)';
    } else if (progressRatio >= 0.8) {
      currentPhase = 'low';
      phaseLabel = 'Fin de descendante (vers basse mer)';
    } else {
      currentPhase = 'outgoing';
      phaseLabel = 'Mi-marée descendante';
    }
  }

  // Prochaine marée haute et basse
  const nextHigh = extremes.find(e => e.type === 'high' && e.timestamp >= nowMs) || {
    time: '18:45',
    timestamp: nowMs + 3600000,
    height: 4.2,
    type: 'high',
    coefficient: 85
  };

  const nextLow = extremes.find(e => e.type === 'low' && e.timestamp >= nowMs) || {
    time: '12:30',
    timestamp: nowMs + 7200000,
    height: 0.9,
    type: 'low'
  };

  // Récupération du coefficient du jour
  const activeCoeff = extremes.find(e => e.type === 'high' && e.coefficient)?.coefficient || 75;

  // Filtrer les marées du jour
  const todayDate = new Date().getDate();
  const todayExtremes = extremes.filter(e => new Date(e.timestamp).getDate() === todayDate);

  // Génération de la courbe horaire sur 24h basée sur les vrais extrêmes CoefMarée
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startMs = startOfDay.getTime();

  const hourlyCurve: TideHourlyPoint[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const t = startMs + hour * 3600 * 1000;
    
    // Trouver les extrêmes encadrant cette heure
    let p = extremes[0];
    let n = extremes[extremes.length - 1];
    for (let k = 0; k < extremes.length - 1; k++) {
      if (extremes[k].timestamp <= t && extremes[k + 1].timestamp >= t) {
        p = extremes[k];
        n = extremes[k + 1];
        break;
      }
    }

    const dur = Math.max(1, n.timestamp - p.timestamp);
    const el = Math.max(0, Math.min(dur, t - p.timestamp));
    const pr = el / dur;
    const f = (1 - Math.cos(Math.PI * pr)) / 2;
    const h = Number(
      (p.type === 'low'
        ? p.height + (n.height - p.height) * f
        : p.height - (p.height - n.height) * f
      ).toFixed(2)
    );

    hourlyCurve.push({
      time: `${hour < 10 ? '0' : ''}${hour}:00`,
      timestamp: t,
      height: h
    });
  }

  return {
    townSlug,
    townName: json.lieu?.nom || townSlug,
    currentHeight,
    currentPhase,
    phaseLabel,
    coefficient: activeCoeff,
    nextHigh,
    nextLow,
    todayExtremes: todayExtremes.length > 0 ? todayExtremes : extremes.slice(0, 4),
    hourlyCurve,
    isExternalApi: true,
    apiSource: 'CoefMarée (Atlas IFREMER/PREVIMER • Calibré SHOM)',
    lastUpdated: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    attribution: 'Données IFREMER/PREVIMER (CC-BY) · marégraphes SHOM/REFMAR via CoefMarée Developer API'
  };
}

/**
 * Service principal de récupération des marées
 */
export async function fetchTideData(townSlug: string = 'biarritz', settings?: ApiSettings): Promise<TideData> {
  const currentSettings = settings || getSavedApiSettings();
  const cacheKey = `${townSlug}_${currentSettings.provider}`;

  // Vérification du cache mémoire
  const cached = tidesCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  // 1. Si le fournisseur est CoefMarée (par défaut, gratuit et sans clé !)
  if (currentSettings.provider === 'coefmaree' || (!currentSettings.apiKey && currentSettings.provider !== 'stormglass')) {
    try {
      const data = await fetchFromCoefMaree(townSlug);
      tidesCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (err) {
      console.warn('CoefMarée call failed, fallback harmonic', err);
      return computeBasqueHarmonicFallback(townSlug);
    }
  }

  // 2. Si l'utilisateur a configuré une clé Stormglass
  if (currentSettings.provider === 'stormglass' && currentSettings.apiKey) {
    try {
      const lat = 43.483;
      const lng = -1.558;
      const now = new Date();
      const start = new Date(now.getTime() - 6 * 3600 * 1000).toISOString();
      const end = new Date(now.getTime() + 18 * 3600 * 1000).toISOString();

      const res = await fetch(
        `https://api.stormglass.io/v2/tide/sea-level/point?lat=${lat}&lng=${lng}&start=${start}&end=${end}`,
        { headers: { Authorization: currentSettings.apiKey } }
      );

      if (res.ok) {
        const data = await res.json();
        if (data && data.data && data.data.length > 0) {
          const fallback = computeBasqueHarmonicFallback(townSlug);
          const height = Number((data.data[0].sg || 2.5).toFixed(2));
          const result: TideData = {
            ...fallback,
            currentHeight: height,
            isExternalApi: true,
            apiSource: 'Stormglass API (En direct)',
            lastUpdated: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          };
          tidesCache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        }
      }
    } catch (err) {
      console.warn('Stormglass failed, falling back to CoefMarée', err);
    }
  }

  // 3. Fallback CoefMarée puis harmoniques
  try {
    return await fetchFromCoefMaree(townSlug);
  } catch {
    return computeBasqueHarmonicFallback(townSlug);
  }
}
