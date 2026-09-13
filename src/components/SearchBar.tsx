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
      
      {/* Ligne 1 : Filtres Communes glissants au pouce (h-7) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        <button
          onClick={() => onTownChange('ALL')}
          className={`h-7 px-3.5 rounded-full text-xs whitespace-nowrap font-medium transition shrink-0 ${
            selectedTown === 'ALL'
              ? 'bg-wave-500 text-ocean-dark font-bold shadow-[0_2px_10px_rgba(20,184,166,0.3)]'
              : 'bg-ocean-card text-slate-400 hover:text-slate-200 border border-ocean-border hover:border-slate-600'
          }`}
        >
          Tous ({selectedTown === 'ALL' ? 'Côte Basque' : 'Tous'})
        </button>

        {BASQUE_TOWNS.map((town) => (
          <button
            key={town}
            onClick={() => onTownChange(town)}
            className={`h-7 px-3.5 rounded-full text-xs whitespace-nowrap font-medium transition shrink-0 ${
              selectedTown === town
                ? 'bg-wave-500 text-ocean-dark font-bold shadow-[0_2px_10px_rgba(20,184,166,0.3)]'
                : 'bg-ocean-card text-slate-400 hover:text-slate-200 border border-ocean-border hover:border-slate-600'
            }`}
          >
            {town}
          </button>
        ))}
      </div>

      {/* Ligne 2 : Recherche + Bascule Vue + Favoris (À portée directe du pouce) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        
        {/* Champ de recherche compact (h-10) */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none stroke-[1.75]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Chercher une plage (Lafitenia, Cavaliers...)"
            className="w-full h-10 pl-10 pr-8 bg-ocean-card border border-ocean-border focus:border-wave-500 rounded-xl text-slate-100 placeholder-slate-400 text-xs focus:outline-none transition shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
              aria-label="Effacer recherche"
            >
              <X className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          )}
        </div>

        {/* Bascule Vue : Liste / Carte (Segmenté compact h-10) */}
        <div className="flex items-center bg-ocean-card border border-ocean-border rounded-xl p-1 h-10 shrink-0 shadow-sm">
          <button
            onClick={() => onViewModeChange('list')}
            className={`h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'list'
                ? 'bg-wave-500 text-ocean-dark font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Vue liste"
          >
            <LayoutList className="w-3.5 h-3.5 stroke-[2]" />
            <span className="hidden sm:inline font-heading">Liste</span>
          </button>

          <button
            onClick={() => onViewModeChange('map')}
            className={`h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'map'
                ? 'bg-wave-500 text-ocean-dark font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Vue carte"
          >
            <Map className="w-3.5 h-3.5 stroke-[2]" />
            <span className="hidden sm:inline font-heading">Carte</span>
          </button>
        </div>

        {/* Filtre Favoris (h-10 compact) */}
        <button
          onClick={onToggleFavoritesOnly}
          className={`h-10 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0 border transition active:scale-95 ${
            showFavoritesOnly
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
              : 'bg-ocean-card text-slate-400 border-ocean-border hover:text-slate-200 hover:border-slate-600'
          }`}
          title="Afficher les favoris"
        >
          <Star className={`w-4 h-4 stroke-[2] ${showFavoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
          {favoritesCount > 0 && (
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
              showFavoritesOnly ? 'bg-amber-400/30 text-amber-200' : 'bg-ocean-hover text-slate-300'
            }`}>
              {favoritesCount}
            </span>
          )}
        </button>

      </div>

    </div>
  );
};
