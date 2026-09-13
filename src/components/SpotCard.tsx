import React from 'react';
import { Spot, SpotScore, TideData } from '../types/index';
import { Star, ChevronRight, Clock, Flame, Waves } from 'lucide-react';

interface SpotCardProps {
  spot: Spot;
  score: SpotScore;
  tide?: TideData;
  isFavorite: boolean;
  isTop?: boolean;
  onToggleFavorite: (spotId: string) => void;
  onSelectSpot: (spot: Spot) => void;
}

export const SpotCard: React.FC<SpotCardProps> = ({
  spot,
  score,
  isFavorite,
  isTop,
  onToggleFavorite,
  onSelectSpot,
}) => {
  const getScoreBadgeStyle = () => {
    if (score.matchQuality === 'dangerous') {
      return {
        bg: 'bg-[#FF453A]/15 border-[#FF453A]/30 text-[#FF6961]',
        dot: 'bg-[#FF453A]'
      };
    }
    if (score.score >= 8.0) {
      return {
        bg: 'bg-[#30D158]/15 border-[#30D158]/30 text-[#30D158]',
        dot: 'bg-[#30D158]'
      };
    }
    if (score.score >= 6.0) {
      return {
        bg: 'bg-[#0A84FF]/15 border-[#0A84FF]/30 text-[#0A84FF]',
        dot: 'bg-[#0A84FF]'
      };
    }
    if (score.score >= 4.0) {
      return {
        bg: 'bg-[#FF9F0A]/15 border-[#FF9F0A]/30 text-[#FF9F0A]',
        dot: 'bg-[#FF9F0A]'
      };
    }
    return {
      bg: 'bg-white/10 border-white/15 text-white/70',
      dot: 'bg-white/40'
    };
  };

  const formatCompactWindow = (w?: string) => {
    if (!w) return 'Toute la journée';
    return w
      .replace(/:00/g, 'h')
      .replace(/\s*-\s*/g, '–')
      .replace(/\s*&\s*/g, ' · ')
      .replace(/\s*,\s*/g, ' · ');
  };

  const badgeStyle = getScoreBadgeStyle();

  return (
    <div
      onClick={() => onSelectSpot(spot)}
      className="group relative liquid-glass-card rounded-[1.35rem] p-3.5 sm:p-4 transition-all duration-250 cursor-pointer active:scale-[0.985] flex flex-col justify-between overflow-hidden min-h-[104px] w-full min-w-0"
    >
      {/* Ligne 1 : Méta (Ville · Type) + Top Badge + Bouton Favori */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center space-x-1.5 text-[11px] text-white/50 font-medium tracking-normal min-w-0 truncate">
          {isTop && (
            <span className="flex items-center gap-0.5 text-[#30D158] bg-[#30D158]/15 border border-[#30D158]/30 px-1.5 py-0.5 rounded-md text-[10px] font-bold shrink-0">
              <Flame className="w-2.5 h-2.5 stroke-[2.5]" />
              <span>Top</span>
            </span>
          )}
          <span className="text-sky-300 font-semibold shrink-0">{spot.town}</span>
          <span className="text-white/20">·</span>
          <span className="truncate">{spot.level}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(spot.id);
          }}
          className="w-9 h-9 -mr-2 -mt-1.5 flex items-center justify-center rounded-full bg-white/[0.04] hover:bg-white/[0.14] text-white/40 hover:text-[#FF9500] active:scale-90 transition shrink-0"
          aria-label={isFavorite ? 'Retirer favori' : 'Ajouter favori'}
        >
          <Star className={`w-4 h-4 stroke-[2] ${isFavorite ? 'fill-[#FF9500] text-[#FF9500]' : ''}`} />
        </button>
      </div>

      {/* Ligne 2 : Titre du Spot + Note claire /10 */}
      <div className="flex items-center justify-between gap-3 my-1.5 min-w-0">
        <h3 className="font-bold text-white text-base sm:text-lg tracking-tight truncate group-hover:text-sky-300 transition-colors min-w-0 flex-1">
          {spot.name}
        </h3>

        {/* Note Apple Style : Chiffre + /10 explicite */}
        <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-md ${badgeStyle.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm sm:text-[15px] font-bold apple-score text-white">
              {score.scoreFormatted}
            </span>
            <span className="text-[10px] text-white/40 font-semibold">/10</span>
          </div>
        </div>
      </div>

      {/* Ligne 3 : Créneau horaire + Houle + Chevron */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06] text-xs min-w-0">
        <div className="flex items-center gap-1.5 min-w-0 truncate text-white/75">
          <Clock className="w-3.5 h-3.5 text-[#0A84FF] shrink-0 stroke-[2.2]" />
          <span className="text-[11px] text-white/45 font-medium shrink-0">Idéal :</span>
          <span className="text-xs font-mono font-semibold text-white truncate">
            {formatCompactWindow(score.bestWindowToday)}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Taille de houle */}
          {score.breakdown?.effectiveSwellHeight != null && score.breakdown.effectiveSwellHeight > 0 && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-300/90">
              <Waves className="w-3.5 h-3.5 stroke-[2]" />
              <span className="font-mono">{score.breakdown.effectiveSwellHeight.toFixed(1)}m</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-white/30 group-hover:text-white/80 transition-colors">
            <span className="text-[11px] font-medium hidden xs:inline text-white/40 group-hover:text-white/70">Détails</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform stroke-[2]" />
          </div>
        </div>
      </div>
    </div>
  );
};

