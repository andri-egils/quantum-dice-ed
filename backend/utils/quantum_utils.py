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
        probs = [1/n] * n
        qc = build_state_preparation_circuit(probs)

        sv = Statevector.from_instruction(qc)
        print("\n[EXACT] Statevector:", sv.data, "\n")

        measured_qc = QuantumCircuit(qc.num_qubits, qc.num_qubits)
        measured_qc.compose(qc, inplace=True)
        measured_qc.measure(range(qc.num_qubits), range(qc.num_qubits))

        return measured_qc
        # amps = [1/np.sqrt(n)] * n + [0] * (2**num_qubits - n)
        # sp_gate = StatePreparation(amps)
        # qc = QuantumCircuit(num_qubits)
        # qc.append(sp_gate, qc.qubits)
        # deep_decomposed = qc.decompose(reps=10)
        # return deep_decomposed
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




# - Exact State Preperation:

import numpy as np
from qiskit import QuantumCircuit

# ------------------------------------------------------------
# Utilities
# ------------------------------------------------------------

def normalize_probs(probs):
    probs = np.array(probs, dtype=float)
    probs /= probs.sum()
    return probs

def pad_amplitudes(amplitudes):
    """Pad amplitude list to next power of 2."""
    N = len(amplitudes)
    n = int(np.ceil(np.log2(N)))
    target_len = 2**n

    padded = list(amplitudes) + [0.0]*(target_len - N)
    return np.array(padded), n


# ------------------------------------------------------------
# Recursive angle computation
# ------------------------------------------------------------

def compute_angles_recursive(amplitudes, prefix="", level=0):
    """
    For given amplitudes and prefix, compute the rotation angle for this node,
    then recurse on its children.

    Returns dictionary:
        angles[(level, prefix)] = theta
    """
    num_qubits = int(np.log2(len(amplitudes)))
    angles = {}

    # If the prefix length equals number of qubits: leaf
    if len(prefix) == num_qubits:
        return angles

    # Indices matching prefix at current depth
    depth = len(prefix)
    
    S0 = 0
    S1 = 0

    for idx, amp in enumerate(amplitudes):
        bits = f"{idx:0{num_qubits}b}"
        if bits.startswith(prefix):
            if bits[depth] == '0':
                S0 += amp**2
            else:
                S1 += amp**2

    if S0 + S1 < 1e-15:
        theta = 0.0
    else:
        theta = 2 * np.arccos(np.sqrt(S0 / (S0 + S1)))

    # Store angle for this prefix
    angles[(level, prefix)] = theta

    # Recurse for next level
    angles.update(compute_angles_recursive(amplitudes, prefix + "0", level+1))
    angles.update(compute_angles_recursive(amplitudes, prefix + "1", level+1))

    return angles


# ------------------------------------------------------------
# Circuit construction
# ------------------------------------------------------------

def apply_controlled_ry(qc, theta, qubits, target, prefix):
    controls = qubits[:len(prefix)]
    
    # Only apply X mask where needed
    for i, bit in enumerate(prefix):
        if bit == "0":
            qc.x(qubits[i])

    # Apply rotation
    if len(controls) == 0:
        qc.ry(theta, target)
    else:
        qc.mcry(theta, controls, target)

    # Undo X mask
    for i, bit in enumerate(prefix):
        if bit == "0":
            qc.x(qubits[i])



def build_state_preparation_circuit(probs):
    probs = normalize_probs(probs)
    amplitudes = np.sqrt(probs)
    padded_amps, n = pad_amplitudes(amplitudes)
    angles = compute_angles_recursive(padded_amps)

    qc = QuantumCircuit(n)

    for (level, prefix), theta in sorted(angles.items()):
        if abs(theta) < 1e-10:  # skip unnecessary rotations
            continue

        target = len(prefix)  # target qubit = current depth
        if target >= n:
            continue

        # Only mask qubits in prefix if prefix bit is 0
        controls = list(range(n))
        apply_controlled_ry(qc, theta, controls, target, prefix)

    return qc
