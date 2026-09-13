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
    <div className="w-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {days.map((item) => {
          const isSelected = selectedOffset === item.offset;

          return (
            <button
              key={item.offset}
              onClick={() => onSelectOffset(item.offset)}
              className={`flex flex-col items-center justify-center min-w-[3.6rem] sm:min-w-[4rem] py-2 px-2 rounded-2xl transition-all duration-200 active:scale-95 shrink-0 border ${
                isSelected
                  ? 'bg-white text-black font-bold shadow-md border-white'
                  : 'bg-white/[0.06] hover:bg-white/[0.1] text-white/70 border-white/[0.08]'
              }`}
              title={item.fullDateStr}
            >
              <span className={`text-[10px] uppercase font-semibold tracking-wider ${isSelected ? 'text-black/60' : 'text-white/40'}`}>
                {item.dayLabel}
              </span>
              <span className="text-base sm:text-lg font-bold font-mono leading-none my-0.5">
                {item.dayNumber}
              </span>
              <span className={`text-[9px] font-medium lowercase ${isSelected ? 'text-black/60' : 'text-white/40'}`}>
                {item.monthLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
