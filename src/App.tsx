import React, { useState, useEffect, useMemo } from 'react';
import { BASQUE_SPOTS } from './data/spots';
import { Spot, TideData, BasqueTown, ApiSettings } from './types/index';
import { fetchTideData, getSavedApiSettings } from './services/tides';
import { evaluateSpotConditions } from './services/scoring';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { SpotCard } from './components/SpotCard';
import { SpotDetailModal } from './components/SpotDetailModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { Waves, Sparkles, AlertCircle, Compass } from 'lucide-react';

const FAVORITES_STORAGE_KEY = 'basque_surf_favorites';

export const App: React.FC = () => {
  const [tideData, setTideData] = useState<TideData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiSettings, setApiSettings] = useState<ApiSettings>(getSavedApiSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Recherche & Filtres
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTown, setSelectedTown] = useState<BasqueTown | 'ALL'>('ALL');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'town'>('score');

  // Spot sélectionné pour modal
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // Favoris
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['biarritz-cote-des-basques', 'anglet-cavaliers', 'st-jean-lafitenia'];
    } catch {
      return ['biarritz-cote-des-basques', 'anglet-cavaliers', 'st-jean-lafitenia'];
    }
  });

  // Chargement des données marées
  const loadTides = async (settingsToUse?: ApiSettings) => {
    setLoading(true);
    try {
      const data = await fetchTideData(settingsToUse || apiSettings);
      setTideData(data);
    } catch (err) {
      console.error('Erreur chargement marées', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTides();
    const interval = setInterval(() => loadTides(), 5 * 60 * 1000); // Mise à jour toutes les 5 min
    return () => clearInterval(interval);
  }, []);

  // Gestion des favoris
  const handleToggleFavorite = (spotId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(spotId)
        ? prev.filter((id) => id !== spotId)
        : [...prev, spotId];
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Calcul des scores pour chaque spot
  const spotsWithScores = useMemo(() => {
    if (!tideData) return [];
    return BASQUE_SPOTS.map((spot) => {
      const score = evaluateSpotConditions(spot, tideData);
      return {
        spot,
        score,
        isFavorite: favorites.includes(spot.id),
      };
    });
  }, [tideData, favorites]);

  // Filtrage et Tri
  const filteredSpots = useMemo(() => {
    return spotsWithScores
      .filter(({ spot, isFavorite }) => {
        // Filtre favoris
        if (showFavoritesOnly && !isFavorite) return false;

        // Filtre ville
        if (selectedTown !== 'ALL' && spot.town !== selectedTown) return false;

        // Filtre recherche
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase().trim();
          const matchName = spot.name.toLowerCase().includes(query);
          const matchTown = spot.town.toLowerCase().includes(query);
          const matchDesc = spot.description.toLowerCase().includes(query);
          const matchLevel = spot.level.toLowerCase().includes(query);
          return matchName || matchTown || matchDesc || matchLevel;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') {
          return b.score.score - a.score.score;
        }
        if (sortBy === 'name') {
          return a.spot.name.localeCompare(b.spot.name);
        }
        if (sortBy === 'town') {
          return a.spot.town.localeCompare(b.spot.town);
        }
        return 0;
      });
  }, [spotsWithScores, searchTerm, selectedTown, showFavoritesOnly, sortBy]);

  // Meilleur spot du moment
  const topSpot = useMemo(() => {
    if (spotsWithScores.length === 0) return null;
    return [...spotsWithScores].sort((a, b) => b.score.score - a.score.score)[0];
  }, [spotsWithScores]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      
      {/* Navigation Header */}
      <Header
        tideData={tideData}
        onOpenSettings={() => setIsSettingsOpen(true)}
        favoritesCount={favorites.length}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-ocean-950/60 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-ocean-500/10 border border-ocean-500/20 text-ocean-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-ocean-400" />
              <span>Ongi Etorri • 100% Côte Basque (Anglet à Hendaye)</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Trouvez la meilleure vague basque selon la marée
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Chaque plage de la côte basque réagit différemment à la marée : la Côte des Basques s’engloutit à marée haute, Lafitenia adore la marée basse, et Hendaye encaisse toutes les houles. Notre algorithme note chaque spot en direct avec précision.
            </p>

            {/* Quick Highlight Box */}
            {topSpot && tideData && (
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <div 
                  onClick={() => setSelectedSpot(topSpot.spot)}
                  className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3.5 py-2 text-emerald-300 cursor-pointer hover:bg-emerald-500/20 transition"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Top spot actuel : <strong>{topSpot.spot.name}</strong> ({topSpot.spot.town})</span>
                  <span className="font-mono font-bold bg-emerald-500/30 px-1.5 py-0.5 rounded text-white">
                    {topSpot.score.scoreFormatted}/10
                  </span>
                </div>

                <div className="text-slate-400 text-xs flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-ocean-400" />
                  <span>Source marée : <strong className="text-slate-300">{tideData.apiSource}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Background decorative waves */}
          <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-10 pointer-events-none">
            <Waves className="w-96 h-96 text-ocean-400" />
          </div>
        </section>

        {/* Search & Filters */}
        <section className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTown={selectedTown}
            onTownChange={setSelectedTown}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
            favoritesCount={favorites.length}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </section>

        {/* Spots Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              {filteredSpots.length} {filteredSpots.length > 1 ? 'plages trouvées' : 'plage trouvée'}
              {selectedTown !== 'ALL' && ` à ${selectedTown}`}
              {showFavoritesOnly && ' (Favoris uniquement)'}
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Cliquez sur une plage pour voir la courbe de marée
            </span>
          </div>

          {loading && !tideData ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-slate-400">Évaluation des marées sur la côte basque...</p>
            </div>
          ) : filteredSpots.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/40 border border-slate-800/60 rounded-2xl p-8 space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-semibold text-slate-200">Aucune plage ne correspond à vos critères</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {showFavoritesOnly 
                  ? "Vous n'avez pas encore ajouté cette plage à vos favoris. Cliquez sur l'étoile d'une plage pour la retrouver ici !"
                  : "Essayez d'ajuster votre recherche ou sélectionnez une autre ville de la côte basque."}
              </p>
              {showFavoritesOnly && (
                <button
                  onClick={() => setShowFavoritesOnly(false)}
                  className="mt-2 text-xs text-ocean-400 hover:text-ocean-300 underline font-medium"
                >
                  Afficher toutes les plages
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredSpots.map(({ spot, score, isFavorite }) => (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  score={score}
                  tide={tideData!}
                  isFavorite={isFavorite}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectSpot={(sp) => setSelectedSpot(sp)}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800 bg-slate-950 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-basque-red"></div>
            <span className="font-semibold text-slate-200">Basque Surf</span>
            <span className="text-slate-600">•</span>
            <span>Anglet • Biarritz • Bidart • Guéthary • Saint-Jean-de-Luz • Hendaye</span>
          </div>
          
          <div className="flex items-center space-x-4 text-slate-500">
            <span>Notes sur 10 calculées selon marée & bathymétrie</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-300 underline"
            >
              Clé API & Réglages
            </button>
          </div>
        </div>
      </footer>

      {/* Spot Detail Modal */}
      {selectedSpot && tideData && (
        <SpotDetailModal
          spot={selectedSpot}
          score={evaluateSpotConditions(selectedSpot, tideData)}
          tide={tideData}
          isFavorite={favorites.includes(selectedSpot.id)}
          onToggleFavorite={handleToggleFavorite}
          onClose={() => setSelectedSpot(null)}
        />
      )}

      {/* API Key Configuration Modal */}
      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={apiSettings}
        onSave={(newSettings) => {
          setApiSettings(newSettings);
          loadTides(newSettings);
        }}
      />

    </div>
  );
};

export default App;
