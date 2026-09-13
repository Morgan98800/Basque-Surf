export type BreakType = 'beach' | 'reef' | 'pointbreak';
export type SurfLevelGrade = 1 | 2 | 3 | 4 | 5; // 1: Débutant, 2: Débutant+, 3: Intermédiaire, 4: Confirmé, 5: Expert
export type HazardSeverity = 'none' | 'caution' | 'critical';

export interface SpotHazard {
  id: string;
  label: string;
  description: string;
  severity: HazardSeverity;
  triggerCondition?: 'high_tide' | 'low_tide' | 'big_swell' | 'strong_current' | 'always';
}

export interface SpotEnriched {
  id: string;
  name: string;
  town: string;
  breakType: BreakType;

  // Exposition houle (Variable #1 du surf basque)
  swellWindow: { dirMin: number; dirMax: number }; // Degrés (ex: 270-340)
  exposure: number;                                // 0.0 (totalement abrité ex: baie) à 1.0 (pleine exposition océan)
  sizeRange: { min: number; max: number };         // Taille utile au déferlement (mètres)
  optimalSize: number;                             // Hauteur idéale au déferlement (mètres)

  // Vent
  offshoreDir: number;                             // Cap offshore idéal en degrés (ex: 110° pour Est-Sud-Est)
  windTolerance: number;                           // Tolérance angulaire en degrés (ex: 45°)

  // Marée & Bathymétrie
  tideWindow: { min: number; max: number };        // Fenêtre d'eau idéale (mètres)
  preferredPhase: 'rising' | 'falling' | 'any';

  // Sécurité & Baïnes (Indépendant du score de vagues)
  hazards: SpotHazard[];
  baineRisk: number;                               // 0.0 à 1.0, amplifié par le coefficient

  // Niveau
  levelRange: { min: SurfLevelGrade; max: SurfLevelGrade };
  levelLabel: string;                              // "Tous niveaux", "Confirmé", etc.

  // Données géographiques
  lat: number;
  lon: number;
  coefMareeSlug: string;
  description: string;
}

export interface MarineConditions {
  timestamp: number;
  timeStr: string;           // "14:00"

  // Houle (Swell pur distinct du vent)
  swellHeight: number;       // en mètres
  swellPeriod: number;       // en secondes
  swellDirection: number;    // en degrés (ex: 290°)

  // Mer du vent (Wind wave)
  windWaveHeight: number;    // en mètres
  windWavePeriod?: number;

  // Vent
  windSpeedKts: number;      // en nœuds
  windDirection: number;     // en degrés d'où vient le vent

  // Marée à cet instant
  tideHeight: number;        // en mètres
  tidePhase: 'low' | 'incoming' | 'high' | 'outgoing';
  tideCoefficient: number;
}

export interface FactorBreakdown {
  fSwell: number;            // [0, 1]
  fPeriod: number;           // [0, 1]
  fWind: number;             // [0, 1]
  fTide: number;             // [0, 1]
  fWindow: number;           // [0, 1]
  rawEnergy: number;         // H² * T
  effectiveSwellHeight: number; // Taille reçue au spot après exposition
}

export interface SpotScoreV2 {
  quality: number;           // 0 à 10 (qualité pure des vagues, jamais écrasée par le danger)
  qualityFormatted: string;  // "8,7"
  label: string;             // "Session parfaite", "Très bon", etc.
  hazard: HazardSeverity;    // 'none' | 'caution' | 'critical'
  hazardReasons: string[];   // Liste explicite des dangers
  hazardChip: string;        // Badge court pour l'UI
  recommended: boolean;      // false si hazard === 'critical'
  confidence: number;        // 0.0 à 1.0 (décroît avec l'horizon prévisionnel)
  bestWindow: {
    start: string;
    end: string;
    durationHours: number;
    score: number;
  } | null;
  breakdown: FactorBreakdown;
}
