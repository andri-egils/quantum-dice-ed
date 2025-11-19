import math
from qiskit import QuantumCircuit

def num_qubits_for_n(n: int) -> int:
    return max(1, math.ceil(math.log2(n)))

def make_uniform_hadamard_circuit(num_qubits: int):
    qc = QuantumCircuit(num_qubits)
    for q in range(num_qubits):
        qc.h(q)
    return qc

def safe_svg_draw(qc: QuantumCircuit):
    try:
        return qc.draw(output="svg")
    except Exception:
        try:
            svg_text = qc.draw(output="text").single_string()
            return "<pre>" + svg_text.replace("<", "&lt;") + "</pre>"
        except Exception:
            return "<div>Could not render circuit on server.</div>"
