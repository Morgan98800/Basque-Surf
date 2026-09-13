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
  const [isSearchExpandedMobile, setIsSearchExpandedMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Focus input quand la recherche s'étend sur mobile
  useEffect(() => {
    if (isSearchExpandedMobile && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpandedMobile]);

  const townOptions: Array<{ value: BasqueTown | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'Toute la Côte Basque' },
    ...BASQUE_TOWNS.map((t) => ({ value: t, label: t }))
  ];

  const currentLabel = selectedTown === 'ALL' ? 'Toute la côte' : selectedTown;

  return (
    <div className="w-full relative" ref={menuRef}>
      
      {/* Menu Déroulant style iOS Liquid Glass Popover */}
      {isMenuOpen && (
        <div className="absolute bottom-full mb-2 left-0 z-50 w-72 max-w-[calc(100vw-2rem)] bg-[#0d1522]/95 backdrop-blur-3xl border border-white/[0.18] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden animate-slide-up p-2 divide-y divide-white/[0.08]">
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
                  className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition active:scale-[0.98] ${
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

      {/* Dock Unifié sur 1 SEULE LIGNE (hauteur tactile 44px Apple HIG) */}
      <div className="flex items-center gap-1.5 sm:gap-2 h-11 w-full">

        {/* Vue Mobile Recherche Dépliée */}
        {isSearchExpandedMobile ? (
          <div className="flex items-center gap-2 w-full sm:hidden animate-fade-in">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none stroke-[2]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher une plage..."
                className="w-full h-11 pl-9 pr-9 rounded-2xl bg-white/[0.08] border border-white/[0.14] text-white placeholder-white/40 text-xs focus:outline-none focus:border-sky-400"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/40 hover:text-white active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setIsSearchExpandedMobile(false)}
              className="h-11 px-3 text-xs font-semibold text-sky-400 flex items-center justify-center shrink-0 active:opacity-70"
            >
              Annuler
            </button>
          </div>
        ) : (
          <>
            {/* Bouton Menu Commune */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`h-11 px-3 sm:px-3.5 rounded-2xl border flex items-center gap-1.5 text-xs font-semibold shrink-0 transition active:scale-95 ${
                selectedTown !== 'ALL'
                  ? 'bg-white text-black border-white shadow-sm'
                  : 'liquid-glass-pill text-white hover:bg-white/[0.12]'
              }`}
              title="Choisir une commune"
            >
              <MapPin className={`w-3.5 h-3.5 stroke-[2] ${selectedTown !== 'ALL' ? 'text-black' : 'text-[#38bdf8]'}`} />
              <span className="max-w-[78px] sm:max-w-none truncate">{currentLabel}</span>
              <ChevronDown className={`w-3 h-3 stroke-[2] transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Segmented Control Liste / Carte */}
            <div className="flex items-center liquid-glass-pill rounded-2xl p-1 h-11 shrink-0 gap-0.5">
              <button
                onClick={() => onViewModeChange('list')}
                className={`h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                  viewMode === 'list'
                    ? 'bg-white/20 text-white shadow-sm font-bold border border-white/15'
                    : 'text-white/60 hover:text-white'
                }`}
                title="Vue liste"
              >
                <LayoutList className="w-3.5 h-3.5 stroke-[2]" />
                <span className="hidden xs:inline">Liste</span>
              </button>

              <button
                onClick={() => onViewModeChange('map')}
                className={`h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                  viewMode === 'map'
                    ? 'bg-white/20 text-white shadow-sm font-bold border border-white/15'
                    : 'text-white/60 hover:text-white'
                }`}
                title="Vue carte"
              >
                <Map className="w-3.5 h-3.5 stroke-[2]" />
                <span className="hidden xs:inline">Carte</span>
              </button>
            </div>

            {/* Bouton Favoris */}
            <button
              onClick={onToggleFavoritesOnly}
              className={`h-11 px-3 sm:px-3.5 min-w-[44px] rounded-2xl text-xs font-medium flex items-center justify-center gap-1.5 shrink-0 transition active:scale-95 ${
                showFavoritesOnly
                  ? 'bg-[#FF9500]/25 text-[#FF9F0A] border border-[#FF9500]/50 shadow-[0_0_10px_rgba(255,149,0,0.3)]'
                  : 'liquid-glass-pill text-white/60 hover:text-white'
              }`}
              title="Afficher les favoris"
            >
              <Star className={`w-4 h-4 stroke-[2] ${showFavoritesOnly ? 'fill-[#FF9500] text-[#FF9500]' : ''}`} />
              {favoritesCount > 0 && (
                <span className={`text-[11px] apple-score px-1.5 py-0.5 rounded-md ${
                  showFavoritesOnly ? 'bg-[#FF9500]/40 text-white' : 'bg-white/10 text-white/70'
                }`}>
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Bouton Loupe Dépliable sur Mobile (Carré 44x44px Apple HIG) */}
            <button
              onClick={() => setIsSearchExpandedMobile(true)}
              className={`h-11 w-11 rounded-2xl flex sm:hidden items-center justify-center transition active:scale-95 shrink-0 ${
                searchTerm 
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-400/40' 
                  : 'liquid-glass-pill text-white/60 hover:text-white'
              }`}
              title="Rechercher un spot"
            >
              <Search className="w-4 h-4 stroke-[2]" />
            </button>

            {/* Champ de recherche Inline sur Tablette & Desktop */}
            <div className="relative flex-1 min-w-0 hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none stroke-[2]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher une plage (Lafitenia, Cavaliers...)"
                className="w-full h-11 pl-9 pr-9 rounded-2xl liquid-glass-pill focus:border-sky-400 focus:bg-white/[0.1] text-white placeholder-white/40 text-xs focus:outline-none transition"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/40 hover:text-white active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        )}

      </div>

    </div>
  );
};

