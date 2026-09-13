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
    <div className="space-y-2.5">
      
      {/* Search Bar + View Toggle + Favorites */}
      <div className="flex items-center gap-2">
        
        {/* Search Field */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher une plage..."
            className="w-full h-11 pl-9 pr-8 bg-nautical-800 border border-nautical-700 rounded-xl text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-sky-500 transition shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
              aria-label="Effacer recherche"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode Toggle (Liste / Carte) */}
        <div className="flex items-center bg-nautical-800 border border-nautical-700 rounded-xl p-0.5 h-11 shrink-0">
          <button
            onClick={() => onViewModeChange('list')}
            className={`h-9 px-2.5 sm:px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === 'list'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-label="Vue liste"
          >
            <LayoutList className="w-4 h-4" />
            <span className="hidden sm:inline">Liste</span>
          </button>

          <button
            onClick={() => onViewModeChange('map')}
            className={`h-9 px-2.5 sm:px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === 'map'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-label="Vue carte"
          >
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Carte</span>
          </button>
        </div>

        {/* Favorite Filter Toggle */}
        <button
          onClick={onToggleFavoritesOnly}
          className={`h-11 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 border transition active:scale-95 ${
            showFavoritesOnly
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-nautical-800 text-slate-300 border-nautical-700 hover:bg-nautical-750'
          }`}
          aria-label="Filtrer par favoris"
        >
          <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
          {favoritesCount > 0 && (
            <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${
              showFavoritesOnly ? 'bg-amber-400/30 text-amber-200' : 'bg-nautical-700 text-slate-300'
            }`}>
              {favoritesCount}
            </span>
          )}
        </button>

      </div>

      {/* Swipeable Town Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        <button
          onClick={() => onTownChange('ALL')}
          className={`h-8 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition shrink-0 ${
            selectedTown === 'ALL'
              ? 'bg-sky-600 text-white font-semibold'
              : 'bg-nautical-800 text-slate-400 hover:text-slate-200 border border-nautical-750'
          }`}
        >
          Toute la côte
        </button>

        {BASQUE_TOWNS.map((town) => (
          <button
            key={town}
            onClick={() => onTownChange(town)}
            className={`h-8 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition shrink-0 ${
              selectedTown === town
                ? 'bg-sky-600 text-white font-semibold'
                : 'bg-nautical-800 text-slate-400 hover:text-slate-200 border border-nautical-750'
            }`}
          >
            {town}
          </button>
        ))}
      </div>

    </div>
  );
};
