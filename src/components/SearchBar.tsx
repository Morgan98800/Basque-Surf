import React from 'react';
import { Search, X, Star, Map, LayoutList } from 'lucide-react';
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
  return (
    <div className="w-full space-y-2">
      
      {/* Ligne 1 : Filtres Communes glissants style Apple Maps (h-7) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => onTownChange('ALL')}
          className={`h-7 px-3.5 rounded-full text-xs whitespace-nowrap font-medium transition active:scale-95 shrink-0 ${
            selectedTown === 'ALL'
              ? 'bg-white text-black font-semibold shadow-sm'
              : 'bg-white/[0.08] hover:bg-white/[0.12] text-white/70 hover:text-white border border-white/[0.08]'
          }`}
        >
          Tous ({selectedTown === 'ALL' ? 'Côte Basque' : 'Tous'})
        </button>

        {BASQUE_TOWNS.map((town) => (
          <button
            key={town}
            onClick={() => onTownChange(town)}
            className={`h-7 px-3.5 rounded-full text-xs whitespace-nowrap font-medium transition active:scale-95 shrink-0 ${
              selectedTown === town
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'bg-white/[0.08] hover:bg-white/[0.12] text-white/70 hover:text-white border border-white/[0.08]'
            }`}
          >
            {town}
          </button>
        ))}
      </div>

      {/* Ligne 2 : Recherche Spotlight + Segmented Control iOS + Favoris */}
      <div className="flex items-center gap-2">
        
        {/* Champ de recherche style iOS Spotlight (h-10) */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none stroke-[2]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher une plage (Lafitenia, Cavaliers...)"
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
            className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
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
            className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
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
