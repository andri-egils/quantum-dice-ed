from pydantic import BaseModel

class BuildRequest(BaseModel):
    n: int
    method: str

class SimRequest(BaseModel):
    n: int
    method: str
    shots: int = 1000

class RollRequest(BaseModel):
    n: int
    method: str
