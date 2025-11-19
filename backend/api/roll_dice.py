from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from models import RollRequest
from utils import rejection_sample, exact_sample

router = APIRouter()

@router.post("/roll_dice")
def roll_dice(req: RollRequest) -> Dict[str, Any]:
    n = max(2, min(20, req.n))
    method = req.method.lower()

    if method == "rejection":
        result = rejection_sample(n)
        return {"result": result, "n": n, "method": method}

    elif method == "exact":
        raise HTTPException(
            status_code=501,
            detail="Exact sampling not implemented yet."
        )

    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid method. Use 'rejection' or 'exact'."
        )
