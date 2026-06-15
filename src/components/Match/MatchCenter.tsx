/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useCopa } from '../../context/CopaContext';
import { STADIUMS, Match } from '../../data/copaData';
import { LivePlayer } from './LivePlayer';
import { GoogleMatchTabs } from './GoogleMatchTabs';
import { Search, Tv, Award, Calendar } from 'lucide-react';
import { useLiveClock } from '../../hooks/useLiveClock';

export const MatchCenter: React.FC = () => {
  const { 
    matches, 
    teams, 
    selectedMatchId, 
    setSelectedMatchId,
    isDetailsLoading,
  } = useCopa();

  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<'ALL' | 'GROUP' | 'KNOCKOUT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE' | 'FINISHED' | 'SCHEDULED'>('ALL');

  const selectedMatch = matches.find(m => m.id === selectedMatchId);
  const homeTeam = selectedMatch ? teams.find(t => t.id === selectedMatch.homeTeamId) : undefined;
  const awayTeam = selectedMatch ? teams.find(t => t.id === selectedMatch.awayTeamId) : undefined;
  const matchStadium = selectedMatch ? STADIUMS.find(s => s.id === selectedMatch.stadiumId) : undefined;
  const groupStandings = selectedMatch && selectedMatch.group 
    ? teams.filter(t => t.group === selectedMatch.group).sort((a,b) => b.points - a.points)
    : [];

  // Live ticking clock for the selected match (hook handles undefined safely)
  const { displayMinute, isHalftime } = useLiveClock(selectedMatch);

  // Filter matches
  const filteredMatches = matches.filter(m => {
    // Search filter
    const hTeam = teams.find(t => t.id === m.homeTeamId);
    const aTeam = teams.find(t => t.id === m.awayTeamId);
    const matchesSearch = 
      (hTeam?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (aTeam?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.group && `grupo ${m.group}`.toLowerCase().includes(searchTerm.toLowerCase()));

    // Stage filter
    let matchesStage = true;
    if (stageFilter === 'GROUP') matchesStage = m.stage === 'GROUP';
    else if (stageFilter === 'KNOCKOUT') matchesStage = m.stage !== 'GROUP';

    // Status filter
    let matchesStatus = true;
    if (statusFilter !== 'ALL') matchesStatus = m.status === statusFilter;

    return matchesSearch && matchesStage && matchesStatus;
  });

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'GROUP': return 'Fase de Grupos';
      case 'ROUND_OF_32': return '16 avos';
      case 'ROUND_OF_16': return 'Oitavas de Final';
      case 'QUARTER_FINALS': return 'Quartas de Final';
      case 'SEMI_FINALS': return 'Semifinal';
      case 'FINAL': return 'Grande Final';
      default: return stage;
    }
  };

  // Sub-component for LIVE badge with ticking clock per card
  const LiveBadge: React.FC<{ m: Match }> = ({ m }) => {
    const { displayMinute, isHalftime } = useLiveClock(m);
    if (isHalftime) {
      return (
        <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
          <span>⏸</span> Intervalo
        </span>
      );
    }
    return (
      <span className="bg-red-600/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        {displayMinute !== undefined ? `${displayMinute}'` : '●'} AO VIVO
      </span>
    );
  };

  const getStatusBadge = (m: Match) => {
    switch (m.status) {
      case 'LIVE':
        return <LiveBadge m={m} />;
      case 'FINISHED':
        return (
          <span className="bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <Award size={10} /> Fim
          </span>
        );
      default: {
        const time = new Date(m.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const date = new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        return (
          <span className="bg-slate-900 border border-copa-border text-slate-400 text-[10px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <Calendar size={10} /> {date} - {time}
          </span>
        );
      }
    }
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left Panel: Matches List (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4 h-[calc(100vh-140px)] min-h-[500px]">
        {/* Search & Filters */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3 border-copa-border">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar país ou grupo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-copa-border rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-copa-green/45 transition duration-300"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {/* Stage Toggle */}
            <div className="flex bg-slate-950/60 p-1 rounded-lg border border-copa-border shrink-0">
              <button
                onClick={() => setStageFilter('ALL')}
                className={`px-3 py-1.5 rounded-md font-medium transition duration-200 ${stageFilter === 'ALL' ? 'bg-copa-card text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setStageFilter('GROUP')}
                className={`px-3 py-1.5 rounded-md font-medium transition duration-200 ${stageFilter === 'GROUP' ? 'bg-copa-card text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Grupos
              </button>
              <button
                onClick={() => setStageFilter('KNOCKOUT')}
                className={`px-3 py-1.5 rounded-md font-medium transition duration-200 ${stageFilter === 'KNOCKOUT' ? 'bg-copa-card text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Fase Final
              </button>
            </div>

            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950/60 border border-copa-border rounded-lg text-slate-400 font-medium hover:text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">Todos Status</option>
              <option value="LIVE">Ao Vivo</option>
              <option value="FINISHED">Encerrados</option>
              <option value="SCHEDULED">Agendados</option>
            </select>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 pr-1">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm glass-panel rounded-2xl border-copa-border">
              Nenhuma partida encontrada para os filtros aplicados.
            </div>
          ) : (
            filteredMatches.map((m) => {
              const hTeam = teams.find(t => t.id === m.homeTeamId);
              const aTeam = teams.find(t => t.id === m.awayTeamId);
              const isSelected = m.id === selectedMatchId;
              const isLive = m.status === 'LIVE';

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMatchId(m.id)}
                  className={`glass-panel p-4 rounded-2xl cursor-pointer border transition duration-300 flex flex-col gap-3 group ${
                    isSelected 
                      ? 'border-copa-green/40 bg-copa-green/[0.03] shadow-md' 
                      : isLive 
                      ? 'border-red-500/20 hover:border-red-500/40 bg-red-950/[0.02]'
                      : 'border-copa-border hover:border-slate-700/60 hover:bg-copa-card-hover/20'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      {m.group ? `Grupo ${m.group}` : getStageLabel(m.stage)}
                    </span>
                    {getStatusBadge(m)}
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Home team */}
                    <div className="flex items-center gap-2.5 w-[42%]">
                      <span className="text-2xl sm:text-3xl filter drop-shadow group-hover:scale-105 transition duration-300">{hTeam?.flag || '🏁'}</span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate">{hTeam?.name || m.homeTeamId}</span>
                    </div>

                    {/* Score display */}
                    <div className="flex items-center justify-center gap-2 px-2.5 py-1 bg-slate-950/70 rounded-lg border border-slate-800/80 font-mono font-bold text-sm sm:text-base min-w-[70px] text-center">
                      <span className={m.homeScore !== null ? 'text-white' : 'text-slate-600'}>
                        {m.homeScore !== null ? m.homeScore : '-'}
                      </span>
                      <span className="text-slate-600 text-xs font-normal">x</span>
                      <span className={m.awayScore !== null ? 'text-white' : 'text-slate-600'}>
                        {m.awayScore !== null ? m.awayScore : '-'}
                      </span>
                    </div>

                    {/* Away team */}
                    <div className="flex items-center justify-end gap-2.5 w-[42%] text-right">
                      <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate">{aTeam?.name || m.awayTeamId}</span>
                      <span className="text-2xl sm:text-3xl filter drop-shadow group-hover:scale-105 transition duration-300">{aTeam?.flag || '🏁'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel: Live match embed & details (7 cols) */}
      <div className="lg:col-span-7 flex flex-col">
        {selectedMatch ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Tv className="text-copa-green" size={20} />
                Central da Partida
              </h2>

            </div>

            <LivePlayer 
              match={selectedMatch}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              stadium={matchStadium}
            />

            {/* Score header below player */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-copa-border mt-4 flex items-center justify-between text-center bg-slate-900/10">
              <div className="flex flex-col items-center w-[30%]">
                <span className="text-4xl sm:text-5xl filter drop-shadow mb-1">{homeTeam?.flag}</span>
                <span className="text-xs sm:text-sm font-bold text-white truncate max-w-full">{homeTeam?.name}</span>
                <span className="text-[10px] text-slate-500 uppercase font-mono mt-0.5">{selectedMatch.homeTeamId}</span>
              </div>

              <div className="flex flex-col items-center justify-center">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                  {selectedMatch.group ? `Grupo ${selectedMatch.group}` : getStageLabel(selectedMatch.stage)}
                </span>
                <div className="flex items-center gap-4 bg-slate-950/85 px-6 py-2.5 rounded-2xl border border-copa-border shadow-inner">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                    {selectedMatch.homeScore !== null ? selectedMatch.homeScore : '-'}
                  </span>
                  <span className="text-slate-600 font-extrabold text-lg sm:text-xl">x</span>
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                    {selectedMatch.awayScore !== null ? selectedMatch.awayScore : '-'}
                  </span>
                </div>
                {selectedMatch.status === 'LIVE' ? (
                  isHalftime ? (
                    <span className="text-xs font-bold text-yellow-400 mt-2 flex items-center gap-1">
                      <span>⏸</span> Intervalo
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-glow-green text-copa-green mt-2 animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-copa-green rounded-full"></span>
                      {displayMinute !== undefined ? `${displayMinute}' Minuto` : 'Ao Vivo'}
                    </span>
                  )
                ) : selectedMatch.status === 'FINISHED' ? (
                  <span className="text-xs text-slate-500 font-semibold uppercase mt-2">Finalizado</span>
                ) : (
                  <span className="text-xs text-copa-gold font-semibold uppercase mt-2">Agendado</span>
                )}
              </div>

              <div className="flex flex-col items-center w-[30%]">
                <span className="text-4xl sm:text-5xl filter drop-shadow mb-1">{awayTeam?.flag}</span>
                <span className="text-xs sm:text-sm font-bold text-white truncate max-w-full">{awayTeam?.name}</span>
                <span className="text-[10px] text-slate-500 uppercase font-mono mt-0.5">{selectedMatch.awayTeamId}</span>
              </div>
            </div>

            {/* Detail fetch loading indicator */}
            {isDetailsLoading && (
              <div className="relative h-0.5 w-full overflow-hidden rounded-full bg-slate-800 mb-1">
                <div className="absolute inset-y-0 left-0 w-1/2 bg-copa-green rounded-full animate-[loadbar_1.2s_ease-in-out_infinite]" />
              </div>
            )}

            {/* Google Stats Tabs */}
            <GoogleMatchTabs
              match={selectedMatch}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              groupStandings={groupStandings}
            />
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-[400px] text-center glass-panel rounded-2xl p-6 border-copa-border">
            <Tv size={48} className="text-slate-600 mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-white mb-1">Nenhum Jogo Selecionado</h3>
            <p className="text-slate-400 text-sm max-w-xs">
              Escolha uma partida da lista ao lado para conferir a transmissão, minuto a minuto e estatísticas táticas.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
