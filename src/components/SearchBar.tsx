import React from 'react';
import { Search, X, Star, SlidersHorizontal, MapPin } from 'lucide-react';
import { BasqueTown } from '../types';
import { BASQUE_TOWNS } from '../data/spots';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTown: BasqueTown | 'ALL';
  onTownChange: (town: BasqueTown | 'ALL') => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  favoritesCount: number;
  sortBy: 'score' | 'name' | 'town';
  onSortChange: (sort: 'score' | 'name' | 'town') => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedTown,
  onTownChange,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  favoritesCount,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="space-y-3.5">
      
      {/* Search Bar & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher une plage (ex: Côte des Basques, Lafitenia, Cavaliers...)"
            className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Favorites Filter Button */}
        <button
          onClick={onToggleFavoritesOnly}
          className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition shrink-0 ${
            showFavoritesOnly
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-750 hover:text-white'
          }`}
        >
          <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
          <span>Favoris</span>
          {favoritesCount > 0 && (
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              showFavoritesOnly ? 'bg-amber-400/30 text-amber-200' : 'bg-slate-700 text-slate-300'
            }`}>
              {favoritesCount}
            </span>
          )}
        </button>

        {/* Sort Select */}
        <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Tri :</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value="score" className="bg-slate-800">Meilleure note</option>
            <option value="town" className="bg-slate-800">Par ville</option>
            <option value="name" className="bg-slate-800">Nom (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Town Filter Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => onTownChange('ALL')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium ${
            selectedTown === 'ALL'
              ? 'bg-ocean-600 text-white shadow-md shadow-ocean-600/30'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Toute la côte ({BASQUE_TOWNS.length} villes)
        </button>

        {BASQUE_TOWNS.map((town) => (
          <button
            key={town}
            onClick={() => onTownChange(town)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium ${
              selectedTown === town
                ? 'bg-ocean-600 text-white shadow-md shadow-ocean-600/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-3 h-3 opacity-60" />
            <span>{town}</span>
          </button>
        ))}
      </div>

    </div>
  );
};
