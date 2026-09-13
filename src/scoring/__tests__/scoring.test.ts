import { SpotEnriched, MarineConditions } from '../types';
import { scoreSpot } from '../engine';
import { calculateFTide } from '../factors';

/**
 * 2 SPOTS ARCHÉTYPES POUR LES TESTS :
 * - Les Cavaliers (Anglet) : Plein océan, exposé (exposure = 1.0), offshore Est (95°)
 * - Hendaye Deux Jumeaux : Baie très abritée (exposure = 0.35), offshore Sud (180°)
 * - Lafitenia (Saint-Jean-de-Luz) : Pointbreak / Reef légendaire (exposure = 0.85), taille idéale 1.5-2.0m
 */
const CAVALIERS: SpotEnriched = {
  id: 'anglet-cavaliers',
  name: 'Les Cavaliers',
  town: 'Anglet',
  breakType: 'beach',
  swellWindow: { dirMin: 270, dirMax: 335 },
  exposure: 1.0, // Plein océan
  sizeRange: { min: 0.8, max: 2.4 },
  optimalSize: 1.5,
  offshoreDir: 95, // Est
  windTolerance: 45,
  tideWindow: { min: 1.2, max: 2.8 },
  preferredPhase: 'rising',
  hazards: [],
  baineRisk: 0.85,
  levelRange: { min: 3, max: 5 },
  levelLabel: 'Confirmé',
  lat: 43.5242,
  lon: -1.5303,
  coefMareeSlug: 'anglet',
  description: 'Beach break tubulaire puissant'
};

const HENDAYE: SpotEnriched = {
  id: 'hendaye-deux-jumeaux',
  name: 'Hendaye - Les Deux Jumeaux',
  town: 'Hendaye',
  breakType: 'beach',
  swellWindow: { dirMin: 285, dirMax: 345 },
  exposure: 0.35, // Très abrité
  sizeRange: { min: 0.6, max: 1.6 },
  optimalSize: 1.1,
  offshoreDir: 180, // Sud
  windTolerance: 60,
  tideWindow: { min: 1.4, max: 3.5 },
  preferredPhase: 'any',
  hazards: [],
  baineRisk: 0.15,
  levelRange: { min: 1, max: 3 },
  levelLabel: 'Tous niveaux',
  lat: 43.3745,
  lon: -1.7582,
  coefMareeSlug: 'hendaye',
  description: 'Spot de repli abrité'
};

const LAFITENIA: SpotEnriched = {
  id: 'saint-jean-de-luz-lafitenia',
  name: 'Lafitenia',
  town: 'Saint-Jean-de-Luz',
  breakType: 'pointbreak',
  swellWindow: { dirMin: 280, dirMax: 330 },
  exposure: 0.85,
  sizeRange: { min: 1.2, max: 2.8 },
  optimalSize: 1.8,
  offshoreDir: 135, // Sud-Est
  windTolerance: 45,
  tideWindow: { min: 1.3, max: 2.7 },
  preferredPhase: 'rising',
  hazards: [],
  baineRisk: 0.2,
  levelRange: { min: 3, max: 5 },
  levelLabel: 'Confirmé',
  lat: 43.4182,
  lon: -1.6321,
  coefMareeSlug: 'saint-jean-de-luz',
  description: 'Droite de pointbreak sur reef'
};

const COTE_DES_BASQUES: SpotEnriched = {
  id: 'biarritz-cote-des-basques',
  name: 'Côte des Basques',
  town: 'Biarritz',
  breakType: 'beach',
  swellWindow: { dirMin: 270, dirMax: 330 },
  exposure: 0.80,
  sizeRange: { min: 0.6, max: 1.8 },
  optimalSize: 1.2,
  offshoreDir: 110, // Est-Sud-Est
  windTolerance: 45,
  tideWindow: { min: 1.0, max: 2.6 },
  preferredPhase: 'rising',
  hazards: [],
  baineRisk: 0.3,
  levelRange: { min: 1, max: 4 },
  levelLabel: 'Tous niveaux',
  lat: 43.4776,
  lon: -1.5678,
  coefMareeSlug: 'biarritz',
  description: 'Berceau du surf, falaise'
};

/**
 * HARNAIS D'EXÉCUTION DES 6 JOURNÉES ARCHÉTYPES
 */
export function runArchetypeTests(): { passed: boolean; results: string[] } {
  const logs: string[] = [];
  let allPassed = true;

  function assert(condition: boolean, message: string) {
    if (condition) {
      logs.push(`✅ [PASS] ${message}`);
    } else {
      logs.push(`❌ [FAIL] ${message}`);
      allPassed = false;
    }
  }

  // --- J1 : Petite houle propre (0.8m / 12s / NO 305° / vent E 8kt 90°)
  {
    const cond: MarineConditions = {
      timestamp: Date.now(),
      timeStr: '11:00',
      swellHeight: 0.8,
      swellPeriod: 12,
      swellDirection: 305,
      windWaveHeight: 0.2,
      windSpeedKts: 8,
      windDirection: 90, // Est plein
      tideHeight: 2.0,
      tidePhase: 'incoming',
      tideCoefficient: 70
    };
    const scoreCav = scoreSpot(CAVALIERS, cond).quality;
    const scoreHen = scoreSpot(HENDAYE, cond).quality;
    assert(scoreCav >= 7.0, `J1: Cavaliers fonctionne bien sur petite houle propre (${scoreCav}/10 >= 7.0)`);
    assert(scoreHen < 4.5, `J1: Hendaye est quasi-plat / sous le seuil utile (${scoreHen}/10 < 4.5)`);
    assert(scoreCav > scoreHen + 2.5, `J1: Écart massif entre spot exposé et spot abrité (diff ${Number((scoreCav - scoreHen).toFixed(1))} >= 2.5)`);
  }

  // --- J2 : Houle moyenne longue de reef (1.5m / 15s / O 280° / vent SE 5kt 135°)
  {
    const cond: MarineConditions = {
      timestamp: Date.now(),
      timeStr: '11:00',
      swellHeight: 1.5,
      swellPeriod: 15,
      swellDirection: 280,
      windWaveHeight: 0.2,
      windSpeedKts: 5,
      windDirection: 135, // Sud-Est (Offshore parfait pour Lafit)
      tideHeight: 2.0,
      tidePhase: 'incoming',
      tideCoefficient: 75
    };
    const scoreLaf = scoreSpot(LAFITENIA, cond).quality;
    assert(scoreLaf >= 8.5, `J2: Lafitenia est au sommet sur houle longue 1.5m (${scoreLaf}/10 >= 8.5)`);
  }

  // --- J3 : Grosse houle d'hiver (3.2m / 16s / NO 310° / vent E 12kt 90°)
  {
    const cond: MarineConditions = {
      timestamp: Date.now(),
      timeStr: '11:00',
      swellHeight: 3.2,
      swellPeriod: 16,
      swellDirection: 310,
      windWaveHeight: 0.5,
      windSpeedKts: 12,
      windDirection: 90,
      tideHeight: 2.2,
      tidePhase: 'incoming',
      tideCoefficient: 85
    };
    const scoreCav = scoreSpot(CAVALIERS, cond).quality;
    const scoreHen = scoreSpot(HENDAYE, cond).quality;
    assert(scoreCav <= 5.0, `J3: Cavaliers est en saturation / barres fermantes (${scoreCav}/10 <= 5.0)`);
    assert(scoreHen >= 7.5, `J3: Hendaye devient le spot d'excellence de repli (${scoreHen}/10 >= 7.5)`);
    assert(scoreHen > scoreCav, `J3: Inversion du classement : le repli bat le spot exposé`);
  }

  // --- J4 : Tempête onshore / chantier (2.0m / 7s / O 270° / vent O 25kt 270°)
  {
    const cond: MarineConditions = {
      timestamp: Date.now(),
      timeStr: '11:00',
      swellHeight: 2.0,
      swellPeriod: 7,
      swellDirection: 270,
      windWaveHeight: 1.8,
      windSpeedKts: 25,
      windDirection: 270, // Plein ouest dans la face
      tideHeight: 2.2,
      tidePhase: 'incoming',
      tideCoefficient: 80
    };
    const spots = [CAVALIERS, HENDAYE, LAFITENIA, COTE_DES_BASQUES];
    const scores = spots.map((s) => scoreSpot(s, cond).quality);
    const maxScore = Math.max(...scores);
    assert(maxScore < 4.0, `J4: AUCUN spot ne dépasse 4.0/10 par vent onshore 25kt (Max = ${maxScore}/10)`);
  }

  // --- J5 : Houle de vent de Nord (1.2m / 13s / N 355° / vent NE 10kt 45°)
  {
    const cond: MarineConditions = {
      timestamp: Date.now(),
      timeStr: '11:00',
      swellHeight: 1.2,
      swellPeriod: 13,
      swellDirection: 355, // Nord
      windWaveHeight: 0.3,
      windSpeedKts: 10,
      windDirection: 45,
      tideHeight: 2.0,
      tidePhase: 'incoming',
      tideCoefficient: 65
    };
    const scoreCav = scoreSpot(CAVALIERS, cond).quality;
    // Cavaliers a une fenêtre 270-335, donc une houle à 355° est très désaxée
    assert(scoreCav < 6.5, `J5: Cavaliers est pénalisé sur houle de Nord hors fenêtre (${scoreCav}/10 < 6.5)`);
  }

  // --- J6 : Lac plat / mer d'huile (0.3m / 9s / O 270° / vent nul)
  {
    const cond: MarineConditions = {
      timestamp: Date.now(),
      timeStr: '11:00',
      swellHeight: 0.3,
      swellPeriod: 9,
      swellDirection: 270,
      windWaveHeight: 0.1,
      windSpeedKts: 2,
      windDirection: 90,
      tideHeight: 2.0,
      tidePhase: 'incoming',
      tideCoefficient: 60
    };
    const spots = [CAVALIERS, HENDAYE, LAFITENIA, COTE_DES_BASQUES];
    const scores = spots.map((s) => scoreSpot(s, cond).quality);
    const maxScore = Math.max(...scores);
    assert(maxScore < 3.0, `J6: AUCUN spot ne dépasse 3.0/10 par mer plate (Max = ${maxScore}/10)`);
  }

  // --- TEST DE SÉCURITÉ CÔTE DES BASQUES
  {
    const condHighTide: MarineConditions = {
      timestamp: Date.now(),
      timeStr: '16:00',
      swellHeight: 1.2,
      swellPeriod: 14,
      swellDirection: 290,
      windWaveHeight: 0.2,
      windSpeedKts: 6,
      windDirection: 110,
      tideHeight: 3.5, // Marée très haute
      tidePhase: 'high',
      tideCoefficient: 90
    };
    const result = scoreSpot(COTE_DES_BASQUES, condHighTide);
    assert(result.hazard === 'critical', `Sécurité: Côte des Basques à marée haute déclenche un danger CRITIQUE`);
    assert(result.recommended === false, `Sécurité: Côte des Basques non recommandée à marée haute`);
    // Propriété clé : la note de qualité des vagues au large n'est PAS détruite arbitrairement à 1.0, mais la marée fTide et le danger séparent les deux axes
    assert(result.hazardReasons.length > 0, `Sécurité: motif explicite fourni ("Danger Digue")`);
  }

  // --- TEST DE CONTINUITÉ MATHÉMATIQUE (Balayage marée par pas de 1 cm)
  {
    let maxJump = 0;
    let prevVal = calculateFTide(0, { min: 1.5, max: 2.8 }, 'incoming', 'rising');
    for (let h = 0.01; h <= 5.0; h += 0.01) {
      const val = calculateFTide(h, { min: 1.5, max: 2.8 }, 'incoming', 'rising');
      const jump = Math.abs(val - prevVal);
      if (jump > maxJump) maxJump = jump;
      prevVal = val;
    }
    assert(maxJump < 0.03, `Continuité: Pas de saut de marée > 0.03 point par pas de 1cm (Max jump: ${maxJump.toFixed(4)})`);
  }

  return { passed: allPassed, results: logs };
}
