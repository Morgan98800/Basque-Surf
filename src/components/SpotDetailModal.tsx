import React, { useEffect } from 'react';
import { Spot, SpotScore, TideData } from '../types/index';
import { X, Star, AlertTriangle, Wind, Waves, Compass, Clock, Navigation } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex sm:items-center items-end justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-lg bg-[#1c1c1e] border-t sm:border border-white/[0.12] rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Drag Indicator / Grabber */}
        <div className="pt-3 pb-1">
          <div className="w-9 h-1.5 rounded-full bg-white/20 mx-auto" />
        </div>

        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#0A84FF]">
              {spot.town} • {spot.level}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {spot.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(spot.id)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-white/60 hover:text-[#FF9500] active:scale-95 transition"
              aria-label="Favori"
            >
              <Star className={`w-4 h-4 stroke-[2] ${isFavorite ? 'fill-[#FF9500] text-[#FF9500]' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-white/60 hover:text-white active:scale-95 transition"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Scrollable Content (Grouped Insets iOS) */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto overscroll-contain text-xs">
          
          {/* Main Score Hero Card */}
          <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-white/50 block mb-0.5 font-medium">Note de surf en direct</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">{score.scoreFormatted}</span>
                <span className="text-xs text-white/40 font-semibold">/10</span>
              </div>
              <span className="text-xs font-semibold text-[#0A84FF]">
                {score.label}
              </span>
            </div>

            <div className="text-right text-xs space-y-1 text-white/80 font-medium">
              <div>
                <span className="text-white/40">Hauteur d'eau : </span>
                <strong className="text-white font-mono">{tide.currentHeight}m</strong>
              </div>
              <div>
                <span className="text-white/40">Créneau idéal : </span>
                <strong className="text-[#30D158] font-mono font-bold">{score.bestWindowToday}</strong>
              </div>
            </div>
          </div>

          {/* Dangers & Alertes spécifiques */}
          {score.warning && (
            <div className="p-3.5 rounded-2xl bg-[#FF3B30]/15 border border-[#FF3B30]/30 text-[#FF453A] text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 stroke-[2]" />
              <span className="leading-snug font-medium">{score.warning}</span>
            </div>
          )}

          {/* Diagnostic texte */}
          <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/[0.08] text-white/80 leading-relaxed font-normal">
            <span className="font-semibold text-white block mb-1 text-xs">Analyse des marées</span>
            <p>{score.explanation}</p>
          </div>

          {/* Courbe Horaire 24H façon Apple Météo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-semibold text-white">Courbe 24h ({tide.townName})</span>
              <span className="text-white/50">Idéal : {spot.optimalTideRange.minHeight}m - {spot.optimalTideRange.maxHeight}m</span>
            </div>

            <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5">
              <div className="h-24 flex items-end justify-between gap-1 pt-3 pb-1">
                {tide.hourlyCurve.map((pt, idx) => {
                  const hNormalized = Math.max(0.1, Math.min(1, (pt.height - 0.5) / 4.0));
                  const isCurrent = idx === currentHour;
                  const isOptimal = pt.height >= spot.optimalTideRange.minHeight && pt.height <= spot.optimalTideRange.maxHeight;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end relative">
                      <div
                        style={{ height: `${hNormalized * 100}%` }}
                        className={`w-full rounded-t-sm transition-all ${
                          isCurrent
                            ? 'bg-[#FF9500] shadow-[0_0_8px_rgba(255,149,0,0.6)]'
                            : isOptimal
                            ? 'bg-[#34C759]'
                            : 'bg-white/10'
                        }`}
                      />
                      <span className={`text-[8px] mt-1.5 font-mono ${isCurrent ? 'text-[#FF9500] font-bold' : 'text-white/30'}`}>
                        {idx % 4 === 0 ? pt.time.split(':')[0] + 'h' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] text-white/50 mt-2.5 pt-2.5 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#34C759]"></span>
                  <span>Fenêtre idéale pour ce spot</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF9500]"></span>
                  <span>Heure actuelle</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grouped Table View (Style Réglages iOS) */}
          <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl divide-y divide-white/[0.06] overflow-hidden text-xs">
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#007AFF]/20 flex items-center justify-center">
                  <Wind className="w-3.5 h-3.5 text-[#0A84FF] stroke-[2]" />
                </div>
                <span className="text-white/60 font-medium">Vent favorable</span>
              </div>
              <span className="text-white font-semibold">{spot.bestWind}</span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#30B0C7]/20 flex items-center justify-center">
                  <Waves className="w-3.5 h-3.5 text-[#30B0C7] stroke-[2]" />
                </div>
                <span className="text-white/60 font-medium">Meilleure houle</span>
              </div>
              <span className="text-white font-semibold">{spot.bestSwell}</span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#FF9500]/20 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-[#FF9500] stroke-[2]" />
                </div>
                <span className="text-white/60 font-medium">Marée requise</span>
              </div>
              <span className="text-white font-semibold">{spot.tideDescription}</span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#AF52DE]/20 flex items-center justify-center">
                  <Compass className="w-3.5 h-3.5 text-[#BF5AF2] stroke-[2]" />
                </div>
                <span className="text-white/60 font-medium">Niveau requis</span>
              </div>
              <span className="text-white font-semibold">{spot.level}</span>
            </div>
          </div>

          <p className="text-xs text-white/50 leading-relaxed font-normal px-1">
            {spot.description}
          </p>

        </div>

        {/* Bottom Action: Bouton Apple Style Pleine Largeur */}
        <div className="p-4 border-t border-white/[0.08] bg-[#161618]">
          <button
            onClick={openGPS}
            className="w-full h-11 px-6 rounded-full bg-[#007AFF] hover:bg-[#0062cc] active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-md"
          >
            <Navigation className="w-4 h-4 fill-white stroke-white" />
            <span>Itinéraire Apple Plans</span>
          </button>
        </div>

      </div>
    </div>
  );
};
