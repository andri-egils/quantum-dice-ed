from fastapi import APIRouter
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from utils import build_quantum_circuit
from models import CircuitRequest

router = APIRouter()

def generate_gate_description(instr, qubit_indices):
    return f"{instr.name.upper()} on qubits {qubit_indices} with params {instr.params}"

@router.post("/circuit_visual")
def circuit_visual(req: CircuitRequest):
    """
    Returns step-by-step info for frontend visualization.
    """
    n = max(2, min(20, req.n))
    method = req.method.lower()

    qc: QuantumCircuit = build_quantum_circuit(n, method)
    sv = Statevector.from_label("0" * qc.num_qubits)
    steps = []

    for instr, qargs, _ in qc.data:
        qubit_indices = [q._index for q in qargs]

        if instr.name in ["measure", "reset", "barrier"]:
            continue

        sv = sv.evolve(instr, qubit_indices)

        # convert complex numbers to [real, imag] for JSON
        statevector_serializable = [[c.real, c.imag] for c in sv.data]

        step_info = {
            "gate": instr.name,
            "params": [float(p) for p in instr.params],
            "qubits": qubit_indices,
            "description": generate_gate_description(instr, qubit_indices),
            "statevector": statevector_serializable,
            "probabilities": (abs(sv.data)**2).tolist()
        }
        steps.append(step_info)

    return {"num_qubits": qc.num_qubits, "steps": steps}
