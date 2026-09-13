import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Spot, SpotScore, TideData } from '../types/index';
import { Navigation, Star, Clock, ChevronRight } from 'lucide-react';

interface SpotMapProps {
  spots: Array<{ spot: Spot; score: SpotScore; tide: TideData; isFavorite: boolean }>;
  selectedSpot: Spot | null;
  onSelectSpot: (spot: Spot) => void;
  onOpenDetails: (spot: Spot) => void;
  onToggleFavorite: (spotId: string) => void;
}

// Bornes strictes de la Côte Basque (Anglet à Hendaye)
const BASQUE_BOUNDS: L.LatLngBoundsLiteral = [
  [43.32, -1.86], // Sud-Ouest : Hendaye / frontière
  [43.56, -1.46]  // Nord-Est : Anglet / Adour
];

const BASQUE_CENTER: [number, number] = [43.455, -1.595]; // Entre Biarritz et Guéthary

export const SpotMap: React.FC<SpotMapProps> = ({
  spots,
  selectedSpot,
  onSelectSpot,
  onOpenDetails,
  onToggleFavorite,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialisation de la carte Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: BASQUE_CENTER,
      zoom: 12,
      minZoom: 11,
      maxZoom: 16,
      maxBounds: BASQUE_BOUNDS,
      maxBoundsViscosity: 0.9,
      zoomControl: false,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Mise à jour des marqueurs
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    spots.forEach(({ spot, score, isFavorite }) => {
      const isSelected = selectedSpot?.id === spot.id;

      let badgeBg = '#34C759'; // Vert iOS
      if (score.matchQuality === 'dangerous') badgeBg = '#FF3B30'; // Rouge iOS
      else if (score.score < 5.0) badgeBg = '#8E8E93'; // Gris iOS
      else if (score.score < 7.0) badgeBg = '#007AFF'; // Bleu iOS

      const html = `
        <div class="spot-marker ${isSelected ? 'marker-selected' : ''}" style="
          display: flex;
          align-items: center;
          background: rgba(28, 28, 30, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1.5px solid ${isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.16)'};
          border-radius: 9999px;
          padding: 2.5px 8px 2.5px 3.5px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.65);
          cursor: pointer;
          transform: translate(-50%, -50%) ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
        ">
          <span style="
            background: ${badgeBg};
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 700;
            font-family: -apple-system, monospace;
            padding: 1px 5px;
            border-radius: 9999px;
            margin-right: 5px;
          ">${score.scoreFormatted}</span>
          <span style="
            color: #FFFFFF;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: -0.01em;
          ">${spot.name.split(' - ')[0]}</span>
          ${isFavorite ? '<span style="color:#FF9500;margin-left:4px;font-size:10px;">★</span>' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-spot-marker',
        html,
        iconSize: [0, 0],
      });

      const marker = L.marker([spot.lat, spot.lon], { icon: customIcon });
      
      marker.on('click', () => {
        onSelectSpot(spot);
        map.panTo([spot.lat, spot.lon], { animate: true, duration: 0.4 });
      });

      marker.addTo(map);
      markersRef.current.set(spot.id, marker);
    });
  }, [spots, selectedSpot, onSelectSpot]);

  useEffect(() => {
    if (selectedSpot && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([selectedSpot.lat, selectedSpot.lon], {
        animate: true,
        duration: 0.5,
      });
    }
  }, [selectedSpot]);

  const activeSpotData = spots.find((s) => s.spot.id === selectedSpot?.id) || spots[0];

  const openGPS = (lat: number, lon: number, name: string) => {
    const isApple = /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent);
    if (isApple) {
      window.open(`maps://maps.apple.com/?daddr=${lat},${lon}&q=${encodeURIComponent(name)}&dirflg=d`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
    }
  };

  return (
    <div className="relative w-full h-[68vh] min-h-[460px] max-h-[720px] rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl flex flex-col">
      
      {/* Conteneur Leaflet */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full z-10" />

      {/* Overlay État Vide sur la Carte */}
      {spots.length === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="text-center p-6 rounded-3xl bg-[#1c1c1e]/90 border border-white/[0.12] max-w-sm space-y-2 shadow-2xl">
            <h4 className="text-sm font-semibold text-white">Aucun spot sur cette zone</h4>
            <p className="text-xs text-white/50 leading-relaxed">
              Essayez de réinitialiser la recherche ou de sélectionner « Toute la Côte Basque ».
            </p>
          </div>
        </div>
      )}

      {/* Fiche d'action flottante sous la carte façon Apple Maps Card */}
      {activeSpotData && (
        <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 z-20 bg-[#1c1c1e]/95 backdrop-blur-2xl border border-white/[0.14] rounded-3xl p-3.5 sm:p-4 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slide-up">
          
          {/* Infos spot */}
          <div className="flex items-start justify-between sm:justify-start gap-3 min-w-0">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0A84FF] tracking-normal truncate">
                <span>{activeSpotData.spot.town}</span>
                <span className="text-white/30">•</span>
                <span className="truncate text-white/60 font-medium">{activeSpotData.spot.level}</span>
              </div>
              <h4 className="font-bold text-white text-base sm:text-lg tracking-tight truncate">
                {activeSpotData.spot.name}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <Clock className="w-3.5 h-3.5 text-[#0A84FF] shrink-0 stroke-[2]" />
                <span>Créneau : <strong className="text-white font-mono font-semibold">{activeSpotData.score.bestWindowToday || 'Journée'}</strong></span>
              </div>
            </div>

            {/* Note mobile */}
            <div className="sm:hidden shrink-0 flex items-baseline gap-1 px-3 py-1 bg-white/[0.08] border border-white/[0.1] rounded-full font-mono">
              <span className="text-base font-bold text-white">{activeSpotData.score.scoreFormatted}</span>
              <span className="text-[10px] text-white/50 font-sans font-medium">/10</span>
            </div>
          </div>

          {/* Note desktop */}
          <div className="hidden sm:flex items-center gap-1 px-3.5 py-1.5 bg-white/[0.08] border border-white/[0.1] rounded-full font-mono shrink-0">
            <span className="text-lg font-bold text-white">{activeSpotData.score.scoreFormatted}</span>
            <span className="text-xs text-white/50 font-sans font-medium">/10</span>
          </div>

          {/* Boutons d'action adaptés mobile & desktop */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            
            {/* Favori */}
            <button
              onClick={() => onToggleFavorite(activeSpotData.spot.id)}
              className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-white/[0.08] border border-white/[0.1] text-white/60 hover:text-[#FF9500] active:scale-95 transition"
              aria-label="Favori"
            >
              <Star className={`w-4 h-4 stroke-[2] ${activeSpotData.isFavorite ? 'fill-[#FF9500] text-[#FF9500]' : ''}`} />
            </button>

            {/* Fiche & Marée */}
            <button
              onClick={() => onOpenDetails(activeSpotData.spot)}
              className="flex-1 sm:flex-initial h-10 px-3.5 sm:px-4 rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <span>Fiche</span>
              <ChevronRight className="w-3.5 h-3.5 text-white/60 stroke-[2.5]" />
            </button>

            {/* Bouton GPS unique & puissant façon Apple Maps */}
            <button
              onClick={() => openGPS(activeSpotData.spot.lat, activeSpotData.spot.lon, activeSpotData.spot.name)}
              className="flex-1 sm:flex-initial h-10 px-4 sm:px-5 rounded-full bg-[#007AFF] hover:bg-[#0062cc] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <Navigation className="w-3.5 h-3.5 fill-white stroke-white" />
              <span>Y aller</span>
            </button>

          </div>

        </div>
      )}

    </div>
  );
};
