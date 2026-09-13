import React from 'react';
import { Spot, SpotScore, TideData } from '../types';
import { Star, AlertTriangle, Clock, ChevronRight, Waves } from 'lucide-react';

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
  // Styles selon la note
  const getScoreTheme = (val: number, quality: string) => {
    if (quality === 'dangerous') {
      return {
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        ring: 'border-rose-500/30 hover:border-rose-500/60',
        accent: 'text-rose-400',
        bar: 'bg-rose-500'
      };
    }
    if (val >= 8.0) {
      return {
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        ring: 'border-emerald-500/30 hover:border-emerald-500/60',
        accent: 'text-emerald-400',
        bar: 'bg-emerald-500'
      };
    }
    if (val >= 6.0) {
      return {
        badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        ring: 'border-sky-500/30 hover:border-sky-500/60',
        accent: 'text-sky-400',
        bar: 'bg-sky-500'
      };
    }
    if (val >= 4.0) {
      return {
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        ring: 'border-amber-500/30 hover:border-amber-500/60',
        accent: 'text-amber-400',
        bar: 'bg-amber-500'
      };
    }
    return {
      badge: 'bg-slate-700/60 text-slate-300 border-slate-600',
      ring: 'border-slate-700 hover:border-slate-600',
      accent: 'text-slate-400',
      bar: 'bg-slate-500'
    };
  };

  const theme = getScoreTheme(score.score, score.matchQuality);

  return (
    <div
      onClick={() => onSelectSpot(spot)}
      className={`group relative bg-slate-850 bg-slate-800/60 hover:bg-slate-800 border rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${theme.ring}`}
    >
      {/* Top Header: Town, Name, Favorite */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-ocean-400 tracking-wider uppercase">
              {spot.town}
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-xs text-slate-400">
              {spot.type === 'beach_break' ? 'Beach break' : spot.type === 'reef_break' ? 'Reef break' : 'Point break'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-ocean-300 transition">
            {spot.name}
          </h3>
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(spot.id);
          }}
          className="p-2 rounded-xl bg-slate-750/70 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition"
          title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Main Score & Tide Status */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-750 rounded-xl p-3 mb-3.5">
        
        {/* Big Score on 10 */}
        <div className="flex items-baseline space-x-1.5">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {score.scoreFormatted}
          </span>
          <span className="text-xs text-slate-400 font-semibold">/10</span>
        </div>

        {/* Quality Badge */}
        <div className="text-right">
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${theme.badge}`}>
            {score.label}
          </span>
        </div>
      </div>

      {/* High Tide / Hazards Alert Banner */}
      {score.warning && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span className="leading-snug">{score.warning}</span>
        </div>
      )}

      {/* Tide explanation */}
      <p className="text-xs text-slate-300 line-clamp-2 mb-3.5 leading-relaxed">
        {score.explanation}
      </p>

      {/* Spot specifics mini pills */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3.5 pt-2 border-t border-slate-750/60 text-slate-400">
        <div className="flex items-center space-x-1.5 truncate">
          <Waves className="w-3.5 h-3.5 text-ocean-400 shrink-0" />
          <span className="truncate">{spot.level}</span>
        </div>
        <div className="flex items-center space-x-1.5 truncate">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">Créneau : {score.bestWindowToday || 'Journée'}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between text-xs text-ocean-400 font-medium group-hover:text-ocean-300 transition pt-1">
        <span>Marée & Détails du spot</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
      </div>

    </div>
  );
};
