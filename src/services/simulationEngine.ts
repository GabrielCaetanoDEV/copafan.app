import { Match, Team, generateSquad } from '../data/copaData';

// Realistic commentary pools in Portuguese
const COMMENTARY_TEMPLATES = {
  possession: [
    "Troca passes com paciência no meio de campo, buscando abrir espaços.",
    "Trabalha a bola de um lado para o outro. A defesa adversária se fecha bem.",
    "Aperta a marcação no campo ofensivo e força o erro de passe.",
    "Mantém a posse de bola sob vaias da torcida adversária.",
    "Tenta acelerar o ritmo com passes rápidos de primeira."
  ],
  shot_miss: [
    "Chutou para fora! Arriscou de longe, mas a bola subiu demais.",
    "Passou raspando a trave! Que chance perdida de abrir vantagem!",
    "Chute rasteiro cruzado, mas sai sem direção pela linha de fundo.",
    "Finalização sem força, a bola rola mansa para fora.",
    "Tentativa de chute colocado, mas pegou muito embaixo da bola."
  ],
  shot_saved: [
    "DEFESAÇA! O goleiro voa no ângulo e espalma para escanteio! Que milagre!",
    "Goleiro seguro! Chute firme de meia distância, mas ele encaixa sem rebote.",
    "Espalma o arqueiro! Chute forte e no meio do gol, ele afasta o perigo.",
    "Em dois tempos! O atacante bate cruzado e o goleiro segura a bola em seguida.",
    "O goleiro fecha o ângulo e faz uma grande defesa cara a cara!"
  ],
  foul: [
    "Falta marcada. Entrada mais forte para parar a jogada no meio de campo.",
    "O árbitro apita. Falta de ataque após disputa aérea na área adversária.",
    "Jogo parado. Jogador caído reclamando de pancada no tornozelo.",
    "Falta cometida na lateral do campo. Boa chance para cruzamento na área.",
    "Entrada atrasada no círculo central. O juiz apenas adverte verbalmente."
  ],
  yellow_card: [
    "Cartão Amarelo! Entrada dura por trás, punição merecida.",
    "Cartão Amarelo aplicado por reclamação acintosa com a arbitragem.",
    "Cartão Amarelo por parar o contra-ataque promissor com falta tática.",
    "Cartão Amarelo! O jogador deixou o pé em dividida desnecessária."
  ],
  red_card: [
    "CARTÃO VERMELHO DIRETO! Entrada violenta de sola, expulsão incontestável!",
    "SEGUNDO AMARELO E RUA! Falta tática violenta e o jogador vai mais cedo para o chuveiro!"
  ],
  corner: [
    "Escanteio cobrado curto. A zaga afasta em seguida.",
    "Cruzamento fechado na cobrança de escanteio, o goleiro sai de soco e tira dali.",
    "Escanteio cobrado na primeira trave, a defesa corta para lateral.",
    "Cabeceio após cobrança de escanteio! A bola passa por cima do travessão."
  ],
  substitution: [
    "Substituição no time! Entra sangue novo para dar mais velocidade ao ataque.",
    "Substituição tática: sai um meia cansado para a entrada de um volante de marcação.",
    "Alteração: o treinador saca o lateral cansado para reforçar o setor defensivo."
  ],
  goal_build: [
    "GOOOOOOOOOOL! É REDE! Que jogada espetacular! Finalização precisa sem chances para o goleiro!",
    "GOOOOL! No rebote! O chute explodiu na trave e o atacante completou de cabeça!",
    "GOOOOOOL DA SELEÇÃO! Gol de placa! Driblou dois defensores e bateu colocado no canto!",
    "GOOOOL! Na cobrança de pênalti! Batida firme no canto oposto do goleiro!"
  ]
};

// Seed-free random helpers for live simulation
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function simulateMatchTick(match: Match, teams: Team[]): Match {
  if (match.status !== 'LIVE' || match.minute === undefined) {
    return match;
  }

  const newMatch = { ...match, events: [...match.events], stats: { ...match.stats } };
  const currentMinute = newMatch.minute! + 1;
  newMatch.minute = currentMinute;

  // If match reaches 90 minutes, finish it
  if (currentMinute >= 90) {
    newMatch.status = 'FINISHED';
    newMatch.events.push({
      id: `ev_${newMatch.id}_end_game`,
      minute: 90,
      type: 'comment',
      detail: 'FIM DE PAPO! O árbitro apita o final do jogo. Que partida espetacular acompanhamos!'
    });
    return newMatch;
  }

  const homeTeam = teams.find(t => t.id === newMatch.homeTeamId);
  const awayTeam = teams.find(t => t.id === newMatch.awayTeamId);
  const homeName = homeTeam?.name || "Mandante";
  const awayName = awayTeam?.name || "Visitante";

  const hSquad = generateSquad(newMatch.homeTeamId);
  const aSquad = generateSquad(newMatch.awayTeamId);

  // Generate random events during the tick (every minute has a chance of some event)
  const randVal = Math.random();

  // 1. Goal Chance (1.5% chance per minute)
  if (randVal < 0.015) {
    const isHomeGoal = Math.random() < 0.52; // Slight home bias
    const scoringTeamId = isHomeGoal ? newMatch.homeTeamId : newMatch.awayTeamId;
    const teamName = isHomeGoal ? homeName : awayName;
    const squad = isHomeGoal ? hSquad : aSquad;
    
    // Choose a striker or mid for the goal
    const scorer = squad[Math.floor(Math.random() * 8) + 15] || squad[10];

    if (isHomeGoal) {
      newMatch.homeScore = (newMatch.homeScore || 0) + 1;
      newMatch.stats.shotsHome += 1;
      newMatch.stats.shotsOnTargetHome += 1;
    } else {
      newMatch.awayScore = (newMatch.awayScore || 0) + 1;
      newMatch.stats.shotsAway += 1;
      newMatch.stats.shotsOnTargetAway += 1;
    }

    newMatch.events.push({
      id: `ev_${newMatch.id}_g_${currentMinute}_${Math.random().toString(36).substr(2, 4)}`,
      minute: currentMinute,
      type: 'goal',
      teamId: scoringTeamId,
      playerName: scorer.name,
      detail: `${randomChoice(COMMENTARY_TEMPLATES.goal_build).replace("DA SELEÇÃO", `do ${teamName}`)} (${scorer.name}, nº ${scorer.number})`
    });
  }
  // 2. Shot (Miss or Saved) (5% chance)
  else if (randVal < 0.065) {
    const isHome = Math.random() < 0.53;
    const teamName = isHome ? homeName : awayName;
    const isSaved = Math.random() < 0.45; // 45% of shots are on target and saved
    const squad = isHome ? hSquad : aSquad;
    const shooter = squad[Math.floor(Math.random() * 10) + 13];

    if (isHome) {
      newMatch.stats.shotsHome += 1;
      if (isSaved) newMatch.stats.shotsOnTargetHome += 1;
    } else {
      newMatch.stats.shotsAway += 1;
      if (isSaved) newMatch.stats.shotsOnTargetAway += 1;
    }

    const comment = isSaved 
      ? `${teamName} finaliza! ${randomChoice(COMMENTARY_TEMPLATES.shot_saved)}`
      : `${teamName} arrisca! ${randomChoice(COMMENTARY_TEMPLATES.shot_miss)}`;

    newMatch.events.push({
      id: `ev_${newMatch.id}_s_${currentMinute}`,
      minute: currentMinute,
      type: isSaved ? 'comment' : 'comment',
      teamId: isHome ? newMatch.homeTeamId : newMatch.awayTeamId,
      playerName: shooter.name,
      detail: `${comment} (${shooter.name})`
    });
  }
  // 3. Corner kick (4% chance)
  else if (randVal < 0.105) {
    const isHome = Math.random() < 0.5;
    const teamName = isHome ? homeName : awayName;
    
    if (isHome) {
      newMatch.stats.cornersHome += 1;
    } else {
      newMatch.stats.cornersAway += 1;
    }

    newMatch.events.push({
      id: `ev_${newMatch.id}_c_${currentMinute}`,
      minute: currentMinute,
      type: 'comment',
      teamId: isHome ? newMatch.homeTeamId : newMatch.awayTeamId,
      detail: `Escanteio para o ${teamName}! ${randomChoice(COMMENTARY_TEMPLATES.corner)}`
    });
  }
  // 4. Yellow card / Foul (6% chance)
  else if (randVal < 0.165) {
    const isHome = Math.random() < 0.5;
    const teamName = isHome ? homeName : awayName;
    const teamId = isHome ? newMatch.homeTeamId : newMatch.awayTeamId;
    const squad = isHome ? hSquad : aSquad;
    const player = squad[Math.floor(Math.random() * 14) + 3]; // mid/def

    const isCard = Math.random() < 0.25; // 25% of fouls get a card

    if (isHome) {
      newMatch.stats.foulsHome += 1;
      if (isCard) newMatch.stats.yellowHome += 1;
    } else {
      newMatch.stats.foulsAway += 1;
      if (isCard) newMatch.stats.yellowAway += 1;
    }

    newMatch.events.push({
      id: `ev_${newMatch.id}_f_${currentMinute}`,
      minute: currentMinute,
      type: isCard ? 'yellow_card' : 'comment',
      teamId,
      playerName: player.name,
      detail: isCard
        ? `${randomChoice(COMMENTARY_TEMPLATES.yellow_card)} (${player.name}, do ${teamName})`
        : `Falta de ${player.name} (${teamName}). ${randomChoice(COMMENTARY_TEMPLATES.foul)}`
    });
  }
  // 5. Red Card (0.2% chance)
  else if (randVal < 0.167) {
    const isHome = Math.random() < 0.5;
    const teamName = isHome ? homeName : awayName;
    const teamId = isHome ? newMatch.homeTeamId : newMatch.awayTeamId;
    const squad = isHome ? hSquad : aSquad;
    const player = squad[Math.floor(Math.random() * 10) + 3]; // defenders

    if (isHome) {
      newMatch.stats.redHome += 1;
    } else {
      newMatch.stats.redAway += 1;
    }

    newMatch.events.push({
      id: `ev_${newMatch.id}_rc_${currentMinute}`,
      minute: currentMinute,
      type: 'red_card',
      teamId,
      playerName: player.name,
      detail: `${randomChoice(COMMENTARY_TEMPLATES.red_card)} (${player.name}, do ${teamName})`
    });
  }
  // 6. Substitution (typical around minutes 60-80, 2% chance)
  else if (randVal < 0.187 && currentMinute > 55 && currentMinute < 85) {
    const isHome = Math.random() < 0.5;
    const teamName = isHome ? homeName : awayName;
    const teamId = isHome ? newMatch.homeTeamId : newMatch.awayTeamId;
    const squad = isHome ? hSquad : aSquad;
    
    // Choose sub in/out
    const outPlayer = squad[Math.floor(Math.random() * 11)];
    const inPlayer = squad[Math.floor(Math.random() * 12) + 11];

    newMatch.events.push({
      id: `ev_${newMatch.id}_sub_${currentMinute}`,
      minute: currentMinute,
      type: 'substitution',
      teamId,
      playerName: `${outPlayer.name} / ${inPlayer.name}`,
      detail: `Substituição no ${teamName}: sai ${outPlayer.name} (nº ${outPlayer.number}) e entra ${inPlayer.name} (nº ${inPlayer.number}).`
    });
  }
  // 7. General Commentary (15% chance)
  else if (randVal < 0.337) {
    newMatch.events.push({
      id: `ev_${newMatch.id}_c_comm_${currentMinute}`,
      minute: currentMinute,
      type: 'comment',
      detail: `[${currentMinute}'] - ${randomChoice(COMMENTARY_TEMPLATES.possession)}`
    });
  }

  // Slightly oscillate possession
  const possessionDelta = Math.floor(Math.random() * 5) - 2; // -2 to +2
  newMatch.stats.possessionHome = Math.max(30, Math.min(70, newMatch.stats.possessionHome + possessionDelta));
  newMatch.stats.possessionAway = 100 - newMatch.stats.possessionHome;

  // Sort events by minute (descending for nice timeline layout or ascending, let's keep ascending and we sort it in UI)
  newMatch.events.sort((a, b) => b.minute - a.minute); // Descending so latest events show first in a feed!

  return newMatch;
}
