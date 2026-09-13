import { Spot, TideData, SpotScore, TideMatchQuality } from '../types/index';

export function evaluateSpotConditions(spot: Spot, tide: TideData): SpotScore {
  const { currentHeight, currentPhase, coefficient, hourlyCurve } = tide;
  const { minHeight, maxHeight, preferredPhases } = spot.optimalTideRange;

  let baseScore = 6.5;
  let explanation = '';
  let matchQuality: TideMatchQuality = 'good';

  // 1. CAS PARTICULIER CRITIQUE : Côte des Basques à marée haute
  if (spot.id === 'biarritz-cote-des-basques') {
    if (currentHeight >= 3.3 || currentPhase === 'high') {
      const cliffFactor = Math.min(1.0, Math.max(0, (currentHeight - 3.2) / 1.5));
      const score = Number((1.8 - cliffFactor * 0.8).toFixed(1)); // Score stable 1.0 - 1.8
      return {
        score,
        scoreFormatted: score.toFixed(1).replace('.', ','),
        label: 'Dangereux / Impraticable',
        explanation: 'La marée est trop haute. L’eau submerge totalement le sable et frappe la digue rocheuse.',
        matchQuality: 'dangerous',
        warning: '⚠️ DANGER DIGUE : La plage a disparu. Risque sérieux de projection contre le mur de soutènement et les escaliers.',
        bestWindowToday: findBestWindow(spot, hourlyCurve)
      };
    }
  }

  // 2. Vérification de la hauteur d'eau par rapport à la plage optimale du spot
  const optimalMid = (minHeight + maxHeight) / 2;
  const heightSpan = (maxHeight - minHeight) / 2;

  if (currentHeight >= minHeight && currentHeight <= maxHeight) {
    // Parfaitement dans la fenêtre d'eau
    const distFromCenter = Math.abs(currentHeight - optimalMid) / heightSpan; // 0 (plein centre) à 1 (sur les bords)
    const heightBonus = 2.2 * (1 - distFromCenter * 0.4); // +1.3 à +2.2
    baseScore += heightBonus;
    explanation += `Hauteur d'eau idéale (${currentHeight}m) pour ce spot. `;
  } else if (currentHeight < minHeight) {
    const diff = minHeight - currentHeight;
    baseScore -= diff * 2.8;
    explanation += `Manque d'eau (${currentHeight}m) : risque de vagues fermantes ou roche apparente. `;
    if (diff > 0.6) {
      matchQuality = 'poor';
    }
  } else {
    // currentHeight > maxHeight
    const diff = currentHeight - maxHeight;
    baseScore -= diff * 2.5;
    explanation += `Trop d'eau (${currentHeight}m) : les vagues peuvent devenir molles ou saturer en shorebreak. `;
    if (diff > 0.6) {
      matchQuality = 'poor';
    }
  }

  // 3. Adéquation de la phase (montante vs descendante vs basse vs haute)
  const isPreferredPhase = preferredPhases.includes(currentPhase);
  if (isPreferredPhase) {
    baseScore += 0.8;
    if (currentPhase === 'incoming') {
      explanation += 'La marée montante dynamise le déferlement. ';
    }
  } else {
    baseScore -= 0.6;
    if (currentPhase === 'high') {
      explanation += 'Pleine mer : section souvent aplatie. ';
    } else if (currentPhase === 'low') {
      explanation += 'Basse mer : vagues plus rapides et fermantes. ';
    }
  }

  // 4. Coefficient de marée
  // Les forts coefficients (>80) accentuent le courant de baïne sur Anglet
  if (spot.town === 'Anglet' && coefficient >= 80) {
    baseScore -= 0.4;
    explanation += `Fort coeff (${coefficient}) : méfiance baïnes et fort courant de vidange. `;
  } else if (coefficient >= 60 && coefficient <= 85) {
    // Bon coefficient de surf
    baseScore += 0.3;
  }

  // Ajustement pseudo-aléatoire déterministe pour avoir des décimales précises
  // basées sur l'ID du spot et l'heure pour ne pas avoir de valeurs rondes
  const charSum = spot.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const subtleVariation = ((charSum % 7) - 3) * 0.08;
  baseScore += subtleVariation;

  // Bornes de 1.0 à 9.8
  let finalScore = Math.min(9.8, Math.max(1.0, baseScore));
  // Arrondi à un chiffre après la virgule
  finalScore = Math.round(finalScore * 10) / 10;

  // Attribution du label et de la qualité
  let label = 'Conditions moyennes';
  if (finalScore >= 8.5) {
    label = 'Session parfaite';
    matchQuality = 'perfect';
  } else if (finalScore >= 7.0) {
    label = 'Très bonnes conditions';
    matchQuality = 'good';
  } else if (finalScore >= 5.0) {
    label = 'Conditions correctes';
    matchQuality = 'average';
  } else {
    label = 'Conditions médiocres';
    matchQuality = 'poor';
  }

  const scoreFormatted = finalScore.toFixed(1).replace('.', ',');

  return {
    score: finalScore,
    scoreFormatted,
    label,
    explanation: explanation.trim(),
    matchQuality,
    warning: spot.hazards ? spot.hazards : undefined,
    bestWindowToday: findBestWindow(spot, hourlyCurve)
  };
}

/**
 * Calcule le meilleur créneau horaire de la journée pour ce spot en fonction de sa courbe de marée
 */
function findBestWindow(spot: Spot, curve: { time: string; height: number }[]): string {
  const { minHeight, maxHeight } = spot.optimalTideRange;
  const matchingPoints = curve.filter(
    (p) => p.height >= minHeight - 0.15 && p.height <= maxHeight + 0.15
  );

  if (matchingPoints.length === 0) {
    return 'Conditions marginales';
  }

  // Grouper en blocs continus d'heures consécutives
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

  // Privilégier les sessions de jour (07:00 à 21:00) si disponibles, max 2 créneaux
  const daytimeBlocks = blocks.filter((b) => b.endHour >= 7 && b.startHour <= 21);
  const selectedBlocks = (daytimeBlocks.length > 0 ? daytimeBlocks : blocks).slice(0, 2);

  return selectedBlocks.map((b) => `${b.start} - ${b.end}`).join(' & ');
}
