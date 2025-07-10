# Relazione Progetto: TennisHub

**Gestione Tornei Internazionali di Tennis**  
A.A. 2024/2025  
Studenti:  
- Kirollos Habashi [kirollosemad.habashi@studio.unibo.it] 0001126002  
- Mattia Pozzati [mattia.pozzati3@studio.unibo.it] 0001117149  

---

## Indice
1. [Introduzione Generale](#introduzione-generale)
2. [Analisi dei Requisiti](#analisi-dei-requisiti)
3. [Progettazione Concettuale](#progettazione-concettuale)
4. [Progettazione Logica](#progettazione-logica)
5. [Progettazione dell’Applicazione](#progettazione-dellapplicazione)
6. [Query Principali](#query-principali)
7. [Tabella dei Privilegi di Accesso](#tabella-dei-privilegi-di-accesso)

---

## Introduzione Generale

La piattaforma TennisHub digitalizza la gestione di tornei di tennis internazionali, consentendo la registrazione e la gestione di team, giocatori, arbitri e tornei. Automatizza processi come l’iscrizione ai tornei, la gestione disciplinare e la visualizzazione delle classifiche.

---

## Analisi dei Requisiti

### Concetti Principali

| Concetto         | Descrizione | Vincoli/Regole | Entità DB |
|------------------|-------------|----------------|-----------|
| Team             | Gruppo che partecipa ai tornei | Può essere bloccato | Team |
| Giocatore        | Atleta associato a un team | Appartiene a un team | Player |
| Arbitro          | Ufficiale con livello e disponibilità | Può candidarsi a tornei | Referee |
| Torneo           | Competizione con nome, edizione, livello minimo, tipo campo | Livello minimo, max 16 giocatori | Tournament |
| Partecipazione   | Iscrizione di uno o più giocatori di un team a un torneo | Solo se team non bloccato | TournamentRegistration |
| Fase             | Suddivisione del torneo (es. Quarti, Semifinali) | Ogni torneo ha più fasi | Phase |
| Partita          | Incontro tra due giocatori | Arbitro assegnato, fase | Match |
| Amministratore   | Gestisce tornei, arbitri, blocca/sblocca team | Solo admin può bloccare/sbloccare | User (admin) |

---

### Specifiche Funzionali

- **Registrazione Team:** nome, email, password. Ogni team può aggiungere giocatori.
- **Registrazione Giocatori:** solo tramite team.
- **Registrazione Arbitri:** nome, cognome, livello, codice fiscale.
- **Creazione Tornei:** solo admin, con requisiti di livello e tipo campo.
- **Iscrizione ai Tornei:**  
  - Il team può scegliere quali giocatori iscrivere (tramite checkbox).
  - Solo i giocatori selezionati vengono iscritti.
  - Un team bloccato non può iscrivere giocatori a nuovi tornei.
- **Blocco Team:**  
  - Dopo 3 sanzioni disciplinari, il team viene bloccato automaticamente.
  - Solo l’admin può sbloccare un team.
- **Gestione Arbitri:** candidatura a tornei, assegnazione alle partite.
- **Classifiche:** ranking generale e per tipo di campo.
- **Storico:** tracciamento punteggi e partecipazioni.

---

## Progettazione Concettuale

La progettazione concettuale si basa sull’analisi dei requisiti e individua le entità fondamentali, le loro relazioni e i vincoli principali del dominio “tornei di tennis”.

### Scelte progettuali
- **Centralità del team**: ogni azione competitiva parte dal team, che può essere bloccato per motivi disciplinari. Questo riflette la realtà dei tornei a squadre e permette una gestione amministrativa efficace.
- **Partecipazione per giocatore**: la partecipazione ai tornei è tracciata a livello di giocatore, non di team intero, per supportare tornei con squadre di dimensione variabile e per gestire casi di sostituzione o infortuni.
- **Fasi del torneo**: la suddivisione in fasi (es. Quarti, Semifinali, Finale) permette di modellare tornei a eliminazione diretta e di gestire la progressione dei match.
- **Gestione disciplinare**: la presenza di una flag `is_blocked` e di un contatore di sanzioni consente di automatizzare la sospensione dei team recidivi, garantendo correttezza e trasparenza.
- **Ruolo dell’admin**: solo l’amministratore può bloccare/sbloccare team e creare tornei, riflettendo la separazione dei privilegi.

### Entità principali
- **Team**: gruppo organizzato che partecipa ai tornei, può essere bloccato per motivi disciplinari.
- **Player**: atleta appartenente a un team, con livello e punteggio.
- **Referee**: arbitro con livello, punteggio e disponibilità per i tornei.
- **Tournament**: competizione con nome, edizione, periodo, livello minimo richiesto, tipo di campo.
- **Phase**: suddivisione di un torneo (es. Quarti, Semifinali, Finale).
- **Match**: partita tra due giocatori, associata a una fase e arbitrata da un referee.
- **TournamentRegistration**: partecipazione di uno o più giocatori di un team a un torneo.
- **RefereeAvailability**: disponibilità di un arbitro per un torneo.

#### Relazioni e vincoli
- Un **Team** può avere più **Player** (1:N).
- Un **Player** appartiene a un solo **Team** (N:1).
- Un **Team** può iscrivere uno o più **Player** a un **Tournament** tramite **TournamentRegistration**.
- Un **Tournament** è suddiviso in più **Phase** (1:N).
- Una **Phase** contiene più **Match** (1:N).
- Un **Match** coinvolge due **Player** e un **Referee**.
- Un **Referee** può essere disponibile per più **Tournament** tramite **RefereeAvailability**.
- Un **Team** bloccato non può iscrivere giocatori a nuovi tornei (vincolo applicativo e di business).
- Un **Player** può essere iscritto a un torneo solo una volta per edizione.

#### Motivazione delle scelte
- **Tracciamento puntuale**: la granularità a livello di giocatore e partita permette statistiche dettagliate e ranking accurati.
- **Flessibilità**: la struttura supporta tornei con regole diverse (es. numero di giocatori per team, fasi personalizzate).
- **Sicurezza e integrità**: i vincoli sulle foreign key e sulle iscrizioni evitano inconsistenze e duplicazioni.

---

## Progettazione Logica

La progettazione logica traduce lo schema concettuale in tabelle relazionali, specificando attributi, chiavi primarie e chiavi esterne, e motivando le scelte di struttura.

### Scelte progettuali
- **Normalizzazione**: tutte le tabelle sono normalizzate per evitare ridondanze e facilitare la manutenzione.
- **Foreign key**: ogni relazione è implementata tramite chiavi esterne per garantire integrità referenziale.
- **Attributi di stato**: l’uso di flag come `is_blocked` e `status` permette controlli rapidi e query efficienti.
- **Estendibilità**: la struttura consente di aggiungere facilmente nuove funzionalità (es. storico punteggi, log eventi).

### Struttura delle Tabelle Principali

- **Team:**  
  `id` (PK), `name`, `user_id` (FK), `is_blocked`, `disciplinary_actions_count`
- **Player:**  
  `id` (PK), `name`, `level`, `score`, `team_id` (FK)
- **Referee:**  
  `id` (PK), `name`, `last_name`, `level`, `score`, `fiscal_code`
- **Tournament:**  
  `id` (PK), `name`, `edition`, `start_date`, `end_date`, `min_level`, `min_referee_level`, `status`, `court_type`, `spectator_count`
- **TournamentRegistration:**  
  `id` (PK), `tournament_id` (FK), `player_id` (FK), `registration_date`
- **Phase:**  
  `id` (PK), `tournament_id` (FK), `name`, `start_date`, `end_date`
- **Match:**  
  `id` (PK), `tournament_id` (FK), `player1_id` (FK), `player2_id` (FK), `referee_id` (FK), `phase_id` (FK), `winner_id` (FK, nullable), `match_date`, `court_number`, `score`, `status`
- **RefereeAvailability:**  
  `id` (PK), `tournament_id` (FK), `referee_id` (FK), `is_available`

#### Vincoli e regole implementative
- Un team può essere bloccato (`is_blocked = 1`) e in tal caso non può iscrivere giocatori a nuovi tornei.
- Un team può iscrivere solo i propri giocatori a un torneo.
- Un arbitro può essere disponibile per più tornei, ma può arbitrare una sola partita per volta.
- Ogni torneo può avere più fasi e ogni fase più partite.
- La partecipazione a un torneo è tracciata a livello di giocatore (non di team intero).
- Le foreign key garantiscono che non possano esistere iscrizioni o match orfani.

#### Esempio di DDL (estratto)
```sql
CREATE TABLE Team (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  user_id INTEGER UNIQUE,
  is_blocked BOOLEAN DEFAULT 0,
  disciplinary_actions_count INTEGER DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES User(id)
);

CREATE TABLE Player (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  team_id INTEGER NOT NULL,
  FOREIGN KEY(team_id) REFERENCES Team(id)
);

CREATE TABLE Tournament (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  edition TEXT NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  min_level INTEGER NOT NULL,
  min_referee_level INTEGER NOT NULL,
  status TEXT NOT NULL,
  court_type TEXT NOT NULL,
  spectator_count INTEGER DEFAULT 0
);
```

---

## Progettazione dell’Applicazione

### Architettura

- **Backend:** FastAPI + SQLAlchemy (REST API)
- **Frontend:** React + TypeScript
- **Database:** SQLite (sviluppo), facilmente migrabile a PostgreSQL/MySQL
- **Autenticazione:** JWT (token-based)
- **Ruoli:** admin, team, referee

### Flussi Principali

- **Iscrizione a un torneo:**  
  1. Il team visualizza i tornei disponibili.
  2. Per ogni torneo, può selezionare tramite checkbox i giocatori da iscrivere.
  3. Solo i giocatori selezionati vengono inviati all’API.
  4. Se il team è bloccato, il bottone di iscrizione è disabilitato e viene mostrato un messaggio.
- **Blocco/Sblocco team:**  
  - L’admin può bloccare o sbloccare un team dalla dashboard.
  - Un team bloccato non può iscrivere giocatori a nuovi tornei.

---

## Query Principali

### 1. Registrazione di un Team
```sql
INSERT INTO users (email, password, user_type) VALUES (?, ?, 'team');
INSERT INTO teams (name, user_id, is_blocked, disciplinary_actions_count) VALUES (?, ?, 0, 0);
```

### 2. Registrazione di un Giocatore
```sql
INSERT INTO players (name, level, score, team_id) VALUES (?, ?, 0, ?);
```

### 3. Iscrizione di uno o più giocatori di un team a un torneo
```sql
SELECT is_blocked FROM teams WHERE id = :team_id;
INSERT INTO tournament_registrations (tournament_id, player_id, registration_date)
VALUES (:tournament_id, :player_id, CURRENT_TIMESTAMP);
```

### 4. Blocco automatico di un team dopo 3 sanzioni
```sql
UPDATE teams
SET disciplinary_actions_count = disciplinary_actions_count + 1,
    is_blocked = CASE WHEN disciplinary_actions_count + 1 >= 3 THEN 1 ELSE is_blocked END
WHERE id = :team_id;
```

### 5. Sblocco manuale di un team (solo admin)
```sql
UPDATE teams
SET is_blocked = 0, disciplinary_actions_count = 0
WHERE id = :team_id;
```

### 6. Recupero dei giocatori di un team
```sql
SELECT * FROM players WHERE team_id = :team_id;
```

### 7. Recupero dei tornei disponibili
```sql
SELECT * FROM tournaments
WHERE status != 'completed'
AND (
  SELECT COUNT(*) FROM tournament_registrations
  WHERE tournament_id = tournaments.id
) < 16;
```

### 8. Classifica giocatori
```sql
SELECT p.*, t.name as team_name
FROM players p
LEFT JOIN teams t ON p.team_id = t.id
ORDER BY p.score DESC;
```

### 9. Recupero partite di un torneo
```sql
SELECT m.*, ph.name as phase_name
FROM matches m
JOIN phases ph ON m.phase_id = ph.id
WHERE m.tournament_id = :tournament_id;
```

---

## Tabella dei Privilegi di Accesso

| Funzionalità                        | Team | Arbitro | Admin |
|-------------------------------------|:----:|:-------:|:-----:|
| Registrazione account               |  ✔   |   ✔     |  ✔    |
| Login                               |  ✔   |   ✔     |  ✔    |
| Aggiunta giocatori                  |  ✔   |         |       |
| Visualizzazione propri giocatori    |  ✔   |         |       |
| Iscrizione a torneo (giocatori)     |  ✔   |         |       |
| Selezione giocatori da iscrivere    |  ✔   |         |       |
| Visualizzazione tornei              |  ✔   |   ✔     |  ✔    |
| Visualizzazione partite             |  ✔   |   ✔     |  ✔    |
| Visualizzazione classifica          |  ✔   |   ✔     |  ✔    |
| Candidatura a torneo                |      |   ✔     |       |
| Visualizzazione proprie candidature |      |   ✔     |       |
| Creazione torneo                    |      |         |  ✔    |
| Blocco/Sblocco team                 |      |         |  ✔    |
| Assegnazione arbitri                |      |         |  ✔    |
| Sanzione disciplinare team          |      |         |  ✔    |
| Eliminazione arbitro                |      |         |  ✔    |
| Modifica punteggio arbitro          |      |         |  ✔    |

**Legenda:**  
✔ = permesso  
vuoto = non permesso

---

## Note Finali

La piattaforma implementa tutti i vincoli e le funzionalità richieste, con particolare attenzione alla gestione disciplinare, alla selezione dei giocatori per torneo e alla sicurezza dei flussi di iscrizione. 