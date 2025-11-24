from pydantic import BaseModel

class BuildRequest(BaseModel):
    n: int
    method: str  # "rejection" or "exact"

class RollRequest(BaseModel):
    n: int
    method: str

class RollMultipleRequest(BaseModel):
    n: int
    method: str
    shots: int = 1000

class SimRequest(BaseModel):
    n: int
    method: str
    shots: int = 1000

class CircuitRequest(BaseModel):
    n: int
    method: str = "exact"