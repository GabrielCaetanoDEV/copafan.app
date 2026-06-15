/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useCopa } from '../../context/CopaContext';
import { generateSquad, Match, STADIUMS } from '../../data/copaData';
import { Search, Trophy, Calendar, MapPin, Users, BarChart3 } from 'lucide-react';

export const TeamCenter: React.FC = () => {
  const { teams, matches, selectedTeamId, setSelectedTeamId } = useCopa();
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<'ALL' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L'>('ALL');
  const [activeRightTab, setActiveRightTab] = useState<'overview' | 'roster'>('overview');

  const selectedTeam = teams.find(t => t.id === selectedTeamId) || teams.find(t => t.id === 'BRA') || teams[0];
  const squad = selectedTeam ? generateSquad(selectedTeam.id) : [];

  // Filter teams list
  const filteredTeams = teams.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = groupFilter === 'ALL' || t.group === groupFilter;
    return matchesSearch && matchesGroup;
  });

  // Find matches involving the selected team
  const teamMatches = matches.filter(m => m.homeTeamId === selectedTeam.id || m.awayTeamId === selectedTeam.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Split into finished and upcoming
  const pastMatches = teamMatches.filter(m => m.status === 'FINISHED' || m.status === 'LIVE');
  const upcomingMatches = teamMatches.filter(m => m.status === 'SCHEDULED');
  const nextMatch = upcomingMatches[0];

  // Calculate stats manually for the team
  const stats = {
    played: pastMatches.length,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0
  };

  pastMatches.forEach(m => {
    if (m.homeScore === null || m.awayScore === null) return;
    const isHome = m.homeTeamId === selectedTeam.id;
    const teamScore = isHome ? m.homeScore : m.awayScore;
    const oppScore = isHome ? m.awayScore : m.homeScore;

    stats.goalsFor += teamScore;
    stats.goalsAgainst += oppScore;

    if (m.status === 'FINISHED') {
      if (teamScore > oppScore) stats.wins += 1;
      else if (teamScore < oppScore) stats.losses += 1;
      else stats.draws += 1;
    }
  });

  const getMatchResult = (m: Match) => {
    if (m.status === 'LIVE') return { label: 'AO VIVO', style: 'bg-red-500/10 text-red-500 border-red-500/20' };
    if (m.homeScore === null || m.awayScore === null) return { label: '-', style: 'bg-slate-800 text-slate-400 border-slate-700' };

    const isHome = m.homeTeamId === selectedTeam.id;
    const teamScore = isHome ? m.homeScore : m.awayScore;
    const oppScore = isHome ? m.awayScore : m.homeScore;

    if (teamScore > oppScore) return { label: 'VITÓRIA', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    if (teamScore < oppScore) return { label: 'DERROTA', style: 'bg-red-500/10 text-red-400 border-red-500/20' };
    return { label: 'EMPATE', style: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
  };

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-start h-[calc(100vh-140px)] min-h-[500px]">
      
      {/* LEFT COLUMN: Teams Browser (5 cols) */}
      <div className="md:col-span-5 flex flex-col gap-4 h-full">
        {/* Search & Group Filters */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3 border-copa-border">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar seleção..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-copa-border rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-copa-green/45 transition duration-300"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Grupo:</span>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value as any)}
              className="px-2.5 py-1 bg-slate-950/60 border border-copa-border rounded-lg text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">Todos</option>
              {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map(g => (
                <option key={g} value={g}>Grupo {g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Scrollable teams list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1">
          {filteredTeams.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm glass-panel rounded-2xl border-copa-border">
              Nenhuma seleção encontrada.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filteredTeams.map((team) => {
                const isSelected = team.id === selectedTeam.id;
                
                return (
                  <div
                    key={team.id}
                    onClick={() => {
                      setSelectedTeamId(team.id);
                      setActiveRightTab('overview'); // reset tabs
                    }}
                    className={`glass-panel p-3.5 rounded-xl cursor-pointer border text-center transition duration-300 flex flex-col items-center justify-center gap-1.5 group ${
                      isSelected 
                        ? 'border-copa-green/40 bg-copa-green/[0.03] shadow-md' 
                        : 'border-copa-border hover:border-slate-700/60 hover:bg-copa-card-hover/20'
                    }`}
                  >
                    <span className="text-3xl filter drop-shadow transform group-hover:scale-110 transition duration-300">{team.flag}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">{team.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono uppercase">Grupo {team.group}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Team Details Split Screen (7 cols) */}
      <div className="md:col-span-7 glass-panel rounded-2xl border border-copa-border overflow-hidden h-full flex flex-col shadow-2xl">
        
        {/* Detail Header Banner */}
        <div className="relative p-6 border-b border-copa-border bg-gradient-to-r from-slate-950/80 via-slate-900/40 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-5xl sm:text-6xl filter drop-shadow">{selectedTeam.flag}</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                {selectedTeam.name}
              </h2>
              <span className="inline-block mt-1 bg-slate-950/60 border border-copa-border text-slate-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Grupo {selectedTeam.group} | Sigla: {selectedTeam.id}
              </span>
            </div>
          </div>

          <div className="flex bg-slate-950/70 border border-copa-border p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveRightTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition duration-200 ${
                activeRightTab === 'overview' ? 'bg-copa-card text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 size={13} />
              Geral
            </button>
            <button
              onClick={() => setActiveRightTab('roster')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition duration-200 ${
                activeRightTab === 'roster' ? 'bg-copa-card text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users size={13} />
              Elenco
            </button>
          </div>
        </div>

        {/* Scrollable details content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 sm:p-6 bg-slate-900/10">
          
          {/* Tab 1: Overview */}
          {activeRightTab === 'overview' && (
            <div className="space-y-6">
              
              {/* 1. Next Match / Proximo Jogo */}
              <div className="bg-slate-950/45 border border-copa-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
                  <span className="text-[10px] font-bold text-copa-gold uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={12} /> Próximo Compromisso
                  </span>
                  {nextMatch ? (
                    <>
                      <div className="text-sm font-bold text-white mt-1">
                        Copa 2026 - {nextMatch.stage === 'GROUP' ? `Grupo ${nextMatch.group}` : 'Mata-Mata'}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 justify-center sm:justify-start">
                        <MapPin size={12} className="text-slate-500" />
                        <span>{STADIUMS.find(s => s.id === nextMatch.stadiumId)?.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        {new Date(nextMatch.date).toLocaleDateString('pt-BR', {
                          weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-slate-500 mt-2 font-medium italic">
                      Sem compromissos oficiais agendados
                    </div>
                  )}
                </div>

                {nextMatch && (
                  <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-copa-border shadow-md">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl">{selectedTeam.flag}</span>
                      <span className="text-[9px] font-bold text-slate-400 mt-0.5">{selectedTeam.id}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">vs</span>
                    {(() => {
                      const oppId = nextMatch.homeTeamId === selectedTeam.id ? nextMatch.awayTeamId : nextMatch.homeTeamId;
                      const opp = teams.find(t => t.id === oppId);
                      return (
                        <div className="flex flex-col items-center">
                          <span className="text-2xl">{opp?.flag || '🏁'}</span>
                          <span className="text-[9px] font-bold text-slate-400 mt-0.5">{opp?.id || oppId}</span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* 2. Team Stats Summary */}
              <div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Trophy size={14} className="text-copa-gold" /> Estatísticas Resumidas
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950/30 border border-copa-border rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-500 font-medium">Jogos</div>
                    <div className="text-2xl font-bold font-mono text-white mt-1">{stats.played}</div>
                  </div>
                  <div className="bg-slate-950/30 border border-copa-border rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-500 font-medium">Vitórias</div>
                    <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{stats.wins}</div>
                  </div>
                  <div className="bg-slate-950/30 border border-copa-border rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-500 font-medium">Derrotas</div>
                    <div className="text-2xl font-bold font-mono text-red-400 mt-1">{stats.losses}</div>
                  </div>
                  <div className="bg-slate-950/30 border border-copa-border rounded-xl p-3 text-center col-span-3 sm:col-span-1">
                    <div className="text-xs text-slate-500 font-medium">Gols Marcados</div>
                    <div className="text-lg font-bold font-mono text-slate-300 mt-1">{stats.goalsFor}</div>
                  </div>
                  <div className="bg-slate-950/30 border border-copa-border rounded-xl p-3 text-center col-span-3 sm:col-span-1">
                    <div className="text-xs text-slate-500 font-medium">Gols Sofridos</div>
                    <div className="text-lg font-bold font-mono text-slate-300 mt-1">{stats.goalsAgainst}</div>
                  </div>
                  <div className="bg-slate-950/30 border border-copa-border rounded-xl p-3 text-center col-span-3 sm:col-span-1">
                    <div className="text-xs text-slate-500 font-medium">Capitão</div>
                    <div className="text-xs font-bold text-copa-gold mt-2 truncate">
                      {squad.find(p => p.isCaptain)?.name || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Match History */}
              <div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Histórico de Jogos</h3>
                {pastMatches.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs italic">
                    Nenhum jogo concluído ou em andamento
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {pastMatches.map((m) => {
                      const isHome = m.homeTeamId === selectedTeam.id;
                      const oppId = isHome ? m.awayTeamId : m.homeTeamId;
                      const opp = teams.find(t => t.id === oppId);
                      const result = getMatchResult(m);

                      return (
                        <div 
                          key={m.id}
                          className="bg-slate-950/25 hover:bg-slate-950/50 border border-copa-border rounded-xl p-3 flex items-center justify-between text-xs sm:text-sm transition duration-200"
                        >
                          <div className="flex items-center gap-2 w-[55%]">
                            <span className="text-lg shrink-0">{isHome ? selectedTeam.flag : opp?.flag}</span>
                            <span className="font-semibold text-slate-200 truncate">
                              {isHome ? selectedTeam.name : opp?.name}
                            </span>
                            <span className="text-slate-500 text-[10px] font-semibold shrink-0 uppercase">vs</span>
                            <span className="text-lg shrink-0">{isHome ? opp?.flag : selectedTeam.flag}</span>
                            <span className="font-medium text-slate-400 truncate">
                              {isHome ? opp?.name : selectedTeam.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-white bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                              {m.homeScore} - {m.awayScore}
                            </span>
                            <span className={`border text-[9px] font-bold px-2 py-0.5 rounded-md tracking-wider shrink-0 ${result.style}`}>
                              {result.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Tab 2: Roster / Elenco */}
          {activeRightTab === 'roster' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Users size={16} className="text-copa-green" /> Roster Oficial (23 jogadores)
              </h3>
              
              {/* Grid split by positions */}
              {['Goleiro', 'Defensor', 'Meio-campista', 'Atacante'].map((pos) => {
                const posPlayers = squad.filter(p => p.position === pos);
                
                return (
                  <div key={pos} className="bg-slate-950/25 border border-copa-border p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-copa-border/40 pb-1 flex justify-between">
                      <span>{pos}s</span>
                      <span className="text-[10px] text-slate-600 font-mono font-normal">{posPlayers.length} atletas</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {posPlayers.map(p => (
                        <div key={p.id} className="flex justify-between items-center bg-slate-950/30 p-2 rounded-lg border border-slate-950/70 hover:border-slate-800 transition duration-150">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-slate-500 font-bold w-4 text-right">{p.number}</span>
                            <span className="font-semibold text-slate-300">{p.name}</span>
                          </div>
                          {p.isCaptain && (
                            <span className="bg-copa-gold/15 border border-copa-gold/25 text-copa-gold text-[8px] font-bold uppercase px-1.5 py-0.5 rounded">
                              Capitão
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
