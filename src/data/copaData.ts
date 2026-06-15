// ============================================================
// Copa do Mundo FIFA 2026 - Data Layer
// Official 48-team tournament data
// ============================================================

export interface Team {
  id: string; // 3-letter TLA from football-data.org
  name: string;
  flag: string;
  group: string; // A - L
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDifference: number;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: 'Goleiro' | 'Defensor' | 'Meio-campista' | 'Atacante';
  isCaptain?: boolean;
  grid?: string; // API-Football grid position e.g. "2:3" = row 2, col 3
  isSubstitute?: boolean; // came on as a substitute mid-match
}

export interface Stadium {
  id: string;
  name: string;
  city: string;
  capacity: string;
}

export interface MatchEvent {
  id: string;
  minute: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'comment';
  teamId?: string;
  playerName?: string;
  playerInName?: string; // for substitutions: who came ON
  detail: string;
}

export interface MatchStats {
  possessionHome: number;
  possessionAway: number;
  shotsHome: number;
  shotsAway: number;
  shotsOnTargetHome: number;
  shotsOnTargetAway: number;
  foulsHome: number;
  foulsAway: number;
  cornersHome: number;
  cornersAway: number;
  yellowHome: number;
  yellowAway: number;
  redHome: number;
  redAway: number;
  offsidesHome: number;
  offsidesAway: number;
}

export interface MatchLineup {
  formation: string;
  titulares: Player[];
  reservas: Player[];
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  stage: 'GROUP' | 'ROUND_OF_32' | 'ROUND_OF_16' | 'QUARTER_FINALS' | 'SEMI_FINALS' | 'THIRD_PLACE' | 'FINAL';
  group?: string;
  stadiumId: string;
  youtubeId: string;
  minute?: number;
  minuteUpdatedAt?: number; // Date.now() when minute was last set from API
  isHalftime?: boolean; // true when API reports HT status
  events: MatchEvent[];
  stats: MatchStats;
  lineups?: {
    home: MatchLineup;
    away: MatchLineup;
  };
}

// Official 2026 Host Stadiums
export const STADIUMS: Stadium[] = [
  { id: "STAD_01", name: "Estádio Azteca", city: "Cidade do México, México", capacity: "87.523" },
  { id: "STAD_02", name: "MetLife Stadium", city: "Nova York/Nova Jersey, EUA", capacity: "82.500" },
  { id: "STAD_03", name: "SoFi Stadium", city: "Los Angeles, EUA", capacity: "70.240" },
  { id: "STAD_04", name: "AT&T Stadium", city: "Dallas, EUA", capacity: "80.000" },
  { id: "STAD_05", name: "Mercedes-Benz Stadium", city: "Atlanta, EUA", capacity: "71.000" },
  { id: "STAD_06", name: "BC Place", city: "Vancouver, Canadá", capacity: "54.500" },
  { id: "STAD_07", name: "Lumen Field", city: "Seattle, EUA", capacity: "69.000" },
  { id: "STAD_08", name: "Arrowhead Stadium", city: "Kansas City, EUA", capacity: "76.416" },
  { id: "STAD_09", name: "Hard Rock Stadium", city: "Miami, EUA", capacity: "64.767" },
  { id: "STAD_10", name: "Lincoln Financial Field", city: "Filadélfia, EUA", capacity: "69.796" },
  { id: "STAD_11", name: "Gillette Stadium", city: "Boston, EUA", capacity: "65.878" },
  { id: "STAD_12", name: "Levi's Stadium", city: "São Francisco, EUA", capacity: "68.500" },
  { id: "STAD_13", name: "NRG Stadium", city: "Houston, EUA", capacity: "72.220" },
  { id: "STAD_14", name: "BMO Field", city: "Toronto, Canadá", capacity: "30.000" },
  { id: "STAD_15", name: "Estádio BBVA", city: "Monterrey, México", capacity: "51.000" },
  { id: "STAD_16", name: "Estádio Akron", city: "Guadalajara, México", capacity: "48.071" },
];

// ==============================================================
// OFFICIAL Copa 2026 groups per football-data.org API data
// Groups A-L: 4 teams each = 48 total
// ==============================================================
export const INITIAL_TEAMS: Team[] = [
  // Group A
  { id: "MEX", name: "México", flag: "🇲🇽", group: "A", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "RSA", name: "África do Sul", flag: "🇿🇦", group: "A", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "KOR", name: "Coreia do Sul", flag: "🇰🇷", group: "A", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "CZE", name: "Chéquia", flag: "🇨🇿", group: "A", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },

  // Group B
  { id: "CAN", name: "Canadá", flag: "🇨🇦", group: "B", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "BIH", name: "Bósnia e Herzegovina", flag: "🇧🇦", group: "B", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "QAT", name: "Catar", flag: "🇶🇦", group: "B", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "SUI", name: "Suíça", flag: "🇨🇭", group: "B", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },

  // Group C
  { id: "BRA", name: "Brasil", flag: "🇧🇷", group: "C", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "MAR", name: "Marrocos", flag: "🇲🇦", group: "C", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "HAI", name: "Haiti", flag: "🇭🇹", group: "C", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "SCO", name: "Escócia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },

  // Group D
  { id: "USA", name: "Estados Unidos", flag: "🇺🇸", group: "D", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "PAR", name: "Paraguai", flag: "🇵🇾", group: "D", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "AUS", name: "Austrália", flag: "🇦🇺", group: "D", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "TUR", name: "Turquia", flag: "🇹🇷", group: "D", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },

  // Group E
  { id: "GER", name: "Alemanha", flag: "🇩🇪", group: "E", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "CUW", name: "Curaçau", flag: "🇨🇼", group: "E", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "CIV", name: "Costa do Marfim", flag: "🇨🇮", group: "E", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "ECU", name: "Equador", flag: "🇪🇨", group: "E", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },

  // Group F
  { id: "NED", name: "Holanda", flag: "🇳🇱", group: "F", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "JPN", name: "Japão", flag: "🇯🇵", group: "F", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "SWE", name: "Suécia", flag: "🇸🇪", group: "F", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "TUN", name: "Tunísia", flag: "🇹🇳", group: "F", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },

  // Group G
  { id: "BEL", name: "Bélgica", flag: "🇧🇪", group: "G", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "EGY", name: "Egito", flag: "🇪🇬", group: "G", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "IRN", name: "Irã", flag: "🇮🇷", group: "G", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "NZL", name: "Nova Zelândia", flag: "🇳🇿", group: "G", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },

  // Group H
  { id: "ESP", name: "Espanha", flag: "🇪🇸", group: "H", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "CPV", name: "Cabo Verde", flag: "🇨🇻", group: "H", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "KSA", name: "Arábia Saudita", flag: "🇸🇦", group: "H", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "URY", name: "Uruguai", flag: "🇺🇾", group: "H", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },

  // Group I
  { id: "FRA", name: "França", flag: "🇫🇷", group: "I", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "SEN", name: "Senegal", flag: "🇸🇳", group: "I", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "IRQ", name: "Iraque", flag: "🇮🇶", group: "I", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "NOR", name: "Noruega", flag: "🇳🇴", group: "I", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },

  // Group J
  { id: "ARG", name: "Argentina", flag: "🇦🇷", group: "J", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "ALG", name: "Argélia", flag: "🇩🇿", group: "J", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "AUT", name: "Áustria", flag: "🇦🇹", group: "J", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "JOR", name: "Jordânia", flag: "🇯🇴", group: "J", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },

  // Group K
  { id: "POR", name: "Portugal", flag: "🇵🇹", group: "K", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "COD", name: "RD Congo", flag: "🇨🇩", group: "K", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "UZB", name: "Uzbequistão", flag: "🇺🇿", group: "K", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "COL", name: "Colômbia", flag: "🇨🇴", group: "K", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },

  // Group L
  { id: "ENG", name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "CRO", name: "Croácia", flag: "🇭🇷", group: "L", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "GHA", name: "Gana", flag: "🇬🇭", group: "L", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
  { id: "PAN", name: "Panamá", flag: "🇵🇦", group: "L", points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalsDifference: 0 },
];

// ==============================================================
// Seeded random for consistent squad generation
// ==============================================================
function getSeededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES: Record<string, string[]> = {
  latin: ["Gabriel", "Lucas", "Mateus", "Enzo", "Felipe", "Pedro", "Rodrigo", "Thiago", "Vinicius", "Marcos", "Juan", "Diego", "Carlos", "Luis", "Javier", "Manuel", "Alejandro", "Lionel", "Emiliano", "Lautaro", "Darwin", "Ronald", "James", "Rafael"],
  anglo: ["Harry", "John", "Jack", "Marcus", "Mason", "Jude", "Declan", "Bukayo", "Kyle", "Jordan", "Trent", "Virgil", "Frenkie", "Memphis", "Cody", "Nathan", "Kevin", "Romelu", "Tyler", "Weston", "Timothy", "Alphonso"],
  euro: ["Hugo", "Kylian", "Antoine", "Olivier", "Aurélien", "Theo", "Dayot", "Manuel", "Thomas", "Joshua", "Kai", "Leroy", "Serge", "Marc", "Álvaro", "Pedri", "Gavi", "Rodri", "Pau", "Gianluigi", "Nicolò", "Federico", "Luka", "Mateo", "Ivan", "Granit", "Yann", "Robert", "Sebastian", "Viktor", "Arda", "Hakan"],
  african: ["Yassine", "Achraf", "Sofyan", "Azzedine", "Youssef", "Sadio", "Kalidou", "Édouard", "Idrissa", "Mohamed", "Mostafa", "Victor", "Alex", "Wilfred", "Kelechi", "Vincent"],
  asian: ["Kaoru", "Wataru", "Daichi", "Takefusa", "Takuma", "Junya", "Heung-min", "Min-jae", "Gue-sung", "Kang-in", "Mathew", "Jackson", "Salem", "Firas", "Almoez", "Hassan"],
  nordic: ["Erling", "Martin", "Alexander", "Sander", "Stefan", "Victor", "Jakob", "Andreas"],
};

const LAST_NAMES: Record<string, string[]> = {
  latin: ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Almeida", "Nascimento", "Fernandes", "Gomez", "Rodriguez", "Fernandez", "Gonzalez", "Martinez", "Alvarez", "Messi", "Otamendi", "De Paul", "Valverde", "Nunez", "Araujo", "Diaz", "Zapata"],
  anglo: ["Kane", "Stones", "Walker", "Rice", "Bellingham", "Saka", "Shaw", "Pickford", "Van Dijk", "De Jong", "Depay", "Gakpo", "De Bruyne", "Lukaku", "Pulisic", "Adams", "McKennie", "David", "Davies"],
  euro: ["Lloris", "Mbappé", "Griezmann", "Giroud", "Tchouaméni", "Hernández", "Upamecano", "Neuer", "Müller", "Kimmich", "Havertz", "Sané", "Morata", "González", "Donnarumma", "Barella", "Modrić", "Kovačić", "Xhaka", "Sommer", "Lewandowski", "Güler", "Çalhanoğlu"],
  african: ["Bounou", "Hakimi", "Amrabat", "Ounahi", "En-Nesyri", "Mané", "Koulibaly", "Mendy", "Gueye", "Salah", "Osimhen", "Iwobi", "Ndidi", "Aboubakar", "Ayew", "Kudus"],
  asian: ["Mitoma", "Endo", "Kamada", "Kubo", "Asano", "Son", "Kim", "Cho", "Lee", "Hwang", "Ryan", "Irvine", "Al-Dawsari", "Al-Buraikan", "Azmoun", "Taremi", "Afif"],
  nordic: ["Haaland", "Ødegaard", "Dybvig", "Berge", "Ajer", "Strand Larsen"],
};

function getTeamLanguageCategory(teamId: string): string {
  const categories: Record<string, string> = {
    BRA: 'latin', ARG: 'latin', URY: 'latin', COL: 'latin', MEX: 'latin', PAR: 'latin', ECU: 'latin',
    USA: 'anglo', CAN: 'anglo', ENG: 'anglo', AUS: 'anglo', NZL: 'anglo',
    FRA: 'euro', GER: 'euro', ESP: 'euro', ITA: 'euro', POR: 'euro', NED: 'euro', BEL: 'euro',
    CRO: 'euro', SUI: 'euro', AUT: 'euro', TUR: 'euro', CZE: 'euro', SCO: 'euro', BIH: 'euro',
    MAR: 'african', SEN: 'african', EGY: 'african', GHA: 'african', CMR: 'african', ALG: 'african', TUN: 'african', RSA: 'african', CIV: 'african', COD: 'african', CPV: 'african',
    JPN: 'asian', KOR: 'asian', KSA: 'asian', IRN: 'asian', IRQ: 'asian', UZB: 'asian', QAT: 'asian', JOR: 'asian',
    NOR: 'nordic', SWE: 'nordic',
    HAI: 'latin', PAN: 'latin', CUW: 'latin',
  };
  return categories[teamId] || 'latin';
}

// Customized real squads for top teams
const REAL_SQUADS: Record<string, Player[]> = {
  BRA: [
    { id: "BRA_01", name: "Alisson Becker", number: 1, position: "Goleiro" },
    { id: "BRA_02", name: "Danilo", number: 2, position: "Defensor" },
    { id: "BRA_03", name: "Marquinhos", number: 3, position: "Defensor", isCaptain: true },
    { id: "BRA_04", name: "Gabriel Magalhães", number: 4, position: "Defensor" },
    { id: "BRA_05", name: "Bruno Guimarães", number: 5, position: "Meio-campista" },
    { id: "BRA_06", name: "Guilherme Arana", number: 6, position: "Defensor" },
    { id: "BRA_07", name: "Vinícius Júnior", number: 7, position: "Atacante" },
    { id: "BRA_08", name: "Lucas Paquetá", number: 8, position: "Meio-campista" },
    { id: "BRA_09", name: "Rodrygo", number: 9, position: "Atacante" },
    { id: "BRA_10", name: "Neymar Jr", number: 10, position: "Atacante" },
    { id: "BRA_11", name: "Raphinha", number: 11, position: "Atacante" },
    { id: "BRA_12", name: "Bento", number: 12, position: "Goleiro" },
    { id: "BRA_13", name: "Yan Couto", number: 13, position: "Defensor" },
    { id: "BRA_14", name: "Lucas Beraldo", number: 14, position: "Defensor" },
    { id: "BRA_15", name: "João Gomes", number: 15, position: "Meio-campista" },
    { id: "BRA_16", name: "Andreas Pereira", number: 16, position: "Meio-campista" },
    { id: "BRA_17", name: "Éder Militão", number: 17, position: "Defensor" },
    { id: "BRA_18", name: "Douglas Luiz", number: 18, position: "Meio-campista" },
    { id: "BRA_19", name: "Endrick", number: 19, position: "Atacante" },
    { id: "BRA_20", name: "Savinho", number: 20, position: "Atacante" },
    { id: "BRA_21", name: "Gabriel Martinelli", number: 21, position: "Atacante" },
    { id: "BRA_22", name: "Bremer", number: 22, position: "Defensor" },
    { id: "BRA_23", name: "Ederson", number: 23, position: "Goleiro" },
  ],
  ARG: [
    { id: "ARG_01", name: "Emiliano Martínez", number: 1, position: "Goleiro" },
    { id: "ARG_02", name: "Nahuel Molina", number: 2, position: "Defensor" },
    { id: "ARG_03", name: "Nicolás Tagliafico", number: 3, position: "Defensor" },
    { id: "ARG_04", name: "Cristian Romero", number: 4, position: "Defensor" },
    { id: "ARG_05", name: "Leandro Paredes", number: 5, position: "Meio-campista" },
    { id: "ARG_06", name: "Lisandro Martínez", number: 6, position: "Defensor" },
    { id: "ARG_07", name: "Rodrigo De Paul", number: 7, position: "Meio-campista" },
    { id: "ARG_08", name: "Enzo Fernández", number: 8, position: "Meio-campista" },
    { id: "ARG_09", name: "Julián Álvarez", number: 9, position: "Atacante" },
    { id: "ARG_10", name: "Lionel Messi", number: 10, position: "Atacante", isCaptain: true },
    { id: "ARG_11", name: "Ángel Di María", number: 11, position: "Atacante" },
    { id: "ARG_12", name: "Franco Armani", number: 12, position: "Goleiro" },
    { id: "ARG_13", name: "Gonzalo Montiel", number: 13, position: "Defensor" },
    { id: "ARG_14", name: "Alexis Mac Allister", number: 14, position: "Meio-campista" },
    { id: "ARG_15", name: "Germán Pezzella", number: 15, position: "Defensor" },
    { id: "ARG_16", name: "Giovani Lo Celso", number: 16, position: "Meio-campista" },
    { id: "ARG_17", name: "Alejandro Garnacho", number: 17, position: "Atacante" },
    { id: "ARG_18", name: "Guido Rodríguez", number: 18, position: "Meio-campista" },
    { id: "ARG_19", name: "Nicolás Otamendi", number: 19, position: "Defensor" },
    { id: "ARG_20", name: "Lautaro Martínez", number: 20, position: "Atacante" },
    { id: "ARG_21", name: "Nicolás González", number: 21, position: "Atacante" },
    { id: "ARG_22", name: "Marcos Acuña", number: 22, position: "Defensor" },
    { id: "ARG_23", name: "Gerónimo Rulli", number: 23, position: "Goleiro" },
  ],
  FRA: [
    { id: "FRA_01", name: "Mike Maignan", number: 1, position: "Goleiro" },
    { id: "FRA_02", name: "Benjamin Pavard", number: 2, position: "Defensor" },
    { id: "FRA_03", name: "Lucas Hernández", number: 3, position: "Defensor" },
    { id: "FRA_04", name: "Dayot Upamecano", number: 4, position: "Defensor" },
    { id: "FRA_05", name: "Jules Koundé", number: 5, position: "Defensor" },
    { id: "FRA_06", name: "Aurélien Tchouaméni", number: 6, position: "Meio-campista" },
    { id: "FRA_07", name: "Antoine Griezmann", number: 7, position: "Atacante", isCaptain: true },
    { id: "FRA_08", name: "Adrien Rabiot", number: 8, position: "Meio-campista" },
    { id: "FRA_09", name: "Olivier Giroud", number: 9, position: "Atacante" },
    { id: "FRA_10", name: "Kylian Mbappé", number: 10, position: "Atacante" },
    { id: "FRA_11", name: "Ousmane Dembélé", number: 11, position: "Atacante" },
    { id: "FRA_12", name: "Alphonse Areola", number: 12, position: "Goleiro" },
    { id: "FRA_13", name: "N'Golo Kanté", number: 13, position: "Meio-campista" },
    { id: "FRA_14", name: "Theo Hernández", number: 14, position: "Defensor" },
    { id: "FRA_15", name: "Marcus Thuram", number: 15, position: "Atacante" },
    { id: "FRA_16", name: "Mike Maignan", number: 16, position: "Goleiro" },
    { id: "FRA_17", name: "Randal Kolo Muani", number: 17, position: "Atacante" },
    { id: "FRA_18", name: "Eduardo Camavinga", number: 18, position: "Meio-campista" },
    { id: "FRA_19", name: "Youssouf Fofana", number: 19, position: "Meio-campista" },
    { id: "FRA_20", name: "Bradley Barcola", number: 20, position: "Atacante" },
    { id: "FRA_21", name: "Ibrahima Konaté", number: 21, position: "Defensor" },
    { id: "FRA_22", name: "William Saliba", number: 22, position: "Defensor" },
    { id: "FRA_23", name: "Brice Samba", number: 23, position: "Goleiro" },
  ],
};

export function generateSquad(teamId: string): Player[] {
  if (REAL_SQUADS[teamId]) return REAL_SQUADS[teamId];

  const rand = getSeededRandom(teamId);
  const lang = getTeamLanguageCategory(teamId);
  const fNames = FIRST_NAMES[lang] || FIRST_NAMES.latin;
  const lNames = LAST_NAMES[lang] || LAST_NAMES.latin;

  const players: Player[] = [];
  const roles: ('Goleiro' | 'Defensor' | 'Meio-campista' | 'Atacante')[] = [
    ...Array(3).fill('Goleiro'),
    ...Array(7).fill('Defensor'),
    ...Array(7).fill('Meio-campista'),
    ...Array(6).fill('Atacante')
  ];

  const numbersUsed = new Set<number>();

  for (let i = 0; i < 23; i++) {
    const fIdx = Math.floor(rand() * fNames.length);
    const lIdx = Math.floor(rand() * lNames.length);
    let number = i === 9 ? 10 : (i === 0 ? 1 : Math.floor(rand() * 25) + 2);
    while (numbersUsed.has(number)) {
      number = Math.floor(rand() * 98) + 2;
    }
    numbersUsed.add(number);

    let name = `${fNames[fIdx]} ${lNames[lIdx]}`;
    if (players.some(p => p.name === name)) name += " Jr.";

    players.push({
      id: `${teamId}_${String(i + 1).padStart(2, '0')}`,
      name,
      number,
      position: roles[i],
      isCaptain: i === 2,
    });
  }

  const posOrder: Record<string, number> = { 'Goleiro': 0, 'Defensor': 1, 'Meio-campista': 2, 'Atacante': 3 };
  return players.sort((a, b) => posOrder[a.position] - posOrder[b.position]);
}

// ==============================================================
// Group stage match generation (72 matches, real Copa 2026 schedule)
// ==============================================================
function makeEmptyStats(): MatchStats {
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

export function generateGroupMatches(): Match[] {
  const matches: Match[] = [];
  const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
  let matchCounter = 1;
  const startDate = new Date("2026-06-11T13:00:00Z");

  const ytIds = [
    "v2_WswqM37A", "E-MhKszRslE", "z62gB7aT2_Y", "lQW9PqM3V6k",
    "U42w8D3-Wms", "3Bq9xY-2_5E", "5Wc-5J1lP2A", "a4bU3-WmsC9"
  ];

  groups.forEach((groupName) => {
    const groupTeams = INITIAL_TEAMS.filter(t => t.group === groupName);
    if (groupTeams.length < 4) return;

    const [t0, t1, t2, t3] = [groupTeams[0].id, groupTeams[1].id, groupTeams[2].id, groupTeams[3].id];
    const matchups = [
      { h: t0, a: t1, dayOffset: 0 },
      { h: t2, a: t3, dayOffset: 0 },
      { h: t0, a: t2, dayOffset: 4 },
      { h: t1, a: t3, dayOffset: 4 },
      { h: t3, a: t0, dayOffset: 8 },
      { h: t1, a: t2, dayOffset: 8 },
    ];

    matchups.forEach((matchup, idx) => {
      const matchDate = new Date(startDate.getTime());
      const groupOffset = groups.indexOf(groupName) * 0.5;
      matchDate.setDate(matchDate.getDate() + matchup.dayOffset + Math.floor(groupOffset));
      const hours = [13, 16, 19];
      matchDate.setUTCHours(hours[idx % 3], 0, 0, 0);

      const stadiumIndex = (matchCounter - 1) % STADIUMS.length;
      const youtubeId = ytIds[matchCounter % ytIds.length];

      // Determine match status based on match date vs now
      const now = new Date();
      const matchTime = matchDate.getTime();
      const twoHoursMs = 2 * 60 * 60 * 1000;

      let status: 'SCHEDULED' | 'LIVE' | 'FINISHED' = 'SCHEDULED';
      let homeScore: number | null = null;
      let awayScore: number | null = null;
      const events: MatchEvent[] = [];
      let currentMinute: number | undefined;

      const isPast = matchTime < now.getTime() - twoHoursMs;
      const isCurrentlyLive = !isPast && matchTime < now.getTime() && matchTime > now.getTime() - twoHoursMs;

      if (isPast) {
        status = 'FINISHED';
        // Scores will be loaded from football-data.org API
        // We start with null - the API will fill in actual scores
        homeScore = null;
        awayScore = null;

        // Events and stats are intentionally empty — they come from API-Football
        matches.push({ id: `M_${String(matchCounter).padStart(3, '0')}`, homeTeamId: matchup.h, awayTeamId: matchup.a, homeScore, awayScore, date: matchDate.toISOString(), status, stage: 'GROUP', group: groupName, stadiumId: STADIUMS[stadiumIndex].id, youtubeId, minute: currentMinute, events: [], stats: makeEmptyStats() });
      } else if (isCurrentlyLive) {
        status = 'LIVE';
        homeScore = 0;
        awayScore = 0;
        currentMinute = Math.floor((now.getTime() - matchTime) / 60000);

        events.push({ id: `ev_${matchCounter}_live_start`, minute: 1, type: 'comment', detail: 'BOLA ROLANDO! Começa o espetáculo da Copa do Mundo 2026.' });
        matches.push({ id: `M_${String(matchCounter).padStart(3, '0')}`, homeTeamId: matchup.h, awayTeamId: matchup.a, homeScore, awayScore, date: matchDate.toISOString(), status, stage: 'GROUP', group: groupName, stadiumId: STADIUMS[stadiumIndex].id, youtubeId, minute: currentMinute, events, stats: makeEmptyStats() });
      } else {
        matches.push({ id: `M_${String(matchCounter).padStart(3, '0')}`, homeTeamId: matchup.h, awayTeamId: matchup.a, homeScore, awayScore, date: matchDate.toISOString(), status, stage: 'GROUP', group: groupName, stadiumId: STADIUMS[stadiumIndex].id, youtubeId, events: [], stats: makeEmptyStats() });
      }

      matchCounter++;
    });
  });

  return matches;
}

// ==============================================================
// Calculate standings from match results
// ==============================================================
export function calculateStandings(teams: Team[], matches: Match[]): Team[] {
  const updatedTeams = teams.map(t => ({
    ...t,
    points: 0, played: 0, wins: 0, draws: 0, losses: 0,
    goalsFor: 0, goalsAgainst: 0, goalsDifference: 0
  }));

  matches.forEach(m => {
    if (m.stage !== 'GROUP' || m.homeScore === null || m.awayScore === null || m.status !== 'FINISHED') return;

    const home = updatedTeams.find(t => t.id === m.homeTeamId);
    const away = updatedTeams.find(t => t.id === m.awayTeamId);
    if (!home || !away) return;

    home.played += 1;
    away.played += 1;
    home.goalsFor += m.homeScore;
    home.goalsAgainst += m.awayScore;
    away.goalsFor += m.awayScore;
    away.goalsAgainst += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.wins += 1; home.points += 3; away.losses += 1;
    } else if (m.homeScore < m.awayScore) {
      away.wins += 1; away.points += 3; home.losses += 1;
    } else {
      home.draws += 1; away.draws += 1;
      home.points += 1; away.points += 1;
    }

    home.goalsDifference = home.goalsFor - home.goalsAgainst;
    away.goalsDifference = away.goalsFor - away.goalsAgainst;
  });

  return updatedTeams.sort((a, b) => {
    if (a.group !== b.group) return a.group.localeCompare(b.group);
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalsDifference !== a.goalsDifference) return b.goalsDifference - a.goalsDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.name.localeCompare(b.name);
  });
}

// ==============================================================
// Bracket Node interface and generator
// ==============================================================
export interface BracketNode {
  id: string;
  stage: 'ROUND_OF_32' | 'ROUND_OF_16' | 'QUARTER_FINALS' | 'SEMI_FINALS' | 'FINAL';
  homeTeamPlaceholder: string;
  awayTeamPlaceholder: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerId: string | null;
  date: string;
  stadiumId: string;
  youtubeId: string;
  nextMatchId: string | null;
}

export function generateKnockoutBracket(standings: Team[]): BracketNode[] {
  // Copa 2026: 12 group winners + 12 runners-up + 8 best 3rds = 32 teams
  const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
  const winners: Team[] = [];
  const runnersUp: Team[] = [];
  const thirds: Team[] = [];

  groups.forEach(g => {
    const groupTeams = standings.filter(t => t.group === g).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalsDifference !== a.goalsDifference) return b.goalsDifference - a.goalsDifference;
      return b.goalsFor - a.goalsFor;
    });
    if (groupTeams.length >= 3) {
      winners.push(groupTeams[0]);
      runnersUp.push(groupTeams[1]);
      thirds.push(groupTeams[2]);
    }
  });

  const bestThirds = thirds
    .sort((a, b) => b.points - a.points || b.goalsDifference - a.goalsDifference || b.goalsFor - a.goalsFor)
    .slice(0, 8);

  // R32 slots: [W_A, R_A, W_B, R_B ... W_L, R_L, 3rd_best_1...3rd_best_8]
  // Simplified bracket: alternate winners and runners-up
  const r32Teams: (string | null)[] = Array(32).fill(null);
  for (let i = 0; i < 12 && i < winners.length; i++) r32Teams[i * 2] = winners[i].id;
  for (let i = 0; i < 12 && i < runnersUp.length; i++) r32Teams[i * 2 + 1] = runnersUp[i].id;
  for (let i = 0; i < 8 && i < bestThirds.length; i++) r32Teams[24 + i] = bestThirds[i].id;

  const nodes: BracketNode[] = [];

  // 1. Round of 32 (16 matches) - all start clean
  const r32BaseDate = new Date("2026-06-28T19:00:00Z");
  for (let i = 0; i < 16; i++) {
    const matchId = `R32_${String(i + 1).padStart(2, '0')}`;
    const nextMatchId = `R16_${String(Math.floor(i / 2) + 1).padStart(2, '0')}`;
    const date = new Date(r32BaseDate.getTime());
    date.setDate(date.getDate() + Math.floor(i / 4));
    date.setUTCHours(17 + (i % 2) * 4, 0, 0, 0);

    const homeId = r32Teams[i * 2] || null;
    const awayId = r32Teams[i * 2 + 1] || null;
    const grpIdx = Math.min(Math.floor(i / 1.5), groups.length - 1);

    nodes.push({
      id: matchId,
      stage: 'ROUND_OF_32',
      homeTeamPlaceholder: homeId ? homeId : `1º Grupo ${groups[Math.min(i, 11)]}`,
      awayTeamPlaceholder: awayId ? awayId : `2º Grupo ${groups[Math.min(grpIdx, 11)]}`,
      homeTeamId: homeId,
      awayTeamId: awayId,
      homeScore: null,
      awayScore: null,
      winnerId: null,
      date: date.toISOString(),
      stadiumId: STADIUMS[i % STADIUMS.length].id,
      youtubeId: "v2_WswqM37A",
      nextMatchId,
    });
  }

  // 2. Round of 16 (8 matches)
  const r16BaseDate = new Date("2026-07-04T17:00:00Z");
  for (let i = 0; i < 8; i++) {
    const matchId = `R16_${String(i + 1).padStart(2, '0')}`;
    const nextMatchId = `QF_${String(Math.floor(i / 2) + 1).padStart(2, '0')}`;
    const date = new Date(r16BaseDate.getTime());
    date.setDate(date.getDate() + Math.floor(i / 2));
    date.setUTCHours(17 + (i % 2) * 4, 0, 0, 0);

    nodes.push({
      id: matchId,
      stage: 'ROUND_OF_16',
      homeTeamPlaceholder: `Venc. R32-${String(i * 2 + 1).padStart(2, '0')}`,
      awayTeamPlaceholder: `Venc. R32-${String(i * 2 + 2).padStart(2, '0')}`,
      homeTeamId: null,
      awayTeamId: null,
      homeScore: null,
      awayScore: null,
      winnerId: null,
      date: date.toISOString(),
      stadiumId: STADIUMS[(i + 4) % STADIUMS.length].id,
      youtubeId: "E-MhKszRslE",
      nextMatchId,
    });
  }

  // 3. Quarter Finals (4 matches)
  const qfBaseDate = new Date("2026-07-09T17:00:00Z");
  for (let i = 0; i < 4; i++) {
    const matchId = `QF_${String(i + 1).padStart(2, '0')}`;
    const nextMatchId = `SF_${String(Math.floor(i / 2) + 1).padStart(2, '0')}`;
    const date = new Date(qfBaseDate.getTime());
    date.setDate(date.getDate() + Math.floor(i / 2));
    date.setUTCHours(17 + (i % 2) * 4, 0, 0, 0);

    nodes.push({
      id: matchId,
      stage: 'QUARTER_FINALS',
      homeTeamPlaceholder: `Venc. Oitavas ${i * 2 + 1}`,
      awayTeamPlaceholder: `Venc. Oitavas ${i * 2 + 2}`,
      homeTeamId: null,
      awayTeamId: null,
      homeScore: null,
      awayScore: null,
      winnerId: null,
      date: date.toISOString(),
      stadiumId: STADIUMS[(i + 8) % STADIUMS.length].id,
      youtubeId: "z62gB7aT2_Y",
      nextMatchId,
    });
  }

  // 4. Semi Finals (2 matches)
  const sfBaseDate = new Date("2026-07-14T20:00:00Z");
  for (let i = 0; i < 2; i++) {
    const matchId = `SF_${String(i + 1).padStart(2, '0')}`;
    const date = new Date(sfBaseDate.getTime());
    date.setDate(date.getDate() + i * 2);
    date.setUTCHours(20, 0, 0, 0);

    nodes.push({
      id: matchId,
      stage: 'SEMI_FINALS',
      homeTeamPlaceholder: `Venc. Quartas ${i * 2 + 1}`,
      awayTeamPlaceholder: `Venc. Quartas ${i * 2 + 2}`,
      homeTeamId: null,
      awayTeamId: null,
      homeScore: null,
      awayScore: null,
      winnerId: null,
      date: date.toISOString(),
      stadiumId: STADIUMS[i === 0 ? 3 : 2].id,
      youtubeId: "lQW9PqM3V6k",
      nextMatchId: "FINAL_01",
    });
  }

  // 5. Grand Final
  nodes.push({
    id: "FINAL_01",
    stage: 'FINAL',
    homeTeamPlaceholder: "Vencedor Semifinal 1",
    awayTeamPlaceholder: "Vencedor Semifinal 2",
    homeTeamId: null,
    awayTeamId: null,
    homeScore: null,
    awayScore: null,
    winnerId: null,
    date: "2026-07-19T18:00:00Z",
    stadiumId: "STAD_02",
    youtubeId: "U42w8D3-Wms",
    nextMatchId: null,
  });

  return nodes;
}
