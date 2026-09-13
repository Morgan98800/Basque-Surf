export type TidePhase = 'low' | 'incoming' | 'high' | 'outgoing';

export type SpotType = 'beach_break' | 'reef_break' | 'point_break';

export type SurfLevel = 'Tous niveaux' | 'Débutant' | 'Intermédiaire' | 'Confirmé' | 'Expert';

export type BasqueTown = 'Anglet' | 'Biarritz' | 'Bidart' | 'Guéthary' | 'Saint-Jean-de-Luz' | 'Hendaye';

export interface Spot {
  id: string;
  name: string;
  town: BasqueTown;
  coefMareeSlug: string; // 'anglet' | 'biarritz' | 'bidart' | 'guethary' | 'saint-jean-de-luz' | 'hendaye'
  type: SpotType;
  level: SurfLevel;
  optimalTideRange: {
    minHeight: number; // en mètres
    maxHeight: number; // en mètres
    preferredPhases: ('low' | 'incoming' | 'high' | 'outgoing')[];
  };
  tideDescription: string;
  hazards?: string;
  highTideRisk?: boolean;
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
  coefficient?: number;
}

export interface TideHourlyPoint {
  time: string; // "14:00"
  timestamp: number;
  height: number;
}

export interface TideData {
  townSlug: string;
  townName: string;
  currentHeight: number;
  currentPhase: TidePhase;
  phaseLabel: string;
  coefficient: number;
  nextHigh: TideExtreme;
  nextLow: TideExtreme;
  todayExtremes: TideExtreme[];
  hourlyCurve: TideHourlyPoint[];
  isExternalApi: boolean;
  apiSource: string;
  lastUpdated: string;
  attribution?: string;
}

export type TideMatchQuality = 'perfect' | 'good' | 'average' | 'poor' | 'dangerous';

export interface SpotScore {
  score: number;
  scoreFormatted: string;
  label: string;
  explanation: string;
  matchQuality: TideMatchQuality;
  warning?: string;
  bestWindowToday?: string;
}
