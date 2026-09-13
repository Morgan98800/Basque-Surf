import React, { useEffect } from 'react';
import { Spot, SpotScore, TideData } from '../types/index';
import { X, Star, AlertTriangle, Wind, Waves, Compass, Clock, Navigation } from 'lucide-react';

interface SpotDetailModalProps {
  spot: Spot | null;
  score: SpotScore | null;
  tide: TideData | null;
  isFavorite: boolean;
  isToday?: boolean;
  onToggleFavorite: (spotId: string) => void;
  onClose: () => void;
}

export const SpotDetailModal: React.FC<SpotDetailModalProps> = ({
  spot,
  score,
  tide,
  isFavorite,
  isToday = true,
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
              <span className="text-xs text-white/50 block mb-0.5 font-medium">
                {isToday ? 'Note de surf en direct' : 'Note prévisionnelle'}
              </span>
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
                <span className="text-white/40">{isToday ? "Hauteur d'eau : " : "Marée estimée (midi) : "}</span>
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

          {/* Courbe Continue Fluide façon Apple Météo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-semibold text-white">Marégraphe 24h ({tide.townName})</span>
              <span className="text-white/50 text-[11px]">Plage idéale : {spot.optimalTideRange.minHeight}m - {spot.optimalTideRange.maxHeight}m</span>
            </div>

            <div className="liquid-glass-card rounded-2xl p-4 overflow-hidden">
              {(() => {
                const svgWidth = 500;
                const svgHeight = 110;
                const paddingBottom = 22;
                const usableHeight = svgHeight - paddingBottom - 16;
                const minH = 0.5;
                const maxH = 4.6;

                const pts = tide.hourlyCurve.map((pt, idx) => {
                  const x = (idx / 23) * svgWidth;
                  const norm = Math.max(0, Math.min(1, (pt.height - minH) / (maxH - minH)));
                  const y = (svgHeight - paddingBottom) - norm * usableHeight;
                  return { x, y, pt, idx };
                });

                let pathD = '';
                if (pts.length > 0) {
                  pathD = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
                  for (let i = 0; i < pts.length - 1; i++) {
                    const p0 = pts[Math.max(0, i - 1)];
                    const p1 = pts[i];
                    const p2 = pts[i + 1];
                    const p3 = pts[Math.min(pts.length - 1, i + 2)];

                    const cp1x = p1.x + (p2.x - p0.x) / 6;
                    const cp1y = p1.y + (p2.y - p0.y) / 6;
                    const cp2x = p2.x - (p3.x - p1.x) / 6;
                    const cp2y = p2.y - (p3.y - p1.y) / 6;

                    pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
                  }
                }

                const areaD = pathD ? `${pathD} L ${svgWidth} ${svgHeight - paddingBottom} L 0 ${svgHeight - paddingBottom} Z` : '';

                const optMinY = (svgHeight - paddingBottom) - Math.max(0, Math.min(1, (spot.optimalTideRange.minHeight - minH) / (maxH - minH))) * usableHeight;
                const optMaxY = (svgHeight - paddingBottom) - Math.max(0, Math.min(1, (spot.optimalTideRange.maxHeight - minH) / (maxH - minH))) * usableHeight;
                const optTop = Math.min(optMinY, optMaxY);
                const optHeight = Math.abs(optMinY - optMaxY);

                const currentPt = isToday ? pts[Math.min(pts.length - 1, Math.max(0, currentHour))] : null;

                return (
                  <div className="w-full">
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-28 overflow-visible select-none">
                      <defs>
                        <linearGradient id="appleTideArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.32" />
                          <stop offset="80%" stopColor="#0A84FF" stopOpacity="0.04" />
                          <stop offset="100%" stopColor="#0A84FF" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="appleTideLine" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#30B0C7" />
                          <stop offset="50%" stopColor="#0A84FF" />
                          <stop offset="100%" stopColor="#5E5CE6" />
                        </linearGradient>
                      </defs>

                      {/* Zone Idéale du Spot en surbrillance émeraude */}
                      <rect
                        x="0"
                        y={optTop}
                        width={svgWidth}
                        height={optHeight}
                        fill="#30D158"
                        fillOpacity="0.08"
                        stroke="#30D158"
                        strokeOpacity="0.22"
                        strokeDasharray="3 3"
                        rx="3"
                      />
                      <text x={svgWidth - 4} y={optTop + 10} fill="#30D158" fontSize="9" fontWeight="600" textAnchor="end">
                        Fenêtre idéale
                      </text>

                      {/* Remplissage fluide dégradé */}
                      <path d={areaD} fill="url(#appleTideArea)" />

                      {/* Ligne de marée continue */}
                      <path d={pathD} fill="none" stroke="url(#appleTideLine)" strokeWidth="2.5" strokeLinecap="round" />

                      {/* Ligne de sol / Zéro relatif */}
                      <line x1="0" y1={svgHeight - paddingBottom} x2={svgWidth} y2={svgHeight - paddingBottom} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                      {/* Indicateur de position courante (si Aujourd'hui) */}
                      {currentPt && (
                        <g>
                          <line
                            x1={currentPt.x}
                            y1={currentPt.y}
                            x2={currentPt.x}
                            y2={svgHeight - paddingBottom}
                            stroke="#FF9500"
                            strokeDasharray="2 2"
                            strokeOpacity="0.75"
                            strokeWidth="1.2"
                          />
                          <circle cx={currentPt.x} cy={currentPt.y} r="8" fill="#FF9500" fillOpacity="0.25" />
                          <circle cx={currentPt.x} cy={currentPt.y} r="4.5" fill="#FF9500" stroke="#FFFFFF" strokeWidth="1.8" />
                          <text
                            x={currentPt.x}
                            y={Math.max(10, currentPt.y - 7)}
                            fill="#FF9500"
                            fontSize="9"
                            fontWeight="700"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            {currentPt.pt.height}m
                          </text>
                        </g>
                      )}

                      {/* Graduations horaires toutes les 4h */}
                      {[0, 4, 8, 12, 16, 20, 23].map((h) => {
                        const x = (h / 23) * svgWidth;
                        const isCurrentH = isToday && h === currentHour;
                        return (
                          <text
                            key={h}
                            x={x}
                            y={svgHeight - 4}
                            fill={isCurrentH ? '#FF9500' : 'rgba(255,255,255,0.35)'}
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight={isCurrentH ? '700' : '500'}
                            textAnchor={h === 0 ? 'start' : h === 23 ? 'end' : 'middle'}
                          >
                            {h.toString().padStart(2, '0')}h
                          </text>
                        );
                      })}
                    </svg>

                    <div className="flex items-center justify-between text-[10px] text-white/50 mt-2.5 pt-2.5 border-t border-white/[0.06]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#30D158]"></span>
                        <span>Zone d'eau optimale ({spot.optimalTideRange.minHeight}m - {spot.optimalTideRange.maxHeight}m)</span>
                      </div>
                      {isToday && (
                        <div className="flex items-center gap-1.5 font-medium text-[#FF9500]">
                          <span className="w-2 h-2 rounded-full bg-[#FF9500]"></span>
                          <span>Marée actuelle ({currentHour}h)</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
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

        {/* Bottom Action: Bouton Apple Style Pleine Largeur avec Safe Area iOS */}
        <div className="p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-white/[0.08] bg-[#161618]">
          <button
            onClick={openGPS}
            className="w-full h-11 px-6 rounded-full bg-[#007AFF] hover:bg-[#0062cc] active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-md"
          >
            <Navigation className="w-4 h-4 fill-white stroke-white" />
            <span>{/iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent) ? 'Itinéraire Apple Plans' : 'Itinéraire Google Maps'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
