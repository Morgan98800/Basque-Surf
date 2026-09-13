import React from 'react';
import { TideData } from '../types/index';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface HeaderProps {
  tideData: TideData | null;
}

export const Header: React.FC<HeaderProps> = ({ tideData }) => {
  const isRising = tideData?.currentPhase === 'incoming' || tideData?.currentPhase === 'high';

  return (
    <header className="sticky top-0 z-30 bg-[#070b12]/75 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.6)] transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-13 py-2 gap-3">
          
          {/* iOS Style Title with Monochrome Basque Lauburu */}
          <div className="flex items-center space-x-2.5 shrink-0 select-none">
            <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center shadow-inner">
              <svg className="w-4.5 h-4.5 text-white/90" viewBox="0 0 100 100" fill="currentColor">
                <g transform="translate(50,50)">
                  <path d="M 0,0 A 25,25 0 0 1 0,-50 A 25,25 0 0 1 0,0 A 12.5,12.5 0 0 0 0,-25 A 12.5,12.5 0 0 1 0,0 Z" />
                  <path d="M 0,0 A 25,25 0 0 1 0,-50 A 25,25 0 0 1 0,0 A 12.5,12.5 0 0 0 0,-25 A 12.5,12.5 0 0 1 0,0 Z" transform="rotate(90)" />
                  <path d="M 0,0 A 25,25 0 0 1 0,-50 A 25,25 0 0 1 0,0 A 12.5,12.5 0 0 0 0,-25 A 12.5,12.5 0 0 1 0,0 Z" transform="rotate(180)" />
                  <path d="M 0,0 A 25,25 0 0 1 0,-50 A 25,25 0 0 1 0,0 A 12.5,12.5 0 0 0 0,-25 A 12.5,12.5 0 0 1 0,0 Z" transform="rotate(270)" />
                </g>
              </svg>
            </div>
            <span className="font-bold tracking-tight text-white text-base sm:text-lg">
              Basque Surf
            </span>
          </div>

          {/* Dynamic Island Style Tide Pill avec Liquid Glass v2 */}
          {tideData && (
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center liquid-glass-pill rounded-full px-3.5 py-1 text-white shadow-sm transition active:scale-95">
                <div className="flex items-center space-x-1.5 font-semibold text-xs">
                  <span className="font-mono tracking-tight">{tideData.currentHeight}m</span>
                  {isRising ? (
                    <ArrowUp className="w-3.5 h-3.5 text-[#30B0C7] stroke-[2.5]" />
                  ) : (
                    <ArrowDown className="w-3.5 h-3.5 text-[#FF9500] stroke-[2.5]" />
                  )}
                </div>

                <span className="mx-2 text-white/20">•</span>

                <div className="flex items-center space-x-1 text-xs">
                  <span className="text-white/50 font-medium">Coeff</span>
                  <span className="font-bold text-white font-mono tracking-tight">{tideData.coefficient}</span>
                </div>
              </div>

              <div className="hidden sm:flex items-center space-x-2 text-xs text-white/60 bg-white/[0.04] px-3.5 py-1 rounded-full border border-white/[0.08]">
                <span>BM <strong className="text-white font-mono">{tideData.nextLow.time}</strong></span>
                <span className="text-white/20">•</span>
                <span>PM <strong className="text-white font-mono">{tideData.nextHigh.time}</strong></span>
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
