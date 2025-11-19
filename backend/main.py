from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.cors import origins
from api.build_circuit import router as build_router
from api.simulate import router as simulate_router
from api.step_state import router as step_state_router
from api.roll_dice import router as roll_router

app = FastAPI(title="Quantum Dice API")

# Apply CORS from config
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base health check
@app.get("/")
def root():
    return {"ok": True, "note": "See /docs for interactive API docs."}

# Register routers
app.include_router(build_router)
app.include_router(simulate_router)
app.include_router(step_state_router)
app.include_router(roll_router)
