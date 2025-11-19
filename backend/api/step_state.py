from fastapi import APIRouter
from typing import Any, Dict
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

from models import BuildRequest
from utils import num_qubits_for_n

router = APIRouter()

@router.post("/step_state")
def step_state(req: BuildRequest) -> Dict[str, Any]:
    n = max(1, min(20, req.n))
    num_qubits = num_qubits_for_n(n)

    qc = QuantumCircuit(num_qubits)
    steps = []

    for q in range(num_qubits):
        qc.h(q)
        sv = Statevector.from_instruction(qc).data.tolist()
        steps.append({"after_gate": f"h q{q}", "statevector": sv})

    return {"n": n, "num_qubits": num_qubits, "steps": steps}
