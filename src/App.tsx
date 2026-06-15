import { useState } from 'react';
import { useCopa } from './context/CopaContext';
import { MatchCenter } from './components/Match/MatchCenter';
import { BracketView } from './components/Bracket/BracketView';
import { TeamCenter } from './components/Team/TeamCenter';
import { SettingsModal } from './components/SettingsModal';
import { Trophy, Tv, Key, Shield, Award, Globe, Heart, RefreshCw } from 'lucide-react';

function App() {
  const { activeTab, setActiveTab, teams, isApiMode, isLoading, lastUpdated, refreshFromApi } = useCopa();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const groupsList = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    return lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#03060f] flex flex-col justify-between text-slate-100 font-sans">
      
      {/* Premium Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#050b18]/85 backdrop-blur-md border-b border-copa-border shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo area */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-copa-green to-copa-accent flex items-center justify-center shadow-md shadow-emerald-500/10">
                <Trophy className="text-black" size={20} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-white font-display">
                  Copa 2026 Hub
                </h1>
                <span className="text-[9px] text-copa-gold font-bold uppercase tracking-wider">
                  Live & Stats Center
                </span>
              </div>
            </div>

            {/* Desktop Tabs */}
            <nav className="hidden md:flex space-x-1 bg-slate-950/50 border border-copa-border p-1 rounded-xl text-xs sm:text-sm">
              <button
                onClick={() => setActiveTab('matches')}
                className={`px-4 py-2 rounded-lg font-bold transition duration-200 flex items-center gap-1.5 ${
                  activeTab === 'matches' ? 'bg-copa-green text-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Tv size={15} />
                Jogos & CazéTV
              </button>
              <button
                onClick={() => setActiveTab('standings')}
                className={`px-4 py-2 rounded-lg font-bold transition duration-200 flex items-center gap-1.5 ${
                  activeTab === 'standings' ? 'bg-copa-green text-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield size={15} />
                Tabela de Grupos
              </button>
              <button
                onClick={() => setActiveTab('bracket')}
                className={`px-4 py-2 rounded-lg font-bold transition duration-200 flex items-center gap-1.5 ${
                  activeTab === 'bracket' ? 'bg-copa-green text-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award size={15} />
                Chaveamento
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`px-4 py-2 rounded-lg font-bold transition duration-200 flex items-center gap-1.5 ${
                  activeTab === 'teams' ? 'bg-copa-green text-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe size={15} />
                Seleções
              </button>
            </nav>

            {/* API Config Button & Mode Indicators */}
            <div className="flex items-center gap-2">
              {isApiMode && lastUpdated && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono text-slate-500">
                  Atualizado: {formatLastUpdated()}
                </span>
              )}
              <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                isApiMode
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-copa-green'
              }`}>
                {isApiMode ? '🌐 API Online' : '⚡ Simulador'}
              </span>

              {isApiMode && (
                <button
                  onClick={refreshFromApi}
                  disabled={isLoading}
                  title="Atualizar dados da API"
                  className="p-2 bg-slate-900 border border-copa-border hover:border-copa-accent/40 text-slate-400 hover:text-slate-200 rounded-xl transition duration-200 disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin text-copa-accent' : ''} />
                </button>
              )}

              <button
                onClick={() => setIsSettingsOpen(true)}
                title="Configurações de Conectividade"
                className="p-2 sm:px-3 sm:py-2 bg-slate-900 border border-copa-border hover:border-copa-gold/40 text-slate-400 hover:text-slate-200 rounded-xl transition duration-200 flex items-center gap-1.5 text-xs font-bold"
              >
                <Key size={14} className="text-copa-gold" />
                <span className="hidden sm:inline">Chave API</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        
        {activeTab === 'matches' && <MatchCenter />}
        {activeTab === 'bracket' && <BracketView />}
        {activeTab === 'teams' && <TeamCenter />}

        {/* Standings view - 12 groups grid */}
        {activeTab === 'standings' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Shield className="text-copa-green" size={24} />
                Fase de Grupos – 48 Seleções
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Os 2 melhores de cada grupo (24) + os 8 melhores 3os colocados avançam para os 16avos de final.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {groupsList.map((groupChar) => {
                const groupTeams = teams
                  .filter(t => t.group === groupChar)
                  .sort((a, b) => {
                    if (b.points !== a.points) return b.points - a.points;
                    if (b.goalsDifference !== a.goalsDifference) return b.goalsDifference - a.goalsDifference;
                    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
                    return a.name.localeCompare(b.name);
                  });

                if (groupTeams.length === 0) return null;

                return (
                  <div key={groupChar} className="glass-panel rounded-2xl border border-copa-border flex flex-col overflow-hidden">
                    <div className="bg-slate-950/60 border-b border-copa-border px-4 py-2.5 flex justify-between items-center">
                      <h3 className="text-sm font-bold text-white font-display">Grupo {groupChar}</h3>
                      <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-widest">FIFA WORLD CUP 2026</span>
                    </div>

                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="text-slate-500 font-semibold border-b border-slate-950/60 uppercase text-[9px] tracking-wider bg-slate-950/30">
                          <th className="py-2 pl-3 w-6 text-center">Pos</th>
                          <th className="py-2 pl-2">Seleção</th>
                          <th className="py-2 text-center w-7">J</th>
                          <th className="py-2 text-center w-7">V</th>
                          <th className="py-2 text-center w-7">E</th>
                          <th className="py-2 text-center w-7">D</th>
                          <th className="py-2 text-center w-7">GP</th>
                          <th className="py-2 text-center w-7">GC</th>
                          <th className="py-2 text-center w-7">SG</th>
                          <th className="py-2 text-center w-8 pr-2">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupTeams.map((team, idx) => {
                          const isQualified = idx < 2;
                          const isThird = idx === 2;
                          return (
                            <tr
                              key={team.id}
                              className="border-b border-slate-950/20 last:border-0 hover:bg-slate-800/20 transition duration-150"
                            >
                              <td className="py-2 text-center pl-3">
                                <span className={`inline-flex w-5 h-5 items-center justify-center rounded-full text-[9px] font-bold ${
                                  isQualified
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : isThird
                                    ? 'bg-yellow-500/10 text-yellow-500/70'
                                    : 'text-slate-600'
                                }`}>
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="py-2 pl-2">
                                <div className="flex items-center gap-1.5 font-medium text-slate-200">
                                  <span className="text-base shrink-0">{team.flag}</span>
                                  <span className="truncate max-w-[90px]">{team.name}</span>
                                </div>
                              </td>
                              <td className="py-2 text-center text-slate-400 font-mono">{team.played}</td>
                              <td className="py-2 text-center text-slate-400 font-mono">{team.wins}</td>
                              <td className="py-2 text-center text-slate-400 font-mono">{team.draws}</td>
                              <td className="py-2 text-center text-slate-400 font-mono">{team.losses}</td>
                              <td className="py-2 text-center text-slate-400 font-mono">{team.goalsFor}</td>
                              <td className="py-2 text-center text-slate-400 font-mono">{team.goalsAgainst}</td>
                              <td className={`py-2 text-center font-mono font-semibold ${
                                team.goalsDifference > 0 ? 'text-emerald-400' : team.goalsDifference < 0 ? 'text-red-400' : 'text-slate-500'
                              }`}>
                                {team.goalsDifference > 0 ? `+${team.goalsDifference}` : team.goalsDifference}
                              </td>
                              <td className="py-2 text-center text-white font-bold font-mono pr-2">{team.points}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 inline-block" />
                Classificado para 16avos
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-yellow-500/10 inline-block" />
                Pode avançar (melhor 3º)
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050b18]/95 backdrop-blur-lg border-t border-copa-border py-2.5 px-4 flex justify-around items-center text-[10px] text-slate-400 font-semibold shadow-2xl">
        <button onClick={() => setActiveTab('matches')} className={`flex flex-col items-center gap-1 transition ${activeTab === 'matches' ? 'text-copa-green' : 'hover:text-slate-200'}`}>
          <Tv size={18} /><span>Jogos</span>
        </button>
        <button onClick={() => setActiveTab('standings')} className={`flex flex-col items-center gap-1 transition ${activeTab === 'standings' ? 'text-copa-green' : 'hover:text-slate-200'}`}>
          <Shield size={18} /><span>Tabela</span>
        </button>
        <button onClick={() => setActiveTab('bracket')} className={`flex flex-col items-center gap-1 transition ${activeTab === 'bracket' ? 'text-copa-green' : 'hover:text-slate-200'}`}>
          <Award size={18} /><span>Chave</span>
        </button>
        <button onClick={() => setActiveTab('teams')} className={`flex flex-col items-center gap-1 transition ${activeTab === 'teams' ? 'text-copa-green' : 'hover:text-slate-200'}`}>
          <Globe size={18} /><span>Seleções</span>
        </button>
      </nav>

      {/* Spacer for mobile bar */}
      <div className="md:hidden h-16"></div>

      {/* Premium Footer */}
      <footer className="bg-slate-950/60 border-t border-copa-border py-5 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1 justify-center">
            Desenvolvido com <Heart size={12} className="text-red-500 fill-red-500" /> para acompanhar a Copa do Mundo FIFA 2026.
          </p>
          <div className="flex items-center gap-3 justify-center text-slate-500">
            <span>Transmissão: <strong className="text-slate-400">CazéTV (YouTube)</strong></span>
            <span>•</span>
            <span>Dados: <strong className="text-slate-400">football-data.org</strong></span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default App;
