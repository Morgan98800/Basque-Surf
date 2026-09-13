import React, { useState, useEffect, useMemo } from 'react';
import { BASQUE_SPOTS, TOWN_TO_SLUG } from './data/spots';
import { Spot, TideData, BasqueTown, ApiSettings } from './types/index';
import { fetchTideData, getSavedApiSettings } from './services/tides';
import { evaluateSpotConditions } from './services/scoring';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { SpotCard } from './components/SpotCard';
import { SpotDetailModal } from './components/SpotDetailModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { AlertCircle, ArrowUpRight } from 'lucide-react';

const FAVORITES_STORAGE_KEY = 'basque_surf_favorites';

export const App: React.FC = () => {
  const [tidesByTown, setTidesByTown] = useState<Record<string, TideData>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [apiSettings, setApiSettings] = useState<ApiSettings>(getSavedApiSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Recherche & Filtres
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTown, setSelectedTown] = useState<BasqueTown | 'ALL'>('ALL');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'town'>('score');

  // Spot sélectionné pour Bottom Sheet
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // Favoris persistants
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['biarritz-cote-des-basques', 'anglet-cavaliers', 'st-jean-lafitenia'];
    } catch {
      return ['biarritz-cote-des-basques', 'anglet-cavaliers', 'st-jean-lafitenia'];
    }
  });

  // Chargement des marées officielles de la Côte Basque
  const loadAllTides = async (settingsToUse?: ApiSettings) => {
    setLoading(true);
    const settings = settingsToUse || apiSettings;
    const slugs = ['biarritz', 'anglet', 'bidart', 'guethary', 'saint-jean-de-luz', 'hendaye'];
    const newTides: Record<string, TideData> = {};

    try {
      const biarritzData = await fetchTideData('biarritz', settings);
      newTides['biarritz'] = biarritzData;
      setTidesByTown({ ...newTides });

      const others = slugs.filter(s => s !== 'biarritz');
      const results = await Promise.allSettled(others.map(slug => fetchTideData(slug, settings)));
      
      results.forEach((res, index) => {
        const slug = others[index];
        newTides[slug] = res.status === 'fulfilled' ? res.value : biarritzData;
      });

      setTidesByTown({ ...newTides });
    } catch (err) {
      console.error('Erreur chargement marées', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllTides();
    const interval = setInterval(() => loadAllTides(), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleFavorite = (spotId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(spotId)
        ? prev.filter((id) => id !== spotId)
        : [...prev, spotId];
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Marée active pour l'en-tête
  const activeHeaderTide = useMemo(() => {
    if (selectedTown !== 'ALL') {
      const slug = TOWN_TO_SLUG[selectedTown];
      return tidesByTown[slug] || tidesByTown['biarritz'] || null;
    }
    return tidesByTown['biarritz'] || null;
  }, [selectedTown, tidesByTown]);

  // Scores par spot
  const spotsWithScores = useMemo(() => {
    const fallbackTide = tidesByTown['biarritz'];
    if (!fallbackTide) return [];

    return BASQUE_SPOTS.map((spot) => {
      const spotTide = tidesByTown[spot.coefMareeSlug] || fallbackTide;
      const score = evaluateSpotConditions(spot, spotTide);
      return {
        spot,
        score,
        tide: spotTide,
        isFavorite: favorites.includes(spot.id),
      };
    });
  }, [tidesByTown, favorites]);

  // Filtrage et Tri
  const filteredSpots = useMemo(() => {
    return spotsWithScores
      .filter(({ spot, isFavorite }) => {
        if (showFavoritesOnly && !isFavorite) return false;
        if (selectedTown !== 'ALL' && spot.town !== selectedTown) return false;
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase().trim();
          return (
            spot.name.toLowerCase().includes(query) ||
            spot.town.toLowerCase().includes(query) ||
            spot.description.toLowerCase().includes(query) ||
            spot.level.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.score.score - a.score.score;
        if (sortBy === 'name') return a.spot.name.localeCompare(b.spot.name);
        if (sortBy === 'town') return a.spot.town.localeCompare(b.spot.town);
        return 0;
      });
  }, [spotsWithScores, searchTerm, selectedTown, showFavoritesOnly, sortBy]);

  // Top spot
  const topSpot = useMemo(() => {
    if (spotsWithScores.length === 0) return null;
    return [...spotsWithScores].sort((a, b) => b.score.score - a.score.score)[0];
  }, [spotsWithScores]);

  const selectedSpotTide = useMemo(() => {
    if (!selectedSpot) return null;
    return tidesByTown[selectedSpot.coefMareeSlug] || tidesByTown['biarritz'] || null;
  }, [selectedSpot, tidesByTown]);

  return (
    <div className="min-h-screen bg-nautical-900 flex flex-col text-slate-100">
      
      {/* Sticky Header */}
      <Header
        tideData={activeHeaderTide}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 py-3.5 sm:py-6 space-y-3.5 sm:space-y-4">
        
        {/* Compact Quick Highlight Strip (No AI fluff) */}
        {topSpot && activeHeaderTide && (
          <div 
            onClick={() => setSelectedSpot(topSpot.spot)}
            className="flex items-center justify-between p-2.5 sm:p-3 bg-nautical-850 hover:bg-nautical-800 border border-nautical-750 rounded-xl cursor-pointer active:scale-[0.99] transition text-xs"
          >
            <div className="flex items-center space-x-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              <span className="text-slate-400">Meilleure condition actuelle :</span>
              <strong className="text-white font-semibold truncate">{topSpot.spot.name}</strong>
              <span className="text-slate-500 hidden xs:inline font-normal">({topSpot.spot.town})</span>
            </div>

            <div className="flex items-center space-x-1 font-mono font-bold text-emerald-400 shrink-0 pl-2">
              <span>{topSpot.score.scoreFormatted}/10</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        )}

        {/* Search & Town Filters */}
        <section className="bg-nautical-850/80 border border-nautical-750 rounded-2xl p-3 sm:p-4">
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
        <section className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>
              {filteredSpots.length} {filteredSpots.length > 1 ? 'spots' : 'spot'}
              {selectedTown !== 'ALL' && ` à ${selectedTown}`}
              {showFavoritesOnly && ' (favoris)'}
            </span>
            <span className="text-slate-500 font-mono">
              Atlas IFREMER/SHOM
            </span>
          </div>

          {loading && Object.keys(tidesByTown).length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400">Chargement des marées...</p>
            </div>
          ) : filteredSpots.length === 0 ? (
            <div className="py-12 text-center bg-nautical-850 border border-nautical-750 rounded-xl p-6 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-200">Aucun spot trouvé</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {showFavoritesOnly 
                  ? "Ajoutez des spots en favoris en cliquant sur l'étoile pour les retrouver ici."
                  : "Essayez un autre mot clé ou sélectionnez une autre commune."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
              {filteredSpots.map(({ spot, score, tide, isFavorite }) => (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  score={score}
                  tide={tide}
                  isFavorite={isFavorite}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectSpot={(sp) => setSelectedSpot(sp)}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Clean Footer */}
      <footer className="mt-8 border-t border-nautical-800 bg-nautical-950 py-5 text-[11px] text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-sm bg-ikurrina-red"></span>
            <span className="font-bold text-slate-300">BASQUE SURF</span>
            <span className="text-slate-600">•</span>
            <span>Anglet à Hendaye</span>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <span>Marées CoefMarée (IFREMER/SHOM)</span>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-200 underline"
            >
              Sources
            </button>
          </div>
        </div>
      </footer>

      {/* Spot Detail Mobile Bottom Sheet / Modal */}
      {selectedSpot && selectedSpotTide && (
        <SpotDetailModal
          spot={selectedSpot}
          score={evaluateSpotConditions(selectedSpot, selectedSpotTide)}
          tide={selectedSpotTide}
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
          loadAllTides(newSettings);
        }}
      />

    </div>
  );
};

export default App;
