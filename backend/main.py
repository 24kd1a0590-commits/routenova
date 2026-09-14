from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .services.seed_service import seed_database_if_empty

from .routers import auth, vehicles, destinations, shipments, deliveries, pooling, analysis, outcomes, dashboard, demo

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RouteNova Backend API",
    description="Rural Last-Mile Delivery Reliability & Micropooling Engine",
    version="1.0.0"
)

# CORS configuration: Allow local frontend dev origins
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()

@app.get("/health", tags=["health"])
def health_check():
    return {
        "status": "ok",
        "app": "RouteNova API",
        "version": "1.0.0",
        "engine": "SQLAlchemy + SQLite",
    }

# Register routers
app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(destinations.router)
app.include_router(shipments.router)
app.include_router(deliveries.router)
app.include_router(pooling.router)
app.include_router(analysis.router)
app.include_router(outcomes.router)
app.include_router(dashboard.router)
app.include_router(demo.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
