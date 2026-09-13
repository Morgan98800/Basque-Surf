import React from 'react';

interface DateSelectorProps {
  selectedOffset: number;
  onSelectOffset: (offset: number) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedOffset,
  onSelectOffset,
}) => {
  // Générer les 7 prochains jours à partir d'aujourd'hui
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);

    const isToday = i === 0;
    const isTomorrow = i === 1;

    let dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short' });
    dayLabel = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1).replace('.', '');

    if (isToday) dayLabel = 'Auj.';
    else if (isTomorrow) dayLabel = 'Dem.';

    const dayNumber = d.getDate();
    const monthLabel = d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');

    return {
      offset: i,
      dayLabel,
      dayNumber,
      monthLabel,
      fullDateStr: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    };
  });

  return (
    <div className="w-full relative">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
        {days.map((item) => {
          const isSelected = selectedOffset === item.offset;

          return (
            <button
              key={item.offset}
              onClick={() => onSelectOffset(item.offset)}
              className={`flex flex-col items-center justify-center min-w-[3.6rem] sm:min-w-[4.2rem] py-2 px-2 rounded-2xl transition-all duration-200 active:scale-90 shrink-0 ${
                isSelected
                  ? 'bg-white text-black font-bold shadow-[0_6px_24px_rgba(255,255,255,0.3)] border border-white'
                  : 'liquid-glass-pill hover:bg-white/[0.12] text-white/70 hover:text-white'
              }`}
              title={item.fullDateStr}
            >
              <span className={`text-[10px] uppercase font-semibold tracking-wider ${isSelected ? 'text-black/60' : 'text-white/40'}`}>
                {item.dayLabel}
              </span>
              <span className="text-base sm:text-lg font-bold font-mono leading-none my-1 tracking-tight">
                {item.dayNumber}
              </span>
              <span className={`text-[9px] font-medium lowercase ${isSelected ? 'text-black/60' : 'text-white/40'}`}>
                {item.monthLabel}
              </span>
              <span className={`w-1 h-1 rounded-full mt-1 transition-all ${isSelected ? 'bg-[#007AFF] shadow-[0_0_6px_rgba(0,122,255,0.9)]' : 'bg-transparent'}`} />
            </button>
          );
        })}
      </div>
      {/* Indicateur discret de défilement horizontal sur mobile */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-[#03070d] to-transparent sm:hidden" />
    </div>
  );
};
