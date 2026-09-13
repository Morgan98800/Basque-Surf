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
    <div className="space-y-2">
      
      {/* Ligne 1 : Recherche + Bascule Vue + Favoris (Compacte & Fluide) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        
        {/* Champ de recherche compact (h-9) */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher une plage (ex: Lafitenia, Cavaliers, Côte des Basques...)"
            className="w-full h-9 pl-8 pr-7 bg-nautical-850/90 hover:bg-nautical-850 border border-nautical-750 focus:border-sky-500 rounded-lg text-slate-100 placeholder-slate-400 text-xs focus:outline-none transition"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-200"
              aria-label="Effacer recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Bascule Vue : Liste / Carte (Segmenté compact h-9) */}
        <div className="flex items-center bg-nautical-850/90 border border-nautical-750 rounded-lg p-0.5 h-9 shrink-0">
          <button
            onClick={() => onViewModeChange('list')}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'list'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Vue liste"
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Liste</span>
          </button>

          <button
            onClick={() => onViewModeChange('map')}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'map'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Vue carte"
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Carte</span>
          </button>
        </div>

        {/* Filtre Favoris (h-9 compact) */}
        <button
          onClick={onToggleFavoritesOnly}
          className={`h-9 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 border transition active:scale-95 ${
            showFavoritesOnly
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-nautical-850/90 text-slate-400 border-nautical-750 hover:text-slate-200'
          }`}
          title="Afficher les favoris"
        >
          <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
          {favoritesCount > 0 && (
            <span className={`text-[10px] font-mono px-1 rounded ${
              showFavoritesOnly ? 'bg-amber-400/30 text-amber-200' : 'bg-nautical-750 text-slate-300'
            }`}>
              {favoritesCount}
            </span>
          )}
        </button>

      </div>

      {/* Ligne 2 : Filtres Communes en bandeau glissant ultra-fin (h-7) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 hide-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        <button
          onClick={() => onTownChange('ALL')}
          className={`h-7 px-2.5 rounded-md text-[11px] whitespace-nowrap transition shrink-0 ${
            selectedTown === 'ALL'
              ? 'bg-sky-600 text-white font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-nautical-800/60'
          }`}
        >
          Toute la côte
        </button>

        {BASQUE_TOWNS.map((town) => (
          <button
            key={town}
            onClick={() => onTownChange(town)}
            className={`h-7 px-2.5 rounded-md text-[11px] whitespace-nowrap transition shrink-0 ${
              selectedTown === town
                ? 'bg-sky-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-nautical-800/60'
            }`}
          >
            {town}
          </button>
        ))}
      </div>

    </div>
  );
};
