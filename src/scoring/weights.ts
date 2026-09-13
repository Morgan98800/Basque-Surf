/**
 * PONDÉRATIONS ET EXPOSANTS DU MODÈLE MULTIPLICATIF
 * 
 * Score de qualité = 10 * (fSwell^0.40) * (fPeriod^0.15) * (fWind^0.25) * (fTide^0.30) * (fWindow^0.10)
 * 
 * La somme des exposants (0.40 + 0.15 + 0.25 + 0.30 + 0.10 = 1.20) est volontairement supérieure à 1.0 :
 * - Si tous les facteurs sont au sommet (1.0), le score atteint un 10 exceptionnel.
 * - Si n'importe quel facteur s'effondre (vers 0), le produit s'effondre (principe du facteur limitant de Liebig).
 */
export const WEIGHTS = {
  // Exposants de la formule multiplicative
  EXPONENTS: {
    swell: 0.40,   // Variable n°1 : énergie et hauteur utile reçue
    period: 0.15,  // Cohérence et puissance de la houle
    wind: 0.25,    // Texture du plan d'eau et tenue de la vague
    tide: 0.30,    // Bathymétrie locale et fonctionnement du banc/reef
    window: 0.10,  // Durée de la session exploitable (effet de vitesse de marée)
  },

  // Tolérances et constantes physiques
  TOLERANCES: {
    tideFalloff: 0.40,      // Écart-type gaussien (mètres) en dehors de la fenêtre d'eau
    windGlassoffKts: 4.5,   // Vitesse sous laquelle le vent est réputé nul ("glassy")
    windMaxOffshoreKts: 26, // Seuil au-delà duquel l'offshore devient excessif et pénalisant
    minQualityClamp: 0.5,   // Plancher minimal absolu
    maxQualityClamp: 9.8,   // Plafond maximal réaliste
  },

  // Seuils d'évaluation pour l'affichage UI
  THRESHOLDS: {
    perfect: 8.5,
    good: 7.0,
    fair: 5.0,
    poor: 3.5,
  }
} as const;
