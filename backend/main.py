from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import wait_for_db, engine
import models
import os
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import uvicorn
from modulos.operacao import router as operacao_diaria

load_dotenv()

wait_for_db()
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Internos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

from routers import auth, users, colaboradores, empresas, roteiros, veiculos, parceiros

app.include_router(auth.router,  prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(colaboradores.router, prefix="/api")
app.include_router(empresas.router, prefix="/api")
app.include_router(roteiros.router, prefix="/api")
app.include_router(veiculos.router, prefix="/api")
app.include_router(parceiros.router, prefix="/api")
app.include_router(operacao_diaria.router, prefix="/api")

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def root():
    return {"message": "API Internos"}

@app.get("/api/health")
def health_check():
    return {"status": "online"}

if __name__ == "__main__":
    port = int(os.getenv("API_PORT", 5000)) 
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)