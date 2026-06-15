/* eslint-disable @typescript-eslint/no-explicit-any */
import { Match, MatchEvent, MatchStats, Player, MatchLineup } from '../data/copaData';

// Mapping of English names in API-Football to 3-letter codes (TLA)
const TEAM_NAME_TO_TLA: Record<string, string> = {
  "Qatar": "QAT",
  "Ecuador": "ECU",
  "Senegal": "SEN",
  "Netherlands": "NED",
  "England": "ENG",
  "Iran": "IRN",
  "USA": "USA",
  "United States": "USA",
  "Wales": "WAL",
  "Argentina": "ARG",
  "Saudi Arabia": "KSA",
  "Mexico": "MEX",
  "Poland": "POL",
  "France": "FRA",
  "Australia": "AUS",
  "Denmark": "DEN",
  "Tunisia": "TUN",
  "Spain": "ESP",
  "Costa Rica": "CRC",
  "Germany": "GER",
  "Japan": "JPN",
  "Belgium": "BEL",
  "Canada": "CAN",
  "Morocco": "MAR",
  "Croatia": "CRO",
  "Brazil": "BRA",
  "Serbia": "SRB",
  "Switzerland": "SUI",
  "Cameroon": "CMR",
  "Portugal": "POR",
  "Ghana": "GHA",
  "Uruguay": "URY",
  "South Korea": "KOR",
  "Korea Republic": "KOR",
  "South Africa": "RSA",
  "Czechia": "CZE",
  "Czech Republic": "CZE",
  "Bosnia & Herzegovina": "BIH",
  "Bosnia and Herzegovina": "BIH",
  "Bosnia": "BIH",
  "Haiti": "HAI",
  "Scotland": "SCO",
  "Paraguay": "PAR",
  "Turkey": "TUR",
  "Curacao": "CUW",
  "Ivory Coast": "CIV",
  "Egypt": "EGY",
  "New Zealand": "NZL",
  "Iraq": "IRQ",
  "Norway": "NOR",
  "Algeria": "ALG",
  "Austria": "AUT",
  "Jordan": "JOR",
  "DR Congo": "COD",
  "Congo DR": "COD",
  "Uzbekistan": "UZB",
  "Colombia": "COL",
  "Panama": "PAN",
  "Cape Verde": "CPV"
};

export const mapTeamNameToTla = (name: string): string => {
  if (!name) return 'TBD';
  const trimmed = name.trim();
  if (TEAM_NAME_TO_TLA[trimmed]) return TEAM_NAME_TO_TLA[trimmed];
  
  // Try case-insensitive lookup
  const lower = trimmed.toLowerCase();
  for (const [key, tla] of Object.entries(TEAM_NAME_TO_TLA)) {
    if (key.toLowerCase() === lower) return tla;
  }
  
  return trimmed.substring(0, 3).toUpperCase();
};

// Parse statistics response for both home and away teams
export const parseApiFootballStats = (apiStatsResponse: any[], homeTla: string, awayTla: string): MatchStats => {
  if (!apiStatsResponse || apiStatsResponse.length === 0) {
    return {
      possessionHome: 50, possessionAway: 50,
      shotsHome: 0, shotsAway: 0,
      shotsOnTargetHome: 0, shotsOnTargetAway: 0,
      foulsHome: 0, foulsAway: 0,
      cornersHome: 0, cornersAway: 0,
      yellowHome: 0, yellowAway: 0,
      redHome: 0, redAway: 0,
      offsidesHome: 0, offsidesAway: 0,
    };
  }

  const getTeamStats = (tla: string) => {
    const found = apiStatsResponse.find(t => mapTeamNameToTla(t.team?.name) === tla);
    return found ? found.statistics : [];
  };

  const homeStats = getTeamStats(homeTla);
  const awayStats = getTeamStats(awayTla);

  const getVal = (stats: any[], type: string, isPercentage = false) => {
    const stat = stats.find((s) => s.type === type);
    if (!stat || stat.value === null || stat.value === undefined) return 0;
    if (isPercentage) {
      return parseInt(stat.value.toString().replace('%', '')) || 0;
    }
    return parseInt(stat.value.toString()) || 0;
  };

  const possessionHome = getVal(homeStats, 'Ball Possession', true);
  const possessionAway = getVal(awayStats, 'Ball Possession', true) || (possessionHome ? 100 - possessionHome : 50);
  const posHome = possessionHome || (possessionAway ? 100 - possessionAway : 50);

  return {
    possessionHome: posHome,
    possessionAway: possessionAway,
    shotsHome: getVal(homeStats, 'Total Shots'),
    shotsAway: getVal(awayStats, 'Total Shots'),
    shotsOnTargetHome: getVal(homeStats, 'Shots on Goal'),
    shotsOnTargetAway: getVal(awayStats, 'Shots on Goal'),
    foulsHome: getVal(homeStats, 'Fouls'),
    foulsAway: getVal(awayStats, 'Fouls'),
    cornersHome: getVal(homeStats, 'Corner Kicks'),
    cornersAway: getVal(awayStats, 'Corner Kicks'),
    yellowHome: getVal(homeStats, 'Yellow Cards'),
    yellowAway: getVal(awayStats, 'Yellow Cards'),
    redHome: getVal(homeStats, 'Red Cards'),
    redAway: getVal(awayStats, 'Red Cards'),
    offsidesHome: getVal(homeStats, 'Offsides'),
    offsidesAway: getVal(awayStats, 'Offsides'),
  };
};

// Parse play-by-play events
export const parseApiFootballEvents = (apiEvents: any[], matchId: string): MatchEvent[] => {
  if (!apiEvents) return [];
  return apiEvents.map((ev, idx) => {
    let type: MatchEvent['type'] = 'comment';
    let detail: string;

    const playerName = ev.player?.name || '';
    const assistName = ev.assist?.name || '';

    if (ev.type === 'Goal') {
      type = 'goal';
      if (ev.detail === 'Penalty') {
        detail = `Gol de pênalti! ${playerName} cobra com extrema categoria e amplia!`;
      } else if (ev.detail === 'Own Goal') {
        detail = `Gol contra! Desvio infeliz de ${playerName} que joga contra a própria meta!`;
      } else {
        detail = `Gol! ${playerName} recebe livre e chuta no canto para estufar as redes!`;
      }
    } else if (ev.type === 'Card') {
      const isYellow = ev.detail?.includes('Yellow') || false;
      type = isYellow ? 'yellow_card' : 'red_card';
      detail = isYellow 
        ? `Cartão amarelo para ${playerName} por falta tática dura.` 
        : `Cartão vermelho! ${playerName} recebe punição severa e é expulso do jogo!`;
    } else if (ev.type === 'subst') {
      type = 'substitution';
      detail = `Substituição: entra ${assistName || 'Novo jogador'} e sai ${playerName || 'Jogador substituído'}.`;
    } else {
      detail = ev.comments || ev.detail || `${ev.type} - ${playerName}`;
    }

    return {
      id: `${matchId}_ev_${idx}`,
      minute: ev.time?.elapsed || 0,
      type,
      teamId: mapTeamNameToTla(ev.team?.name),
      playerName: playerName || undefined,
      detail: detail,
    };
  });
};

const mapPosition = (pos: string): Player['position'] => {
  switch (pos) {
    case 'G': return 'Goleiro';
    case 'D': return 'Defensor';
    case 'M': return 'Meio-campista';
    case 'F': return 'Atacante';
    default: return 'Defensor';
  }
};

// Parse lineups
export const parseApiFootballLineups = (apiLineupsResponse: any[], homeTla: string, awayTla: string): { home: MatchLineup; away: MatchLineup } | undefined => {
  if (!apiLineupsResponse || apiLineupsResponse.length < 2) return undefined;

  const getTeamLineup = (tla: string) => {
    return apiLineupsResponse.find(t => mapTeamNameToTla(t.team?.name) === tla);
  };

  const homeData = getTeamLineup(homeTla);
  const awayData = getTeamLineup(awayTla);

  const mapPlayer = (pObj: any, teamTla: string): Player => {
    const p = pObj.player;
    return {
      id: `${teamTla}_API_${p.id || Math.floor(Math.random() * 100000)}`,
      name: p.name || 'Jogador',
      number: p.number || 0,
      position: mapPosition(p.pos),
      isCaptain: p.captain || false
    };
  };

  const createLineup = (teamData: any, teamTla: string): MatchLineup => {
    if (!teamData) {
      return { formation: '4-3-3', titulares: [], reservas: [] };
    }
    return {
      formation: teamData.formation || '4-3-3',
      titulares: (teamData.startXI || []).map((p: any) => mapPlayer(p, teamTla)),
      reservas: (teamData.substitutes || []).map((p: any) => mapPlayer(p, teamTla)),
    };
  };

  return {
    home: createLineup(homeData, homeTla),
    away: createLineup(awayData, awayTla)
  };
};

// Legacy parser helper if needed
export const parseApiFootballMatches = (apiFixtures: any[]): Match[] => {
  return apiFixtures.map((fixture: any) => {
    const fix = fixture.fixture;
    const league = fixture.league;
    const teams = fixture.teams;
    const goals = fixture.goals;

    let status: 'SCHEDULED' | 'LIVE' | 'FINISHED' = 'SCHEDULED';
    if (fix.status.short === 'FT' || fix.status.short === 'AET' || fix.status.short === 'PEN') status = 'FINISHED';
    else if (['1H', 'HT', '2H', 'ET', 'P', 'LIVE'].includes(fix.status.short)) status = 'LIVE';

    let stage: Match['stage'] = 'GROUP';
    if (league.round?.includes('Round of 32')) stage = 'ROUND_OF_32';
    else if (league.round?.includes('Round of 16')) stage = 'ROUND_OF_16';
    else if (league.round?.includes('Quarter-finals')) stage = 'QUARTER_FINALS';
    else if (league.round?.includes('Semi-finals')) stage = 'SEMI_FINALS';
    else if (league.round?.includes('Final')) stage = 'FINAL';

    const homeTla = mapTeamNameToTla(teams.home?.name);
    const awayTla = mapTeamNameToTla(teams.away?.name);

    return {
      id: `M_API_${fix.id}`,
      homeTeamId: homeTla,
      awayTeamId: awayTla,
      homeScore: goals.home ?? null,
      awayScore: goals.away ?? null,
      date: fix.date,
      status,
      stage,
      group: league.round?.includes('Group') ? league.round.replace('Group ', '') : undefined,
      stadiumId: 'STAD_01',
      youtubeId: 'v2_WswqM37A',
      events: [],
      stats: {
        possessionHome: 50, possessionAway: 50,
        shotsHome: 0, shotsAway: 0,
        shotsOnTargetHome: 0, shotsOnTargetAway: 0,
        foulsHome: 0, foulsAway: 0,
        cornersHome: 0, cornersAway: 0,
        yellowHome: 0, yellowAway: 0,
        redHome: 0, redAway: 0,
        offsidesHome: 0, offsidesAway: 0,
      },
      minute: fix.status.elapsed,
    };
  });
};
