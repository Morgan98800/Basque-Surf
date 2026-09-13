import React, { useState } from 'react';
import { X, Navigation, Check } from 'lucide-react';

export type GPSProvider = 'apple' | 'google' | 'waze';

const GPS_PREF_KEY = 'basque_surf_preferred_gps';

export function getSavedGPSPreference(): GPSProvider | null {
  try {
    const val = localStorage.getItem(GPS_PREF_KEY);
    if (val === 'apple' || val === 'google' || val === 'waze') return val;
    return null;
  } catch {
    return null;
  }
}

export function saveGPSPreference(provider: GPSProvider | null) {
  try {
    if (provider) {
      localStorage.setItem(GPS_PREF_KEY, provider);
    } else {
      localStorage.removeItem(GPS_PREF_KEY);
    }
  } catch {}
}

export function openGPSUrl(provider: GPSProvider, lat: number, lon: number, name: string) {
  const isApple = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent);
  const encodedName = encodeURIComponent(name);

  if (provider === 'apple') {
    window.open(`maps://maps.apple.com/?daddr=${lat},${lon}&q=${encodedName}&dirflg=d`, '_blank');
  } else if (provider === 'google') {
    // Schéma direct ou URL universelle Google Maps
    if (isApple) {
      // Tente d'ouvrir l'app Google Maps sur iOS, sinon bascule sur le web
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
    }
  } else if (provider === 'waze') {
    window.open(`https://waze.com/ul?ll=${lat},${lon}&navigate=yes`, '_blank');
  }
}

interface GPSActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lon: number;
  spotName: string;
  onPreferenceChange?: (provider: GPSProvider) => void;
}

export const GPSActionSheet: React.FC<GPSActionSheetProps> = ({
  isOpen,
  onClose,
  lat,
  lon,
  spotName,
  onPreferenceChange,
}) => {
  const [rememberChoice, setRememberChoice] = useState(true);
  const currentPref = getSavedGPSPreference();

  if (!isOpen) return null;

  const handleSelect = (provider: GPSProvider) => {
    if (rememberChoice) {
      saveGPSPreference(provider);
      if (onPreferenceChange) onPreferenceChange(provider);
    }
    openGPSUrl(provider, lat, lon, spotName);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-md bg-[#1c1c1e] border-t sm:border border-white/[0.14] rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Drag Grabber */}
        <div className="w-9 h-1.5 rounded-full bg-white/20 mx-auto -mt-1 mb-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Application de navigation
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Itinéraire vers {spotName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white/60 hover:text-white flex items-center justify-center transition active:scale-95"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Liste des applications GPS */}
        <div className="space-y-2">
          
          {/* Google Maps */}
          <button
            onClick={() => handleSelect('google')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition active:scale-[0.98] text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-md">
                <Navigation className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
              <div>
                <span className="font-semibold text-sm text-white block">Google Maps</span>
                <span className="text-[11px] text-white/50">Trafic en temps réel & guidage vocal</span>
              </div>
            </div>
            {currentPref === 'google' && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-full border border-sky-400/20">
                <Check className="w-3 h-3 stroke-[2.5]" />
                <span>Préféré</span>
              </span>
            )}
          </button>

          {/* Apple Plans */}
          <button
            onClick={() => handleSelect('apple')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition active:scale-[0.98] text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-md">
                <Navigation className="w-5 h-5 text-white fill-white stroke-white" />
              </div>
              <div>
                <span className="font-semibold text-sm text-white block">Apple Plans</span>
                <span className="text-[11px] text-white/50">Navigation native iOS & CarPlay</span>
              </div>
            </div>
            {currentPref === 'apple' && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-full border border-sky-400/20">
                <Check className="w-3 h-3 stroke-[2.5]" />
                <span>Préféré</span>
              </span>
            )}
          </button>

          {/* Waze */}
          <button
            onClick={() => handleSelect('waze')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition active:scale-[0.98] text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <div>
                <span className="font-semibold text-sm text-white block">Waze</span>
                <span className="text-[11px] text-white/50">Alertes communautaires & radars</span>
              </div>
            </div>
            {currentPref === 'waze' && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-full border border-sky-400/20">
                <Check className="w-3 h-3 stroke-[2.5]" />
                <span>Préféré</span>
              </span>
            )}
          </button>

        </div>

        {/* Option Mémoriser */}
        <label className="flex items-center gap-2.5 pt-1 text-xs text-white/70 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberChoice}
            onChange={(e) => setRememberChoice(e.target.checked)}
            className="w-4 h-4 rounded-md accent-[#007AFF] bg-white/10 border-white/20 cursor-pointer"
          />
          <span>Mémoriser mon choix pour les prochains itinéraires</span>
        </label>

      </div>
    </div>
  );
};
