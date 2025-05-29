export enum TournamentPhase {
  SEDICESIMI = "Sedicesimi",
  OTTAVI = "Ottavi",
  QUARTI = "Quarti",
  SEMIFINALI = "Semifinali",
  FINALE = "Finale",
  VINCITORE = "Vincitore"
}

export interface Player {
  id?: number;
  nome: string;
  nazionalita: string;
  ranking?: number;
  punti?: number;
}

export interface Match {
  id?: number;
  giocatore1: string;
  giocatore2: string;
  data_ora: string;
  fase: TournamentPhase;
  campo: string;
  punteggio?: string;
  vincitore?: string;
}

export interface Tournament {
  id?: number;
  nome: string;
  luogo: string;
  data_inizio: string;
  data_fine: string;
  numero_giocatori: number;
}

export interface CreateTournamentRequest {
  tournament: Tournament;
  players: string[];
}

export interface UpdateMatchResultRequest {
  punteggio: string;
  vincitore: string;
}

export interface UpdatePlayerPointsRequest {
  punti: number;
} 