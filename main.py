from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import sqlite3
from datetime import datetime
from enum import Enum

app = FastAPI()

# Connessione al database SQLite
DATABASE_NAME = "torneo_tennis.db"


# Enum per le fasi del torneo
class FaseTorneo(str, Enum):
    SEDICESIMI = "Sedicesimi"
    OTTAVI = "Ottavi"
    QUARTI = "Quarti"
    SEMIFINALI = "Semifinali"
    FINALE = "Finale"
    VINCITORE = "Vincitore"


# Punti per ogni fase raggiunta
PUNTI_PER_FASE = {
    FaseTorneo.SEDICESIMI: 10,
    FaseTorneo.OTTAVI: 20,
    FaseTorneo.QUARTI: 40,
    FaseTorneo.SEMIFINALI: 80,
    FaseTorneo.FINALE: 160,
    FaseTorneo.VINCITORE: 320
}


# Modelli Pydantic
class Partita(BaseModel):
    id: Optional[int] = None
    giocatore1: str
    giocatore2: str
    data_ora: datetime
    fase: FaseTorneo
    campo: str
    punteggio: Optional[str] = None
    vincitore: Optional[str] = None


class CreaTorneo(BaseModel):
    nome: str
    luogo: str
    data_inizio: datetime
    data_fine: datetime
    numero_giocatori: int = 32


class Giocatore(BaseModel):
    id: Optional[int] = None
    nome: str
    nazionalita: str
    ranking: Optional[int] = None
    punti: Optional[int] = 0


class AggiornaRanking(BaseModel):
    punti: int


# Inizializzazione del database
def init_db():
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    # Tabella tornei
    cursor.execute("""
                   CREATE TABLE IF NOT EXISTS tornei
                   (
                       id
                       INTEGER
                       PRIMARY
                       KEY
                       AUTOINCREMENT,
                       nome
                       TEXT
                       NOT
                       NULL,
                       luogo
                       TEXT
                       NOT
                       NULL,
                       data_inizio
                       TEXT
                       NOT
                       NULL,
                       data_fine
                       TEXT
                       NOT
                       NULL,
                       numero_giocatori
                       INTEGER
                       NOT
                       NULL
                   )
                   """)

    # Tabella partite
    cursor.execute("""
                   CREATE TABLE IF NOT EXISTS partite
                   (
                       id
                       INTEGER
                       PRIMARY
                       KEY
                       AUTOINCREMENT,
                       torneo_id
                       INTEGER,
                       giocatore1
                       TEXT
                       NOT
                       NULL,
                       giocatore2
                       TEXT
                       NOT
                       NULL,
                       data_ora
                       TEXT
                       NOT
                       NULL,
                       fase
                       TEXT
                       NOT
                       NULL,
                       campo
                       TEXT
                       NOT
                       NULL,
                       punteggio
                       TEXT,
                       vincitore
                       TEXT,
                       FOREIGN
                       KEY
                   (
                       torneo_id
                   ) REFERENCES tornei
                   (
                       id
                   )
                       )
                   """)

    # Tabella giocatori
    cursor.execute("""
                   CREATE TABLE IF NOT EXISTS giocatori
                   (
                       id
                       INTEGER
                       PRIMARY
                       KEY
                       AUTOINCREMENT,
                       nome
                       TEXT
                       NOT
                       NULL
                       UNIQUE,
                       nazionalita
                       TEXT
                       NOT
                       NULL,
                       punti
                       INTEGER
                       DEFAULT
                       0,
                       ranking
                       INTEGER
                   )
                   """)

    conn.commit()
    conn.close()


init_db()


# Funzioni di utilità
def aggiorna_ranking():
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    # Ordina i giocatori per punti (decrescente) e assegna il ranking
    cursor.execute("""
                   UPDATE giocatori
                   SET ranking = (SELECT COUNT(*)
                                  FROM giocatori g2
                                  WHERE g2.punti > giocatori.punti
                                     OR (g2.punti = giocatori.punti AND g2.id < giocatori.id)) + 1
                   """)

    conn.commit()
    conn.close()


def aggiungi_giocatore_se_non_esiste(nome: str, nazionalita: str = "Sconosciuta"):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM giocatori WHERE nome = ?", (nome,))
    if not cursor.fetchone():
        cursor.execute("""
                       INSERT INTO giocatori (nome, nazionalita)
                       VALUES (?, ?)
                       """, (nome, nazionalita))
        conn.commit()

    conn.close()


# Endpoint per i giocatori
@app.post("/giocatori/", response_model=Giocatore)
def crea_giocatore(giocatore: Giocatore):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    try:
        cursor.execute("""
                       INSERT INTO giocatori (nome, nazionalita, punti)
                       VALUES (?, ?, ?)
                       """, (giocatore.nome, giocatore.nazionalita, giocatore.punti or 0))

        giocatore_id = cursor.lastrowid
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Giocatore già esistente")

    # Aggiorna i ranking
    aggiorna_ranking()

    cursor.execute("SELECT * FROM giocatori WHERE id = ?", (giocatore_id,))
    giocatore_db = cursor.fetchone()
    conn.close()

    return {
        "id": giocatore_db[0],
        "nome": giocatore_db[1],
        "nazionalita": giocatore_db[2],
        "punti": giocatore_db[3],
        "ranking": giocatore_db[4]
    }


@app.get("/giocatori/", response_model=List[Giocatore])
def get_giocatori(ranking: bool = False):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    query = "SELECT * FROM giocatori"
    if ranking:
        query += " ORDER BY ranking ASC"

    cursor.execute(query)
    giocatori = []
    for row in cursor.fetchall():
        giocatori.append({
            "id": row[0],
            "nome": row[1],
            "nazionalita": row[2],
            "punti": row[3],
            "ranking": row[4]
        })

    conn.close()
    return giocatori


@app.put("/giocatori/{giocatore_id}/punti/")
def aggiorna_punti_giocatore(giocatore_id: int, aggiornamento: AggiornaRanking):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    cursor.execute("""
                   UPDATE giocatori
                   SET punti = punti + ?
                   WHERE id = ?
                   """, (aggiornamento.punti, giocatore_id))

    conn.commit()

    # Aggiorna i ranking
    aggiorna_ranking()

    conn.close()
    return {"message": "Punti aggiornati con successo"}


# Endpoint per il torneo (modificati per gestire il ranking)
@app.post("/tornei/")
def crea_torneo(torneo: CreaTorneo, giocatori: List[str]):
    if len(giocatori) != torneo.numero_giocatori:
        raise HTTPException(
            status_code=400,
            detail=f"Numero di giocatori fornito ({len(giocatori)}) non corrisponde al numero specificato nel torneo ({torneo.numero_giocatori})"
        )

    # Assicurati che tutti i giocatori esistano nel database
    for giocatore in giocatori:
        aggiungi_giocatore_se_non_esiste(giocatore)

    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    cursor.execute("""
                   INSERT INTO tornei (nome, luogo, data_inizio, data_fine, numero_giocatori)
                   VALUES (?, ?, ?, ?, ?)
                   """, (torneo.nome, torneo.luogo, torneo.data_inizio.isoformat(), torneo.data_fine.isoformat(),
                         torneo.numero_giocatori))

    torneo_id = cursor.lastrowid
    conn.commit()
    conn.close()

    genera_partite_iniziali(torneo_id, torneo.numero_giocatori, giocatori)

    return {"message": "Torneo creato con successo", "torneo_id": torneo_id}


@app.put("/partite/{partita_id}/risultato/")
def aggiorna_risultato(partita_id: int, punteggio: str, vincitore: str):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    # Verifica se la partita esiste
    cursor.execute("SELECT id, fase FROM partite WHERE id = ?", (partita_id,))
    partita = cursor.fetchone()
    if not partita:
        conn.close()
        raise HTTPException(status_code=404, detail="Partita non trovata")

    _, fase = partita

    # Aggiorna il risultato
    cursor.execute("""
                   UPDATE partite
                   SET punteggio = ?,
                       vincitore = ?
                   WHERE id = ?
                   """, (punteggio, vincitore, partita_id))

    # Assegna i punti al vincitore
    punti_fase = PUNTI_PER_FASE[FaseTorneo(fase)]
    cursor.execute("""
                   UPDATE giocatori
                   SET punti = punti + ?
                   WHERE nome = ?
                   """, (punti_fase, vincitore))

    conn.commit()

    # Se c'è un vincitore, verifica se bisogna generare la partita successiva
    cursor.execute("""
                   SELECT fase, torneo_id
                   FROM partite
                   WHERE id = ?
                   """, (partita_id,))
    fase, torneo_id = cursor.fetchone()
    fase = FaseTorneo(fase)

    # Determina la prossima fase
    if fase == FaseTorneo.SEDICESIMI:
        nuova_fase = FaseTorneo.OTTAVI
    elif fase == FaseTorneo.OTTAVI:
        nuova_fase = FaseTorneo.QUARTI
    elif fase == FaseTorneo.QUARTI:
        nuova_fase = FaseTorneo.SEMIFINALI
    elif fase == FaseTorneo.SEMIFINALI:
        nuova_fase = FaseTorneo.FINALE
    else:
        nuova_fase = None

    if nuova_fase:
        # Conta quanti vincitori ci sono nella fase corrente
        cursor.execute("""
                       SELECT COUNT(*)
                       FROM partite
                       WHERE torneo_id = ?
                         AND fase = ?
                         AND vincitore IS NOT NULL
                       """, (torneo_id, fase.value))
        num_vincitori = cursor.fetchone()[0]

        # Conta quante partite ci sono nella fase corrente
        cursor.execute("""
                       SELECT COUNT(*)
                       FROM partite
                       WHERE torneo_id = ?
                         AND fase = ?
                       """, (torneo_id, fase.value))
        num_partite = cursor.fetchone()[0]

        # Se tutti hanno giocato, genera le partite per la fase successiva
        if num_vincitori == num_partite:
            # Ottieni tutti i vincitori della fase corrente
            cursor.execute("""
                           SELECT vincitore
                           FROM partite
                           WHERE torneo_id = ?
                             AND fase = ?
                             AND vincitore IS NOT NULL
                           ORDER BY id
                           """, (torneo_id, fase.value))
            vincitori = [row[0] for row in cursor.fetchall()]

            # Genera le nuove partite
            for i in range(0, len(vincitori), 2):
                if i + 1 < len(vincitori):
                    giocatore1 = vincitori[i]
                    giocatore2 = vincitori[i + 1]

                    data_ora = datetime.now().isoformat()

                    cursor.execute("""
                                   INSERT INTO partite (torneo_id, giocatore1, giocatore2, data_ora, fase, campo)
                                   VALUES (?, ?, ?, ?, ?, ?)
                                   """, (torneo_id, giocatore1, giocatore2, data_ora, nuova_fase.value,
                                         "Campo " + str(i % 2 + 1)))

    # Se è la finale, assegna i punti extra al vincitore
    if fase == FaseTorneo.FINALE:
        punti_vincitore = PUNTI_PER_FASE[FaseTorneo.VINCITORE] - PUNTI_PER_FASE[FaseTorneo.FINALE]
        cursor.execute("""
                       UPDATE giocatori
                       SET punti = punti + ?
                       WHERE nome = ?
                       """, (punti_vincitore, vincitore))

    # Aggiorna i ranking
    aggiorna_ranking()

    conn.commit()
    conn.close()

    return {"message": "Risultato aggiornato con successo"}


# Funzione per generare le partite iniziali (come prima)
def genera_partite_iniziali(torneo_id: int, numero_giocatori: int, giocatori: List[str]):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    if numero_giocatori == 32:
        fase = FaseTorneo.SEDICESIMI
        num_partite = 16
    elif numero_giocatori == 16:
        fase = FaseTorneo.OTTAVI
        num_partite = 8
    elif numero_giocatori == 8:
        fase = FaseTorneo.QUARTI
        num_partite = 4
    elif numero_giocatori == 4:
        fase = FaseTorneo.SEMIFINALI
        num_partite = 2
    else:
        fase = FaseTorneo.FINALE
        num_partite = 1

    for i in range(num_partite):
        giocatore1 = giocatori[i * 2]
        giocatore2 = giocatori[i * 2 + 1]
        data_ora = datetime.now().isoformat()

        cursor.execute("""
                       INSERT INTO partite (torneo_id, giocatore1, giocatore2, data_ora, fase, campo)
                       VALUES (?, ?, ?, ?, ?, ?)
                       """, (torneo_id, giocatore1, giocatore2, data_ora, fase.value, "Campo " + str(i % 4 + 1)))

    conn.commit()
    conn.close()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)