import React, { useState, useRef } from 'react';
import { useCopa } from '../../context/CopaContext';
import { BracketNode } from '../../data/copaData';
import { STADIUMS } from '../../data/copaData';
import { Award, MapPin, HelpCircle } from 'lucide-react';

export const BracketView: React.FC = () => {
  const { bracketNodes, teams } = useCopa();
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDown(true);
    if (!containerRef.current) return;
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const stages = {
    ROUND_OF_32: bracketNodes.filter(n => n.stage === 'ROUND_OF_32'),
    ROUND_OF_16: bracketNodes.filter(n => n.stage === 'ROUND_OF_16'),
    QUARTER_FINALS: bracketNodes.filter(n => n.stage === 'QUARTER_FINALS'),
    SEMI_FINALS: bracketNodes.filter(n => n.stage === 'SEMI_FINALS'),
    FINAL: bracketNodes.filter(n => n.stage === 'FINAL'),
  };

  const hasR32 = stages.ROUND_OF_32.length > 0;

  const renderTeamRow = (teamId: string | null, placeholder: string, score: number | null, isWinner: boolean) => {
    const team = teamId ? teams.find(t => t.id === teamId) : null;
    const isHovered = teamId && teamId === hoveredTeamId;
    const hasScore = score !== null;

    return (
      <div
        onMouseEnter={() => teamId && setHoveredTeamId(teamId)}
        onMouseLeave={() => setHoveredTeamId(null)}
        className={`flex items-center justify-between px-3 py-2.5 transition duration-300 ${
          isWinner ? 'bg-slate-900/40' : ''
        } ${
          isHovered
            ? 'bg-copa-green/[0.07] text-copa-green border-l-4 border-l-copa-green'
            : 'border-l-4 border-l-transparent'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden w-[75%]">
          {team ? (
            <>
              <span className="text-xl shrink-0">{team.flag}</span>
              <span className={`text-xs font-semibold truncate ${isWinner ? 'text-white' : 'text-slate-400'}`}>
                {team.name}
              </span>
            </>
          ) : (
            <>
              <HelpCircle size={14} className="text-slate-600 shrink-0" />
              <span className="text-xs text-slate-500 font-medium truncate italic">{placeholder}</span>
            </>
          )}
        </div>

        <div className={`text-xs font-mono font-bold w-6 text-center ${
          isWinner ? 'text-copa-green' : hasScore ? 'text-slate-500' : 'text-slate-700'
        }`}>
          {hasScore ? score : '-'}
        </div>
      </div>
    );
  };

  const renderMatchCard = (node: BracketNode) => {
    const isHomeWinner = node.winnerId !== null && node.winnerId === node.homeTeamId;
    const isAwayWinner = node.winnerId !== null && node.winnerId === node.awayTeamId;
    const nodeStadium = STADIUMS.find(s => s.id === node.stadiumId);
    const date = new Date(node.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const time = new Date(node.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
      <div
        key={node.id}
        className="glass-panel w-[190px] sm:w-[215px] rounded-2xl overflow-hidden border border-copa-border shadow-md hover:border-slate-600 hover:shadow-xl transition duration-300 flex flex-col justify-between"
      >
        <div className="bg-slate-950/70 border-b border-copa-border py-1 px-3 flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          <span>{node.id.replace('_', ' ')}</span>
          <span className="font-mono">{date} · {time}</span>
        </div>

        <div className="divide-y divide-copa-border bg-slate-950/20">
          {renderTeamRow(node.homeTeamId, node.homeTeamPlaceholder, node.homeScore, isHomeWinner)}
          {renderTeamRow(node.awayTeamId, node.awayTeamPlaceholder, node.awayScore, isAwayWinner)}
        </div>

        <div className="bg-slate-950/45 py-1 px-3 border-t border-copa-border text-[9px] text-slate-500 flex items-center gap-1">
          <MapPin size={9} className="text-copa-gold" />
          <span className="truncate">{nodeStadium?.name || 'Estádio'}</span>
        </div>
      </div>
    );
  };

  // Calculate min width based on columns
  const colCount = (hasR32 ? 1 : 0) + 4; // R32 + R16 + QF + SF + F
  const minWidth = colCount * 240 + 200;

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="text-copa-gold" size={24} />
            Mata-Mata Interativo
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Passe o mouse sobre as seleções para iluminar sua caminhada. Clique e arraste para navegar horizontalmente.
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="flex-1 overflow-x-auto overflow-y-hidden select-none py-6 px-4 cursor-grab active:cursor-grabbing scrollbar-thin bg-slate-950/20 border border-copa-border rounded-3xl"
      >
        <div
          className="flex gap-8 sm:gap-12 h-[780px] items-center"
          style={{ minWidth: `${minWidth}px` }}
        >
          {/* Column 1: Round of 32 (only show for Copa 2026 with 48 teams) */}
          {hasR32 && (
            <div className="flex flex-col justify-around h-full gap-2">
              <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">16avos de Final</div>
              <div className="flex flex-col gap-2 overflow-y-auto max-h-full scrollbar-thin pr-1">
                {stages.ROUND_OF_32.map(node => renderMatchCard(node))}
              </div>
            </div>
          )}

          {/* Column 2: Round of 16 */}
          <div className="flex flex-col justify-around h-full py-4 gap-2">
            <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">Oitavas de Final</div>
            {stages.ROUND_OF_16.map(node => renderMatchCard(node))}
          </div>

          {/* Column 3: Quarterfinals */}
          <div className="flex flex-col justify-around h-full py-10 gap-2">
            <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">Quartas de Final</div>
            {stages.QUARTER_FINALS.map(node => renderMatchCard(node))}
          </div>

          {/* Column 4: Semifinals */}
          <div className="flex flex-col justify-around h-full py-24 gap-2">
            <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">Semifinais</div>
            {stages.SEMI_FINALS.map(node => renderMatchCard(node))}
          </div>

          {/* Column 5: Final */}
          <div className="flex flex-col justify-center h-full gap-12">
            <div>
              <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Grande Final</div>
              {stages.FINAL.map(node => (
                <div key={node.id} className="relative flex flex-col items-center">
                  <div className="absolute -inset-2 bg-gradient-to-r from-copa-gold/20 via-transparent to-copa-gold/20 rounded-3xl blur-md pointer-events-none"></div>
                  {renderMatchCard(node)}
                  <div className="mt-8 flex flex-col items-center gap-1">
                    <span className="text-5xl filter drop-shadow-[0_0_15px_rgba(243,198,63,0.4)]">🏆</span>
                    <span className="text-xs font-bold text-copa-gold uppercase tracking-widest mt-2 font-display">MetLife Stadium · NY</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
