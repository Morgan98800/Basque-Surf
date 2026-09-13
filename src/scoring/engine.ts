import { SpotEnriched, MarineConditions, SpotScoreV2, HazardSeverity, FactorBreakdown } from './types';
import { WEIGHTS } from './weights';
import { calculateFSwell, calculateFPeriod, calculateFWind, calculateFTide, calculateFWindow } from './factors';
import { getBasqueSolarTimes } from './solar';

/**
 * Calcule le score de surf instantané v2 pour un spot et des conditions données
 */
export function scoreSpot(
  spot: SpotEnriched,
  conditions: MarineConditions,
  hourlyCurve: MarineConditions[] = [],
  targetDate: Date = new Date()
): SpotScoreV2 {
  // 1. Calcul des 5 facteurs purs normalisés [0, 1]
  const { fSwell, effectiveHeight, rawEnergy } = calculateFSwell(spot, conditions);
  const fPeriod = calculateFPeriod(conditions.swellPeriod, spot.breakType);
  const fWind = calculateFWind(spot, conditions.windSpeedKts, conditions.windDirection);
  const fTide = calculateFTide(
    conditions.tideHeight,
    spot.tideWindow,
    conditions.tidePhase,
    spot.preferredPhase
  );

  // 2. Meilleur créneau horaire et durée exploitable
  const bestWindow = findBestWindowV2(spot, hourlyCurve, targetDate);
  const durationHours = bestWindow ? bestWindow.durationHours : 1.5;
  const fWindow = calculateFWindow(durationHours);

  // 3. Modèle multiplicatif à facteur limitant
  const { EXPONENTS, THRESHOLDS, TOLERANCES } = WEIGHTS;
  const rawQuality = 10 *
    Math.pow(fSwell, EXPONENTS.swell) *
    Math.pow(fPeriod, EXPONENTS.period) *
    Math.pow(fWind, EXPONENTS.wind) *
    Math.pow(fTide, EXPONENTS.tide) *
    Math.pow(fWindow, EXPONENTS.window);

  // Clamping de sécurité [0.5, 9.8]
  const quality = Math.max(
    TOLERANCES.minQualityClamp,
    Math.min(TOLERANCES.maxQualityClamp, Math.round(rawQuality * 10) / 10)
  );

  // 4. Évaluation des Dangers (Axe indépendant de la qualité)
  const { hazard, hazardReasons, hazardChip } = evaluateHazards(spot, conditions);
  const recommended = hazard !== 'critical';

  // 5. Confiance de la prévision selon l'horizon temporel
  const nowMs = Date.now();
  const diffDays = Math.max(0, (conditions.timestamp - nowMs) / (24 * 3600 * 1000));
  // J+0 ≈ 0.95 -> J+6 ≈ 0.45
  const confidence = Math.max(0.40, Number((0.95 - diffDays * 0.08).toFixed(2)));

  // Label textuel
  let label = 'Conditions correctes';
  if (quality >= THRESHOLDS.perfect) {
    label = 'Session parfaite';
  } else if (quality >= THRESHOLDS.good) {
    label = 'Très bonnes conditions';
  } else if (quality >= THRESHOLDS.fair) {
    label = 'Conditions correctes';
  } else {
    label = 'Conditions marginales';
  }

  const breakdown: FactorBreakdown = {
    fSwell,
    fPeriod,
    fWind,
    fTide,
    fWindow,
    rawEnergy,
    effectiveSwellHeight: effectiveHeight
  };

  return {
    quality,
    qualityFormatted: quality.toFixed(1).replace('.', ','),
    label,
    hazard,
    hazardReasons,
    hazardChip,
    recommended,
    confidence,
    bestWindow,
    breakdown
  };
}

/**
 * Évalue les risques et dangers physiques du spot à l'instant T
 */
function evaluateHazards(spot: SpotEnriched, conditions: MarineConditions): {
  hazard: HazardSeverity;
  hazardReasons: string[];
  hazardChip: string;
} {
  const reasons: string[] = [];
  let severity: HazardSeverity = 'none';
  let chip = 'Accessible';

  // CAS PARTICULIER CRITIQUE : Côte des Basques à marée haute
  if (spot.id === 'biarritz-cote-des-basques' || spot.id.includes('cote-des-basques')) {
    if (conditions.tideHeight >= 3.25 || conditions.tidePhase === 'high') {
      severity = 'critical';
      reasons.push('Danger Digue : marée haute, la plage est totalement submergée et les vagues percutent la falaise et les escaliers.');
      chip = 'Danger Digue';
      return { hazard: severity, hazardReasons: reasons, hazardChip: chip };
    }
  }

  // Risque Baïnes (amplifié par fort coefficient sur sable)
  if (spot.breakType === 'beach' && spot.baineRisk >= 0.6) {
    if (conditions.tideCoefficient >= 80) {
      severity = 'caution';
      reasons.push(`Courants de baïne violents (Coeff ${conditions.tideCoefficient}) : vidange très puissante.`);
      chip = 'Baïnes fortes';
    } else {
      severity = 'caution';
      chip = 'Baïnes';
    }
  }

  // Risque Reef / Roches coupantes
  if (spot.breakType === 'reef') {
    if (conditions.tideHeight <= (spot.tideWindow.min + 0.35)) {
      if (severity === 'none') severity = 'caution';
      reasons.push('Dalle rocheuse et têtes de roches affleurantes à basse mer.');
      chip = 'Roches peu profondes';
    }
  }

  // Risque Grosse Houle sur spot inadapté
  if (conditions.swellHeight >= 2.6 && spot.levelRange.min <= 2) {
    severity = 'critical';
    reasons.push('Houle trop massive pour ce spot d’initiation / fermeture totale.');
    chip = 'Surcharge houle';
  }

  if (reasons.length === 0) {
    chip = spot.levelLabel === 'Tous niveaux' ? 'Débutants' : 'Normal';
  }

  return { hazard: severity, hazardReasons: reasons, hazardChip: chip };
}

/**
 * Détermine le meilleur créneau horaire en exploitant les heures solaires réelles et le seuil fTide > 0.75
 */
export function findBestWindowV2(
  spot: SpotEnriched,
  curve: MarineConditions[],
  targetDate: Date = new Date()
): { start: string; end: string; durationHours: number; score: number } | null {
  if (!curve || curve.length === 0) return null;

  const solar = getBasqueSolarTimes(targetDate);
  const dawnH = Math.floor(solar.dawn.getHours());
  const duskH = Math.ceil(solar.dusk.getHours());

  // Heures où la marée est dans le seuil exploitable fTide >= 0.75 ET de jour
  const validPoints = curve.filter((p) => {
    const hour = parseInt(p.timeStr.split(':')[0], 10);
    const isDaylight = hour >= dawnH && hour <= duskH;
    if (!isDaylight) return false;

    const fT = calculateFTide(p.tideHeight, spot.tideWindow, p.tidePhase, spot.preferredPhase);
    return fT >= 0.72;
  });

  if (validPoints.length === 0) {
    return null;
  }

  // Regroupement en blocs continus
  const blocks: { start: string; end: string; durationHours: number; avgScore: number }[] = [];
  let currentBlock: MarineConditions[] = [];

  for (const pt of validPoints) {
    const hour = parseInt(pt.timeStr.split(':')[0], 10);
    if (currentBlock.length === 0) {
      currentBlock.push(pt);
    } else {
      const prevHour = parseInt(currentBlock[currentBlock.length - 1].timeStr.split(':')[0], 10);
      if (hour === prevHour + 1) {
        currentBlock.push(pt);
      } else {
        const startH = parseInt(currentBlock[0].timeStr.split(':')[0], 10);
        const endH = parseInt(currentBlock[currentBlock.length - 1].timeStr.split(':')[0], 10) + 1;
        blocks.push({
          start: `${startH.toString().padStart(2, '0')}:00`,
          end: `${Math.min(24, endH).toString().padStart(2, '0')}:00`,
          durationHours: endH - startH,
          avgScore: 8.0
        });
        currentBlock = [pt];
      }
    }
  }

  if (currentBlock.length > 0) {
    const startH = parseInt(currentBlock[0].timeStr.split(':')[0], 10);
    const endH = parseInt(currentBlock[currentBlock.length - 1].timeStr.split(':')[0], 10) + 1;
    blocks.push({
      start: `${startH.toString().padStart(2, '0')}:00`,
      end: `${Math.min(24, endH).toString().padStart(2, '0')}:00`,
      durationHours: endH - startH,
      avgScore: 8.0
    });
  }

  // Choisir le bloc le plus long ou le plus proche du milieu de journée
  blocks.sort((a, b) => b.durationHours - a.durationHours);
  const best = blocks[0] || null;

  return best ? {
    start: best.start,
    end: best.end,
    durationHours: best.durationHours,
    score: best.avgScore
  } : null;
}
