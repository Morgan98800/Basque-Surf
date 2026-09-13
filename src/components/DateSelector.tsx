import React from 'react';

interface DateSelectorProps {
  selectedOffset: number;
  onSelectOffset: (offset: number) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedOffset,
  onSelectOffset,
}) => {
  // Générer les 7 prochains jours avec format uniforme (LUN, MAR, MER...)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);

    const isToday = i === 0;

    // Abréviation stricte 3 lettres uniforme (LUN, MAR, MER, JEU, VEN, SAM, DIM)
    let dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short' });
    dayLabel = dayLabel.slice(0, 3).toUpperCase().replace('.', '');

    const dayNumber = d.getDate();
    const monthLabel = d.toLocaleDateString('fr-FR', { month: 'short' }).slice(0, 4).replace('.', '');

    return {
      offset: i,
      dayLabel,
      dayNumber,
      monthLabel,
      isToday,
      fullDateStr: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    };
  });

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden relative">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar snap-x snap-proximity overscroll-x-contain touch-pan-x w-full min-w-0">
        {days.map((item) => {
          const isSelected = selectedOffset === item.offset;

          return (
            <button
              key={item.offset}
              onClick={() => onSelectOffset(item.offset)}
              className={`flex flex-col items-center justify-center min-w-[3.8rem] sm:min-w-[4.2rem] py-2 px-2 rounded-2xl transition-all duration-200 active:scale-95 shrink-0 snap-start relative ${
                isSelected
                  ? 'bg-white text-black font-bold shadow-[0_6px_24px_rgba(255,255,255,0.3)] border border-white'
                  : 'liquid-glass-pill hover:bg-white/[0.12] text-white/70 hover:text-white'
              }`}
              title={item.fullDateStr}
            >
              <div className="flex items-center gap-1">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${
                  isSelected 
                    ? 'text-black/70' 
                    : item.isToday 
                    ? 'text-[#0A84FF]' 
                    : 'text-white/40'
                }`}>
                  {item.dayLabel}
                </span>
                {item.isToday && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-[#0A84FF]" />
                )}
              </div>

              <span className={`text-base sm:text-lg font-bold apple-score leading-none my-1 tracking-tight ${
                isSelected ? 'text-black' : 'text-white'
              }`}>
                {item.dayNumber}
              </span>

              <span className={`text-[9px] font-medium lowercase ${isSelected ? 'text-black/60' : 'text-white/40'}`}>
                {item.monthLabel}
              </span>

              {/* Point de repère iOS pour le jour sélectionné */}
              <span className={`w-1 h-1 rounded-full mt-0.5 transition-all ${
                isSelected ? 'bg-[#007AFF] shadow-[0_0_6px_rgba(0,122,255,0.9)]' : 'bg-transparent'
              }`} />
            </button>
          );
        })}
      </div>
      {/* Masque dégradé discret de défilement horizontal */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-[#03070d] to-transparent sm:hidden" />
    </div>
  );
};

