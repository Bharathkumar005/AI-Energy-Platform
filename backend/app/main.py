from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routers import analytics, ml, auth
from app.database import engine, Base

# Create DB tables
Base.metadata.create_all(bind=engine)
import traceback

app = FastAPI(
    title="AI Energy Optimization Platform API",
    description="Backend API for predicting and analyzing energy consumption.",
    version="1.0.0"
)

# Allow React Frontend to connect to this API
# Using Universal CORS for the Demo Review to ensure 100% stability
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler - returns real error details so we can debug
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    print(f"❌ Unhandled Exception: {tb}")
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "traceback": tb}
    )

app.include_router(analytics.router)
app.include_router(ml.router)
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "AI Energy Optimization API is running!"}
