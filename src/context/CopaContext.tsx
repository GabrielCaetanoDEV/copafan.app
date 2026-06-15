import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

import {
  Team,
  Match,
  BracketNode,
  INITIAL_TEAMS,
  generateGroupMatches,
  calculateStandings,
  generateKnockoutBracket,
  STADIUMS,
  MatchStats,
  MatchEvent,
  generateSquad,
} from '../data/copaData';

// ==============================================================
// TYPES
// ==============================================================
interface CopaContextType {
  teams: Team[];
  matches: Match[];
  bracketNodes: BracketNode[];
  selectedMatchId: string | null;
  selectedTeamId: string | null;
  activeTab: 'matches' | 'standings' | 'bracket' | 'teams';
  apiKey: string;
  isApiMode: boolean;
  isLoading: boolean;
  lastUpdated: Date | null;
  setApiKey: (key: string) => void;
  setSelectedMatchId: (id: string | null) => void;
  setSelectedTeamId: (id: string | null) => void;
  setActiveTab: (tab: 'matches' | 'standings' | 'bracket' | 'teams') => void;
  updateMatchScore: (matchId: string, homeScore: number, awayScore: number, status: 'FINISHED' | 'LIVE' | 'SCHEDULED') => void;
  refreshFromApi: () => void;
}

const CopaContext = createContext<CopaContextType | undefined>(undefined);

// ==============================================================
// TEAM TRANSLATIONS - All 48 Copa 2026 teams + extras
// ==============================================================
const TEAM_TRANSLATIONS: Record<string, { name: string; flag: string }> = {
  // Group A
  MEX: { name: 'México', flag: '🇲🇽' },
  RSA: { name: 'África do Sul', flag: '🇿🇦' },
  KOR: { name: 'Coreia do Sul', flag: '🇰🇷' },
  CZE: { name: 'Chéquia', flag: '🇨🇿' },
  // Group B
  CAN: { name: 'Canadá', flag: '🇨🇦' },
  BIH: { name: 'Bósnia e Herzegovina', flag: '🇧🇦' },
  QAT: { name: 'Catar', flag: '🇶🇦' },
  SUI: { name: 'Suíça', flag: '🇨🇭' },
  // Group C
  BRA: { name: 'Brasil', flag: '🇧🇷' },
  MAR: { name: 'Marrocos', flag: '🇲🇦' },
  HAI: { name: 'Haiti', flag: '🇭🇹' },
  SCO: { name: 'Escócia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  // Group D
  USA: { name: 'Estados Unidos', flag: '🇺🇸' },
  PAR: { name: 'Paraguai', flag: '🇵🇾' },
  AUS: { name: 'Austrália', flag: '🇦🇺' },
  TUR: { name: 'Turquia', flag: '🇹🇷' },
  // Group E
  GER: { name: 'Alemanha', flag: '🇩🇪' },
  CUW: { name: 'Curaçau', flag: '🇨🇼' },
  CIV: { name: 'Costa do Marfim', flag: '🇨🇮' },
  ECU: { name: 'Equador', flag: '🇪🇨' },
  // Group F
  NED: { name: 'Holanda', flag: '🇳🇱' },
  JPN: { name: 'Japão', flag: '🇯🇵' },
  SWE: { name: 'Suécia', flag: '🇸🇪' },
  TUN: { name: 'Tunísia', flag: '🇹🇳' },
  // Group G
  BEL: { name: 'Bélgica', flag: '🇧🇪' },
  EGY: { name: 'Egito', flag: '🇪🇬' },
  IRN: { name: 'Irã', flag: '🇮🇷' },
  NZL: { name: 'Nova Zelândia', flag: '🇳🇿' },
  // Group H
  ESP: { name: 'Espanha', flag: '🇪🇸' },
  CPV: { name: 'Cabo Verde', flag: '🇨🇻' },
  KSA: { name: 'Arábia Saudita', flag: '🇸🇦' },
  URY: { name: 'Uruguai', flag: '🇺🇾' },
  // Group I
  FRA: { name: 'França', flag: '🇫🇷' },
  SEN: { name: 'Senegal', flag: '🇸🇳' },
  IRQ: { name: 'Iraque', flag: '🇮🇶' },
  NOR: { name: 'Noruega', flag: '🇳🇴' },
  // Group J
  ARG: { name: 'Argentina', flag: '🇦🇷' },
  ALG: { name: 'Argélia', flag: '🇩🇿' },
  AUT: { name: 'Áustria', flag: '🇦🇹' },
  JOR: { name: 'Jordânia', flag: '🇯🇴' },
  // Group K
  POR: { name: 'Portugal', flag: '🇵🇹' },
  COD: { name: 'RD Congo', flag: '🇨🇩' },
  UZB: { name: 'Uzbequistão', flag: '🇺🇿' },
  COL: { name: 'Colômbia', flag: '🇨🇴' },
  // Group L
  ENG: { name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  CRO: { name: 'Croácia', flag: '🇭🇷' },
  GHA: { name: 'Gana', flag: '🇬🇭' },
  PAN: { name: 'Panamá', flag: '🇵🇦' },
  // Extra/legacy mappings
  SRB: { name: 'Sérvia', flag: '🇷🇸' },
  POL: { name: 'Polônia', flag: '🇵🇱' },
  DEN: { name: 'Dinamarca', flag: '🇩🇰' },
  UKR: { name: 'Ucrânia', flag: '🇺🇦' },
  CHI: { name: 'Chile', flag: '🇨🇱' },
  PER: { name: 'Peru', flag: '🇵🇪' },
  HON: { name: 'Honduras', flag: '🇭🇳' },
  SLV: { name: 'El Salvador', flag: '🇸🇻' },
  JAM: { name: 'Jamaica', flag: '🇯🇲' },
  ITA: { name: 'Itália', flag: '🇮🇹' },
  NGA: { name: 'Nigéria', flag: '🇳🇬' },
  CMR: { name: 'Camarões', flag: '🇨🇲' },
  SUI_OLD: { name: 'Suíça', flag: '🇨🇭' },
  WAL: { name: 'País de Gales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
};

// ==============================================================
    while (usedMinutes.has(m)) m = m === max ? min : m + 1;
    usedMinutes.add(m);
    return m;
  }

  const homeGoalMins: number[] = [];
  const awayGoalMins: number[] = [];

  for (let i = 0; i < homeScore; i++) {
    homeGoalMins.push(randMin(8, 88));
  }
  for (let i = 0; i < awayScore; i++) {
    awayGoalMins.push(randMin(8, 88));
  }

  const GOAL_DETAILS = [
    'GOOOOL! Chute preciso no ângulo, sem chances para o goleiro!',
    'GOLAÇO! Após linda tabela, finalização na saída do arqueiro!',
    'GOL! Na cobrança de pênalti, batida firme no canto!',
    'GOL DE PLACA! Driblou dois defensores e bateu colocado!',
    'GOOOOOL! Cabeceio certeiro após escanteio, a bola entrou no canto!',
    'GOL! No rebote! O chute explodiu na trave e o atacante completou!',
    'GOOOOL! Chute rasteiro cruzado, o goleiro não chegou a tempo!',
  ];

  const MISS_DETAILS = [
    'Chutou para fora! Que chance perdida de abrir vantagem!',
    'Passou raspando a trave! A torcida ficou em êxtase com a chance!',
    'DEFESAÇA! O goleiro voa no ângulo e espalma para escanteio!',
    'Cabeceio após escanteio, mas a bola saiu por cima do travessão.',
    'Finalização sem força, a bola rola mansa para fora.',
  ];

  const GENERAL_COMMENTS = [
    'Troca passes com paciência no meio de campo, buscando espaços.',
    'A defesa adversária se fecha bem e impede a chegada.',
    'Pressão alta no campo ofensivo força o erro de passe.',
    'Boa jogada coletiva, mas a finalização saiu pela linha de fundo.',
    'A partida está equilibrada, com as duas equipes apostando no contra-ataque.',
    'Falta marcada. Entrada mais forte para parar a jogada no meio-campo.',
    'Cartão Amarelo! Entrada dura por trás, punição merecida.',
    'Escanteio cobrado na primeira trave, a defesa afasta de cabeça.',
    'Substituição tática: treinador busca mais velocidade no ataque.',
  ];

  // Kick-off
  events.push({
    id: `${matchId}_start`,
    minute: 1,
    type: 'comment',
    detail: 'Apita o árbitro! A bola está rolando! Começa a partida.',
  });

  // Half-time
  events.push({
    id: `${matchId}_ht`,
    minute: 45,
    type: 'comment',
    detail: 'INTERVALO! O árbitro apita o fim do primeiro tempo. As equipes vão para o vestiário.',
  });

  // Generate home goals
  homeGoalMins.forEach((min, i) => {
    const squad = generateSquad(homeTla.toLowerCase());
    const scorer = squad[Math.floor(Math.random() * 8) + 13];
    events.push({
      id: `${matchId}_hg_${i}`,
      minute: min,
      type: 'goal',
      teamId: homeTla.toLowerCase(),
      playerName: scorer?.name || 'Jogador',
      detail: `${GOAL_DETAILS[Math.floor(Math.random() * GOAL_DETAILS.length)]} (${scorer?.name || 'Jogador'}, ${min}')`,
    });
  });

  // Generate away goals
  awayGoalMins.forEach((min, i) => {
    const squad = generateSquad(awayTla.toLowerCase());
    const scorer = squad[Math.floor(Math.random() * 8) + 13];
    events.push({
      id: `${matchId}_ag_${i}`,
      minute: min,
      type: 'goal',
      teamId: awayTla.toLowerCase(),
      playerName: scorer?.name || 'Jogador',
      detail: `${GOAL_DETAILS[Math.floor(Math.random() * GOAL_DETAILS.length)]} (${scorer?.name || 'Jogador'}, ${min}')`,
    });
  });

  // Generate missed shots/general commentary (6-10 events throughout the match)
  const numComments = 6 + Math.floor(Math.random() * 5);
  for (let i = 0; i < numComments; i++) {
    const min = randMin(3, 89);
    const isHome = Math.random() < 0.5;
    const isMiss = totalGoals < 4 && Math.random() < 0.35;

    if (isMiss) {
      events.push({
        id: `${matchId}_miss_${i}`,
        minute: min,
        type: 'comment',
        teamId: isHome ? homeTla.toLowerCase() : awayTla.toLowerCase(),
        detail: `[${min}'] ${MISS_DETAILS[Math.floor(Math.random() * MISS_DETAILS.length)]}`,
      });
    } else {
      events.push({
        id: `${matchId}_comm_${i}`,
        minute: min,
        type: 'comment',
        detail: `[${min}'] ${GENERAL_COMMENTS[Math.floor(Math.random() * GENERAL_COMMENTS.length)]}`,
      });
    }
  }

  // Yellow cards (1-3 per match usually)
  const numYellow = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numYellow; i++) {
    const min = randMin(20, 87);
    const isHome = Math.random() < 0.5;
    const squad = generateSquad(isHome ? homeTla.toLowerCase() : awayTla.toLowerCase());
    const player = squad[Math.floor(Math.random() * 8) + 3];
    events.push({
      id: `${matchId}_yc_${i}`,
      minute: min,
      type: 'yellow_card',
      teamId: isHome ? homeTla.toLowerCase() : awayTla.toLowerCase(),
      playerName: player?.name,
      detail: `Cartão Amarelo para ${player?.name || 'jogador'} após entrada forte.`,
    });
  }

  // Full-time
  events.push({
    id: `${matchId}_ft`,
    minute: 90,
    type: 'comment',
    detail: `FIM DE JOGO! Placar final: ${homeScore} × ${awayScore}. ${
      homeScore > awayScore
        ? 'Vitória do mandante!'
        : awayScore > homeScore
        ? 'Vitória do visitante!'
        : 'Empate justo entre as equipes!'
    }`,
  });

  // Sort ascending by minute
  events.sort((a, b) => a.minute - b.minute);

  return events;
}

// ==============================================================
// API rate limiter: max 10 calls per minute (free tier)
// ==============================================================
class ApiRateLimiter {
  private callTimes: number[] = [];
  private readonly maxCalls = 9; // keep 1 buffer
  private readonly windowMs = 60000; // 1 minute

  canCall(): boolean {
    const now = Date.now();
    this.callTimes = this.callTimes.filter(t => now - t < this.windowMs);
    return this.callTimes.length < this.maxCalls;
  }

  recordCall(): void {
    this.callTimes.push(Date.now());
  }

  waitMs(): number {
    if (this.canCall()) return 0;
    const oldest = Math.min(...this.callTimes);
    return oldest + this.windowMs - Date.now() + 100;
  }
}

const rateLimiter = new ApiRateLimiter();

// ==============================================================
// Provider
// ==============================================================
export const CopaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teamsState, setTeamsState] = useState<Team[]>(INITIAL_TEAMS);
  const [matches, setMatches] = useState<Match[]>([]);
  const [bracketNodes, setBracketNodes] = useState<BracketNode[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>('BRA');
  const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'bracket' | 'teams'>('matches');
  const [apiKey, setApiKeyInternal] = useState<string>(() => localStorage.getItem('copa_api_key') || '');
  const [isApiMode, setIsApiMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const teamsRef = useRef<Team[]>(INITIAL_TEAMS);

  // Keep ref in sync for simulation engine
  useEffect(() => { teamsRef.current = teamsState; }, [teamsState]);

  // ==============================================================
  // Initialize offline simulation data
  // ==============================================================
  useEffect(() => {
    const initialMatches = generateGroupMatches();
    setMatches(initialMatches);

    const liveMatch = initialMatches.find(m => m.status === 'LIVE');
    if (liveMatch) setSelectedMatchId(liveMatch.id);
    else {
      const finishedMatches = initialMatches.filter(m => m.status === 'FINISHED');
      if (finishedMatches.length > 0) setSelectedMatchId(finishedMatches[finishedMatches.length - 1].id);
      else if (initialMatches.length > 0) setSelectedMatchId(initialMatches[0].id);
    }

    const initialStandings = calculateStandings(INITIAL_TEAMS, initialMatches);
    setTeamsState(initialStandings);
    setBracketNodes(generateKnockoutBracket(initialStandings));
  }, []);

  // ==============================================================
  // Update standings whenever matches change (offline mode)
  // ==============================================================
  useEffect(() => {
    if (matches.length === 0 || isApiMode) return;
    const newStandings = calculateStandings(INITIAL_TEAMS, matches);
    setTeamsState(newStandings);
    setBracketNodes(prev => {
      const freshBracket = generateKnockoutBracket(newStandings);
      return freshBracket.map(freshNode => {
        const prevNode = prev.find(n => n.id === freshNode.id);
        if (!prevNode) return freshNode;
        if (prevNode.homeTeamId === freshNode.homeTeamId && prevNode.awayTeamId === freshNode.awayTeamId) {
          return { ...freshNode, homeScore: prevNode.homeScore, awayScore: prevNode.awayScore, winnerId: prevNode.winnerId };
        }
        return freshNode;
      });
    });
  }, [matches, isApiMode]);

  // ==============================================================
  // API fetch with caching and rate limiting
  // ==============================================================
  const fetchRealDataFromApi = useCallback(async (key: string) => {
    if (!key) return;

    // Check localStorage cache - use if less than 60 seconds old
    const cacheKey = 'copa_api_cache';
    const cacheTimeKey = 'copa_api_cache_time';
    const cachedTime = localStorage.getItem(cacheTimeKey);
    const now = Date.now();

    if (cachedTime && now - parseInt(cachedTime) < 60000) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          applyApiData(data, key);
          return;
        } catch { /* ignore */ }
      }
    }

    // Rate limit check
    if (!rateLimiter.canCall()) {
      const waitMs = rateLimiter.waitMs();
      console.log(`Rate limited. Waiting ${waitMs}ms before API call.`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }

    setIsLoading(true);
    try {
      rateLimiter.recordCall();
      const response = await fetch(
        'https://corsproxy.io/?' + encodeURIComponent('https://api.football-data.org/v4/competitions/WC/matches'),
        { headers: { 'X-Auth-Token': key } }
      );

      if (response.status === 429) {
        console.warn('API rate limit hit. Using cached data if available.');
        const cached = localStorage.getItem(cacheKey);
        if (cached) applyApiData(JSON.parse(cached), key);
        return;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      // Cache the response
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(cacheTimeKey, String(now));

      applyApiData(data, key);
    } catch (error) {
      console.error('API fetch error:', error);
      // Try to use cached data as fallback
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          applyApiData(data, key);
          console.log('Using cached API data as fallback.');
          return;
        } catch { /* ignore */ }
      }
      alert('Erro ao carregar dados da API. Voltando ao Modo Simulação Offline. Verifique sua chave e tente novamente.');
      setIsApiMode(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTeamDetails = (tla: string | null, fallbackName?: string | null): { name: string; flag: string } => {
    if (!tla) return { name: fallbackName || 'TBD', flag: '⚽' };
    const trans = TEAM_TRANSLATIONS[tla];
    if (trans) return trans;
    return { name: fallbackName || tla, flag: '⚽' };
  };

  const getMappedStage = (apiStage: string): Match['stage'] => {
    switch (apiStage) {
      case 'GROUP_STAGE': return 'GROUP';
      case 'ROUND_OF_32': case 'LAST_32': return 'ROUND_OF_32';
      case 'ROUND_OF_16': case 'LAST_16': return 'ROUND_OF_16';
      case 'QUARTER_FINALS': return 'QUARTER_FINALS';
      case 'SEMI_FINALS': return 'SEMI_FINALS';
      case 'THIRD_PLACE': return 'THIRD_PLACE';
      case 'FINAL': return 'FINAL';
      default: return 'GROUP';
    }
  };

  const applyApiData = (data: any, _key: string) => {
    if (!data.matches || data.matches.length === 0) return;

    const apiMatches = data.matches;

    // 1. Extract unique teams from all matches
    const extractedTeamsMap = new Map<string, Team>();

    apiMatches.forEach((m: any) => {
      const groupName = m.group?.replace('GROUP_', '') || '';

      [m.homeTeam, m.awayTeam].forEach((team: any) => {
        if (!team?.tla) return;
        const tla = team.tla;
        if (!extractedTeamsMap.has(tla)) {
          const details = getTeamDetails(tla, team.name);
          extractedTeamsMap.set(tla, {
            id: tla,
            name: details.name,
            flag: details.flag,
            group: groupName,
            points: 0, played: 0, wins: 0, draws: 0, losses: 0,
            goalsFor: 0, goalsAgainst: 0, goalsDifference: 0,
          });
        } else if (groupName && !extractedTeamsMap.get(tla)!.group) {
          extractedTeamsMap.get(tla)!.group = groupName;
        }
      });
    });

    const extractedTeams = Array.from(extractedTeamsMap.values());

    // 2. Map API matches to our internal structure
    const nowMs = Date.now();

    const mappedMatches: Match[] = apiMatches.map((apiMatch: any, idx: number) => {
      const apiHomeScore = apiMatch.score?.fullTime?.home;
      const apiAwayScore = apiMatch.score?.fullTime?.away;

      let apiStatus: 'SCHEDULED' | 'LIVE' | 'FINISHED' = 'SCHEDULED';
      if (apiMatch.status === 'FINISHED') apiStatus = 'FINISHED';
      else if (['IN_PLAY', 'PAUSED', 'HALFTIME'].includes(apiMatch.status)) apiStatus = 'LIVE';

      const matchTimeMs = new Date(apiMatch.utcDate).getTime();
      
      // Fallback for API delay: If time passed, force LIVE or FINISHED locally
      if (apiStatus === 'SCHEDULED') {
        if (nowMs >= matchTimeMs && nowMs < matchTimeMs + 110 * 60000) {
          apiStatus = 'LIVE';
        } else if (nowMs >= matchTimeMs + 110 * 60000) {
          apiStatus = 'FINISHED';
        }
      }

      let currentMinute = 0;
      if (apiStatus === 'LIVE') {
        currentMinute = Math.min(Math.floor((nowMs - matchTimeMs) / 60000), 90);
        if (currentMinute < 1) currentMinute = 1;
      } else if (apiStatus === 'FINISHED') {
        currentMinute = 90;
      }

      const homeScore = apiHomeScore ?? (apiStatus !== 'SCHEDULED' ? 0 : null);
      const awayScore = apiAwayScore ?? (apiStatus !== 'SCHEDULED' ? 0 : null);

      const stadiumId = STADIUMS[idx % STADIUMS.length].id;
      const homeTla = apiMatch.homeTeam?.tla || null;
      const awayTla = apiMatch.awayTeam?.tla || null;

      // Without an external provider like API-Football or TheSports, we leave events empty.
      const events: MatchEvent[] = [];
      
      // Empty stats until a real API is integrated
      const stats: MatchStats = {
        possessionHome: 0, possessionAway: 0,
        shotsHome: 0, shotsAway: 0,
        shotsOnTargetHome: 0, shotsOnTargetAway: 0,
        foulsHome: 0, foulsAway: 0,
        cornersHome: 0, cornersAway: 0,
        yellowHome: 0, yellowAway: 0,
        redHome: 0, redAway: 0,
        offsidesHome: 0, offsidesAway: 0,
      };

      return {
        id: `M_API_${apiMatch.id}`,
        homeTeamId: homeTla || 'TBD',
        awayTeamId: awayTla || 'TBD',
        homeScore,
        awayScore,
        date: apiMatch.utcDate,
        status: apiStatus,
        stage: getMappedStage(apiMatch.stage),
        group: apiMatch.group?.replace('GROUP_', '') || undefined,
        stadiumId,
        youtubeId: 'v2_WswqM37A',
        events,
        stats,
        minute: apiStatus === 'LIVE' ? currentMinute : undefined,
      };
    });

    // 3. Calculate standings from API matches
    const standings = calculateStandings(extractedTeams, mappedMatches);
    setTeamsState(standings);
    setMatches(mappedMatches);

    // Select a live or finished match
    const liveMatch = mappedMatches.find(m => m.status === 'LIVE');
    if (liveMatch) {
      setSelectedMatchId(liveMatch.id);
    } else {
      const finishedMatches = mappedMatches.filter(m => m.status === 'FINISHED');
      if (finishedMatches.length > 0) setSelectedMatchId(finishedMatches[finishedMatches.length - 1].id);
    }

    // 4. Build bracket from API matches
    const getStageMatches = (stageName: Match['stage']) =>
      mappedMatches
        .filter(m => m.stage === stageName)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const apiR32 = getStageMatches('ROUND_OF_32');
    const apiR16 = getStageMatches('ROUND_OF_16');
    const apiQF = getStageMatches('QUARTER_FINALS');
    const apiSF = getStageMatches('SEMI_FINALS');
    const apiFinal = getStageMatches('FINAL');

    const defaultBracket = generateKnockoutBracket(standings);

    const mappedBracket = defaultBracket.map(node => {
      let matchingApiMatch: Match | undefined;
      const nodeIdx = parseInt(node.id.split('_')[1]) - 1;

      if (node.stage === 'ROUND_OF_32' && apiR32[nodeIdx]) matchingApiMatch = apiR32[nodeIdx];
      else if (node.stage === 'ROUND_OF_16' && apiR16[nodeIdx]) matchingApiMatch = apiR16[nodeIdx];
      else if (node.stage === 'QUARTER_FINALS' && apiQF[nodeIdx]) matchingApiMatch = apiQF[nodeIdx];
      else if (node.stage === 'SEMI_FINALS' && apiSF[nodeIdx]) matchingApiMatch = apiSF[nodeIdx];
      else if (node.stage === 'FINAL' && apiFinal[0]) matchingApiMatch = apiFinal[0];

      if (matchingApiMatch) {
        const hScore = matchingApiMatch.homeScore;
        const aScore = matchingApiMatch.awayScore;
        let winnerId: string | null = null;
        if (matchingApiMatch.status === 'FINISHED' && hScore !== null && aScore !== null) {
          if (hScore > aScore) winnerId = matchingApiMatch.homeTeamId;
          else if (hScore < aScore) winnerId = matchingApiMatch.awayTeamId;
        }

        const homeId = matchingApiMatch.homeTeamId !== 'TBD' ? matchingApiMatch.homeTeamId : null;
        const awayId = matchingApiMatch.awayTeamId !== 'TBD' ? matchingApiMatch.awayTeamId : null;
        const homeDetails = getTeamDetails(homeId, null);
        const awayDetails = getTeamDetails(awayId, null);

        return {
          ...node,
          homeTeamPlaceholder: homeId ? homeDetails.name : node.homeTeamPlaceholder,
          awayTeamPlaceholder: awayId ? awayDetails.name : node.awayTeamPlaceholder,
          homeTeamId: homeId,
          awayTeamId: awayId,
          homeScore: hScore,
          awayScore: aScore,
          winnerId,
          date: matchingApiMatch.date,
          stadiumId: matchingApiMatch.stadiumId,
        };
      }

      return node;
    });

    setBracketNodes(mappedBracket);
    setLastUpdated(new Date());
    setIsApiMode(true);
  };

  // ==============================================================
  // Set API Key and trigger fetch
  // ==============================================================
  const setApiKey = (key: string) => {
    setApiKeyInternal(key);
    if (key) {
      localStorage.setItem('copa_api_key', key);
      setIsApiMode(true);
      fetchRealDataFromApi(key);
    } else {
      localStorage.removeItem('copa_api_key');
      localStorage.removeItem('copa_api_cache');
      localStorage.removeItem('copa_api_cache_time');
      setIsApiMode(false);
      const initialMatches = generateGroupMatches();
      setMatches(initialMatches);
      const initialStandings = calculateStandings(INITIAL_TEAMS, initialMatches);
      setTeamsState(initialStandings);
      setBracketNodes(generateKnockoutBracket(initialStandings));
    }
  };

  const refreshFromApi = useCallback(() => {
    if (apiKey) {
      // Clear cache to force fresh fetch
      localStorage.removeItem('copa_api_cache');
      localStorage.removeItem('copa_api_cache_time');
      fetchRealDataFromApi(apiKey);
    }
  }, [apiKey, fetchRealDataFromApi]);

  // ==============================================================
  // Auto-refresh in API mode: every 60 seconds
  // ==============================================================
  useEffect(() => {
    if (!apiKey) return;
    setIsApiMode(true);
    fetchRealDataFromApi(apiKey);

    const autoRefreshInterval = setInterval(() => {
      if (apiKey) fetchRealDataFromApi(apiKey);
    }, 60000); // 60 seconds

    return () => clearInterval(autoRefreshInterval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ==============================================================
  // Manual score update
  // ==============================================================
  const updateMatchScore = (matchId: string, homeScore: number, awayScore: number, status: 'FINISHED' | 'LIVE' | 'SCHEDULED') => {
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      const updatedEvents = [...m.events];
      if (status === 'FINISHED' && m.status !== 'FINISHED') {
        updatedEvents.push({ id: `ev_${m.id}_manual_end`, minute: 90, type: 'comment', detail: 'Fim de jogo (placar atualizado manualmente).' });
      }
      return { ...m, homeScore, awayScore, status, events: updatedEvents };
    }));
  };

  const triggerNextSimulationTick = () => {
    setMatches(prev => prev.map(m => m.status === 'LIVE' ? simulateMatchTick(m, teamsRef.current) : m));
  };

  return (
    <CopaContext.Provider value={{
      teams: teamsState,
      matches,
      bracketNodes,
      selectedMatchId,
      selectedTeamId,
      activeTab,
      apiKey,
      isApiMode,
      isLoading,
      lastUpdated,
      setApiKey,
      setSelectedMatchId,
      setSelectedTeamId,
      setActiveTab,
      updateMatchScore,
      triggerNextSimulationTick,
      refreshFromApi,
    }}>
      {children}
    </CopaContext.Provider>
  );
};

export const useCopa = () => {
  const context = useContext(CopaContext);
  if (context === undefined) throw new Error('useCopa deve ser utilizado dentro de um CopaProvider');
  return context;
};
