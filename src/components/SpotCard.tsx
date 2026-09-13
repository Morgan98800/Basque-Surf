import React from 'react';
import { Spot, SpotScore, TideData } from '../types/index';
import { Star, AlertTriangle, ChevronRight, Clock } from 'lucide-react';

interface SpotCardProps {
  spot: Spot;
  score: SpotScore;
  tide?: TideData;
  isFavorite: boolean;
  onToggleFavorite: (spotId: string) => void;
  onSelectSpot: (spot: Spot) => void;
}

export const SpotCard: React.FC<SpotCardProps> = ({
  spot,
  score,
  isFavorite,
  onToggleFavorite,
  onSelectSpot,
}) => {
  // Score badge theme
  const getBadgeStyle = () => {
    if (score.matchQuality === 'dangerous') {
      return {
        bg: 'bg-rose-950/70 border-rose-800 text-rose-300',
        scoreColor: 'text-rose-400',
        bar: 'bg-rose-500'
      };
    }
    if (score.score >= 8.0) {
      return {
        bg: 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300',
        scoreColor: 'text-emerald-400',
        bar: 'bg-emerald-500'
      };
    }
    if (score.score >= 6.0) {
      return {
        bg: 'bg-sky-950/50 border-sky-800/80 text-sky-300',
        scoreColor: 'text-sky-400',
        bar: 'bg-sky-500'
      };
    }
    if (score.score >= 4.0) {
      return {
        bg: 'bg-amber-950/40 border-amber-800/60 text-amber-300',
        scoreColor: 'text-amber-400',
        bar: 'bg-amber-500'
      };
    }
    return {
      bg: 'bg-nautical-800 border-nautical-700 text-slate-400',
      scoreColor: 'text-slate-400',
      bar: 'bg-slate-600'
    };
  };

  const badge = getBadgeStyle();

  return (
    <div
      onClick={() => onSelectSpot(spot)}
      className="bg-nautical-850 hover:bg-nautical-800 border border-nautical-750 active:border-sky-600/60 rounded-xl p-3.5 sm:p-4.5 transition cursor-pointer active:scale-[0.99] flex flex-col justify-between"
    >
      <div>
        {/* Top bar: City & Type + Favorite */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400 uppercase tracking-wider font-semibold truncate">
            <span className="text-sky-400">{spot.town}</span>
            <span>•</span>
            <span className="truncate">{spot.type === 'beach_break' ? 'Beach' : spot.type === 'reef_break' ? 'Reef' : 'Point break'}</span>
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
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>

        {/* Spot Name & Score Row */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h3 className="font-bold text-white text-base sm:text-lg leading-tight">
            {spot.name}
          </h3>

          {/* Note sur 10 */}
          <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono ${badge.bg}`}>
            <span className={`text-base sm:text-lg font-extrabold ${badge.scoreColor}`}>
              {score.scoreFormatted}
            </span>
            <span className="text-[10px] text-slate-400 font-sans font-bold">/10</span>
          </div>
        </div>

        {/* High Tide / Hazard Warning */}
        {score.warning && (
          <div className="mb-2.5 p-2 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-[11px] flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
            <span className="leading-snug">{score.warning}</span>
          </div>
        )}

        {/* Tide explanation brief */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
          {score.explanation}
        </p>
      </div>

      {/* Footer Info: Best window & Level */}
      <div className="pt-2 border-t border-nautical-750 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 font-medium text-slate-300">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>Créneau : <strong className="text-white font-mono">{score.bestWindowToday || 'Journée'}</strong></span>
        </div>

        <div className="flex items-center gap-1 text-sky-400 font-medium">
          <span className="hidden sm:inline">Détails</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

    </div>
  );
};
