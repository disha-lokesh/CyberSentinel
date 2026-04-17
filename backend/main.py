"""
CyberSentinel Backend
Gemini 3 Flash (agents) + Gemini 3.1 Pro Preview (orchestrator)
FastAPI + ChromaDB RAG + Autonomous Red Team
"""
import asyncio, logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.api.routes import router, _attacks, _defenses, _broadcast
from backend.api.autonomous_red_team import init_autonomous, run_autonomous_red_team

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Wire autonomous red team to shared state
    init_autonomous(_attacks, _defenses, _broadcast)
    # Start autonomous red team in background
    task = asyncio.create_task(run_autonomous_red_team())
    yield
    task.cancel()


app = FastAPI(
    title="CyberSentinel",
    description="Gemini 3 powered autonomous Red Team vs Blue Team",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
def root():
    return {
        "name": "CyberSentinel",
        "version": "2.0.0",
        "models": {
            "agents":       "gemini-3-flash",
            "orchestrator": "gemini-3.1-pro-preview",
        },
        "red_team": "autonomous — no analyst access",
        "status":   "operational",
    }
