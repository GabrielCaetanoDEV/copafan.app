import React, { useState, useEffect } from 'react';
import { Match, Team, Stadium } from '../../data/copaData';
import { Play, Tv, Calendar, MapPin, Award } from 'lucide-react';

interface LivePlayerProps {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
  stadium?: Stadium;
}

export const LivePlayer: React.FC<LivePlayerProps> = ({ match, homeTeam, awayTeam, stadium }) => {
  const [isPlaying, setIsPlaying] = useState(false);
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
    minute: '2-digit'
  });

  // Render scheduled preview card
  if (match.status === 'SCHEDULED' && !isPlaying) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden glass-panel flex flex-col justify-center items-center p-6 text-center group border-copa-border">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-copa-bg via-transparent to-transparent opacity-90 z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent z-0"></div>
        
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

          <div className="flex flex-col items-center gap-1.5 text-slate-400 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <MapPin size={14} className="text-copa-gold" />
              <span>{stadium?.name} - {stadium?.city}</span>
            </div>
            <div className="capitalize">{formattedDate}</div>
          </div>

          <button
            onClick={() => setIsPlaying(true)}
            className="mt-6 px-6 py-3 bg-copa-card hover:bg-copa-card-hover border border-copa-border hover:border-copa-green/50 text-white rounded-full font-semibold text-sm transition duration-300 flex items-center gap-2 shadow-lg"
          >
            <Play size={16} className="text-copa-green fill-copa-green" />
            Forçar Abertura da CazéTV
          </button>
        </div>
      </div>
    );
  }

  // Render Finished preview card
  if (match.status === 'FINISHED' && !isPlaying) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden glass-panel flex flex-col justify-center items-center p-6 text-center group border-copa-border">
        <div className="absolute inset-0 bg-gradient-to-t from-copa-bg via-transparent to-transparent opacity-90 z-0"></div>
        
        <div className="z-10 flex flex-col items-center max-w-lg">
          <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold text-slate-400 border border-slate-700 mb-4 inline-flex items-center gap-1.5 uppercase tracking-wider">
            <Award size={12} />
            Encerrado
          </span>

          <div className="flex justify-center items-center gap-6 sm:gap-12 mb-6">
            <div className="flex flex-col items-center">
              <span className="text-5xl filter drop-shadow-md">{homeTeam?.flag}</span>
              <span className="text-sm font-semibold mt-2 text-slate-300">{homeTeam?.name}</span>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-950/80 px-5 py-2 rounded-2xl border border-copa-border">
              <span className="text-3xl font-bold font-mono text-white">{match.homeScore}</span>
              <span className="text-slate-500 font-bold">-</span>
              <span className="text-3xl font-bold font-mono text-white">{match.awayScore}</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-5xl filter drop-shadow-md">{awayTeam?.flag}</span>
              <span className="text-sm font-semibold mt-2 text-slate-300">{awayTeam?.name}</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-2">Partida Finalizada</h3>
          <p className="text-slate-400 text-xs sm:text-sm mb-6 max-w-sm">
            Esta partida já foi concluída no {stadium?.name}. Clique abaixo para assistir aos melhores momentos da CazéTV.
          </p>

          <button
            onClick={() => setIsPlaying(true)}
            className="px-6 py-3 bg-copa-gold hover:bg-copa-gold-hover text-black rounded-full font-bold text-sm transition duration-300 flex items-center gap-2 shadow-lg glow-gold"
          >
            <Play size={16} className="fill-black" />
            Assistir Replay / Melhores Momentos
          </button>
        </div>
      </div>
    );
  }

  // Render YouTube IFrame player for Live (or if user forced playing on scheduled/finished)
  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden glass-panel border border-copa-border shadow-2xl">
      <iframe
        src={`https://www.youtube.com/embed/${match.youtubeId}?autoplay=1&mute=1&enablejsapi=1`}
        title={`Transmissão do Jogo ${homeTeam?.name} vs ${awayTeam?.name}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full border-0"
      ></iframe>
      
      {match.status === 'LIVE' && (
        <div className="absolute top-4 left-4 bg-red-650 bg-red-650 bg-red-600 border border-red-500 text-white font-bold text-xs uppercase px-2.5 py-1 rounded-md animate-pulse flex items-center gap-1.5 shadow-md">
          <Tv size={12} />
          CazéTV Ao Vivo
        </div>
      )}
    </div>
  );
};
