from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from qiskit_aer import AerSimulator
from models import RollRequest, RollMultipleRequest
from utils import rejection_sample, exact_sample, build_quantum_circuit, num_qubits_for_n, map_measurement

router = APIRouter()

@router.post("/roll")
def roll(req: RollRequest) -> Dict[str, Any]:
    n = max(2, min(20, req.n))
    num_qubits = num_qubits_for_n(n)

    qc = build_quantum_circuit(n, req.method.lower())
    sim = AerSimulator()

    job = sim.run(qc, shots=1)
    res = job.result()
    bitstr = list(res.get_counts().keys())[0]

    raw_value = int(bitstr[::-1], 2)

    return {
        "raw_value": raw_value
    }
    
@router.post("/roll_multiple")
def roll_multiple(req: RollMultipleRequest) -> Dict[str, Any]:
    n = max(2, min(20, req.n))
    num_qubits = num_qubits_for_n(n)

    qc = build_quantum_circuit(n, req.method.lower())
    sim = AerSimulator()

    job = sim.run(qc, shots=req.shots)
    res = job.result()
    counts_raw = res.get_counts()

    # convert bitstrings → integers
    counts_int = {}
    for bitstr, c in counts_raw.items():
        val = int(bitstr[::-1], 2)
        counts_int[str(val)] = c

    return {
        "counts_raw": counts_int
    }