import React from 'react';
import { Spot, SpotScore, TideData } from '../types/index';
import { Star, AlertTriangle, ChevronRight, Clock, Flame } from 'lucide-react';

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
  const getBadgeStyle = () => {
    if (score.matchQuality === 'dangerous') {
      return {
        bg: 'bg-[#FF3B30]/20 border-[#FF3B30]/40 text-[#FF453A] shadow-[0_0_12px_rgba(255,59,48,0.3)]',
        dot: 'bg-[#FF453A] shadow-[0_0_6px_rgba(255,69,58,0.8)]',
      };
    }
    if (score.score >= 8.0) {
      return {
        bg: 'bg-[#34C759]/20 border-[#34C759]/40 text-[#30D158] shadow-[0_0_14px_rgba(52,199,89,0.3)]',
        dot: 'bg-[#30D158] shadow-[0_0_6px_rgba(48,209,88,0.8)]',
      };
    }
    if (score.score >= 6.0) {
      return {
        bg: 'bg-[#007AFF]/20 border-[#007AFF]/40 text-[#0A84FF] shadow-[0_0_12px_rgba(0,122,255,0.25)]',
        dot: 'bg-[#0A84FF] shadow-[0_0_6px_rgba(10,132,255,0.8)]',
      };
    }
    if (score.score >= 4.0) {
      return {
        bg: 'bg-[#FF9500]/20 border-[#FF9500]/40 text-[#FF9F0A] shadow-[0_0_12px_rgba(255,149,0,0.25)]',
        dot: 'bg-[#FF9F0A] shadow-[0_0_6px_rgba(255,159,10,0.8)]',
      };
    }
    return {
      bg: 'bg-white/[0.08] border-white/[0.12] text-white/70',
      dot: 'bg-white/40',
    };
  };

  const badge = getBadgeStyle();

  return (
    <div
      onClick={() => onSelectSpot(spot)}
      className="group relative liquid-glass-card rounded-[1.75rem] p-4 sm:p-5 transition-all duration-300 cursor-pointer active:scale-[0.985] flex flex-col justify-between overflow-hidden"
    >
      <div>
        {/* Top bar: City & Type + Favorite */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center space-x-2 text-xs text-white/60 font-medium tracking-normal truncate">
            {isTop && (
              <span className="flex items-center gap-1 text-[#30D158] bg-[#34C759]/20 border border-[#34C759]/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 shadow-[0_0_10px_rgba(52,199,89,0.3)]">
                <Flame className="w-3 h-3 stroke-[2.5]" />
                <span>Top</span>
              </span>
            )}
            <span className="text-[#38bdf8] font-semibold">{spot.town}</span>
            <span className="text-white/20">•</span>
            <span className="truncate">{spot.type === 'beach_break' ? 'Beach break' : spot.type === 'reef_break' ? 'Reef break' : 'Point break'}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(spot.id);
            }}
            className="w-8 h-8 -mr-1.5 -mt-1 flex items-center justify-center rounded-full bg-white/[0.04] hover:bg-white/[0.12] border border-white/[0.06] text-white/40 hover:text-[#FF9500] active:scale-90 transition"
            aria-label={isFavorite ? 'Retirer favori' : 'Ajouter favori'}
          >
            <Star className={`w-4 h-4 stroke-[2] ${isFavorite ? 'fill-[#FF9500] text-[#FF9500]' : ''}`} />
          </button>
        </div>

        {/* Spot Name & Score Row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-bold text-white text-lg sm:text-xl tracking-tight leading-snug">
            {spot.name}
          </h3>

          {/* Note sur 10 style Widget Apple épuré */}
          <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full border ${badge.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
            <span className="text-base sm:text-lg font-bold font-mono">
              {score.scoreFormatted}
            </span>
          </div>
        </div>

        {/* High Tide / Hazard Warning */}
        {score.warning && (
          <div className="mb-2.5 p-2.5 rounded-2xl bg-[#FF3B30]/15 border border-[#FF3B30]/30 text-[#FF453A] text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 stroke-[2]" />
            <span className="leading-snug font-medium">{score.warning}</span>
          </div>
        )}

        {/* Brief explanation */}
        <p className="text-xs text-white/70 line-clamp-2 leading-relaxed mb-3 font-normal">
          {score.explanation}
        </p>
      </div>

      {/* Footer Info: Best window & Details button */}
      <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/50 font-medium">
        <div className="flex items-center gap-1.5 text-white/80">
          <Clock className="w-3.5 h-3.5 text-[#0A84FF] stroke-[2]" />
          <span>Créneau : <strong className="text-white font-mono font-semibold">{score.bestWindowToday || 'Journée'}</strong></span>
        </div>

        <div className="flex items-center gap-1 text-[#0A84FF] font-semibold group-hover:translate-x-0.5 transition-transform">
          <span className="hidden sm:inline text-xs">Détails</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      </div>

    </div>
  );
};
