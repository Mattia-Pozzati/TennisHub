# Tennis Hub

Un'applicazione web per la gestione di tornei di tennis internazionali.

## Funzionalità

### Team
- Registrazione di un nuovo Team
- Registrazione di un giocatore
- Iscrizione ai tornei
- Visualizzazione del profilo pubblico

### Arbitri
- Registrazione di un nuovo Arbitro
- Visualizzazione dei tornei disponibili
- Gestione della disponibilità per i tornei
- Visualizzazione del profilo pubblico

### Admin
- Gestione dei tornei
- Gestione degli arbitri
- Gestione dei team (blocco/sblocco)
- Visualizzazione delle informazioni aggregate

## Requisiti

- Python 3.8+
- Node.js 14+
- npm 6+

## Installazione

### Backend

1. Crea un ambiente virtuale Python:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. Installa le dipendenze Python:
```bash
pip install -r requirements.txt
```

3. Avvia il server di sviluppo:
```bash
uvicorn main:app --reload
```

### Frontend

1. Installa le dipendenze Node.js:
```bash
npm install
```

2. Avvia il server di sviluppo:
```bash
npm start
```

## API Endpoints

### Autenticazione
- `POST /api/login` - Login utente
- `POST /api/teams/register` - Registrazione team
- `POST /api/referees/register` - Registrazione arbitro

### Team
- `POST /api/players` - Registrazione giocatore
- `GET /api/team/player` - Informazioni giocatore
- `POST /api/tournaments/{tournament_id}/register` - Iscrizione torneo

### Arbitri
- `GET /api/referee/info` - Informazioni arbitro
- `POST /api/tournaments/{tournament_id}/referee-availability` - Imposta disponibilità

### Admin
- `GET /api/teams` - Lista team
- `POST /api/teams/{team_id}/block` - Blocca team
- `POST /api/teams/{team_id}/unblock` - Sblocca team
- `GET /api/referees` - Lista arbitri
- `POST /api/tournaments` - Crea torneo
- `POST /api/tournaments/{tournament_id}/referees` - Assegna arbitro

## Struttura del Progetto

```
tennis-hub/
├── main.py              # Backend FastAPI
├── auth.py             # Gestione autenticazione
├── config.py           # Configurazioni
├── requirements.txt    # Dipendenze Python
├── src/               # Frontend React
│   ├── components/    # Componenti React
│   ├── pages/        # Pagine dell'applicazione
│   ├── context/      # Context React
│   └── types.ts      # Definizioni TypeScript
└── README.md         # Documentazione
```

## Licenza

MIT
