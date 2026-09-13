import React from 'react';
import { TideData } from '../types/index';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface HeaderProps {
  tideData: TideData | null;
}

export const Header: React.FC<HeaderProps> = ({ tideData }) => {
  const isRising = tideData?.currentPhase === 'incoming' || tideData?.currentPhase === 'high';

  return (
    <header className="sticky top-0 z-30 bg-black/70 backdrop-blur-2xl border-b border-white/[0.08] transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-12 gap-3">
          
          {/* iOS Style Title */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#dc2626] shadow-[0_0_8px_rgba(220,38,38,0.7)]"></span>
            <span className="font-bold tracking-tight text-white text-base sm:text-lg">
              Basque Surf
            </span>
          </div>

          {/* Dynamic Island Style Tide Pill */}
          {tideData && (
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center bg-white/[0.09] hover:bg-white/[0.13] border border-white/[0.1] rounded-full px-3 py-1 text-white shadow-sm transition">
                <div className="flex items-center space-x-1 font-semibold text-xs">
                  <span>{tideData.currentHeight}m</span>
                  {isRising ? (
                    <ArrowUp className="w-3.5 h-3.5 text-[#30B0C7] stroke-[2.5]" />
                  ) : (
                    <ArrowDown className="w-3.5 h-3.5 text-[#FF9500] stroke-[2.5]" />
                  )}
                </div>

                <span className="mx-2 text-white/20">•</span>

                <div className="flex items-center space-x-1 text-xs">
                  <span className="text-white/60 font-medium">Coeff</span>
                  <span className="font-bold text-white font-mono">{tideData.coefficient}</span>
                </div>
              </div>

              <div className="hidden sm:flex items-center space-x-1.5 text-xs text-white/60 bg-white/[0.05] px-3 py-1 rounded-full border border-white/[0.06]">
                <span>BM <strong>{tideData.nextLow.time}</strong></span>
                <span className="text-white/20">•</span>
                <span>PM <strong>{tideData.nextHigh.time}</strong></span>
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
