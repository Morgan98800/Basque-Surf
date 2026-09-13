import React, { useEffect } from 'react';
import { Spot, SpotScore, TideData } from '../types/index';
import { X, Star, AlertTriangle, Wind, Waves, Compass, Clock, Navigation, ShieldCheck } from 'lucide-react';

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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!spot || !score || !tide) return null;

  const currentHour = new Date().getHours();

  // Ouvre l'application GPS native
  const openGPS = () => {
    const isApple = /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent);
    if (isApple) {
      window.open(`maps://maps.apple.com/?daddr=${spot.lat},${spot.lon}&q=${encodeURIComponent(spot.name)}&dirflg=d`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lon}`, '_blank');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex sm:items-center items-end justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-lg bg-nautical-900 border-t sm:border border-nautical-750 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Swipe Handle */}
        <div className="sm:hidden pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-nautical-700 mx-auto" />
        </div>

        {/* Header Bar */}
        <div className="px-4 py-3.5 border-b border-ocean-border flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-wave-400 font-heading uppercase tracking-wider">
              {spot.town} • {spot.level}
            </div>
            <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white tracking-tight">
              {spot.name}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(spot.id)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-ocean-card text-slate-400 hover:text-amber-400 border border-ocean-border active:scale-95 transition"
              aria-label="Favori"
            >
              <Star className={`w-4 h-4 stroke-[1.8] ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-ocean-card text-slate-400 hover:text-white border border-ocean-border active:scale-95 transition"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-4 overflow-y-auto overscroll-contain text-xs">
          
          {/* Main Score Hero Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-ocean-card to-ocean-dark border border-ocean-border flex items-center justify-between gap-4 shadow-md">
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5 font-medium">Note de surf en direct</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white font-mono tracking-tight">{score.scoreFormatted}</span>
                <span className="text-xs text-slate-400 font-bold">/10</span>
              </div>
              <span className="text-[11px] font-semibold text-wave-400 font-heading">
                {score.label}
              </span>
            </div>

            <div className="text-right text-[11px] space-y-1 text-slate-300">
              <div>
                <span className="text-slate-400">Eau actuelle : </span>
                <strong className="text-white font-mono">{tide.currentHeight}m</strong>
              </div>
              <div>
                <span className="text-slate-400">Créneau idéal : </span>
                <strong className="text-wave-300 font-mono font-bold">{score.bestWindowToday}</strong>
              </div>
            </div>
          </div>

          {/* Dangers & Alertes spécifiques */}
          {score.warning && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-start gap-2 shadow-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5 stroke-[2]" />
              <span className="leading-snug">{score.warning}</span>
            </div>
          )}

          {/* Diagnostic texte */}
          <div className="p-3.5 rounded-xl bg-ocean-card border border-ocean-border text-slate-300 leading-relaxed">
            <span className="font-heading font-bold text-white block mb-1">Analyse des marées</span>
            <p className="leading-normal">{score.explanation}</p>
          </div>

          {/* Courbe Horaire 24H */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-heading font-semibold text-slate-200">Courbe de marée sur 24h ({tide.townName})</span>
              <span className="text-slate-400">Idéal : {spot.optimalTideRange.minHeight}m - {spot.optimalTideRange.maxHeight}m</span>
            </div>

            <div className="bg-ocean-card border border-ocean-border rounded-xl p-3 shadow-inner">
              <div className="h-24 flex items-end justify-between gap-1 pt-3 pb-1">
                {tide.hourlyCurve.map((pt, idx) => {
                  const hNormalized = Math.max(0.1, Math.min(1, (pt.height - 0.5) / 4.0));
                  const isCurrent = idx === currentHour;
                  const isOptimal = pt.height >= spot.optimalTideRange.minHeight && pt.height <= spot.optimalTideRange.maxHeight;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end relative">
                      <div
                        style={{ height: `${hNormalized * 100}%` }}
                        className={`w-full rounded-t transition-all ${
                          isCurrent
                            ? 'bg-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : isOptimal
                            ? 'bg-wave-500'
                            : 'bg-nautical-750'
                        }`}
                      />
                      <span className={`text-[8px] mt-1 font-mono ${isCurrent ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                        {idx % 4 === 0 ? pt.time.split(':')[0] + 'h' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-2.5 border-t border-ocean-border">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-wave-500"></span>
                  <span>Fenêtre idéale pour ce spot</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>Heure actuelle</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fiche Technique */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-ocean-card border border-ocean-border">
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <Wind className="w-3.5 h-3.5 text-wave-400 stroke-[1.8]" />
                <span className="font-heading font-semibold text-slate-300">Vent</span>
              </div>
              <span className="text-slate-200">{spot.bestWind}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-ocean-card border border-ocean-border">
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <Waves className="w-3.5 h-3.5 text-wave-400 stroke-[1.8]" />
                <span className="font-heading font-semibold text-slate-300">Houle</span>
              </div>
              <span className="text-slate-200">{spot.bestSwell}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-ocean-card border border-ocean-border">
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <Clock className="w-3.5 h-3.5 text-wave-400 stroke-[1.8]" />
                <span className="font-heading font-semibold text-slate-300">Marée</span>
              </div>
              <span className="text-slate-200">{spot.tideDescription}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-ocean-card border border-ocean-border">
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <Compass className="w-3.5 h-3.5 text-wave-400 stroke-[1.8]" />
                <span className="font-heading font-semibold text-slate-300">Niveau</span>
              </div>
              <span className="text-slate-200">{spot.level}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
            {spot.description}
          </p>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-wave-500 shrink-0 stroke-[2]" />
            <span>{tide.attribution || 'Données IFREMER/PREVIMER calibrées SHOM'}</span>
          </div>

        </div>

        {/* Bottom Action: Un seul bouton GPS épuré et puissant */}
        <div className="p-3 border-t border-ocean-border bg-ocean-dark flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400 font-medium">
            {spot.town}
          </span>

          <button
            onClick={openGPS}
            className="h-11 px-5 rounded-xl bg-wave-500 hover:bg-wave-400 active:scale-95 text-ocean-dark font-heading font-bold text-xs flex items-center justify-center gap-2 transition shadow-[0_4px_14px_rgba(20,184,166,0.3)]"
          >
            <Navigation className="w-4 h-4 fill-ocean-dark stroke-ocean-dark" />
            <span>Itinéraire GPS</span>
          </button>
        </div>

      </div>
    </div>
  );
};
