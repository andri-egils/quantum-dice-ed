from fastapi import APIRouter
from typing import Any, Dict
import math

from models import BuildRequest
from utils import (
    num_qubits_for_n,
    make_uniform_hadamard_circuit,
    safe_svg_draw
)

router = APIRouter()

@router.post("/build_circuit")
def build_circuit(req: BuildRequest) -> Dict[str, Any]:
    n = max(1, min(20, req.n))
    num_qubits = num_qubits_for_n(n)
    method = req.method.lower()

    qc = make_uniform_hadamard_circuit(num_qubits)
    svg = safe_svg_draw(qc)

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
