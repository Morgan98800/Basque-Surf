import React from 'react';
import { TideData } from '../types/index';
import { Waves, Key, Compass, ArrowUpRight, ArrowDownRight, Droplets } from 'lucide-react';

interface HeaderProps {
  tideData: TideData | null;
  onOpenSettings: () => void;
  favoritesCount: number;
}

export const Header: React.FC<HeaderProps> = ({ tideData, onOpenSettings, favoritesCount }) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ocean-600 to-ocean-400 flex items-center justify-center shadow-lg shadow-ocean-500/20 text-white">
                <Waves className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                    Basque Surf
                    <span className="inline-block w-2 h-2 rounded-full bg-basque-red" title="Euskal Herria"></span>
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-ocean-500/10 text-ocean-400 font-medium border border-ocean-500/20">
                    Côte Basque
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Marées & Conditions de surf en temps réel
                </p>
              </div>
            </div>

            {/* Mobile Settings Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                title="Source & API des Marées"
              >
                <Key className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>

          {/* Tide Live Summary Banner */}
          {tideData && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              
              {/* Ville affichée */}
              <div className="hidden lg:flex items-center space-x-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-slate-300">
                <span className="text-slate-400 font-medium">Référence :</span>
                <span className="font-semibold text-white">{tideData.townName}</span>
              </div>

              {/* Hauteur actuelle */}
              <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5">
                <Droplets className="w-3.5 h-3.5 text-ocean-400" />
                <div>
                  <span className="text-slate-400">Hauteur : </span>
                  <span className="font-semibold text-white">{tideData.currentHeight}m</span>
                </div>
              </div>

              {/* Phase */}
              <div className="flex items-center space-x-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5">
                {tideData.currentPhase === 'incoming' || tideData.currentPhase === 'high' ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="font-medium text-slate-200">{tideData.phaseLabel}</span>
              </div>

              {/* Coefficient */}
              <div className="flex items-center space-x-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5">
                <span className="text-slate-400">Coeff :</span>
                <span className="font-bold text-ocean-300">{tideData.coefficient}</span>
              </div>

              {/* Prochaine marée */}
              <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-slate-300">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  BM : <strong className="text-white">{tideData.nextLow.time}</strong> ({tideData.nextLow.height}m)
                </span>
                <span className="text-slate-600">•</span>
                <span>
                  PM : <strong className="text-white">{tideData.nextHigh.time}</strong> ({tideData.nextHigh.height}m)
                </span>
              </div>

              {/* Source button (desktop) */}
              <button
                onClick={onOpenSettings}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition text-xs font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>API : CoefMarée</span>
                {favoritesCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-750 text-[10px] text-amber-300">
                    ★ {favoritesCount}
                  </span>
                )}
              </button>

            </div>
          )}

        </div>
      </div>
    </header>
  );
};
