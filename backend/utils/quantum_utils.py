import math
import random
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit.circuit.library import StatePreparation
import numpy as np

def num_qubits_for_n(n: int) -> int:
    return max(1, math.ceil(math.log2(n)))

def build_quantum_circuit(n: int, method: str) -> QuantumCircuit:
    num_qubits = num_qubits_for_n(n)
    if method == "rejection":
        qc = QuantumCircuit(num_qubits, num_qubits)
        for q in range(num_qubits):
            qc.h(q)
        qc.measure(range(num_qubits), range(num_qubits))
        return qc
    elif method == "exact":
        amps = [1/np.sqrt(n)] * n + [0] * (2**num_qubits - n)
        sp_gate = StatePreparation(amps)
        qc = QuantumCircuit(num_qubits)
        qc.append(sp_gate, qc.qubits)
        deep_decomposed = qc.decompose(reps=10)
        return deep_decomposed
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
