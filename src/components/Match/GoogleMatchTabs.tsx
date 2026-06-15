/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Match, Team, generateSquad } from '../../data/copaData';
import { Shield, Users, BarChart3, Clock, ArrowLeftRight } from 'lucide-react';

interface GoogleMatchTabsProps {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
  groupStandings?: Team[];
}

export const GoogleMatchTabs: React.FC<GoogleMatchTabsProps> = ({ 
  match, 
  homeTeam, 
  awayTeam,
  groupStandings = []
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'stats' | 'lineups' | 'group'>('timeline');

  const hasRealLineup = match.lineups && match.lineups.home && match.lineups.away &&
    match.lineups.home.titulares.length > 0;

  // Is this match too far in the future to have any data?
  const matchStartMs = new Date(match.date).getTime();
  const isFarFuture = match.status === 'SCHEDULED' && matchStartMs > Date.now() + 24 * 60 * 60 * 1000;
  const isNearKickoff = match.status === 'SCHEDULED' && matchStartMs <= Date.now() + 2 * 60 * 60 * 1000;

  // ---------------------------------------------------------------
  // Grid-based formation layout
  // API-Football returns p.grid = "row:col" for each player
  // Row 1 = GK, Row 2 = DEF, Row 3+ = MID/FWD depending on formation
  // This correctly handles 4-2-3-1, 4-4-2, 3-5-2, 5-3-2, etc.
  // ---------------------------------------------------------------
  const getRowsByGrid = (players: any[]): { players: any[] }[] => {
    const hasGrid = players.some((p: any) => p.grid);

    if (hasGrid) {
      const rowMap: Record<number, any[]> = {};
      for (const p of players) {
        const rowNum = p.grid ? parseInt((p.grid as string).split(':')[0]) : 99;
        if (!rowMap[rowNum]) rowMap[rowNum] = [];
        rowMap[rowNum].push(p);
      }
      return Object.keys(rowMap)
        .map(Number)
        .sort((a, b) => a - b)
        .map(rowNum => ({
          players: rowMap[rowNum].sort((a: any, b: any) => {
            const aC = a.grid ? parseInt((a.grid as string).split(':')[1]) : 0;
            const bC = b.grid ? parseInt((b.grid as string).split(':')[1]) : 0;
            return aC - bC;
          })
        }));
    }

    // Fallback: group by position category (no grid data)
    return [
      { players: players.filter((p: any) => p.position === 'Goleiro').slice(0, 1) },
      { players: players.filter((p: any) => p.position === 'Defensor') },
      { players: players.filter((p: any) => p.position === 'Meio-campista') },
      { players: players.filter((p: any) => p.position === 'Atacante') },
    ].filter(r => r.players.length > 0);
  };

  // Apply substitution events to update the current lineup
  const applySubstitutions = (titulares: any[], reservas: any[], teamId: string) => {
    const subs = match.events.filter(e =>
      e.type === 'substitution' &&
      e.teamId?.toLowerCase() === teamId.toLowerCase()
    );
    if (!subs.length) return titulares;

    let current = [...titulares];
    for (const sub of subs) {
      // Find who went out (by playerName) to get their grid position
      const playerOut = current.find((p: any) =>
        sub.playerName && p.name.toLowerCase().includes(
          sub.playerName.split(' ').pop()?.toLowerCase() || ''
        )
      );
      const inheritGrid = playerOut?.grid;

      // Remove player who went out
      if (playerOut) {
        current = current.filter((p: any) => p.id !== playerOut.id);
      }

      // Find player who came in from bench (by playerInName)
      if (sub.playerInName) {
        const playerIn = reservas.find((p: any) =>
          p.name.toLowerCase().includes(
            (sub.playerInName as string).split(' ').pop()?.toLowerCase() || ''
          )
        );
        if (playerIn && !current.find((p: any) => p.id === playerIn.id)) {
          current.push({ ...playerIn, grid: inheritGrid, isSubstitute: true });
        }
      }
    }
    return current;
  };

  // Build fallback 4-3-3 from generated squad (no grid data)
  const buildFallbackRows = (squad: ReturnType<typeof generateSquad>) => {
    const gk = squad.filter(p => p.position === 'Goleiro').slice(0, 1);
    const def = squad.filter(p => p.position === 'Defensor').slice(0, 4);
    const mid = squad.filter(p => p.position === 'Meio-campista').slice(0, 3);
    const fwd = squad.filter(p => p.position === 'Atacante').slice(0, 3);
    return [
      { players: gk },
      { players: def },
      { players: mid },
      { players: fwd },
    ].filter(r => r.players.length > 0);
  };

  const hSquad = homeTeam ? generateSquad(homeTeam.id) : [];
  const aSquad = awayTeam ? generateSquad(awayTeam.id) : [];

  const homeTitulares = hasRealLineup
    ? applySubstitutions(match.lineups!.home.titulares, match.lineups!.home.reservas ?? [], match.homeTeamId)
    : hSquad;
  const awayTitulares = hasRealLineup
    ? applySubstitutions(match.lineups!.away.titulares, match.lineups!.away.reservas ?? [], match.awayTeamId)
    : aSquad;

  const homeRows = hasRealLineup ? getRowsByGrid(homeTitulares) : buildFallbackRows(hSquad);
  const awayRows = hasRealLineup ? getRowsByGrid(awayTitulares) : buildFallbackRows(aSquad);

  // Count substitutions by team
  const homeSubCount = match.events.filter(e => e.type === 'substitution' && e.teamId?.toLowerCase() === match.homeTeamId.toLowerCase()).length;
  const awaySubCount = match.events.filter(e => e.type === 'substitution' && e.teamId?.toLowerCase() === match.awayTeamId.toLowerCase()).length;

  // Helper to render stats bars
  const renderStatBar = (label: string, homeValue: number, awayValue: number) => {
    const total = homeValue + awayValue || 1;
    const homePercent = (homeValue / total) * 100;
    const awayPercent = (awayValue / total) * 100;

    return (
      <div className="mb-4">
        <div className="flex justify-between text-xs sm:text-sm mb-1 font-semibold text-slate-300">
          <span>{homeValue}</span>
          <span className="text-slate-400 font-normal">{label}</span>
          <span>{awayValue}</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-copa-green transition-all duration-500 ease-out" 
            style={{ width: `${homePercent}%` }}
          />
          <div 
            className="h-full bg-copa-accent transition-all duration-500 ease-out" 
            style={{ width: `${awayPercent}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full glass-panel rounded-2xl overflow-hidden border border-copa-border shadow-xl mt-6 flex flex-col">
      {/* Navigation Headers */}
      <div className="flex border-b border-copa-border bg-slate-950/60 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 min-w-[100px] py-4 px-2 text-center text-xs sm:text-sm font-semibold border-b-2 transition duration-300 flex items-center justify-center gap-1.5 ${
            activeTab === 'timeline'
              ? 'border-copa-green text-copa-green bg-copa-green/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock size={16} />
          Lance a Lance
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 min-w-[100px] py-4 px-2 text-center text-xs sm:text-sm font-semibold border-b-2 transition duration-300 flex items-center justify-center gap-1.5 ${
            activeTab === 'stats'
              ? 'border-copa-green text-copa-green bg-copa-green/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 size={16} />
          Estatísticas
        </button>
        <button
          onClick={() => setActiveTab('lineups')}
          className={`flex-1 min-w-[100px] py-4 px-2 text-center text-xs sm:text-sm font-semibold border-b-2 transition duration-300 flex items-center justify-center gap-1.5 ${
            activeTab === 'lineups'
              ? 'border-copa-green text-copa-green bg-copa-green/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users size={16} />
          Escalações
        </button>
        {match.stage === 'GROUP' && (
          <button
            onClick={() => setActiveTab('group')}
            className={`flex-1 min-w-[100px] py-4 px-2 text-center text-xs sm:text-sm font-semibold border-b-2 transition duration-300 flex items-center justify-center gap-1.5 ${
              activeTab === 'group'
                ? 'border-copa-green text-copa-green bg-copa-green/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield size={16} />
            Classificação
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-6 bg-slate-900/30 flex-1 min-h-[350px] max-h-[500px] overflow-y-auto scrollbar-thin">

        {/* Far-future match: show placeholder for all tabs */}
        {isFarFuture ? (
          <div className="flex flex-col items-center justify-center h-full py-16 gap-4 text-slate-500">
            <Clock size={40} className="text-slate-700" />
            <p className="text-sm font-semibold text-slate-400">Dados ainda não disponíveis</p>
            <p className="text-xs text-center">
              Escalação, estatísticas e lance a lance serão carregados
              <br/>próximo ao início da partida.
            </p>
            <div className="text-xs text-slate-600 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
              {new Date(match.date).toLocaleString('pt-BR', {
                weekday: 'long', day: 'numeric', month: 'long',
                hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
              })}
            </div>
          </div>
        ) : (
        <>

        {/* Tab 1: Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-[19px] before:w-[2px] before:bg-slate-800">
            {match.events.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm flex flex-col items-center gap-4">
                {match.status === 'SCHEDULED' && !isNearKickoff && (
                  <>
                    <Clock size={32} className="text-slate-700" />
                    <p>Partida ainda não iniciada. O lance a lance começará junto com o apito inicial.</p>
                  </>
                )}
                {match.status === 'SCHEDULED' && isNearKickoff && (
                  <>
                    <Clock size={32} className="text-slate-700 animate-pulse" />
                    <p>Partida prestes a começar!<span className="block text-xs text-slate-600 mt-1">Atualizando a cada 5 minutos.</span></p>
                  </>
                )}
                {match.status === 'FINISHED' && (
                  <>
                    <Clock size={32} className="text-slate-700" />
                    <p>Nenhum evento registrado para esta partida.</p>
                  </>
                )}
                {match.status === 'LIVE' && (
                  <>
                    {/* Live score display */}
                    <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl px-8 py-4">
                      <div className="text-center">
                        <div className="text-lg">{homeTeam?.flag}</div>
                        <div className="text-xs text-slate-400 mt-1">{homeTeam?.name}</div>
                      </div>
                      <div className="text-2xl font-black font-mono text-white tabular-nums">
                        {match.homeScore ?? 0} — {match.awayScore ?? 0}
                      </div>
                      <div className="text-center">
                        <div className="text-lg">{awayTeam?.flag}</div>
                        <div className="text-xs text-slate-400 mt-1">{awayTeam?.name}</div>
                      </div>
                    </div>
                    {/* Monitoring indicator */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-copa-green animate-pulse shadow-[0_0_6px_theme(colors.copa-green)]"/>
                      <span>Monitorando em tempo real</span>
                    </div>
                    <p className="text-xs text-slate-600 max-w-xs leading-relaxed text-center">
                      Nenhum evento registrado ainda.<br/>
                      <span className="text-slate-700">Gols, cartões e substituições aparecerão aqui assim que acontecerem.</span>
                    </p>
                  </>
                )}
              </div>
            ) : (
              match.events.map((event) => {
                let icon = <Clock size={16} className="text-slate-400" />;
                let iconBg = 'bg-slate-900 border-slate-700';
                let cardBorder = 'border-copa-border';

                if (event.type === 'goal') {
                  icon = <span className="text-base">⚽</span>;
                  iconBg = 'bg-emerald-500/20 border-emerald-500';
                  cardBorder = 'border-emerald-500/30';
                } else if (event.type === 'yellow_card') {
                  icon = <div className="w-3 h-4 bg-yellow-400 rounded-sm shadow-sm"/>;
                  iconBg = 'bg-yellow-500/10 border-yellow-500/60';
                  cardBorder = 'border-yellow-500/20';
                } else if (event.type === 'red_card') {
                  icon = <div className="w-3 h-4 bg-red-600 rounded-sm shadow-sm"/>;
                  iconBg = 'bg-red-500/10 border-red-500/60';
                  cardBorder = 'border-red-500/20';
                } else if (event.type === 'substitution') {
                  icon = <ArrowLeftRight size={12} className="text-blue-400" />;
                  iconBg = 'bg-blue-500/10 border-blue-500/40';
                }

                const isHomeEvent = event.teamId?.toLowerCase() === match.homeTeamId.toLowerCase();
                const eventTeam = event.teamId ? (isHomeEvent ? homeTeam : awayTeam) : undefined;

                return (
                  <div key={event.id} className="flex gap-3 items-start relative group transition duration-300">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 z-10 shrink-0 mt-1 ${iconBg}`}>
                      {icon}
                    </div>

                    <div className={`flex-1 bg-slate-950/50 hover:bg-slate-950/80 border ${cardBorder} p-3 rounded-xl transition duration-300`}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          {/* Minute + type label */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black font-mono text-copa-green bg-copa-green/10 px-1.5 py-0.5 rounded border border-copa-green/20">
                              {event.minute}'
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">
                              {event.type === 'goal' ? 'Gol' :
                               event.type === 'yellow_card' ? 'Cartão Amarelo' :
                               event.type === 'red_card' ? 'Cartão Vermelho' :
                               event.type === 'substitution' ? 'Substituição' : event.type}
                            </span>
                          </div>
                          {/* Player name */}
                          {event.playerName && (
                            <span className="text-sm font-bold text-white truncate">{event.playerName}</span>
                          )}
                          {/* Description */}
                          <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{event.detail}</p>
                        </div>
                        {/* Team badge */}
                        {eventTeam && (
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 shrink-0">
                            <span className="text-base leading-none">{eventTeam.flag}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Statistics */}
        {activeTab === 'stats' && (() => {
          const hasStats = match.stats.possessionHome > 0 || match.stats.possessionAway > 0 ||
            match.stats.shotsHome > 0 || match.stats.shotsAway > 0;
          return hasStats ? (
            <div className="space-y-4 max-w-lg mx-auto">
              {renderStatBar('Posse de Bola (%)', match.stats.possessionHome, match.stats.possessionAway)}
              {renderStatBar('Total de Chutes', match.stats.shotsHome, match.stats.shotsAway)}
              {renderStatBar('Chutes no Gol', match.stats.shotsOnTargetHome, match.stats.shotsOnTargetAway)}
              {renderStatBar('Faltas Cometidas', match.stats.foulsHome, match.stats.foulsAway)}
              {renderStatBar('Escanteios', match.stats.cornersHome, match.stats.cornersAway)}
              {renderStatBar('Cartões Amarelos', match.stats.yellowHome, match.stats.yellowAway)}
              {renderStatBar('Cartões Vermelhos', match.stats.redHome, match.stats.redAway)}
              {renderStatBar('Impedimentos', match.stats.offsidesHome, match.stats.offsidesAway)}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-sm flex flex-col items-center gap-3">
              <BarChart3 size={32} className="text-slate-700" />
              {match.status === 'SCHEDULED' && <p>Estatísticas serão exibidas após o início da partida.</p>}
              {match.status === 'FINISHED' && <p>Estatísticas não disponíveis para esta partida.<br/><span className="text-xs text-slate-600">Selecione uma partida recente para carregar os dados via API.</span></p>}
              {match.status === 'LIVE' && <p>Carregando estatísticas em tempo real...</p>}
            </div>
          );
        })()}

        {/* Tab 3: Lineups */}
        {activeTab === 'lineups' && homeTeam && awayTeam && (
          <div className="flex flex-col gap-6">

            {/* Status/time banner */}
            {match.status === 'LIVE' && (
              <div className={`flex items-center justify-center gap-2 text-xs font-bold rounded-lg py-2 px-3 ${
                match.isHalftime
                  ? 'text-yellow-300 bg-yellow-500/10 border border-yellow-500/20'
                  : 'text-copa-green bg-copa-green/10 border border-copa-green/20'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse"/>
                {match.isHalftime
                  ? '⏸ Intervalo — Escalação pode ser alterada no segundo tempo'
                  : `▶ ${match.minute ?? '?'}' — Escalação atualizada com substituições`}
              </div>
            )}

            {/* Estimated lineup badge */}
            {!hasRealLineup && (
              <div className="flex items-center justify-center gap-2 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg py-2 px-3">
                <span>⚠️</span>
                <span className="font-semibold">Escalação estimada — dados oficiais carregados após o início da partida</span>
              </div>
            )}

            {/* Team + formation labels */}
            <div className="flex justify-between text-xs text-slate-400 font-semibold px-2">
              <div className="flex items-center gap-1.5">
                <span>{homeTeam.flag}</span>
                <span>{homeTeam.name}</span>
                {hasRealLineup && <span className="text-copa-green font-mono">({match.lineups!.home.formation})</span>}
                {homeSubCount > 0 && <span className="text-blue-400 text-[10px]">🔄 {homeSubCount}</span>}
              </div>
              <div className="flex items-center gap-1.5 text-right">
                {awaySubCount > 0 && <span className="text-blue-400 text-[10px]">🔄 {awaySubCount}</span>}
                {hasRealLineup && <span className="text-copa-accent font-mono">({match.lineups!.away.formation})</span>}
                <span>{awayTeam.name}</span>
                <span>{awayTeam.flag}</span>
              </div>
            </div>

            {/* Football Field */}
            <div className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl"
              style={{ aspectRatio: '3/4', background: 'linear-gradient(180deg, #0a2010 0%, #0d2a14 48%, #0a2010 100%)' }}>

              {[...Array(8)].map((_, i) => (
                <div key={i} className="absolute inset-x-0 pointer-events-none"
                  style={{ top: `${i * 12.5}%`, height: '12.5%', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }} />
              ))}
              <div className="absolute inset-2 border border-emerald-700/40 rounded-xl pointer-events-none" />
              <div className="absolute inset-x-0 top-1/2 h-px bg-emerald-700/40 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-emerald-700/40 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-700/60 pointer-events-none" />
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-10 border-b border-x border-emerald-700/40 pointer-events-none" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-10 border-t border-x border-emerald-700/40 pointer-events-none" />

              {/* Away team (top half): GK at top → FWD approaching midline */}
              {awayRows.map((row, rowIdx) => {
                const numRows = awayRows.length;
                // Spread from 4% (GK at top) to 43% (FWD near midline)
                const topPct = numRows > 1 ? 4 + rowIdx * (39 / (numRows - 1)) : 20;
                const isGk = rowIdx === 0;
                return row.players.length > 0 && (
                  <div key={`a${rowIdx}`} className="absolute inset-x-3 flex justify-around" style={{ top: `${topPct}%` }}>
                    {row.players.map((p: any) => (
                      <div key={p.id} className="flex flex-col items-center relative" style={{ minWidth: 34 }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg border-2"
                          style={{
                            background: p.isSubstitute ? '#7c3aed' : (isGk ? '#1e40af' : '#3b82f6'),
                            borderColor: p.isSubstitute ? '#c4b5fd' : '#93c5fd',
                            color: 'white'
                          }}>
                          {p.number ?? '?'}
                        </div>
                        {p.isSubstitute && <span className="absolute -top-1 -right-1 text-[8px] leading-none">🔄</span>}
                        <span className="text-[8px] text-white mt-0.5 bg-black/70 px-1 rounded truncate max-w-[44px] text-center leading-tight">
                          {(p.name ?? '').split(' ').pop()}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Home team (bottom half): FWD near midline → GK at bottom */}
              {[...homeRows].reverse().map((row, rowIdx) => {
                const numRows = homeRows.length;
                // Spread from 56% (FWD near midline) to 92% (GK at bottom)
                const topPct = numRows > 1 ? 56 + rowIdx * (36 / (numRows - 1)) : 75;
                const isGk = rowIdx === numRows - 1;
                return row.players.length > 0 && (
                  <div key={`h${rowIdx}`} className="absolute inset-x-3 flex justify-around" style={{ top: `${topPct}%` }}>
                    {row.players.map((p: any) => (
                      <div key={p.id} className="flex flex-col items-center relative" style={{ minWidth: 34 }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg border-2"
                          style={{
                            background: p.isSubstitute ? '#7c3aed' : (isGk ? '#065f46' : '#10b981'),
                            borderColor: p.isSubstitute ? '#c4b5fd' : '#6ee7b7',
                            color: isGk ? 'white' : 'black'
                          }}>
                          {p.number ?? '?'}
                        </div>
                        {p.isSubstitute && <span className="absolute -top-1 -right-1 text-[8px] leading-none">🔄</span>}
                        <span className="text-[8px] text-white mt-0.5 bg-black/70 px-1 rounded truncate max-w-[44px] text-center leading-tight">
                          {(p.name ?? '').split(' ').pop()}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Reserves */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-bold text-copa-green mb-2 flex items-center gap-1">
                  <span>{homeTeam.flag}</span> Reservas {homeTeam.name}
                </h4>
                {(hasRealLineup ? match.lineups!.home.reservas : hSquad.slice(11)).length === 0 ? (
                  <p className="text-slate-600 italic text-[10px]">Dados do banco não disponíveis.</p>
                ) : (
                  <ul className="space-y-1 text-slate-400">
                    {(hasRealLineup ? match.lineups!.home.reservas : hSquad.slice(11)).map(p => (
                      <li key={p.id} className="flex gap-2">
                        <span className="font-mono text-slate-500 w-4">{p.number}</span>
                        <span className="text-slate-300">{p.name}</span>
                        <span className="text-[10px] text-slate-500">({p.position[0]})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="font-bold text-copa-accent mb-2 flex items-center gap-1">
                  <span>{awayTeam.flag}</span> Reservas {awayTeam.name}
                </h4>
                {(hasRealLineup ? match.lineups!.away.reservas : aSquad.slice(11)).length === 0 ? (
                  <p className="text-slate-600 italic text-[10px]">Dados do banco não disponíveis.</p>
                ) : (
                  <ul className="space-y-1 text-slate-400">
                    {(hasRealLineup ? match.lineups!.away.reservas : aSquad.slice(11)).map(p => (
                      <li key={p.id} className="flex gap-2">
                        <span className="font-mono text-slate-500 w-4">{p.number}</span>
                        <span className="text-slate-300">{p.name}</span>
                        <span className="text-[10px] text-slate-500">({p.position[0]})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Standings */}
        {activeTab === 'group' && groupStandings.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-copa-border">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-copa-border">
                  <th className="py-3 px-4 text-center">Pos</th>
                  <th className="py-3 px-2">Seleção</th>
                  <th className="py-3 px-2 text-center">P</th>
                  <th className="py-3 px-2 text-center">J</th>
                  <th className="py-3 px-2 text-center">V</th>
                  <th className="py-3 px-2 text-center">E</th>
                  <th className="py-3 px-2 text-center">D</th>
                  <th className="py-3 px-2 text-center">GP</th>
                  <th className="py-3 px-2 text-center">SG</th>
                </tr>
              </thead>
              <tbody>
                {groupStandings.map((team, idx) => {
                  const isCurrentTeam = team.id === homeTeam?.id || team.id === awayTeam?.id;
                  
                  return (
                    <tr 
                      key={team.id} 
                      className={`border-b border-slate-950/40 last:border-0 hover:bg-slate-800/35 transition duration-200 ${
                        isCurrentTeam ? 'bg-slate-900/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex w-5 h-5 items-center justify-center rounded-full text-xs font-bold ${
                          idx < 2 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                            : 'text-slate-500'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-2 flex items-center gap-2">
                        <span className="text-lg">{team.flag}</span>
                        <span className={isCurrentTeam ? 'text-white' : 'text-slate-300'}>
                          {team.name}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center text-white font-mono">{team.points}</td>
                      <td className="py-3 px-2 text-center text-slate-400 font-mono">{team.played}</td>
                      <td className="py-3 px-2 text-center text-slate-400 font-mono">{team.wins}</td>
                      <td className="py-3 px-2 text-center text-slate-400 font-mono">{team.draws}</td>
                      <td className="py-3 px-2 text-center text-slate-400 font-mono">{team.losses}</td>
                      <td className="py-3 px-2 text-center text-slate-400 font-mono">{team.goalsFor}</td>
                      <td className={`py-3 px-2 text-center font-mono font-semibold ${
                        team.goalsDifference > 0 
                          ? 'text-emerald-400' 
                          : team.goalsDifference < 0 
                          ? 'text-red-400' 
                          : 'text-slate-400'
                      }`}>
                        {team.goalsDifference > 0 ? `+${team.goalsDifference}` : team.goalsDifference}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        </> 
        )}
      </div>
    </div>
  );
};
