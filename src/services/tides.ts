import { TideData, TideExtreme, TideHourlyPoint, TidePhase } from '../types/index';

// Cache en mémoire pour les données brutes (durée: 30 minutes)
interface RawTidePayload {
  townSlug: string;
  townName: string;
  extremes: TideExtreme[];
  rawJson: any;
}
const rawTidesCache = new Map<string, { data: RawTidePayload; timestamp: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000;

/**
 * Calcul harmonique local de secours sur 7 jours
 */
function computeBasqueHarmonicFallback(townSlug: string = 'biarritz', targetDateOffset: number = 0): TideData {
  const epoch = new Date('2025-01-01T04:15:00Z').getTime();
  const periodMs = 12.4206 * 3600 * 1000;
  
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + targetDateOffset);
  targetDate.setHours(targetDateOffset === 0 ? new Date().getHours() : 12, targetDateOffset === 0 ? new Date().getMinutes() : 0, 0, 0);
  const nowMs = targetDate.getTime();
  
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

  const startOfDay = new Date(targetDate);
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
 * Récupère les données brutes sur 7 jours depuis CoefMarée
 */
async function fetchRaw7DaysData(townSlug: string = 'biarritz'): Promise<RawTidePayload> {
  const cached = rawTidesCache.get(townSlug);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  const url = `https://coefmaree.fr/api/v1/tides.php?lieu=${encodeURIComponent(townSlug)}&jours=7`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erreur CoefMarée HTTP ${response.status}`);
  }

  const json = await response.json();
  if (!json.extremes || json.extremes.length === 0) {
    throw new Error('Aucune marée disponible');
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

  const payload: RawTidePayload = {
    townSlug,
    townName: json.lieu?.nom || townSlug,
    extremes,
    rawJson: json
  };

  rawTidesCache.set(townSlug, { data: payload, timestamp: Date.now() });
  return payload;
}

/**
 * Génère les données de marée adaptées au jour sélectionné (offset 0 = aujourd'hui, 1 = demain...)
 */
export async function fetchTideData(townSlug: string = 'biarritz', dayOffset: number = 0): Promise<TideData> {
  try {
    const raw = await fetchRaw7DaysData(townSlug);
    const extremes = raw.extremes;

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dayOffset);
    const targetDayOfMonth = targetDate.getDate();

    // Heure de référence pour l'évaluation : heure actuelle si aujourd'hui, sinon 12:00
    const evalDate = new Date(targetDate);
    if (dayOffset === 0) {
      // Heure actuelle
    } else {
      evalDate.setHours(12, 0, 0, 0);
    }
    const evalMs = evalDate.getTime();

    // Extrêmes du jour sélectionné
    const dayExtremes = extremes.filter(e => {
      const d = new Date(e.timestamp);
      return d.getDate() === targetDayOfMonth && d.getMonth() === targetDate.getMonth();
    });

    // Trouver les extrêmes encadrants pour l'évaluation
    let prev = extremes[0];
    let next = extremes[1] || extremes[0];

    for (let i = 0; i < extremes.length - 1; i++) {
      if (extremes[i].timestamp <= evalMs && extremes[i + 1].timestamp >= evalMs) {
        prev = extremes[i];
        next = extremes[i + 1];
        break;
      }
    }

    const totalDuration = Math.max(1, next.timestamp - prev.timestamp);
    const elapsed = Math.max(0, Math.min(totalDuration, evalMs - prev.timestamp));
    const progressRatio = elapsed / totalDuration;
    const factor = (1 - Math.cos(Math.PI * progressRatio)) / 2;

    const currentHeight = Number(
      (prev.type === 'low'
        ? prev.height + (next.height - prev.height) * factor
        : prev.height - (prev.height - next.height) * factor
      ).toFixed(2)
    );

    let currentPhase: TidePhase = 'incoming';
    let phaseLabel = 'Mi-marée montante';

    if (prev.type === 'low') {
      if (progressRatio < 0.2) {
        currentPhase = 'low';
        phaseLabel = 'Basse mer';
      } else if (progressRatio >= 0.8) {
        currentPhase = 'high';
        phaseLabel = 'Pleine mer';
      } else {
        currentPhase = 'incoming';
        phaseLabel = 'Marée montante';
      }
    } else {
      if (progressRatio < 0.2) {
        currentPhase = 'high';
        phaseLabel = 'Pleine mer';
      } else if (progressRatio >= 0.8) {
        currentPhase = 'low';
        phaseLabel = 'Fin de descendante';
      } else {
        currentPhase = 'outgoing';
        phaseLabel = 'Marée descendante';
      }
    }

    const nextHigh = extremes.find(e => e.type === 'high' && e.timestamp >= evalMs) || extremes.find(e => e.type === 'high')!;
    const nextLow = extremes.find(e => e.type === 'low' && e.timestamp >= evalMs) || extremes.find(e => e.type === 'low')!;

    // Coefficient du jour (sur le premier ou plus haut extrême du jour)
    const activeCoeff = dayExtremes.find(e => e.type === 'high' && e.coefficient)?.coefficient 
      || extremes.find(e => e.type === 'high' && e.coefficient)?.coefficient 
      || 75;

    // Courbe 24h du jour sélectionné
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const startMs = startOfDay.getTime();

    const hourlyCurve: TideHourlyPoint[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const t = startMs + hour * 3600 * 1000;
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
      townName: raw.townName,
      currentHeight,
      currentPhase,
      phaseLabel,
      coefficient: activeCoeff,
      nextHigh,
      nextLow,
      todayExtremes: dayExtremes.length > 0 ? dayExtremes : extremes.slice(0, 4),
      hourlyCurve,
      isExternalApi: true,
      apiSource: 'CoefMarée (IFREMER/SHOM)',
      lastUpdated: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      attribution: 'Données IFREMER/PREVIMER · SHOM/REFMAR via CoefMarée'
    };
  } catch (err) {
    console.warn('Erreur CoefMarée 7j, repli harmonique', err);
    return computeBasqueHarmonicFallback(townSlug, dayOffset);
  }
}
