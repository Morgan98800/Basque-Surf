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
          
          {/* iOS Style Title with Basque Emblem */}
          <div className="flex items-center space-x-2.5 shrink-0 select-none">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
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
