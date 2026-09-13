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
      
      {/* Menu Déroulant style iOS Popover (s'ouvre vers le haut au-dessus de la barre) */}
      {isMenuOpen && (
        <div className="absolute bottom-full mb-2 left-0 z-50 w-64 bg-[#1c1c1e] border border-white/[0.14] rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden animate-slide-up p-1.5 divide-y divide-white/[0.06]">
          <div className="px-3 py-2 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
            Sélectionner une commune / zone
          </div>

          <div className="space-y-0.5 pt-1">
            {townOptions.map((opt) => {
              const isSelected = selectedTown === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    onTownChange(opt.value);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition active:scale-[0.98] ${
                    isSelected
                      ? 'bg-white/15 text-white font-bold'
                      : 'text-white/80 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#0A84FF]' : 'text-white/40'}`} />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#0A84FF] stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Ligne Unique Ultra-Épurée : Menu Commune + Recherche + Segmented Control + Favoris */}
      <div className="flex items-center gap-2">
        
        {/* Bouton Menu Déroulant Commune (Style Apple Menu) */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`h-10 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-semibold shrink-0 transition active:scale-95 ${
            selectedTown !== 'ALL'
              ? 'bg-white text-black border-white shadow-sm'
              : 'bg-white/[0.08] hover:bg-white/[0.12] text-white border-white/[0.08]'
          }`}
          title="Choisir une commune"
        >
          <MapPin className={`w-3.5 h-3.5 stroke-[2] ${selectedTown !== 'ALL' ? 'text-black' : 'text-[#0A84FF]'}`} />
          <span className="max-w-[85px] sm:max-w-none truncate">{currentLabel}</span>
          <ChevronDown className={`w-3.5 h-3.5 stroke-[2.5] transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Champ de recherche style iOS Spotlight (h-10) */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none stroke-[2]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Plage (Lafitenia, Cavaliers...)"
            className="w-full h-10 pl-9 pr-8 bg-white/[0.08] hover:bg-white/[0.11] focus:bg-white/[0.14] border border-white/[0.08] focus:border-[#007AFF] rounded-xl text-white placeholder-white/40 text-xs focus:outline-none transition shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
              aria-label="Effacer recherche"
            >
              <X className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          )}
        </div>

        {/* Segmented Control iOS Natif (Gris avec pilule blanche active) */}
        <div className="flex items-center bg-white/[0.08] border border-white/[0.06] rounded-xl p-0.5 h-10 shrink-0">
          <button
            onClick={() => onViewModeChange('list')}
            className={`h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
              viewMode === 'list'
                ? 'bg-white/20 text-white shadow-sm font-bold'
                : 'text-white/60 hover:text-white'
            }`}
            title="Vue liste"
          >
            <LayoutList className="w-3.5 h-3.5 stroke-[2]" />
            <span className="hidden sm:inline">Liste</span>
          </button>

          <button
            onClick={() => onViewModeChange('map')}
            className={`h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
              viewMode === 'map'
                ? 'bg-white/20 text-white shadow-sm font-bold'
                : 'text-white/60 hover:text-white'
            }`}
            title="Vue carte"
          >
            <Map className="w-3.5 h-3.5 stroke-[2]" />
            <span className="hidden sm:inline">Carte</span>
          </button>
        </div>

        {/* Bouton Favoris style iOS */}
        <button
          onClick={onToggleFavoritesOnly}
          className={`h-10 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0 border transition active:scale-95 ${
            showFavoritesOnly
              ? 'bg-[#FF9500]/20 text-[#FF9500] border-[#FF9500]/40 shadow-sm'
              : 'bg-white/[0.08] text-white/60 border-white/[0.08] hover:text-white hover:bg-white/[0.12]'
          }`}
          title="Afficher les favoris"
        >
          <Star className={`w-4 h-4 stroke-[2] ${showFavoritesOnly ? 'fill-[#FF9500] text-[#FF9500]' : ''}`} />
          {favoritesCount > 0 && (
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
              showFavoritesOnly ? 'bg-[#FF9500]/30 text-[#FF9500]' : 'bg-white/10 text-white/70'
            }`}>
              {favoritesCount}
            </span>
          )}
        </button>

      </div>

    </div>
  );
};
