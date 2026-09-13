import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Spot, SpotScore, TideData } from '../types/index';
import { Navigation, Star, Clock, ChevronRight, Compass } from 'lucide-react';

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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
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

      let badgeBg = '#10b981';
      if (score.matchQuality === 'dangerous') badgeBg = '#ef4444';
      else if (score.score < 5.0) badgeBg = '#64748b';
      else if (score.score < 7.0) badgeBg = '#0284c7';

      const html = `
        <div class="spot-marker ${isSelected ? 'marker-selected' : ''}" style="
          display: flex;
          align-items: center;
          background: #0b1624;
          border: 2px solid ${isSelected ? '#38bdf8' : badgeBg};
          border-radius: 9999px;
          padding: 2px 6px 2px 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          cursor: pointer;
          transform: translate(-50%, -50%) ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          transition: transform 0.15s ease;
          white-space: nowrap;
        ">
          <span style="
            background: ${badgeBg};
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            font-family: monospace;
            padding: 1px 4px;
            border-radius: 6px;
            margin-right: 4px;
          ">${score.scoreFormatted}</span>
          <span style="
            color: #f1f5f9;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: -0.01em;
          ">${spot.name.split(' - ')[0]}</span>
          ${isFavorite ? '<span style="color:#fbbf24;margin-left:3px;font-size:10px;">★</span>' : ''}
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
    <div className="relative w-full h-[68vh] min-h-[460px] max-h-[720px] rounded-2xl overflow-hidden border border-nautical-750 shadow-xl flex flex-col">
      
      {/* Conteneur Leaflet */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full z-10" />

      {/* Badge Côte Basque */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none bg-nautical-900/90 backdrop-blur-md border border-nautical-700 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
        <Compass className="w-4 h-4 text-sky-400 shrink-0" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Spots Côte Basque (Anglet • Hendaye)
        </span>
      </div>

      {/* Fiche d'action flottante sous la carte */}
      {activeSpotData && (
        <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 z-20 bg-nautical-900/95 backdrop-blur-md border border-nautical-700 rounded-xl p-3 sm:p-3.5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slide-up">
          
          {/* Infos spot */}
          <div className="flex items-start justify-between sm:justify-start gap-3 min-w-0">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-sky-400 uppercase tracking-wider truncate">
                <span>{activeSpotData.spot.town}</span>
                <span>•</span>
                <span className="truncate">{activeSpotData.spot.level}</span>
              </div>
              <h4 className="font-bold text-white text-base truncate">
                {activeSpotData.spot.name}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Créneau : <strong className="text-white font-mono">{activeSpotData.score.bestWindowToday || 'Journée'}</strong></span>
              </div>
            </div>

            {/* Note mobile */}
            <div className="sm:hidden shrink-0 flex items-baseline gap-1 px-2.5 py-1 bg-nautical-800 border border-nautical-700 rounded-lg font-mono">
              <span className="text-base font-extrabold text-emerald-400">{activeSpotData.score.scoreFormatted}</span>
              <span className="text-[10px] text-slate-400 font-bold">/10</span>
            </div>
          </div>

          {/* Note desktop */}
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-nautical-800 border border-nautical-700 rounded-xl font-mono shrink-0">
            <span className="text-lg font-extrabold text-emerald-400">{activeSpotData.score.scoreFormatted}</span>
            <span className="text-xs text-slate-400 font-bold">/10</span>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Favori */}
            <button
              onClick={() => onToggleFavorite(activeSpotData.spot.id)}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-nautical-800 border border-nautical-700 text-slate-400 hover:text-amber-400 active:scale-95 transition"
              aria-label="Favori"
            >
              <Star className={`w-4 h-4 ${activeSpotData.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>

            {/* Fiche & Marée */}
            <button
              onClick={() => onOpenDetails(activeSpotData.spot)}
              className="h-10 px-3.5 rounded-xl bg-nautical-800 hover:bg-nautical-750 border border-nautical-700 text-slate-200 text-xs font-semibold flex items-center gap-1 active:scale-95 transition"
            >
              <span>Marée & Fiche</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Bouton GPS unique & puissant */}
            <button
              onClick={() => openGPS(activeSpotData.spot.lat, activeSpotData.spot.lon, activeSpotData.spot.name)}
              className="h-10 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <Navigation className="w-3.5 h-3.5 fill-white" />
              <span>Y aller</span>
            </button>

          </div>

        </div>
      )}

    </div>
  );
};
