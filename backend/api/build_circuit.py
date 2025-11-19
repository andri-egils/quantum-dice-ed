from fastapi import APIRouter
from typing import Any, Dict
import math

from models import BuildRequest
from utils import (
    num_qubits_for_n,
    safe_svg_draw,
    build_quantum_circuit
)

router = APIRouter()

@router.post("/build_circuit")
def build_circuit(req: BuildRequest) -> Dict[str, Any]:
    n = max(2, min(20, req.n))
    method = req.method.lower()
    num_qubits = num_qubits_for_n(n)
    qc = build_quantum_circuit(n, method)
    svg = safe_svg_draw(qc)

    # theoretical uniform distribution over all states
    total_states = 2 ** num_qubits
    prob = 1 / total_states
    dist = {str(i): prob for i in range(total_states)}

    return {
        "n": n,
        "method": method,
        "num_qubits": num_qubits,
        "svg": svg,
        "theoretical": dist
    }
