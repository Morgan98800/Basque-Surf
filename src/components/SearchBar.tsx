import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Star, Map, LayoutList, ChevronDown, Check, MapPin } from 'lucide-react';
import { BasqueTown } from '../types/index';
import { BASQUE_TOWNS } from '../data/spots';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTown: BasqueTown | 'ALL';
  onTownChange: (town: BasqueTown | 'ALL') => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  favoritesCount: number;
  viewMode: 'list' | 'map';
  onViewModeChange: (mode: 'list' | 'map') => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedTown,
  onTownChange,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  favoritesCount,
  viewMode,
  onViewModeChange,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Ferme le menu au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const townOptions: Array<{ value: BasqueTown | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'Toute la Côte Basque' },
    ...BASQUE_TOWNS.map((t) => ({ value: t, label: t }))
  ];

  const currentLabel = selectedTown === 'ALL' ? 'Toute la côte' : selectedTown;

  return (
    <div className="w-full relative" ref={menuRef}>
      
      {/* Menu Déroulant style iOS Liquid Glass Popover */}
      {isMenuOpen && (
        <div className="absolute bottom-full mb-2.5 left-0 z-50 w-72 max-w-[calc(100vw-2rem)] bg-[#0d1522]/95 backdrop-blur-3xl border border-white/[0.18] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden animate-slide-up p-2 divide-y divide-white/[0.08]">
          <div className="px-3.5 py-2 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
            Commune de surf
          </div>

          <div className="space-y-1 pt-1.5 max-h-[60vh] overflow-y-auto">
            {townOptions.map((opt) => {
              const isSelected = selectedTown === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    onTownChange(opt.value);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition active:scale-[0.98] ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-500/20 to-blue-600/30 text-white font-bold border border-sky-400/30 shadow-sm'
                      : 'text-white/80 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#38bdf8]' : 'text-white/40'}`} />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#38bdf8] stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Dock : 2 lignes sur Mobile, 1 ligne sur Tablette/Desktop */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        
        {/* Ligne / Bloc Filtres Secondaires (Commune, Segmented Control, Favoris) */}
        <div className="flex items-center gap-2 order-2 sm:order-1 justify-between sm:justify-start">
          
          {/* Bouton Menu Déroulant Commune */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-2xl border flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold shrink-0 transition active:scale-95 ${
              selectedTown !== 'ALL'
                ? 'bg-gradient-to-b from-white to-white/95 text-black border-white shadow-[0_2px_12px_rgba(255,255,255,0.25)]'
                : 'liquid-glass-pill hover:bg-white/[0.14] text-white'
            }`}
            title="Choisir une commune"
          >
            <MapPin className={`w-3.5 h-3.5 stroke-[2] ${selectedTown !== 'ALL' ? 'text-black' : 'text-[#38bdf8]'}`} />
            <span className="max-w-[85px] sm:max-w-none truncate">{currentLabel}</span>
            <ChevronDown className={`w-3 h-3 stroke-[2.5] transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Segmented Control iOS Liquid Glass */}
          <div className="flex items-center liquid-glass-pill rounded-2xl p-0.5 sm:p-1 h-9 sm:h-10 shrink-0">
            <button
              onClick={() => onViewModeChange('list')}
              className={`h-7 sm:h-8 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-gradient-to-b from-white/30 to-white/10 text-white shadow-md border border-white/20 font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Vue liste"
            >
              <LayoutList className="w-3.5 h-3.5 stroke-[2]" />
              <span>Liste</span>
            </button>

            <button
              onClick={() => onViewModeChange('map')}
              className={`h-7 sm:h-8 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
                viewMode === 'map'
                  ? 'bg-gradient-to-b from-white/30 to-white/10 text-white shadow-md border border-white/20 font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Vue carte"
            >
              <Map className="w-3.5 h-3.5 stroke-[2]" />
              <span>Carte</span>
            </button>
          </div>

          {/* Bouton Favoris Liquid Glass */}
          <button
            onClick={onToggleFavoritesOnly}
            className={`h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-2xl text-xs font-medium flex items-center gap-1.5 shrink-0 transition active:scale-95 ${
              showFavoritesOnly
                ? 'bg-[#FF9500]/25 text-[#FF9F0A] border border-[#FF9500]/50 shadow-[0_0_12px_rgba(255,149,0,0.35)]'
                : 'liquid-glass-pill text-white/60 hover:text-white hover:bg-white/[0.14]'
            }`}
            title="Afficher les favoris"
          >
            <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2] ${showFavoritesOnly ? 'fill-[#FF9500] text-[#FF9500]' : ''}`} />
            {favoritesCount > 0 && (
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                showFavoritesOnly ? 'bg-[#FF9500]/40 text-white' : 'bg-white/10 text-white/70'
              }`}>
                {favoritesCount}
              </span>
            )}
          </button>
        </div>

        {/* Champ de recherche pleine largeur sur Mobile, flex-1 sur Desktop */}
        <div className="relative flex-1 min-w-0 order-1 sm:order-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none stroke-[2]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            placeholder="Rechercher une plage (Lafitenia, Cavaliers...)"
            className="w-full h-10 pl-9 pr-9 liquid-glass-pill focus:border-sky-400 focus:bg-white/[0.12] rounded-2xl text-white placeholder-white/40 text-xs focus:outline-none transition shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/40 hover:text-white rounded-full active:bg-white/10 transition"
              aria-label="Effacer recherche"
            >
              <X className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
