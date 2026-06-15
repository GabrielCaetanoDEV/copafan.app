import React, { useState } from 'react';
import { useCopa } from '../context/CopaContext';
import { X, Key, Info, HelpCircle, Check, RefreshCw, Clock } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { apiKey, setApiKey, isApiMode, isLoading, lastUpdated, refreshFromApi } = useCopa();
  const [tempKey, setTempKey] = useState(apiKey);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(tempKey.trim());
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 1500);
  };

  const handleClear = () => {
    setTempKey('');
    setApiKey('');
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 1200);
  };

  const handleRefresh = () => {
    refreshFromApi();
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Nunca';
    return lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
      />

      <div className="relative glass-panel w-full max-w-md rounded-3xl border border-copa-border shadow-2xl p-6 overflow-hidden z-10 flex flex-col gap-5">
        
        {/* Top accent bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-copa-green via-copa-gold to-copa-accent"></div>

        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
            <Key size={18} className="text-copa-gold" />
            Configurar API Online
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition duration-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Por padrão, o site funciona em <strong className="text-copa-green">Modo Simulação Offline</strong> com 
            cronograma e estatísticas dinâmicas simuladas ao vivo.
          </p>

          <div className="bg-slate-950/50 border border-copa-border p-3.5 rounded-2xl flex gap-3">
            <Info size={18} className="text-copa-accent shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400">
              Para dados em tempo real, insira sua chave gratuita do{' '}
              <strong className="text-slate-300">football-data.org</strong>. 
              O site respeita o limite de <strong className="text-copa-gold">10 chamadas/min</strong> e 
              atualiza automaticamente a cada 60 segundos.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Chave de Autenticação (Token)
            </label>
            <input
              type="password"
              placeholder="Ex: 8a7c2b5f6d..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/60 border border-copa-border rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-copa-green/45 transition duration-300 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <HelpCircle size={13} />
            <span>Cadastre-se gratuitamente em{' '}</span>
            <a
              href="https://www.football-data.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-copa-accent hover:underline font-semibold"
            >
              football-data.org
            </a>
          </div>

          {isApiMode && lastUpdated && (
            <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-800/30 rounded-xl px-3 py-2 border border-copa-border">
              <Clock size={12} className="text-copa-green" />
              <span>Última atualização: <strong className="text-copa-green">{formatLastUpdated()}</strong></span>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="ml-auto text-copa-accent hover:text-blue-300 transition disabled:opacity-50"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          {apiKey && (
            <button
              onClick={handleClear}
              className="flex-1 py-2.5 border border-red-500/20 bg-red-950/5 text-red-400 hover:bg-red-950/20 rounded-xl text-xs sm:text-sm font-semibold transition duration-200"
            >
              Remover Chave
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-copa-green hover:bg-copa-green-hover text-black font-bold rounded-xl text-xs sm:text-sm transition duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/20 disabled:opacity-50"
          >
            {isLoading ? (
              <><RefreshCw size={14} className="animate-spin" /> Conectando...</>
            ) : successMsg ? (
              <><Check size={16} /> Salvo!</>
            ) : (
              'Salvar Configuração'
            )}
          </button>
        </div>

        {isApiMode && !successMsg && (
          <div className="text-center text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 py-1.5 rounded-lg border border-emerald-500/10">
            🌐 Modo API Online Ativo — Dados em Tempo Real
          </div>
        )}
      </div>
    </div>
  );
};
