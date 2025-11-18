from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict
import math

app = FastAPI(title="Quantum Dice API")

# Qiskit imports - AerSimulator is in qiskit_aer package
try:
    from qiskit import QuantumCircuit
    from qiskit.quantum_info import Statevector
    from qiskit_aer import AerSimulator
except Exception as e:
    # Keep it import-safe so devs without qiskit can still start the server and see helpful error
    QuantumCircuit = None
    Statevector = None
    AerSimulator = None

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
    if QuantumCircuit is None:
        return {"error": "Qiskit not installed. Run pip install -r requirements.txt in backend/.venv"}
    n = max(1, min(20, req.n))
    method = req.method.lower()
    num_qubits = max(1, math.ceil(math.log2(n)))
    qc = QuantumCircuit(num_qubits)
    for q in range(num_qubits):
        qc.h(q)

    # try to get an SVG (matplotlib backend). If not available return text fallback.
    try:
        svg = qc.draw(output='mpl')._repr_svg_()
    except Exception:
        try:
            svg = qc.draw(output='text').single_string()
            svg = "<pre>" + svg.replace("<", "&lt;") + "</pre>"
        except Exception:
            svg = "<div>Could not render circuit on server.</div>"

    # theoretical distribution (uniform on 2^k), map to 0..n-1 for display (client will explain mapping)
    total_states = 2 ** num_qubits
    prob = 1/total_states
    dist = {str(i): prob for i in range(total_states)}
    return {"n": n, "method": method, "num_qubits": num_qubits, "svg": svg, "theoretical": dist}

@app.post("/simulate")
def simulate(req: SimRequest) -> Dict[str, Any]:
    if QuantumCircuit is None or AerSimulator is None:
        return {"error": "Qiskit and AerSimulator must be installed in the backend environment."}
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
    if QuantumCircuit is None or Statevector is None:
        return {"error": "Qiskit not available in backend environment."}
    n = max(1, min(20, req.n))
    num_qubits = max(1, math.ceil(math.log2(n)))
    qc = QuantumCircuit(num_qubits)
    steps = []
    for q in range(num_qubits):
        qc.h(q)
        sv = Statevector.from_instruction(qc).data.tolist()
        steps.append({"after_gate": f"h q{q}", "statevector": sv})
    return {"n": n, "num_qubits": num_qubits, "steps": steps}