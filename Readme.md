# TennisHub

Gestione Tornei Internazionali di Tennis

---

## Guida d'Uso

### 1. Requisiti
- Python 3.8+
- Node.js 16+
- npm o yarn

### 2. Setup Backend (FastAPI)

```bash
cd API
python3 -m venv venv
source venv/bin/activate
pip install -r app/requirements.txt
```

#### Creazione/Reset del database e seed dati
```bash
python3 -m app.seed
```

#### Avvio del server FastAPI
```bash
uvicorn app.main:app --reload
```
Il backend sarà disponibile su [http://localhost:8000](http://localhost:8000)

### 3. Setup Frontend (React)

```bash
cd tennis-hub
npm install
npm run dev
```
Il frontend sarà disponibile su [http://localhost:3000](http://localhost:3000) o [http://localhost:5173](http://localhost:5173) (Vite)

### 4. Credenziali di test
- **Admin:**
  - Email: `admin@tennishub.com`
  - Password: `admin123`
- **Team:**
  - Email: `alpha@tennishub.com` / `beta@tennishub.com` / ...
  - Password: `team123`
- **Arbitro:**
  - Email: `robert.wilson@tennishub.com` / ...
  - Password: `referee123`

### 5. Funzionalità principali
- **Admin:** crea tornei, blocca/sblocca team, gestisce arbitri, visualizza e aggiorna partite.
- **Team:** registra nuovi giocatori, iscrive uno o più giocatori ai tornei, visualizza classifica e storico.
- **Arbitro:** visualizza tornei.

### 6. Note utili
- Per resettare il database, rieseguire `python3 -m app.seed`.
- Il backend accetta richieste CORS da localhost:3000 e 5173.
- Tutte le API sono documentate tramite FastAPI docs su [http://localhost:8000/docs](http://localhost:8000/docs)

---

Per dubbi o problemi, consultare la relazione (`Report.md`) o contattare gli autori.