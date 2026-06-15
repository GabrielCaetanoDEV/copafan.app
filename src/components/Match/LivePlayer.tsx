import React, { useState, useEffect } from 'react';
import { Match, Team, Stadium } from '../../data/copaData';
import { Tv, Calendar, MapPin, Award, ExternalLink } from 'lucide-react';

interface LivePlayerProps {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
  stadium?: Stadium;
}

// Busca dinamicamente vídeos da CazéTV no YouTube usando o nome dos times
function getCazeTVSearchUrl(homeTeam?: Team, awayTeam?: Team): string {
  const query = homeTeam && awayTeam
    ? `CazéTV ${homeTeam.name} ${awayTeam.name} melhores momentos Copa 2026`
    : 'CazéTV melhores momentos Copa do Mundo 2026';
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

// Link direto para a playlist oficial de Melhores Momentos da CazéTV
const CAZETU_PLAYLIST = 'https://www.youtube.com/playlist?list=PLsFWLnYCEXEVNzCnkQE-xOuMc8oLxSleC';
// Canal CazéTV
const CAZETU_CHANNEL = 'https://www.youtube.com/@CazeTV';

export const LivePlayer: React.FC<LivePlayerProps> = ({ match, homeTeam, awayTeam, stadium }) => {
  const [timeLeft, setTimeLeft] = useState('');

  // Countdown timer for scheduled matches
  useEffect(() => {
    if (match.status !== 'SCHEDULED') return;

    const interval = setInterval(() => {
      const diff = new Date(match.date).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft('Começando agora!');
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        let str = '';
        if (days > 0) str += `${days}d `;
        str += `${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
        setTimeLeft(str);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [match]);

  const formattedDate = new Date(match.date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  const searchUrl = getCazeTVSearchUrl(homeTeam, awayTeam);

  // ================================================================
  // SCHEDULED — countdown card
  // ================================================================
  if (match.status === 'SCHEDULED') {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden glass-panel flex flex-col justify-center items-center p-6 text-center group border-copa-border">
        <div className="absolute inset-0 bg-gradient-to-t from-copa-bg via-transparent to-transparent opacity-90 z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.12)_0%,_transparent_60%)] z-0" />

        <div className="z-10 flex flex-col items-center max-w-lg">
          <span className="px-3 py-1 bg-copa-card rounded-full text-xs font-semibold text-copa-gold border border-copa-gold/30 mb-4 inline-flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar size={12} />
            Agendado
          </span>

          <div className="flex justify-center items-center gap-8 mb-6">
            <div className="flex flex-col items-center">
              <span className="text-5xl filter drop-shadow-lg transform group-hover:scale-110 transition duration-300">{homeTeam?.flag}</span>
              <span className="text-sm font-semibold mt-2 text-slate-300">{homeTeam?.name}</span>
            </div>
            <span className="text-2xl font-bold text-slate-500">VS</span>
            <div className="flex flex-col items-center">
              <span className="text-5xl filter drop-shadow-lg transform group-hover:scale-110 transition duration-300">{awayTeam?.flag}</span>
              <span className="text-sm font-semibold mt-2 text-slate-300">{awayTeam?.name}</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-2 font-display">Contagem Regressiva</h3>
          <div className="text-2xl font-mono font-bold text-glow-green text-copa-green mb-6 bg-slate-950/60 px-6 py-2 rounded-xl border border-copa-green/20 min-w-[200px]">
            {timeLeft || 'Carregando...'}
          </div>

          <div className="flex flex-col items-center gap-1.5 text-slate-400 text-xs sm:text-sm mb-5">
            <div className="flex items-center gap-1">
              <MapPin size={14} className="text-copa-gold" />
              <span>{stadium?.name} — {stadium?.city}</span>
            </div>
            <div className="capitalize">{formattedDate}</div>
          </div>

          {/* CazéTV links */}
          <div className="flex gap-3 flex-wrap justify-center">
            <a
              href={CAZETU_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold text-xs sm:text-sm transition duration-300 flex items-center gap-2 shadow-lg"
            >
              <Tv size={15} />
              Canal CazéTV
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // FINISHED — show score card + direct links to CazéTV highlights
  // ================================================================
  if (match.status === 'FINISHED') {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden glass-panel flex flex-col justify-center items-center p-6 text-center group border-copa-border">
        <div className="absolute inset-0 bg-gradient-to-t from-copa-bg via-transparent to-transparent opacity-90 z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,255,135,0.04)_0%,_transparent_60%)] z-0" />

        <div className="z-10 flex flex-col items-center max-w-lg">
          <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold text-slate-400 border border-slate-700 mb-4 inline-flex items-center gap-1.5 uppercase tracking-wider">
            <Award size={12} />
            Encerrado
          </span>

          <div className="flex justify-center items-center gap-6 sm:gap-12 mb-5">
            <div className="flex flex-col items-center">
              <span className="text-5xl filter drop-shadow-md">{homeTeam?.flag}</span>
              <span className="text-sm font-semibold mt-2 text-slate-300">{homeTeam?.name}</span>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/80 px-5 py-2 rounded-2xl border border-copa-border">
              <span className="text-3xl font-bold font-mono text-white">{match.homeScore}</span>
              <span className="text-slate-500 font-bold">×</span>
              <span className="text-3xl font-bold font-mono text-white">{match.awayScore}</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-5xl filter drop-shadow-md">{awayTeam?.flag}</span>
              <span className="text-sm font-semibold mt-2 text-slate-300">{awayTeam?.name}</span>
            </div>
          </div>

          <p className="text-slate-400 text-xs sm:text-sm mb-5 max-w-sm">
            Partida finalizada em <strong className="text-slate-300">{stadium?.name}</strong>. 
            Assista aos melhores momentos no canal oficial da CazéTV no YouTube.
          </p>

          {/* CazéTV action buttons */}
          <div className="flex gap-3 flex-wrap justify-center">
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-copa-gold hover:bg-copa-gold-hover text-black rounded-full font-bold text-xs sm:text-sm transition duration-300 flex items-center gap-2 shadow-lg glow-gold"
            >
              <Tv size={15} />
              Melhores Momentos
              <ExternalLink size={12} />
            </a>
            <a
              href={CAZETU_PLAYLIST}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-copa-border text-white rounded-full font-semibold text-xs sm:text-sm transition duration-300 flex items-center gap-2"
            >
              Playlist Copa 2026
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // LIVE — Provide a link to CazéTV since they block embedding
  // ================================================================
  const cazeTvLiveUrl = 'https://www.youtube.com/@CazeTV/live';

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden glass-panel flex flex-col justify-center items-center p-6 text-center group border-copa-border shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-t from-copa-bg via-transparent to-transparent opacity-90 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(220,38,38,0.1)_0%,_transparent_60%)] z-0" />

      <div className="absolute top-4 left-4 bg-red-600 border border-red-500 text-white font-bold text-xs uppercase px-2.5 py-1 rounded-md animate-pulse flex items-center gap-1.5 shadow-md pointer-events-none z-20">
        <Tv size={12} />
        Ao Vivo
      </div>

      <div className="z-10 flex flex-col items-center max-w-lg">
        <div className="flex justify-center items-center gap-6 sm:gap-12 mb-5">
          <div className="flex flex-col items-center">
            <span className="text-5xl filter drop-shadow-md">{homeTeam?.flag}</span>
            <span className="text-sm font-semibold mt-2 text-slate-300">{homeTeam?.name}</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 bg-red-950/40 px-5 py-2 rounded-2xl border border-red-900/50">
              <span className="text-3xl font-bold font-mono text-white">{match.homeScore}</span>
              <span className="text-slate-500 font-bold">×</span>
              <span className="text-3xl font-bold font-mono text-white">{match.awayScore}</span>
            </div>
            {match.minute && (
              <span className="text-xs font-bold text-red-500 animate-pulse bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                {match.minute}' Minuto
              </span>
            )}
          </div>

          <div className="flex flex-col items-center">
            <span className="text-5xl filter drop-shadow-md">{awayTeam?.flag}</span>
            <span className="text-sm font-semibold mt-2 text-slate-300">{awayTeam?.name}</span>
          </div>
        </div>

        <p className="text-slate-400 text-xs sm:text-sm mb-6 max-w-sm">
          A partida está rolando no <strong className="text-slate-300">{stadium?.name}</strong>. 
          A CazéTV não permite reproduzir a live fora do YouTube, clique abaixo para assistir:
        </p>

        <div className="flex gap-3 flex-wrap justify-center">
          <a
            href={cazeTvLiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold text-sm transition duration-300 flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
          >
            <Tv size={16} />
            Assistir na CazéTV
            <ExternalLink size={14} className="ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};
