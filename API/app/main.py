from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Definisci gli origin ammessi (ad esempio, frontend in vite su localhost:5173)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Aggiungi il middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # oppure ["*"] per tutti
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE, ecc.
    allow_headers=["*"],  # Authorization, Content-Type, ecc.
)

