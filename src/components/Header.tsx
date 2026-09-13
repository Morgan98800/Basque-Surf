import React from 'react';
import { TideData } from '../types/index';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface HeaderProps {
  tideData: TideData | null;
}

export const Header: React.FC<HeaderProps> = ({ tideData }) => {
  const isRising = tideData?.currentPhase === 'incoming' || tideData?.currentPhase === 'high';

  return (
    <header className="sticky top-0 z-30 bg-ocean-dark/95 backdrop-blur-md border-b border-ocean-border">
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6">
        <div className="flex items-center justify-between h-11 gap-3">
          
          {/* Logo & Brand avec police Outfit */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-ikurrina-red shadow-[0_0_8px_rgba(220,38,38,0.6)]"></span>
            <span className="font-heading font-extrabold tracking-wider text-white text-base sm:text-lg uppercase">
              Basque Surf
            </span>
            <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-ocean-card px-2 py-0.5 rounded-full border border-ocean-border">
              Côte Basque
            </span>
          </div>

          {/* Quick Tide Pill avec style instrument marin */}
          {tideData && (
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center bg-ocean-card/90 border border-ocean-border rounded-full px-2.5 py-1 text-slate-200 shadow-sm">
                <div className="flex items-center space-x-1 font-mono font-bold text-xs text-white">
                  <span>{tideData.currentHeight}m</span>
                  {isRising ? (
                    <ArrowUp className="w-3.5 h-3.5 text-wave-400 stroke-[2.2]" />
                  ) : (
                    <ArrowDown className="w-3.5 h-3.5 text-amber-400 stroke-[2.2]" />
                  )}
                </div>

                <span className="mx-2 text-slate-600">•</span>

                <div className="flex items-center space-x-1 text-[11px]">
                  <span className="text-slate-400 font-medium">Coeff</span>
                  <span className="font-bold text-wave-300 font-mono">{tideData.coefficient}</span>
                </div>
              </div>

              <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-slate-400 bg-ocean-card/60 px-2.5 py-1 rounded-full border border-ocean-border">
                <span>BM <strong>{tideData.nextLow.time}</strong></span>
                <span className="text-slate-600">•</span>
                <span>PM <strong>{tideData.nextHigh.time}</strong></span>
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
