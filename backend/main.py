from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict
import math
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit_aer import AerSimulator

app = FastAPI(title="Quantum Dice API")

# Enable CORS for your frontend
origins = [
    "http://localhost:5173",  # your Vite dev server
    # "http://your-frontend-domain.com"  # add when deployed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BuildRequest(BaseModel):
    n: int
    method: str  # 'rejection' or 'exact'

class SimRequest(BaseModel):
    n: int
    method: str
    shots: int = 1000

@app.get("/")
def root():
    return {"ok": True, "note": "See /docs for interactive API docs."}

@app.post("/build_circuit")
def build_circuit(req: BuildRequest) -> Dict[str, Any]:
    n = max(1, min(20, req.n))
    method = req.method.lower()
    num_qubits = max(1, math.ceil(math.log2(n)))

    # Create a quantum circuit with Hadamards on all qubits
    qc = QuantumCircuit(num_qubits)
    for q in range(num_qubits):
        qc.h(q)

    # Draw as SVG (safe on server / macOS)
    try:
        svg = qc.draw(output='svg')
    except Exception:
        # Fallback to text representation
        try:
            svg_text = qc.draw(output='text').single_string()
            svg = "<pre>" + svg_text.replace("<", "&lt;") + "</pre>"
        except Exception:
            svg = "<div>Could not render circuit on server.</div>"

    # Theoretical uniform distribution over all states (2^num_qubits)
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

@app.post("/simulate")
def simulate(req: SimRequest) -> Dict[str, Any]:
    n = max(1, min(20, req.n))
    method = req.method.lower()
    shots = max(1, min(10000, req.shots))
    num_qubits = max(1, math.ceil(math.log2(n)))
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
        # qiskit's bitorder may vary; interpret little-endian: reverse
        try:
            val = int(bitstr[::-1], 2)
        except Exception:
            val = int(bitstr, 2)
        if method == "rejection":
            mapped_val = val % n
            mapped[str(mapped_val)] = mapped.get(str(mapped_val), 0) + c
        else:  # exact mapping: only accept val < n
            if val < n:
                mapped[str(val)] = mapped.get(str(val), 0) + c
            else:
                mapped["_rejected"] = mapped.get("_rejected", 0) + c

    return {"n": n, "method": method, "shots": shots, "counts_raw": counts, "counts_mapped": mapped}

@app.post("/step_state")
def step_state(req: BuildRequest) -> Dict[str, Any]:
    n = max(1, min(20, req.n))
    num_qubits = max(1, math.ceil(math.log2(n)))
    qc = QuantumCircuit(num_qubits)
    steps = []
    for q in range(num_qubits):
        qc.h(q)
        sv = Statevector.from_instruction(qc).data.tolist()
        steps.append({"after_gate": f"h q{q}", "statevector": sv})
    return {"n": n, "num_qubits": num_qubits, "steps": steps}