import React from 'react';
import { Spot, SpotScore, TideData } from '../types/index';
import { Star, AlertTriangle, Check, ChevronRight, Clock, Flame } from 'lucide-react';

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
  const getScoreDotColor = () => {
    if (score.matchQuality === 'dangerous') return 'bg-[#FF453A] shadow-[0_0_6px_rgba(255,69,58,0.9)]';
    if (score.score >= 8.0) return 'bg-[#30D158] shadow-[0_0_6px_rgba(48,209,88,0.9)]';
    if (score.score >= 6.0) return 'bg-[#0A84FF] shadow-[0_0_6px_rgba(10,132,255,0.9)]';
    if (score.score >= 4.0) return 'bg-[#FF9F0A] shadow-[0_0_6px_rgba(255,159,10,0.9)]';
    return 'bg-white/40';
  };

  const getHazardChip = () => {
    const level = score.hazardLevel || spot.hazardLevel || 'caution';
    const label = score.hazardChip || spot.hazardChip || 'Prudence';

    if (level === 'safe') {
      return (
        <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-[#30D158]/12 border border-[#30D158]/25 text-[#30D158] text-[11px] font-semibold shrink-0">
          <Check className="w-3 h-3 stroke-[2.5]" />
          <span>{label}</span>
        </span>
      );
    }

    if (level === 'danger') {
      return (
        <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-[#FF453A]/15 border border-[#FF453A]/35 text-[#FF6961] text-[11px] font-semibold shrink-0 shadow-[0_0_10px_rgba(255,69,58,0.2)]">
          <AlertTriangle className="w-3 h-3 text-[#FF453A] stroke-[2.5]" />
          <span>{label}</span>
        </span>
      );
    }

    // caution
    return (
      <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-[#FF9F0A]/12 border border-[#FF9F0A]/25 text-[#FF9F0A] text-[11px] font-semibold shrink-0">
        <AlertTriangle className="w-3 h-3 stroke-[2.2]" />
        <span>{label}</span>
      </span>
    );
  };

  const formatCompactWindow = (w?: string) => {
    if (!w) return 'Toute la journée';
    return w
      .replace(/:00/g, 'h')
      .replace(/\s*-\s*/g, '–')
      .replace(/\s*&\s*/g, ' · ')
      .replace(/\s*,\s*/g, ' · ');
  };

  const spotTypeName = spot.type === 'beach_break' ? 'Beach break' : spot.type === 'reef_break' ? 'Reef break' : 'Point break';

  return (
    <div
      onClick={() => onSelectSpot(spot)}
      className="group relative liquid-glass-card rounded-[1.35rem] p-3.5 sm:p-4 transition-all duration-250 cursor-pointer active:scale-[0.985] flex flex-col justify-between overflow-hidden min-h-[108px] w-full min-w-0"
    >
      {/* Ligne 1 : Méta (Ville · Type) + Bouton Favori */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center space-x-1.5 text-[11px] text-white/55 font-medium tracking-normal min-w-0 truncate">
          {isTop && (
            <span className="flex items-center gap-0.5 text-[#30D158] bg-[#30D158]/15 border border-[#30D158]/30 px-1.5 py-0.5 rounded-md text-[10px] font-bold shrink-0">
              <Flame className="w-2.5 h-2.5 stroke-[2.5]" />
              <span>Top</span>
            </span>
          )}
          <span className="text-sky-300 font-semibold shrink-0">{spot.town}</span>
          <span className="text-white/20">·</span>
          <span className="truncate">{spotTypeName}</span>
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

      {/* Ligne 2 : Titre du Spot + Pastille de Note sur la MÊME ligne */}
      <div className="flex items-center justify-between gap-2 my-1 min-w-0">
        <h3 className="font-bold text-white text-base sm:text-[17px] tracking-tight truncate group-hover:text-sky-300 transition-colors min-w-0 flex-1">
          {spot.name}
        </h3>

        {/* Note Apple Watch SF Pro Rounded */}
        <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] backdrop-blur-md">
          <span className={`w-1.5 h-1.5 rounded-full ${getScoreDotColor()}`} />
          <span className="text-sm font-bold apple-score text-white">
            {score.scoreFormatted}
          </span>
        </div>
      </div>

      {/* Ligne 3 : Créneau horaire + Chip danger 24px + Chevron discret */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.05] text-xs min-w-0">
        <div className="flex items-center gap-1 text-[11px] text-white/70 min-w-0 truncate">
          <Clock className="w-3 h-3 text-[#0A84FF] shrink-0 stroke-[2.2]" />
          <span className="font-mono text-white/80 font-medium truncate">
            {formatCompactWindow(score.bestWindowToday)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {getHazardChip()}
          <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all stroke-[2]" />
        </div>
      </div>
    </div>
  );
};

