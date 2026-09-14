import React, { useEffect, useState, useRef } from 'react';
import { Spot, SpotScore, TideData } from '../types/index';
import { X, Star, AlertTriangle, Wind, Waves, Clock, Navigation, Video, ExternalLink } from 'lucide-react';
import { openDirectMaps } from './GPSActionSheet';
import { getSpotWebcamUrl } from '../data/spots';

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
  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const [dragY, setDragY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragStartY = useRef<number>(0);
  const currentDragY = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);

  // Recul de la vue parente façon iOS 18
  useEffect(() => {
    document.body.classList.add('has-modal-open');
    return () => {
      document.body.classList.remove('has-modal-open');
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!spot || !score || !tide) return null;

  const webcamUrl = getSpotWebcamUrl(spot);
  const currentHour = new Date().getHours();
  const activeHourIndex = scrubIndex !== null ? scrubIndex : (isToday ? Math.min(23, currentHour) : 12);
  const activeHourlyPoint = tide.hourlyCurve[activeHourIndex] || tide.hourlyCurve[0];

  // Gestion du glissement vers le bas (Swipe-to-dismiss haute fidélité)
  const handleDragStart = (clientY: number) => {
    dragStartY.current = clientY;
    currentDragY.current = 0;
    setIsDragging(true);
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    const rawDelta = clientY - dragStartY.current;
    if (rawDelta > 0) {
      currentDragY.current = rawDelta;
      setDragY(rawDelta);
    } else {
      // Effet de résistance élastique Apple (rubber-banding) si on tire vers le haut
      const resistanceDelta = rawDelta * 0.25;
      currentDragY.current = resistanceDelta;
      setDragY(resistanceDelta);
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // Seuil de fermeture réactif (60px suffisent pour un geste fluide)
    if (currentDragY.current > 60) {
      onClose();
    } else {
      setDragY(0);
    }
    currentDragY.current = 0;
  };

  // Glissement depuis le haut du contenu défilable
  const handleContentTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleContentTouchMove = (e: React.TouchEvent) => {
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;
    if (scrollEl.scrollTop <= 0) {
      const deltaY = e.touches[0].clientY - touchStartY.current;
      if (deltaY > 0) {
        currentDragY.current = deltaY;
        setDragY(deltaY);
      }
    }
  };

  const handleContentTouchEnd = () => {
    if (currentDragY.current > 60) {
      onClose();
    } else {
      setDragY(0);
    }
    currentDragY.current = 0;
  };

  // Calcul du fade de l'arrière-plan pendant le drag
  const backdropOpacity = dragY > 0 ? Math.max(0.2, 1 - dragY / 350) : 1;

  return (
    <div 
      className="fixed inset-0 z-50 flex sm:items-center items-end justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4 transition-opacity duration-200"
      style={{ opacity: backdropOpacity }}
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-lg bg-[#1c1c1e] border-t sm:border border-white/[0.12] rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up overflow-hidden will-change-transform"
        style={{
          transform: dragY !== 0 ? `translate3d(0, ${dragY}px, 0)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.32s cubic-bezier(0.175, 0.885, 0.32, 1.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Drag Indicator / Poignée de glissement tactile vers le bas */}
        <div 
          className="pt-3.5 pb-2.5 cursor-grab active:cursor-grabbing flex items-center justify-center select-none w-full touch-none"
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
          onTouchEnd={handleDragEnd}
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onMouseMove={(e) => handleDragMove(e.clientY)}
          onMouseUp={handleDragEnd}
          title="Faire glisser vers le bas pour fermer"
        >
          <div className="w-12 h-1.5 rounded-full bg-white/35 active:scale-95 transition-transform" />
        </div>

        {/* Header Bar avec Croix Apple agrandie et repositionnée */}
        <div 
          className="px-5 pt-1 pb-4 border-b border-white/[0.08] flex items-center justify-between select-none"
          onTouchStart={(e) => {
            if ((e.target as HTMLElement).closest('button')) return;
            handleDragStart(e.touches[0].clientY);
          }}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
          onTouchEnd={handleDragEnd}
        >
          <div className="min-w-0 pr-3">
            <div className="text-xs font-semibold text-[#0A84FF] tracking-wide mb-0.5">
              {spot.town} • {spot.level}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
              {spot.name}
            </h2>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Bouton Favori */}
            <button
              onClick={() => onToggleFavorite(spot.id)}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.12] hover:bg-white/[0.18] active:bg-white/[0.25] text-white/70 hover:text-[#FF9500] active:scale-90 transition shadow-sm"
              aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Star className={`w-5 h-5 stroke-[2] ${isFavorite ? 'fill-[#FF9500] text-[#FF9500]' : ''}`} />
            </button>

            {/* Bouton Fermer (Croix Apple 44x44px distincte et bien visible) */}
            <button
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.14] hover:bg-white/[0.22] active:bg-white/[0.30] text-white active:scale-90 transition shadow-sm"
              aria-label="Fermer la fiche du spot"
            >
              <X className="w-5 h-5 stroke-[2.8]" />
            </button>
          </div>
        </div>

        {/* Scrollable Content avec détection de swipe-down au sommet */}
        <div 
          ref={scrollContainerRef}
          onTouchStart={handleContentTouchStart}
          onTouchMove={handleContentTouchMove}
          onTouchEnd={handleContentTouchEnd}
          className="p-4 sm:p-5 space-y-4 overflow-y-auto overscroll-contain text-xs sheet-scroll"
        >
          
          {/* Main Score Hero Card */}
          {/* Hero Score Card */}
          <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-white/50 block mb-0.5 font-medium">
                {isToday ? 'Note du spot' : 'Prévision'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-bold text-white apple-score tracking-tight">{score.scoreFormatted}</span>
                <span className="text-xs text-white/40 font-semibold">/10</span>
              </div>
              <span className="text-xs font-semibold text-[#0A84FF]">
                {score.label}
              </span>
            </div>

            <div className="text-right text-xs space-y-1 text-white/80 font-medium">
              <div>
                <span className="text-white/40">{scrubIndex !== null ? `${activeHourlyPoint.time} : ` : 'Hauteur : '}</span>
                <strong className="text-white apple-score text-sm">{activeHourlyPoint.height}m</strong>
              </div>
              <div>
                <span className="text-white/40">Créneau : </span>
                <strong className="text-[#30D158] apple-score font-bold">{score.bestWindowToday}</strong>
              </div>
            </div>
          </div>

          {/* Dangers & Alertes spécifiques (affiché seulement si danger réel) */}
          {score.warning && (
            <div className="p-3.5 rounded-2xl bg-[#FF453A]/15 border border-[#FF453A]/30 text-[#FF6961] text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#FF453A] shrink-0 mt-0.5 stroke-[2]" />
              <span className="leading-snug font-medium">{score.warning}</span>
            </div>
          )}

          {/* Bouton Webcam Live / Vue en direct */}
          <a
            href={webcamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-red-500/10 via-white/[0.04] to-sky-500/10 hover:from-red-500/20 hover:to-sky-500/20 border border-white/[0.12] hover:border-white/[0.25] transition-all duration-200 active:scale-[0.985] text-white shadow-lg select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/35 flex items-center justify-center shrink-0">
                <Video className="w-4.5 h-4.5 text-red-400 stroke-[2.2]" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white tracking-tight">Vue en direct (Webcam)</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/25 text-red-400 border border-red-500/35 tracking-wider">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-white/50 truncate">
                  Vérifier l'état des vagues et du plan d'eau en temps réel
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-white/40 group-hover:text-white transition-colors shrink-0 ml-2">
              <span className="text-xs font-semibold hidden xs:inline text-sky-400 group-hover:text-sky-300">Voir</span>
              <ExternalLink className="w-4 h-4 stroke-[2]" />
            </div>
          </a>

          {/* Courbe Continue Fluide façon Apple Météo avec Scrubbing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-semibold text-white">Marégraphe 24h ({tide.townName})</span>
              <span className="text-white/50 text-[11px]">
                {scrubIndex !== null 
                  ? `${activeHourlyPoint.time} · ${activeHourlyPoint.height}m`
                  : `Plage idéale : ${spot.optimalTideRange.minHeight}m - ${spot.optimalTideRange.maxHeight}m`}
              </span>
            </div>

            <div className="liquid-glass-card rounded-2xl p-4 overflow-hidden select-none">
              {(() => {
                const svgWidth = 500;
                const svgHeight = 116;
                const paddingBottom = 24;
                const usableHeight = svgHeight - paddingBottom - 16;
                const minH = 0.5;
                const maxH = 4.6;

                const pts = tide.hourlyCurve.map((pt, idx) => {
                  const x = (idx / 23) * (svgWidth - 44);
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

                const chartWidth = svgWidth - 44;
                const areaD = pathD ? `${pathD} L ${chartWidth} ${svgHeight - paddingBottom} L 0 ${svgHeight - paddingBottom} Z` : '';

                const optMinY = (svgHeight - paddingBottom) - Math.max(0, Math.min(1, (spot.optimalTideRange.minHeight - minH) / (maxH - minH))) * usableHeight;
                const optMaxY = (svgHeight - paddingBottom) - Math.max(0, Math.min(1, (spot.optimalTideRange.maxHeight - minH) / (maxH - minH))) * usableHeight;
                const optTop = Math.min(optMinY, optMaxY);
                const optHeight = Math.abs(optMinY - optMaxY);

                const currentPt = pts[activeHourIndex] || null;

                return (
                  <div className="w-full">
                    <svg 
                      viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                      className="w-full h-32 overflow-visible select-none cursor-ew-resize touch-none"
                      onPointerDown={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / (rect.width * ((svgWidth - 44) / svgWidth))));
                        setScrubIndex(Math.round(relX * 23));
                      }}
                      onPointerMove={(e) => {
                        if (e.buttons > 0 || e.pointerType === 'mouse') {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / (rect.width * ((svgWidth - 44) / svgWidth))));
                          setScrubIndex(Math.round(relX * 23));
                        }
                      }}
                      onPointerLeave={() => setScrubIndex(null)}
                      onPointerUp={() => setScrubIndex(null)}
                    >
                      <defs>
                        <linearGradient id="appleTideArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.28" />
                          <stop offset="80%" stopColor="#0A84FF" stopOpacity="0.04" />
                          <stop offset="100%" stopColor="#0A84FF" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="appleTideLine" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#30B0C7" />
                          <stop offset="50%" stopColor="#0A84FF" />
                          <stop offset="100%" stopColor="#5E5CE6" />
                        </linearGradient>
                      </defs>

                      {/* 1. Zone Idéale du Spot (PLURIALE, PLACÉE SOUS LE DÉGRADÉ BLEU) */}
                      <rect
                        x="0"
                        y={optTop}
                        width={chartWidth}
                        height={optHeight}
                        fill="#30D158"
                        fillOpacity="0.14"
                        stroke="#30D158"
                        strokeOpacity="0.6"
                        strokeDasharray="3 3"
                        rx="4"
                      />

                      {/* 2. Remplissage fluide dégradé bleu */}
                      <path d={areaD} fill="url(#appleTideArea)" />

                      {/* 3. Ligne de marée continue */}
                      <path d={pathD} fill="none" stroke="url(#appleTideLine)" strokeWidth="2.5" strokeLinecap="round" />

                      {/* 4. Axe Y minimal sur la droite */}
                      <g className="select-none font-mono">
                        <line x1={chartWidth} y1={optTop} x2={chartWidth + 5} y2={optTop} stroke="#30D158" strokeWidth="1" strokeOpacity="0.7" />
                        <text x={chartWidth + 8} y={optTop + 3.5} fill="#30D158" fontSize="9.5" fontWeight="600" textAnchor="start">
                          {spot.optimalTideRange.maxHeight}m
                        </text>

                        <line x1={chartWidth} y1={optTop + optHeight} x2={chartWidth + 5} y2={optTop + optHeight} stroke="#30D158" strokeWidth="1" strokeOpacity="0.7" />
                        <text x={chartWidth + 8} y={optTop + optHeight + 3.5} fill="#30D158" fontSize="9.5" fontWeight="600" textAnchor="start">
                          {spot.optimalTideRange.minHeight}m
                        </text>
                      </g>

                      {/* Ligne de sol */}
                      <line x1="0" y1={svgHeight - paddingBottom} x2={chartWidth} y2={svgHeight - paddingBottom} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                      {/* 5. Indicateur interactif de Scrubbing ou Position Actuelle */}
                      {currentPt && (
                        <g className="transition-all duration-75">
                          <line
                            x1={currentPt.x}
                            y1={0}
                            x2={currentPt.x}
                            y2={svgHeight - paddingBottom}
                            stroke={scrubIndex !== null ? '#FFFFFF' : '#FF9F0A'}
                            strokeDasharray={scrubIndex !== null ? 'none' : '2 2'}
                            strokeOpacity={scrubIndex !== null ? '0.9' : '0.75'}
                            strokeWidth={scrubIndex !== null ? '1.5' : '1.2'}
                          />
                          <circle cx={currentPt.x} cy={currentPt.y} r="9" fill={scrubIndex !== null ? '#0A84FF' : '#FF9F0A'} fillOpacity="0.25" />
                          <circle cx={currentPt.x} cy={currentPt.y} r="4.5" fill={scrubIndex !== null ? '#0A84FF' : '#FF9F0A'} stroke="#FFFFFF" strokeWidth="1.8" />
                          
                          {/* Badge flottant heure et hauteur au-dessus du point */}
                          <g transform={`translate(${Math.max(24, Math.min(chartWidth - 24, currentPt.x))}, ${Math.max(14, currentPt.y - 12)})`}>
                            <rect x="-24" y="-12" width="48" height="15" rx="7.5" fill="rgba(20, 22, 28, 0.9)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
                            <text
                              x="0"
                              y="-2"
                              fill="#FFFFFF"
                              fontSize="9"
                              fontWeight="700"
                              textAnchor="middle"
                              fontFamily="ui-rounded, SF Pro Rounded, sans-serif"
                            >
                              {currentPt.pt.height}m
                            </text>
                          </g>
                        </g>
                      )}

                      {/* 6. Graduations horaires : exactement 4 ticks Apple (06h, 12h, 18h, 00h) */}
                      {[
                        { h: 0, label: '00h' },
                        { h: 6, label: '06h' },
                        { h: 12, label: '12h' },
                        { h: 18, label: '18h' },
                        { h: 23, label: '24h' }
                      ].map(({ h, label }) => {
                        const x = (h / 23) * chartWidth;
                        const isSelectedTick = Math.abs(h - activeHourIndex) <= 1;
                        return (
                          <text
                            key={h}
                            x={x}
                            y={svgHeight - 6}
                            fill={isSelectedTick ? '#FFFFFF' : 'rgba(255,255,255,0.55)'}
                            fontSize="11"
                            fontFamily="ui-rounded, SF Pro Rounded, -apple-system, sans-serif"
                            fontWeight={isSelectedTick ? '700' : '500'}
                            textAnchor={h === 0 ? 'start' : h === 23 ? 'end' : 'middle'}
                          >
                            {label}
                          </text>
                        );
                      })}
                    </svg>
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

            <div className="p-3 flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-6 h-6 rounded-lg bg-[#FF9500]/20 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-[#FF9500] stroke-[2]" />
                </div>
                <span className="text-white/60 font-medium">Marée</span>
              </div>
              <span className="text-white font-medium text-right leading-snug">{spot.tideDescription}</span>
            </div>
          </div>

        </div>

        {/* Bottom Actions: Webcam en direct + Itinéraire */}
        <div className="p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-white/[0.08] bg-[#161618] flex items-center gap-2.5">
          <a
            href={webcamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-12 px-3 sm:px-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] active:scale-[0.985] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-sm select-none"
          >
            <div className="relative flex items-center justify-center">
              <Video className="w-4 h-4 text-red-400 stroke-[2.2]" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>
            <span>Webcam Live</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/40 stroke-[2]" />
          </a>

          <button
            onClick={() => openDirectMaps(spot.lat, spot.lon, spot.name)}
            className="flex-1 h-12 px-3 sm:px-4 rounded-2xl bg-[#007AFF] hover:bg-[#0062cc] active:scale-[0.985] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-[0_4px_20px_rgba(0,122,255,0.35)]"
          >
            <Navigation className="w-4 h-4 fill-white stroke-white" />
            <span>Itinéraire</span>
          </button>
        </div>

      </div>

    </div>
  );
};
