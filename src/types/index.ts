export type TidePhase = 'low' | 'incoming' | 'high' | 'outgoing';

export type SpotType = 'beach_break' | 'reef_break' | 'point_break';

export type SurfLevel = 'Tous niveaux' | 'Débutant' | 'Intermédiaire' | 'Confirmé' | 'Expert';

export type BasqueTown = 'Anglet' | 'Biarritz' | 'Bidart' | 'Guéthary' | 'Saint-Jean-de-Luz' | 'Hendaye';

export interface Spot {
  id: string;
  name: string;
  town: BasqueTown;
  type: SpotType;
  level: SurfLevel;
  optimalTideRange: {
    minHeight: number; // en mètres
    maxHeight: number; // en mètres
    preferredPhases: ('low' | 'incoming' | 'high' | 'outgoing')[];
  };
  tideDescription: string;
  hazards?: string;
  highTideRisk?: boolean; // ex: Côte des Basques (pas de plage à marée haute)
  bestWind: string;
  bestSwell: string;
  description: string;
  lat: number;
  lon: number;
  photoUrl?: string;
}

export interface TideExtreme {
  time: string; // "14:35"
  timestamp: number;
  height: number; // en mètres
  type: 'low' | 'high';
}

export interface TideHourlyPoint {
  time: string; // "14:00"
  timestamp: number;
  height: number;
}

export interface TideData {
  currentHeight: number; // ex: 2.85
  currentPhase: TidePhase;
  phaseLabel: string; // "Mi-marée montante"
  coefficient: number; // ex: 76
  nextHigh: TideExtreme;
  nextLow: TideExtreme;
  todayExtremes: TideExtreme[];
  hourlyCurve: TideHourlyPoint[];
  isExternalApi: boolean;
  apiSource: string;
  lastUpdated: string;
}

export type TideMatchQuality = 'perfect' | 'good' | 'average' | 'poor' | 'dangerous';

export interface SpotScore {
  score: number; // ex: 8.4
  scoreFormatted: string; // "8,4"
  label: string; // "Excellentes conditions", "Conditions moyennes", etc.
  explanation: string;
  matchQuality: TideMatchQuality;
  warning?: string;
  bestWindowToday?: string; // "13:30 - 16:45"
}

export interface ApiSettings {
  apiKey: string;
  provider: 'stormglass' | 'worldtides' | 'openmeteo' | 'auto';
  enabled: boolean;
}
