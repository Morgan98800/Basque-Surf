import React from 'react';
import { TideData } from '../types/index';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface HeaderProps {
  tideData: TideData | null;
}

export const Header: React.FC<HeaderProps> = ({ tideData }) => {
  const isRising = tideData?.currentPhase === 'incoming' || tideData?.currentPhase === 'high';

  return (
    <header className="sticky top-0 z-30 bg-nautical-900/95 backdrop-blur-md border-b border-nautical-750">
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6">
        <div className="flex items-center justify-between h-11 gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-sm bg-ikurrina-red shadow-sm"></span>
            <span className="font-extrabold tracking-tight text-white text-base uppercase">
              Basque Surf
            </span>
            <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-nautical-800 px-1.5 py-0.5 rounded border border-nautical-700">
              Côte Basque
            </span>
          </div>

          {/* Quick Tide Pill */}
          {tideData && (
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center bg-nautical-800/90 border border-nautical-700 rounded-full px-2.5 py-0.5 text-slate-200">
                <div className="flex items-center space-x-1 font-mono font-bold text-xs text-white">
                  <span>{tideData.currentHeight}m</span>
                  {isRising ? (
                    <ArrowUp className="w-3 h-3 text-emerald-400 stroke-[2.5]" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-amber-400 stroke-[2.5]" />
                  )}
                </div>

                <span className="mx-1.5 text-nautical-600">|</span>

                <div className="flex items-center space-x-1 text-[11px]">
                  <span className="text-slate-400 font-medium">Coeff</span>
                  <span className="font-bold text-sky-300 font-mono">{tideData.coefficient}</span>
                </div>
              </div>

              <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-slate-400 bg-nautical-800/60 px-2 py-0.5 rounded-full border border-nautical-750">
                <span>BM <strong>{tideData.nextLow.time}</strong></span>
                <span>•</span>
                <span>PM <strong>{tideData.nextHigh.time}</strong></span>
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
