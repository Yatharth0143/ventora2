from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    await db.connect()
    print("✅ Connected to MongoDB and Neo4j")
    yield
    await db.disconnect()
    print("🔌 Disconnected from databases")


app = FastAPI(
    title="Ventora API",
    description="Trust layer for early-stage fundraising in India",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and register routers
from app.routes import auth, deck, audit, payment, chat, investor, graph, verify, marketing, screener  # noqa: E402

app.include_router(auth.router)
app.include_router(deck.router)
app.include_router(audit.router)
app.include_router(payment.router)
app.include_router(chat.router)
app.include_router(investor.router)
app.include_router(graph.router)
app.include_router(verify.router)
app.include_router(marketing.router)
app.include_router(screener.router)


@app.get("/")
async def root():
    return {
        "name": "Ventora API",
        "version": "1.0.0",
        "status": "running",
        "description": "Trust layer for early-stage fundraising",
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "env": settings.APP_ENV}

