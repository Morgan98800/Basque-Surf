import { SpotEnriched, MarineConditions } from './types';
import { WEIGHTS } from './weights';

/**
 * 1. FACTEUR HOULE (fSwell) — Énergie utile reçue au spot
 * 
 * Modélise :
 * - L'énergie incidente proportionnelle à H²
 * - L'atténuation angulaire selon la fenêtre d'entrée de la baie/plage
 * - L'exposition du spot (0 = abrité comme Hendaye, 1 = plein large comme Anglet)
 * - L'adéquation avec la taille de houle optimale du spot
 */
export function calculateFSwell(spot: SpotEnriched, conditions: MarineConditions): { fSwell: number; effectiveHeight: number; rawEnergy: number } {
  const { swellHeight, swellPeriod, swellDirection } = conditions;

  // Si pas de houle au large, score plancher immédiat
  if (swellHeight <= 0.15) {
    return { fSwell: 0.01, effectiveHeight: 0, rawEnergy: 0 };
  }

  // Énergie brute au large (H² * T)
  const rawEnergy = Math.pow(swellHeight, 2) * swellPeriod;

  // Fenêtre angulaire d'exposition du spot
  const { dirMin, dirMax } = spot.swellWindow;
  let angularFactor = 1.0;

  // Gestion du passage par 360°/0°
  const inWindow = dirMin <= dirMax
    ? (swellDirection >= dirMin && swellDirection <= dirMax)
    : (swellDirection >= dirMin || swellDirection <= dirMax);

  if (!inWindow) {
    // Calcul de l'écart angulaire au bord de la fenêtre
    let dMin = Math.abs(swellDirection - dirMin);
    let dMax = Math.abs(swellDirection - dirMax);
    if (dMin > 180) dMin = 360 - dMin;
    if (dMax > 180) dMax = 360 - dMax;
    const diff = Math.min(dMin, dMax);
    // Décroissance exponentielle si la houle vient hors de la fenêtre du spot (ex: houle de Nord)
    angularFactor = Math.exp(-Math.pow(diff / 16, 1.8));
  }

  // Hauteur de houle efficace reçue au déferlement
  // Un spot à exposure 0.35 (ex: Hendaye) sur une houle de 3m reçoit ~1.05m
  const effectiveHeight = swellHeight * spot.exposure * angularFactor;

  // Adéquation avec la plage utile du spot [sizeRange.min, sizeRange.max]
  const { min: sMin, max: sMax } = spot.sizeRange;
  const opt = spot.optimalSize;

  if (effectiveHeight < 0.25) {
    // Vaguelettes ou mer plate < 25cm inexploitable
    return { fSwell: 0.01, effectiveHeight, rawEnergy };
  }

  let fSwell: number;
  if (effectiveHeight >= sMin && effectiveHeight <= sMax) {
    // Dans la plage exploitable : plateau avec maximum à l'optimum
    const distFromOpt = Math.abs(effectiveHeight - opt);
    const span = effectiveHeight >= opt ? (sMax - opt) : (opt - sMin);
    const normalizedDist = span > 0 ? Math.min(1, distFromOpt / span) : 0;
    fSwell = 0.82 + 0.18 * Math.cos((Math.PI / 2) * normalizedDist);
  } else if (effectiveHeight < sMin) {
    // Sous la taille minimale requise (vagues trop molles / sans fond)
    const diff = sMin - effectiveHeight;
    fSwell = 0.82 * Math.exp(-Math.pow(diff / 0.18, 1.8));
  } else {
    // Au-dessus de la taille maximale (saturation, barres infranchissables, fermetures)
    const diff = effectiveHeight - sMax;
    // Les beach-breaks ferment et saturent brutalement par rapport aux pointbreaks/reefs
    const tolerance = spot.breakType === 'beach' ? 0.35 : (spot.levelRange.max >= 4 ? 0.85 : 0.50);
    fSwell = 0.82 * Math.exp(-Math.pow(diff / tolerance, 1.8));
  }

  // Si la houle était hors de la fenêtre d'entrée, pénaliser aussi la qualité de forme
  if (!inWindow) {
    fSwell *= (0.20 + 0.80 * angularFactor);
  }

  return {
    fSwell: Math.max(0.01, Math.min(1.0, fSwell)),
    effectiveHeight: Number(effectiveHeight.toFixed(2)),
    rawEnergy: Number(rawEnergy.toFixed(1))
  };
}

/**
 * 2. FACTEUR PÉRIODE (fPeriod) — Organisation et énergie des lignes de houle
 * 
 * En Atlantique Nord / Golfe de Gascogne :
 * - T < 8s : clapot court, sans poussée, sections hachées
 * - T = 10-12s : houle moyenne standard d'ouest
 * - T = 13-16s : houle longue de reef et beach-break d'excellence
 * - T > 18s : houle très longue, parfois trop puissante sur le sable mais magique sur les pointbreaks
 */
export function calculateFPeriod(period: number, breakType: SpotEnriched['breakType']): number {
  if (period <= 4) return 0.05;

  if (period < 8.0) {
    // Houle courte de vent
    return Math.max(0.1, 0.15 + 0.35 * Math.pow((period - 4) / 4, 1.5));
  }

  if (period <= 16.0) {
    // Montée vers l'optimum 13-15s
    const norm = (period - 8) / 8; // 0 à 1
    return 0.50 + 0.50 * Math.sin((Math.PI / 2) * norm);
  }

  // Périodes géantes (> 16s)
  if (breakType === 'reef' || breakType === 'pointbreak') {
    // Les reefs adorent la houle très longue
    return Math.min(1.0, 0.95 + 0.05 * Math.sin(period));
  } else {
    // Les beach-breaks ont tendance à fermer en barres massives sur 18s+
    const excess = period - 16;
    return Math.max(0.65, 1.0 - excess * 0.04);
  }
}

/**
 * 3. FACTEUR VENT (fWind) — Alignement offshore et état du plan d'eau
 * 
 * Propriétés physiques impératives :
 * - Si vitesse <= 4.5 kts (glass-off) : fWind -> 1.0 quelle que soit la direction.
 * - Si vent offshore modéré (5-15 kts aligné) : fWind -> 1.0.
 * - Si vent onshore fort (> 18 kts) : fWind s'effondre (< 0.25).
 * - Si vent offshore excessif (> 25 kts) : fWind est pénalisé (vagues dures à attraper, embruns aveuglants).
 */
export function calculateFWind(spot: SpotEnriched, windSpeedKts: number, windDirection: number): number {
  // 1. Condition Glass-off (pépite matinale ou de tombée du soir)
  const glassoffThreshold = WEIGHTS.TOLERANCES.windGlassoffKts;
  if (windSpeedKts <= glassoffThreshold) {
    const fraction = windSpeedKts / glassoffThreshold;
    return 1.0 - 0.05 * fraction;
  }

  // 2. Alignement angulaire avec la direction offshore idéale du spot
  // diff = 0° => plein offshore (align = 1)
  // diff = 180° => plein onshore (align = -1)
  // diff = 90° => cross-shore (align = 0)
  let diffDeg = Math.abs(windDirection - spot.offshoreDir);
  if (diffDeg > 180) diffDeg = 360 - diffDeg;
  const align = Math.cos((diffDeg * Math.PI) / 180);

  // 3. Impact de la vitesse combinée à l'alignement
  let fWind: number;
  if (align >= 0.4) {
    // Vent favorable (Offshore à side-offshore)
    if (windSpeedKts <= 16) {
      fWind = 1.0;
    } else if (windSpeedKts <= WEIGHTS.TOLERANCES.windMaxOffshoreKts) {
      // 16-26 kts offshore : un peu fort mais tient encore
      fWind = 1.0 - ((windSpeedKts - 16) / 10) * 0.15;
    } else {
      // Offshore violent (> 26 kts) : pénalité croissante
      const excess = windSpeedKts - WEIGHTS.TOLERANCES.windMaxOffshoreKts;
      fWind = Math.max(0.35, 0.85 - (excess / 15) * 0.45);
    }
  } else if (align >= -0.2) {
    // Vent de travers (Cross-shore / Side-shore)
    // Acceptable si modéré (< 12 kts), se dégrade vite au-delà
    const penaltyPerKnot = 0.035;
    fWind = Math.max(0.25, 0.85 - (windSpeedKts - glassoffThreshold) * penaltyPerKnot);
  } else {
    // Vent défavorable (Plein Onshore)
    // Détruit le plan d'eau et hache les vagues
    const onshoreFactor = Math.max(0.3, Math.abs(align)); // 0.3 à 1.0
    const excess = Math.max(0, windSpeedKts - glassoffThreshold);
    fWind = 0.90 * Math.exp(-Math.pow((excess * onshoreFactor) / 6.2, 1.7));
  }

  return Math.max(0.005, Math.min(1.0, fWind));
}

/**
 * 4. FACTEUR MARÉE (fTide) — Continuité C1 (Plateau cosinus + Décroissance Gaussienne)
 * 
 * Aucune discontinuité mathématique :
 * - Plateau cosinusoïdal doux sur la fenêtre [min, max]
 * - Décroissance gaussienne continue avec dérivée nulle aux raccords
 */
export function calculateFTide(
  height: number,
  tideWindow: { min: number; max: number },
  phase: 'low' | 'incoming' | 'high' | 'outgoing',
  preferredPhase: 'rising' | 'falling' | 'any',
  tol: number = WEIGHTS.TOLERANCES.tideFalloff
): number {
  const { min, max } = tideWindow;

  let baseFTide: number;
  if (height >= min && height <= max) {
    const c = (min + max) / 2;
    const w = (max - min) / 2 || 1e-6;
    // Cosinus doux avec amplitude [0.88, 1.00]
    baseFTide = 0.88 + 0.12 * Math.cos((Math.PI / 2) * ((height - c) / w));
  } else {
    const d = height < min ? min - height : height - max;
    // Décroissance exponentielle continue (raccord continu en 0.88)
    baseFTide = 0.88 * Math.exp(-Math.pow(d / tol, 2));
  }

  // Bonus/malus de dynamique de phase (flot vs jusant)
  if (preferredPhase !== 'any') {
    const isRising = phase === 'incoming' || phase === 'low';
    const isFalling = phase === 'outgoing' || phase === 'high';

    if (preferredPhase === 'rising' && isRising) {
      baseFTide = Math.min(1.0, baseFTide * 1.05);
    } else if (preferredPhase === 'falling' && isFalling) {
      baseFTide = Math.min(1.0, baseFTide * 1.05);
    } else {
      baseFTide = baseFTide * 0.94;
    }
  }

  return Math.max(0.05, Math.min(1.0, baseFTide));
}

/**
 * 5. FACTEUR DURÉE DU CRÉNEAU (fWindow) — Effet physique du coefficient
 * 
 * Un fort coefficient (>90) accélère le flux d'eau et rétrécit la fenêtre praticable à ~45 min.
 * Un mortes-eaux (coeff 45) offre une session de 3h stable.
 * Modélisation : min(1.0, 0.45 + 0.18 * durationHours) saturant vers 3h.
 */
export function calculateFWindow(durationHours: number): number {
  if (durationHours <= 0) return 0.35;
  return Math.min(1.0, 0.45 + 0.18 * durationHours);
}
