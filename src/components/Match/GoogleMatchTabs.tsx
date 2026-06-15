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

  const hSquad = homeTeam ? generateSquad(homeTeam.id) : [];
  const aSquad = awayTeam ? generateSquad(awayTeam.id) : [];

  // Group players by position for field layout
  const getPlayersByPosition = (squad: any[]) => {
    return {
      Goleiro: squad.filter(p => p.position === 'Goleiro').slice(0, 1),
      Defensor: squad.filter(p => p.position === 'Defensor').slice(0, 4), // assume 4-4-2 / 4-3-3
      MeioCampista: squad.filter(p => p.position === 'Meio-campista').slice(0, 3),
      Atacante: squad.filter(p => p.position === 'Atacante').slice(0, 3)
    };
  };

  const homeLayout = getPlayersByPosition(hSquad);
  const awayLayout = getPlayersByPosition(aSquad);

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
        
        {/* Tab 1: Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-[19px] before:w-[2px] before:bg-slate-800">
            {match.events.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                Partida ainda não iniciada. A narração em tempo real começará junto com o apito inicial.
              </div>
            ) : (
              match.events.map((event) => {
                let icon = <Clock size={16} className="text-slate-400" />;
                let iconBg = 'bg-slate-900 border-slate-700';

                if (event.type === 'goal') {
                  icon = <span className="font-bold text-xs text-black">⚽</span>;
                  iconBg = 'bg-copa-green border-copa-green glow-green';
                } else if (event.type === 'yellow_card') {
                  icon = <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm"></div>;
                  iconBg = 'bg-slate-950 border-yellow-500/50';
                } else if (event.type === 'red_card') {
                  icon = <div className="w-2.5 h-3.5 bg-red-650 bg-red-600 rounded-sm"></div>;
                  iconBg = 'bg-slate-950 border-red-500/50';
                } else if (event.type === 'substitution') {
                  icon = <ArrowLeftRight size={12} className="text-emerald-400" />;
                  iconBg = 'bg-slate-950 border-slate-700';
                }

                const eventTeam = event.teamId === match.homeTeamId ? homeTeam : awayTeam;

                return (
                  <div key={event.id} className="flex gap-4 items-start relative group transition duration-300">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 shrink-0 ${iconBg}`}>
                      {icon}
                    </div>
                    
                    <div className="flex-1 bg-slate-950/45 hover:bg-slate-950/80 border border-copa-border p-3.5 rounded-xl transition duration-300">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold font-mono text-glow-green text-copa-green bg-copa-green/5 px-2 py-0.5 rounded-md border border-copa-green/10">
                          {event.minute}'
                        </span>
                        {eventTeam && (
                          <span className="text-[10px] sm:text-xs text-slate-400 font-semibold flex items-center gap-1">
                            <span>{eventTeam.flag}</span>
                            <span>{eventTeam.name}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">{event.detail}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Statistics */}
        {activeTab === 'stats' && (
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
        )}

        {/* Tab 3: Lineups */}
        {activeTab === 'lineups' && homeTeam && awayTeam && (
          <div className="flex flex-col gap-8">
            {/* Visual Football Field */}
            <div className="relative w-full aspect-[4/5] max-w-md mx-auto rounded-3xl overflow-hidden bg-gradient-to-b from-[#14301a] to-[#07170a] border border-emerald-900/60 p-4 shadow-2xl flex flex-col justify-between">
              
              {/* Field Markings */}
              <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none border border-emerald-800/40 m-2.5 rounded-2xl"></div>
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-emerald-800/40 pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-emerald-800/40 pointer-events-none"></div>
              {/* Goal Area Top */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-40 h-16 border-b border-x border-emerald-800/40 pointer-events-none"></div>
              {/* Goal Area Bottom */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-40 h-16 border-t border-x border-emerald-800/40 pointer-events-none"></div>

              {/* Away Team (Top - playing down) */}
              <div className="flex flex-col justify-between flex-1 pb-4 z-10">
                {/* Away Goalkeeper */}
                <div className="flex justify-center">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-copa-accent border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-md">
                      {awayLayout.Goleiro[0]?.number}
                    </div>
                    <span className="text-[10px] text-white mt-1 bg-black/60 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                      {awayLayout.Goleiro[0]?.name.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Away Defenders */}
                <div className="flex justify-around">
                  {awayLayout.Defensor.map((p) => (
                    <div key={p.id} className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-copa-accent border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-md">
                        {p.number}
                      </div>
                      <span className="text-[10px] text-white mt-1 bg-black/60 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                        {p.name.split(' ').pop()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Away Midfielders */}
                <div className="flex justify-around">
                  {awayLayout.MeioCampista.map((p) => (
                    <div key={p.id} className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-copa-accent border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-md">
                        {p.number}
                      </div>
                      <span className="text-[10px] text-white mt-1 bg-black/60 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                        {p.name.split(' ').pop()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Away Strikers */}
                <div className="flex justify-around">
                  {awayLayout.Atacante.map((p) => (
                    <div key={p.id} className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-copa-accent border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-md">
                        {p.number}
                      </div>
                      <span className="text-[10px] text-white mt-1 bg-black/60 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                        {p.name.split(' ').pop()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Home Team (Bottom - playing up) */}
              <div className="flex flex-col-reverse justify-between flex-1 pt-4 z-10 border-t border-emerald-800/10">
                {/* Home Goalkeeper */}
                <div className="flex justify-center">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-copa-green border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-black shadow-md">
                      {homeLayout.Goleiro[0]?.number}
                    </div>
                    <span className="text-[10px] text-white mt-1 bg-black/60 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                      {homeLayout.Goleiro[0]?.name.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Home Defenders */}
                <div className="flex justify-around">
                  {homeLayout.Defensor.map((p) => (
                    <div key={p.id} className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-copa-green border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-black shadow-md">
                        {p.number}
                      </div>
                      <span className="text-[10px] text-white mt-1 bg-black/60 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                        {p.name.split(' ').pop()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Home Midfielders */}
                <div className="flex justify-around">
                  {homeLayout.MeioCampista.map((p) => (
                    <div key={p.id} className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-copa-green border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-black shadow-md">
                        {p.number}
                      </div>
                      <span className="text-[10px] text-white mt-1 bg-black/60 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                        {p.name.split(' ').pop()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Home Strikers */}
                <div className="flex justify-around">
                  {homeLayout.Atacante.map((p) => (
                    <div key={p.id} className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-copa-green border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-black shadow-md">
                        {p.number}
                      </div>
                      <span className="text-[10px] text-white mt-1 bg-black/60 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                        {p.name.split(' ').pop()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reserves / Squad Bench list */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-bold text-copa-green mb-2 flex items-center gap-1">
                  <span>{homeTeam.flag}</span> Reserves {homeTeam.name}
                </h4>
                <ul className="space-y-1 text-slate-400">
                  {hSquad.slice(11).map(p => (
                    <li key={p.id} className="flex gap-2">
                      <span className="font-mono text-slate-500 w-4">{p.number}</span>
                      <span className="text-slate-300">{p.name}</span>
                      <span className="text-[10px] text-slate-500">({p.position[0]})</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-copa-accent mb-2 flex items-center gap-1">
                  <span>{awayTeam.flag}</span> Reserves {awayTeam.name}
                </h4>
                <ul className="space-y-1 text-slate-400">
                  {aSquad.slice(11).map(p => (
                    <li key={p.id} className="flex gap-2">
                      <span className="font-mono text-slate-500 w-4">{p.number}</span>
                      <span className="text-slate-300">{p.name}</span>
                      <span className="text-[10px] text-slate-500">({p.position[0]})</span>
                    </li>
                  ))}
                </ul>
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
      </div>
    </div>
  );
};
