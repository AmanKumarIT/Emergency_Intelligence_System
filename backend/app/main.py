"""
Emergency Intelligence System — FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.endpoints import router as api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──
    print("=" * 60)
    print("  Emergency Intelligence System (EIS) — Starting")
    print(f"  Grid: {settings.GRID_ROWS}x{settings.GRID_COLS}")
    print(f"  YOLO model: {settings.YOLO_MODEL_PATH}")
    print(f"  Stream FPS: {settings.STREAM_FPS}")
    print("=" * 60)
    yield
    # ── Shutdown ──
    print("[EIS] Shutting down…")


app = FastAPI(
    title="Emergency Intelligence System API",
    description="Real-time crowd anomaly detection for large-scale sporting venues",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ──
app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
