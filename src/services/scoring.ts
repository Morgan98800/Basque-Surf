import { Spot, TideData, SpotScore, TideMatchQuality, HazardLevel, SurfLevel } from '../types/index';
import { SpotEnriched, MarineConditions, BreakType, SurfLevelGrade, SpotHazard } from '../scoring/types';
import { scoreSpot } from '../scoring/engine';

export function spotToEnriched(spot: Spot): SpotEnriched {
  const breakType: BreakType =
    spot.type === 'point_break' ? 'pointbreak' :
    spot.type === 'reef_break' ? 'reef' : 'beach';

  const preferredPhase: 'rising' | 'falling' | 'any' =
    spot.optimalTideRange.preferredPhases.includes('incoming') && !spot.optimalTideRange.preferredPhases.includes('outgoing')
      ? 'rising'
      : spot.optimalTideRange.preferredPhases.includes('outgoing') && !spot.optimalTideRange.preferredPhases.includes('incoming')
      ? 'falling'
      : 'any';

  const levelGradeMap: Record<SurfLevel, { min: SurfLevelGrade; max: SurfLevelGrade }> = {
    'Débutant': { min: 1, max: 2 },
    'Tous niveaux': { min: 1, max: 4 },
    'Intermédiaire': { min: 3, max: 4 },
    'Confirmé': { min: 4, max: 5 },
    'Expert': { min: 5, max: 5 },
  };

  const hazards: SpotHazard[] = [];
  if (spot.id === 'biarritz-cote-des-basques' || spot.highTideRisk) {
    hazards.push({
      id: 'cote-des-basques-digue',
      label: 'Danger Digue',
      description: 'Plage submergée à marée haute.',
      severity: 'critical',
      triggerCondition: 'high_tide'
    });
  }

  return {
    id: spot.id,
    name: spot.name,
    town: spot.town,
    breakType,
    swellWindow: spot.swellWindow || { dirMin: 270, dirMax: 335 },
    exposure: spot.exposure ?? 0.85,
    sizeRange: spot.sizeRange || { min: 0.8, max: 2.2 },
    optimalSize: spot.optimalSize ?? 1.4,
    offshoreDir: spot.offshoreDir ?? 105,
    windTolerance: 45,
    tideWindow: {
      min: spot.optimalTideRange.minHeight,
      max: spot.optimalTideRange.maxHeight
    },
    preferredPhase,
    hazards,
    baineRisk: spot.baineRisk ?? (breakType === 'beach' ? 0.7 : 0.1),
    levelRange: levelGradeMap[spot.level] || { min: 1, max: 4 },
    levelLabel: spot.level,
    lat: spot.lat,
    lon: spot.lon,
    coefMareeSlug: spot.coefMareeSlug,
    description: spot.description
  };
}

export function evaluateSpotConditions(
  spot: Spot,
  tide: TideData,
  hourlyMarine?: MarineConditions[],
  targetDate: Date = new Date()
): SpotScore {
  const spotEnriched = spotToEnriched(spot);
  const now = new Date();
  const isSameDay =
    targetDate.getDate() === now.getDate() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getFullYear() === now.getFullYear();

  const activeHour = isSameDay ? now.getHours() : 11; // 11:00 pour la prévision diurne des jours futurs

  // 1. Préparer ou synchroniser la courbe marine 24h avec la marée SHOM/locale
  let syncedCurve: MarineConditions[] = [];

  if (hourlyMarine && hourlyMarine.length === 24) {
    syncedCurve = hourlyMarine.map((m, idx) => {
      const tidePt = tide.hourlyCurve[idx];
      return {
        ...m,
        tideHeight: tidePt ? tidePt.height : tide.currentHeight,
        tidePhase: tide.currentPhase,
        tideCoefficient: tide.coefficient
      };
    });
  } else {
    // Mode repli réaliste si la météo marine n'est pas encore prête
    syncedCurve = Array.from({ length: 24 }, (_, h) => {
      const tidePt = tide.hourlyCurve[h];
      return {
        timestamp: targetDate.getTime() + h * 3600 * 1000,
        timeStr: `${h.toString().padStart(2, '0')}:00`,
        swellHeight: 1.3,
        swellPeriod: 12,
        swellDirection: 295,
        windWaveHeight: 0.2,
        windSpeedKts: 7,
        windDirection: spot.offshoreDir || 105,
        tideHeight: tidePt ? tidePt.height : tide.currentHeight,
        tidePhase: tide.currentPhase,
        tideCoefficient: tide.coefficient
      };
    });
  }

  // 2. Condition instantanée pour l'évaluation
  const instantCondition: MarineConditions = {
    ...syncedCurve[activeHour],
    tideHeight: isSameDay ? tide.currentHeight : (syncedCurve[activeHour]?.tideHeight ?? tide.currentHeight),
    tidePhase: isSameDay ? tide.currentPhase : 'incoming',
    tideCoefficient: tide.coefficient
  };

  // 3. Calcul du score v2
  const v2Score = scoreSpot(spotEnriched, instantCondition, syncedCurve, targetDate);

  // 4. Déduction des statuts UI et labels
  const matchQuality: TideMatchQuality =
    v2Score.hazard === 'critical'
      ? 'dangerous'
      : v2Score.quality >= 8.5
      ? 'perfect'
      : v2Score.quality >= 7.0
      ? 'good'
      : v2Score.quality >= 5.0
      ? 'average'
      : 'poor';

  const hazardLevel: HazardLevel =
    v2Score.hazard === 'critical' ? 'danger' : v2Score.hazard === 'caution' ? 'caution' : 'safe';

  // Meilleur créneau
  let bestWindowToday = v2Score.bestWindow
    ? `${v2Score.bestWindow.start} - ${v2Score.bestWindow.end}`
    : findBestWindow(spot, tide.hourlyCurve);

  if (v2Score.hazard === 'critical' && spot.id === 'biarritz-cote-des-basques') {
    // À marée haute, préciser les créneaux praticables
    bestWindowToday = findBestWindow(spot, tide.hourlyCurve);
  }

  // Explication claire et synthétique
  const effectiveSize = v2Score.breakdown.effectiveSwellHeight;
  const angleDiff = Math.abs((instantCondition.windDirection - (spot.offshoreDir || 105) + 360) % 360);
  const isOffshore = angleDiff <= 45 || angleDiff >= 315;
  const offshoreLabel = isOffshore ? 'offshore' : 'onshore';
  const explanation = `${effectiveSize.toFixed(1)}m prévus (${instantCondition.swellHeight.toFixed(1)}m au large @ ${Math.round(instantCondition.swellPeriod)}s). Vent ${Math.round(instantCondition.windSpeedKts)} kts ${offshoreLabel}. Marée ${instantCondition.tideHeight.toFixed(1)}m.`;

  const warning = v2Score.hazardReasons.length > 0
    ? v2Score.hazardReasons[0]
    : (hazardLevel === 'danger' ? spot.hazards : undefined);

  return {
    score: v2Score.quality,
    scoreFormatted: v2Score.qualityFormatted,
    label: v2Score.label,
    explanation,
    matchQuality,
    hazardLevel,
    hazardChip: v2Score.hazardChip,
    warning,
    bestWindowToday,
    confidence: v2Score.confidence,
    breakdown: v2Score.breakdown
  };
}

/**
 * Détecte les fenêtres de marée optimales de jour (multi-créneaux matin/après-midi)
 */
export function findBestWindow(spot: Spot, curve: { time: string; height: number }[]): string {
  const { minHeight, maxHeight } = spot.optimalTideRange;
  const matchingPoints = curve.filter(
    (p) => p.height >= minHeight - 0.15 && p.height <= maxHeight + 0.15
  );

  if (matchingPoints.length === 0) {
    return 'Conditions marginales';
  }

  const blocks: { start: string; end: string; startHour: number; endHour: number }[] = [];
  let currentBlock: { time: string; hour: number }[] = [];

  for (const pt of matchingPoints) {
    const hour = parseInt(pt.time.split(':')[0], 10);
    if (currentBlock.length === 0) {
      currentBlock.push({ time: pt.time, hour });
    } else {
      const lastHour = currentBlock[currentBlock.length - 1].hour;
      if (hour === lastHour + 1) {
        currentBlock.push({ time: pt.time, hour });
      } else {
        const startH = currentBlock[0].hour;
        const endH = currentBlock[currentBlock.length - 1].hour + 1;
        blocks.push({
          start: `${startH.toString().padStart(2, '0')}:00`,
          end: `${Math.min(24, endH).toString().padStart(2, '0')}:00`,
          startHour: startH,
          endHour: endH,
        });
        currentBlock = [{ time: pt.time, hour }];
      }
    }
  }

  if (currentBlock.length > 0) {
    const startH = currentBlock[0].hour;
    const endH = currentBlock[currentBlock.length - 1].hour + 1;
    blocks.push({
      start: `${startH.toString().padStart(2, '0')}:00`,
      end: `${Math.min(24, endH).toString().padStart(2, '0')}:00`,
      startHour: startH,
      endHour: endH,
    });
  }

  const daytimeBlocks = blocks.filter((b) => b.endHour >= 7 && b.startHour <= 21);
  const selectedBlocks = (daytimeBlocks.length > 0 ? daytimeBlocks : blocks).slice(0, 2);

  return selectedBlocks.map((b) => `${b.start} - ${b.end}`).join(' & ');
}
