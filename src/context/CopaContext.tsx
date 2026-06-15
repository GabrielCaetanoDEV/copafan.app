/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  MatchEvent
} from '../data/copaData';

import {
  mapTeamNameToTla,
  parseApiFootballStats,
  parseApiFootballEvents,
  parseApiFootballLineups
} from '../services/apiFootball';

const DEFAULT_FOOTBALL_DATA_KEY = import.meta.env.VITE_FOOTBALL_DATA_KEY || '8c0b296b4122485eb0fc9167232231ab';
const DEFAULT_API_FOOTBALL_KEY = import.meta.env.VITE_API_FOOTBALL_KEY || '11098850f9600270cf5494ac33c6ba5a';

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
  isOnline: boolean;
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
// API-Football Fixture Lookup — uses /fixtures?date= (free plan compatible)
// ==============================================================
const fetchFixtureByDate = async (match: Match): Promise<number | null> => {
  const matchDate = new Date(match.date).toISOString().split('T')[0];
  const cacheKey = `api_football_fixture_${match.homeTeamId}_${match.awayTeamId}_${matchDate}`;
  
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try { return JSON.parse(cached); } catch { /* ignore */ }
  }

  try {
    const url = `https://v3.football.api-sports.io/fixtures?date=${matchDate}`;
    const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(url);
    const res = await fetch(proxyUrl, {
      headers: { 'x-apisports-key': DEFAULT_API_FOOTBALL_KEY }
    });
    if (!res.ok) throw new Error(`API-Football date error: ${res.status}`);
    const data = await res.json();
    if (!data.response || data.response.length === 0) return null;

    // Find WC fixture by matching team names
    const fixture = data.response.find((f: any) => {
      const fHomeTla = mapTeamNameToTla(f.teams.home.name);
      const fAwayTla = mapTeamNameToTla(f.teams.away.name);
      return (
        (fHomeTla === match.homeTeamId && fAwayTla === match.awayTeamId) ||
        (fHomeTla === match.awayTeamId && fAwayTla === match.homeTeamId)
      );
    });

    if (fixture) {
      const fixtureId = fixture.fixture.id;
      localStorage.setItem(cacheKey, JSON.stringify(fixtureId));
      return fixtureId;
    }
  } catch (err) {
    console.error('Failed to find fixture by date:', err);
  }
  return null;
};

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
  const [apiKey, setApiKeyInternal] = useState<string>(() => localStorage.getItem('copa_api_key') || DEFAULT_FOOTBALL_DATA_KEY);
  const [isApiMode, setIsApiMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const teamsRef = useRef<Team[]>(INITIAL_TEAMS);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Keep ref in sync for simulation engine
  useEffect(() => { teamsRef.current = teamsState; }, [teamsState]);

  // ==============================================================
  // Initialize offline simulation data
  // ==============================================================
  useEffect(() => {
    const initialMatches = generateGroupMatches();
    const liveMatch = initialMatches.find(m => m.status === 'LIVE');
    let initialSelectedId: string | null = null;
    if (liveMatch) initialSelectedId = liveMatch.id;
    else {
      const finishedMatches = initialMatches.filter(m => m.status === 'FINISHED');
      if (finishedMatches.length > 0) initialSelectedId = finishedMatches[finishedMatches.length - 1].id;
      else if (initialMatches.length > 0) initialSelectedId = initialMatches[0].id;
    }
    const initialStandings = calculateStandings(INITIAL_TEAMS, initialMatches);
    
    setTimeout(() => {
      setMatches(initialMatches);
      setSelectedMatchId(initialSelectedId);
      setTeamsState(initialStandings);
      setBracketNodes(generateKnockoutBracket(initialStandings));
    }, 0);
  }, []);

  // ==============================================================
  // Update standings whenever matches change (offline mode)
  // ==============================================================
  useEffect(() => {
    if (matches.length === 0 || isApiMode) return;
    const newStandings = calculateStandings(INITIAL_TEAMS, matches);
    setTimeout(() => {
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
    }, 0);
  }, [matches, isApiMode]);

  function getTeamDetails(tla: string | null, fallbackName?: string | null): { name: string; flag: string } {
    if (!tla) return { name: fallbackName || 'TBD', flag: '⚽' };
    const trans = TEAM_TRANSLATIONS[tla];
    if (trans) return trans;
    return { name: fallbackName || tla, flag: '⚽' };
  }

  function getMappedStage(apiStage: string): Match['stage'] {
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
  }

  function applyApiData(data: any, _key: string) {
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
    const mappedMatches: Match[] = apiMatches.map((apiMatch: any, idx: number) => {
      const apiHomeScore = apiMatch.score?.fullTime?.home;
      const apiAwayScore = apiMatch.score?.fullTime?.away;

      let apiStatus: 'SCHEDULED' | 'LIVE' | 'FINISHED' = 'SCHEDULED';
      if (apiMatch.status === 'FINISHED') apiStatus = 'FINISHED';
      else if (['IN_PLAY', 'PAUSED', 'HALFTIME'].includes(apiMatch.status)) apiStatus = 'LIVE';

      const matchTimeMs = new Date(apiMatch.utcDate).getTime();
      const nowMs2 = Date.now();

      // Only apply local time fallback if API still says SCHEDULED but time has passed
      if (apiStatus === 'SCHEDULED') {
        if (nowMs2 >= matchTimeMs && nowMs2 < matchTimeMs + 115 * 60000) {
          apiStatus = 'LIVE';
        } else if (nowMs2 >= matchTimeMs + 115 * 60000) {
          apiStatus = 'FINISHED';
        }
      }

      // Correct minute calculation:
      // - HALFTIME: freeze at 45'
      // - PAUSED/2nd half: offset correctly
      let currentMinute: number | undefined;
      if (apiStatus === 'LIVE') {
        if (apiMatch.status === 'HALFTIME') {
          currentMinute = 45;
        } else {
          currentMinute = Math.min(Math.max(1, Math.floor((nowMs2 - matchTimeMs) / 60000)), 90);
        }
      } else if (apiStatus === 'FINISHED') {
        currentMinute = undefined; // don't show minute for finished
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
        minute: currentMinute,
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
  }

  // ==============================================================
  // API fetch with caching and rate limiting
  // ==============================================================
  const fetchRealDataFromApi = useCallback(async (key: string) => {
    if (!key) return;

    // Check localStorage cache - use if less than 60 seconds old
    const cacheKey = 'copa_api_cache_v2';
    const cacheTimeKey = 'copa_api_cache_time_v2';
    const cachedTime = localStorage.getItem(cacheTimeKey);
    const now = Date.now();

    if (cachedTime && now - parseInt(cachedTime) < 600000) {
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
      alert('Erro ao carregar dados da API. Verifique sua chave e tente novamente.');
      // Don't switch to offline if we have cache
      if (!localStorage.getItem(cacheKey)) setIsApiMode(false);
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps



  // ==============================================================
  // Set API Key and trigger fetch
  // ==============================================================
  const setApiKey = (key: string) => {
    setApiKeyInternal(key);
    if (key) {
      localStorage.setItem('copa_api_key', key);
      setIsApiMode(true);
      // Purge old v1 cache keys if present
      localStorage.removeItem('copa_api_cache');
      localStorage.removeItem('copa_api_cache_time');
      fetchRealDataFromApi(key);
    } else {
      localStorage.removeItem('copa_api_key');
      localStorage.removeItem('copa_api_cache_v2');
      localStorage.removeItem('copa_api_cache_time_v2');
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
      localStorage.removeItem('copa_api_cache_v2');
      localStorage.removeItem('copa_api_cache_time_v2');
      fetchRealDataFromApi(apiKey);
    }
  }, [apiKey, fetchRealDataFromApi]);

  // ==============================================================
  // Fetch details for the selected match (events, statistics, lineups)
  // ==============================================================
  const fetchLiveMatchDetails = useCallback(async (match: Match) => {
    if (!match) return;
    
    // For SCHEDULED matches, only try to fetch if the match starts within 2 hours
    // (Teams submit lineups 1 hour before kickoff, API-Football usually has them)
    if (match.status === 'SCHEDULED') {
      const matchStartMs = new Date(match.date).getTime();
      const twoHoursMs = 2 * 60 * 60 * 1000;
      if (Date.now() < matchStartMs - twoHoursMs) return; // too far in future
    }

    const cacheKey = `copa_match_details_v2_${match.id}`;
    const cachedData = localStorage.getItem(cacheKey);
    const now = Date.now();

    if (cachedData) {
      try {
        const { timestamp, data } = JSON.parse(cachedData);
        // Finished = cache forever; Live = 5min; Scheduled (near kickoff) = 10min
        const cacheDuration = match.status === 'FINISHED' ? Infinity
          : match.status === 'LIVE' ? 300000
          : 600000;
        if (now - timestamp < cacheDuration) {
          setTimeout(() => {
            setMatches(prev => prev.map(m => m.id === match.id ? { ...m, ...data } : m));
          }, 0);
          return;
        }
      } catch { /* ignore */ }
    }

    try {
      // Use date-based fixture lookup (works on API-Football free plan)
      const fixtureId = await fetchFixtureByDate(match);
      if (!fixtureId) {
        console.log(`No fixture found for match ${match.id} (${match.homeTeamId} vs ${match.awayTeamId})`);
        return;
      }

      const headers = {
        'x-apisports-key': DEFAULT_API_FOOTBALL_KEY
      };

      // 1. Lineups (cached permanently per fixtureId)
      const lineupCacheKey = `copa_lineup_${fixtureId}`;
      let lineups = null;
      const cachedLineup = localStorage.getItem(lineupCacheKey);
      
      if (cachedLineup) {
        try {
          lineups = JSON.parse(cachedLineup);
        } catch { /* ignore */ }
      }

      if (!lineups) {
        const lineupsUrl = `https://corsproxy.io/?` + encodeURIComponent(`https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixtureId}`);
        const lRes = await fetch(lineupsUrl, { headers });
        if (lRes.ok) {
          const lData = await lRes.json();
          if (lData.response) {
            const parsedLineups = parseApiFootballLineups(lData.response, match.homeTeamId, match.awayTeamId);
            if (parsedLineups) {
              lineups = parsedLineups;
              localStorage.setItem(lineupCacheKey, JSON.stringify(lineups));
            }
          }
        }
      }

      // 2. Events & Stats (in parallel)
      const eventsUrl = `https://corsproxy.io/?` + encodeURIComponent(`https://v3.football.api-sports.io/fixtures/events?fixture=${fixtureId}`);
      const statsUrl = `https://corsproxy.io/?` + encodeURIComponent(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`);

      const [evRes, stRes] = await Promise.all([
        fetch(eventsUrl, { headers }),
        fetch(statsUrl, { headers })
      ]);

      let events: MatchEvent[] = [];
      if (evRes.ok) {
        const evData = await evRes.json();
        if (evData.response) {
          events = parseApiFootballEvents(evData.response, match.id);
        }
      }

      let stats = match.stats;
      if (stRes.ok) {
        const stData = await stRes.json();
        if (stData.response) {
          stats = parseApiFootballStats(stData.response, match.homeTeamId, match.awayTeamId);
        }
      }

      const updatedData = {
        events,
        stats,
        lineups: lineups || undefined
      };

      // Cache the result
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: now,
        data: updatedData
      }));

      // Update match state
      setMatches(prev => prev.map(m => m.id === match.id ? { ...m, ...updatedData } : m));
    } catch (err) {
      console.error(`Error fetching details for match ${match.id}:`, err);
    }
  }, []);

  // Polling details for the selected match (LIVE every 5min, near-kickoff SCHEDULED every 10min)
  const selectedMatch = matches.find(m => m.id === selectedMatchId);
  const selectedMatchStatus = selectedMatch?.status;
  const selectedMatchDate = selectedMatch?.date;

  useEffect(() => {
    if (!selectedMatchId || !isApiMode) return;
    const match = matches.find(m => m.id === selectedMatchId);
    if (!match) return;

    // Determine if this SCHEDULED match is within 2h of kickoff
    const isNearKickoff = match.status === 'SCHEDULED' &&
      Date.now() >= new Date(match.date).getTime() - 2 * 60 * 60 * 1000;

    // Initial fetch
    setTimeout(() => { fetchLiveMatchDetails(match); }, 0);

    // Poll LIVE every 5 min, near-kickoff SCHEDULED every 10 min
    if (selectedMatchStatus === 'LIVE' || isNearKickoff) {
      const intervalMs = selectedMatchStatus === 'LIVE' ? 300000 : 600000;
      const interval = setInterval(() => {
        setMatches(prev => {
          const freshMatch = prev.find(m => m.id === selectedMatchId);
          if (freshMatch) fetchLiveMatchDetails(freshMatch);
          return prev;
        });
      }, intervalMs);
      return () => clearInterval(interval);
    }
  }, [selectedMatchId, selectedMatchStatus, selectedMatchDate, isApiMode, fetchLiveMatchDetails]); // eslint-disable-line react-hooks/exhaustive-deps

  // ==============================================================
  // Auto-refresh in API mode: every 10 minutes (600,000 ms)
  // ==============================================================
  useEffect(() => {
    if (!apiKey) return;
    setTimeout(() => {
      fetchRealDataFromApi(apiKey);
    }, 0);

    const autoRefreshInterval = setInterval(() => {
      if (apiKey) fetchRealDataFromApi(apiKey);
    }, 600000); // 10 minutes

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
      isOnline,
      lastUpdated,
      setApiKey,
      setSelectedMatchId,
      setSelectedTeamId,
      setActiveTab,
      updateMatchScore,
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
