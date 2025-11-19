from fastapi import APIRouter
from typing import Any, Dict
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
import math

from models import SimRequest
from utils import num_qubits_for_n

router = APIRouter()

@router.post("/simulate")
def simulate(req: SimRequest) -> Dict[str, Any]:
    n = max(1, min(20, req.n))
    method = req.method.lower()
    shots = max(1, min(10000, req.shots))
    num_qubits = num_qubits_for_n(n)

    qc = QuantumCircuit(num_qubits, num_qubits)
    for q in range(num_qubits):
        qc.h(q)
    qc.measure(range(num_qubits), range(num_qubits))

    sim = AerSimulator()
    job = sim.run(qc, shots=shots)
    res = job.result()
    counts = res.get_counts()

    mapped = {}
    for bitstr, c in counts.items():
        val = int(bitstr[::-1], 2)
        if method == "rejection":
            mapped_val = val % n
            mapped[str(mapped_val)] = mapped.get(str(mapped_val), 0) + c
        else:
            if val < n:
                mapped[str(val)] = mapped.get(str(val), 0) + c
            else:
                mapped["_rejected"] = mapped.get("_rejected", 0) + c

    return {
        "n": n,
        "method": method,
        "shots": shots,
        "counts_raw": counts,
        "counts_mapped": mapped
    }
