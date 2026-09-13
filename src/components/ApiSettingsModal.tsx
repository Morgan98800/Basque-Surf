import React, { useState } from 'react';
import { ApiSettings } from '../types';
import { saveApiSettings } from '../services/tides';
import { X, Key, CheckCircle2, ShieldCheck, HelpCircle, RefreshCw } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: ApiSettings;
  onSave: (newSettings: ApiSettings) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSave,
}) => {
  const [apiKey, setApiKey] = useState(currentSettings.apiKey);
  const [provider, setProvider] = useState<'stormglass' | 'worldtides' | 'openmeteo' | 'auto'>(currentSettings.provider);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ApiSettings = {
      apiKey: apiKey.trim(),
      provider,
      enabled: apiKey.trim().length > 0
    };
    saveApiSettings(updated);
    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    setApiKey('');
    const updated: ApiSettings = {
      apiKey: '',
      provider: 'stormglass',
      enabled: false
    };
    saveApiSettings(updated);
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Configuration de l'API</h3>
              <p className="text-xs text-slate-400">Marées de la Côte Basque</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-4">
          
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 leading-relaxed space-y-1.5">
            <div className="flex items-center space-x-1.5 text-ocean-400 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Mode automatique sécurisé</span>
            </div>
            <p>
              Sans clé API renseignée, l'application utilise le modèle astronomique harmonique de la côte basque (Biarritz/Socoa/Bayonne). Dès que vous collez votre clé ici, les marées en direct sont interrogées.
            </p>
          </div>

          {/* Provider Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Fournisseur d'API
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-ocean-500 transition cursor-pointer"
            >
              <option value="stormglass">Stormglass.io (Recommandé pour le surf)</option>
              <option value="worldtides">WorldTides API</option>
            </select>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Clé API
              </label>
              {apiKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Effacer la clé
                </button>
              )}
            </div>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Collez votre clé API ici..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-ocean-500 transition"
            />
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              <HelpCircle className="w-3 h-3" />
              La clé est stockée localement dans votre navigateur (`localStorage`).
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-transparent rounded-xl transition"
            >
              Fermer
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-ocean-600 hover:bg-ocean-500 rounded-xl shadow-md shadow-ocean-600/30 transition"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Enregistré !</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sauvegarder & Actualiser</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
