import math
import random
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def num_qubits_for_n(n: int) -> int:
    return max(1, math.ceil(math.log2(n)))

def build_quantum_circuit(n: int, method: str) -> QuantumCircuit:
    if method == "rejection":
        num_qubits = num_qubits_for_n(n)
        qc = QuantumCircuit(num_qubits, num_qubits)
        for q in range(num_qubits):
            qc.h(q)
        qc.measure(range(num_qubits), range(num_qubits))
        return qc
    elif method == "exact":
        # TODO Implement exact probabilistic state
        pass
    else:
        raise ValueError(f"Invalid method: {method}. Use 'rejection' or 'exact'.")

def safe_svg_draw(qc: QuantumCircuit) -> str:
    try:
        return qc.draw(output="svg")
    except Exception:
        try:
            text = qc.draw(output="text").single_string()
            return "<pre>" + text.replace("<", "&lt;") + "</pre>"
        except Exception:
            return "<div>Could not render circuit.</div>"

def map_measurement(value: int, n: int, method: str) -> int:
    if method == "rejection":
        return value % n
    elif method == "exact":
        if value < n:
            return value
        else:
            return None  # rejected
    else:
        raise ValueError("Invalid method. Use 'rejection' or 'exact'.")
