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
        bg: 'bg-rose-950/60 border-rose-800/80 text-rose-300',
        scoreColor: 'text-rose-400',
        dot: 'bg-rose-500',
      };
    }
    if (score.score >= 8.0) {
      return {
        bg: 'bg-emerald-950/60 border-emerald-700/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
        scoreColor: 'text-emerald-400',
        dot: 'bg-emerald-400',
      };
    }
    if (score.score >= 6.0) {
      return {
        bg: 'bg-teal-950/60 border-teal-700/80 text-teal-300',
        scoreColor: 'text-teal-400',
        dot: 'bg-teal-400',
      };
    }
    if (score.score >= 4.0) {
      return {
        bg: 'bg-amber-950/50 border-amber-750 text-amber-300',
        scoreColor: 'text-amber-400',
        dot: 'bg-amber-400',
      };
    }
    return {
      bg: 'bg-ocean-card border-ocean-border text-slate-400',
      scoreColor: 'text-slate-400',
      dot: 'bg-slate-500',
    };
  };

  const badge = getBadgeStyle();

  return (
    <div
      onClick={() => onSelectSpot(spot)}
      className="group bg-ocean-card hover:bg-ocean-hover border border-ocean-border hover:border-wave-500/50 active:border-wave-500 rounded-2xl p-4 transition-all duration-200 cursor-pointer active:scale-[0.99] flex flex-col justify-between shadow-lg shadow-black/20"
    >
      <div>
        {/* Top bar: City & Type + Favorite */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400 uppercase tracking-wider font-semibold truncate">
            {isTop && (
              <span className="flex items-center gap-1 text-emerald-300 bg-emerald-950/90 border border-emerald-700/80 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                <Flame className="w-3 h-3 text-emerald-400 stroke-[2.2]" />
                <span>Top</span>
              </span>
            )}
            <span className="text-wave-400 font-heading tracking-wide">{spot.town}</span>
            <span className="text-slate-600">•</span>
            <span className="truncate">{spot.type === 'beach_break' ? 'Beach break' : spot.type === 'reef_break' ? 'Reef break' : 'Point break'}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(spot.id);
            }}
            className="w-8 h-8 -mr-1 -mt-1 flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-400 active:scale-90 transition"
            aria-label={isFavorite ? 'Retirer favori' : 'Ajouter favori'}
          >
            <Star className={`w-4 h-4 stroke-[1.8] ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>

        {/* Spot Name & Score Row */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h3 className="font-heading font-bold text-white text-lg sm:text-xl tracking-tight leading-snug group-hover:text-wave-300 transition-colors">
            {spot.name}
          </h3>

          {/* Note sur 10 avec indicateur de qualité */}
          <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono ${badge.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
            <span className={`text-base sm:text-lg font-extrabold ${badge.scoreColor}`}>
              {score.scoreFormatted}
            </span>
            <span className="text-[10px] text-slate-400 font-sans font-bold">/10</span>
          </div>
        </div>

        {/* High Tide / Hazard Warning */}
        {score.warning && (
          <div className="mb-2.5 p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400 stroke-[2]" />
            <span className="leading-snug">{score.warning}</span>
          </div>
        )}

        {/* Brief explanation */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3 font-normal">
          {score.explanation}
        </p>
      </div>

      {/* Footer Info: Best window & Details button */}
      <div className="pt-2.5 border-t border-ocean-border flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 font-medium text-slate-300">
          <Clock className="w-3.5 h-3.5 text-wave-400 stroke-[2]" />
          <span>Créneau : <strong className="text-white font-mono">{score.bestWindowToday || 'Journée'}</strong></span>
        </div>

        <div className="flex items-center gap-1 text-wave-400 font-semibold group-hover:translate-x-0.5 transition-transform">
          <span className="hidden sm:inline font-heading text-xs">Voir marée</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.2]" />
        </div>
      </div>

    </div>
  );
};
