import React from 'react';
import { Spot, SpotScore, TideData } from '../types';
import { X, Star, AlertTriangle, Wind, Waves, Compass, Clock, MapPin, ExternalLink } from 'lucide-react';

interface SpotDetailModalProps {
  spot: Spot | null;
  score: SpotScore | null;
  tide: TideData | null;
  isFavorite: boolean;
  onToggleFavorite: (spotId: string) => void;
  onClose: () => void;
}

export const SpotDetailModal: React.FC<SpotDetailModalProps> = ({
  spot,
  score,
  tide,
  isFavorite,
  onToggleFavorite,
  onClose,
}) => {
  if (!spot || !score || !tide) return null;

  const currentHour = new Date().getHours();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-850">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-ocean-400 tracking-wider uppercase">
                {spot.town}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">
                {spot.type === 'beach_break' ? 'Beach break' : spot.type === 'reef_break' ? 'Reef break' : 'Point break'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {spot.name}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleFavorite(spot.id)}
              className={`p-2.5 rounded-xl border transition ${
                isFavorite 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Main Score & Diagnostics Hero */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-800/60 border border-slate-750 p-4 rounded-xl">
            {/* Note sur 10 */}
            <div className="sm:col-span-1 flex flex-col items-center justify-center p-3 bg-slate-900/80 rounded-lg border border-slate-750/80 text-center">
              <span className="text-xs text-slate-400 font-medium mb-1">Note de surf actuelle</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-extrabold text-white font-mono">{score.scoreFormatted}</span>
                <span className="text-sm text-slate-400 font-semibold">/10</span>
              </div>
              <span className="mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-ocean-500/20 text-ocean-300 border border-ocean-500/30">
                {score.label}
              </span>
            </div>

            {/* Détails marée spot */}
            <div className="sm:col-span-2 flex flex-col justify-center space-y-2 text-xs">
              <div>
                <span className="text-slate-400">Diagnostic marée : </span>
                <span className="text-slate-200">{score.explanation}</span>
              </div>
              <div>
                <span className="text-slate-400">Fenêtre idéale d'eau : </span>
                <strong className="text-ocean-300">{spot.optimalTideRange.minHeight}m à {spot.optimalTideRange.maxHeight}m</strong>
                <span className="text-slate-400"> (actuellement : {tide.currentHeight}m)</span>
              </div>
              <div>
                <span className="text-slate-400">Meilleur créneau du jour : </span>
                <span className="text-emerald-400 font-semibold">{score.bestWindowToday}</span>
              </div>
            </div>
          </div>

          {/* Dangers & Alertes spécifiques */}
          {spot.hazards && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Spécificités et dangers du spot :</strong>
                <span className="leading-relaxed text-amber-200/90">{spot.hazards}</span>
              </div>
            </div>
          )}

          {/* Courbe Visuelle de Marée 24H */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-ocean-400" />
                <span>Courbe des marées sur 24h</span>
              </h4>
              <span className="text-slate-400 text-[11px]">
                Zone optimale : <strong className="text-ocean-300">{spot.optimalTideRange.minHeight}m - {spot.optimalTideRange.maxHeight}m</strong>
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
              <div className="h-28 flex items-end justify-between gap-1 pt-4 pb-1">
                {tide.hourlyCurve.map((pt, idx) => {
                  const hNormalized = Math.max(0.1, Math.min(1, (pt.height - 0.5) / 4.0)); // 0.5m à 4.5m
                  const isCurrent = idx === currentHour;
                  const isOptimal = pt.height >= spot.optimalTideRange.minHeight && pt.height <= spot.optimalTideRange.maxHeight;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group/bar relative">
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-2 hidden group-hover/bar:flex flex-col items-center z-20 pointer-events-none">
                        <div className="bg-slate-800 text-[10px] text-white px-2 py-1 rounded shadow-lg border border-slate-700 whitespace-nowrap">
                          <strong>{pt.time}</strong>: {pt.height}m
                          {isOptimal && <span className="text-emerald-400 block font-medium">Idéal pour {spot.name}</span>}
                        </div>
                      </div>

                      {/* Bar indicator */}
                      <div
                        style={{ height: `${hNormalized * 100}%` }}
                        className={`w-full rounded-t transition-all ${
                          isCurrent
                            ? 'bg-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-400/20'
                            : isOptimal
                            ? 'bg-emerald-500/80 group-hover/bar:bg-emerald-400'
                            : 'bg-slate-700 group-hover/bar:bg-slate-600'
                        }`}
                      />
                      <span className={`text-[9px] mt-1 font-mono ${isCurrent ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                        {idx % 4 === 0 ? pt.time.split(':')[0] + 'h' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80 px-1">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                  <span>Hauteur idéale pour surfer</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span>
                  <span>Heure actuelle</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fiche Technique du Spot */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Fiche Technique
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-750 flex items-start space-x-2.5">
                <Wind className="w-4 h-4 text-ocean-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-300 block">Vent favorable</strong>
                  <span className="text-slate-400">{spot.bestWind}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-750 flex items-start space-x-2.5">
                <Waves className="w-4 h-4 text-ocean-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-300 block">Houle optimale</strong>
                  <span className="text-slate-400">{spot.bestSwell}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-750 flex items-start space-x-2.5">
                <Clock className="w-4 h-4 text-ocean-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-300 block">Marée recommandée</strong>
                  <span className="text-slate-400">{spot.tideDescription}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-750 flex items-start space-x-2.5">
                <Compass className="w-4 h-4 text-ocean-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-300 block">Niveau de surf</strong>
                  <span className="text-slate-400">{spot.level}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-800/30 p-3 rounded-lg border border-slate-800 leading-relaxed">
              {spot.description}
            </p>
          </div>

          {/* Localisation GPS */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-ocean-400" />
              <span>Coordonnées : {spot.lat.toFixed(4)}, {spot.lon.toFixed(4)}</span>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-ocean-400 hover:text-ocean-300 transition"
            >
              <span>Itinéraire Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
