import React, { useState } from "react";

interface StepData {
  gate: string;
  params: number[];
  qubits: number[];
  description: string;
  statevector: [number, number][]; // [real, imag]
  probabilities: number[];
}

interface CircuitData {
  num_qubits: number;
  steps: StepData[];
}

interface QuantumVisualProps {
  circuitData: CircuitData;
  mode?: "step-by-step" | "view-only";
  gateWidth?: number;
  spacing?: number;
}

const gateColors: Record<string, string> = {
  ry: "#6c5ce7",
  mcry: "#00b894",
  x: "#fd79a8",
  measure: "#fab1a0",
  default: "#dfe6e9",
};

export default function QuantumVisual({
  circuitData,
  mode = "step-by-step",
  gateWidth = 60,
  spacing = 20,
}: QuantumVisualProps) {
  const [currentStep, setCurrentStep] = useState<number>(
    mode === "step-by-step" ? 0 : circuitData.steps.length - 1
  );

  const nextStep = () =>
    setCurrentStep((s) => Math.min(s + 1, circuitData.steps.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const qubitLines = Array.from({ length: circuitData.num_qubits }, (_, i) => i);

  // Convert an index (assumed to be in little-endian ordering) to a big-endian bitstring.
  // The returned string has MSB at index 0 (leftmost).
  function idxToBigEndian(idx: number, numQubits: number): string {
    // If the incoming index is little-endian index (LSB=bit0), reversing gives big-endian string.
    return idx.toString(2).padStart(numQubits, "0").split("").reverse().join("");
  }

  // We'll produce an array of indices sorted by the numeric value of their big-endian string.
  // This ensures display order is 0..(2^n -1) in natural big-endian order.
  const sortedIndices = Array.from({ length: 2 ** circuitData.num_qubits }, (_, i) => i).sort(
    (a, b) => {
      const aBE = parseInt(idxToBigEndian(a, circuitData.num_qubits), 2);
      const bBE = parseInt(idxToBigEndian(b, circuitData.num_qubits), 2);
      return aBE - bBE;
    }
  );

  return (
    <div>
      {mode === "step-by-step" && (
        <div style={{ marginBottom: 10 }}>
          <button onClick={prevStep}>Previous</button>
          <button onClick={nextStep} style={{ marginLeft: 5 }}>
            Next
          </button>
          <span style={{ marginLeft: 10 }}>
            Step {currentStep}/{circuitData.steps.length - 1}
          </span>
        </div>
      )}

      <div
        style={{
          overflowX: "auto",
          border: "1px solid #ccc",
          padding: 10,
          whiteSpace: "nowrap",
        }}
      >
        <svg
          width={circuitData.steps.length * (gateWidth + spacing) + 100}
          height={circuitData.num_qubits * 50 + 60}
        >
          {/* Qubit horizontal lines */}
          {qubitLines.map((q) => (
            <line
              key={q}
              x1={0}
              y1={q * 50 + 25}
              x2={circuitData.steps.length * (gateWidth + spacing)}
              y2={q * 50 + 25}
              stroke="#b2bec3"
              strokeWidth={2}
            />
          ))}

          {/* Gates (including a possible initial "step 0" contextual area) */}
          {circuitData.steps.map((step, i) => {
            const x = i * (gateWidth + spacing);

            const hasGate = Boolean(step.gate && step.gate.trim().length > 0);
            const hasQubits = Array.isArray(step.qubits) && step.qubits.length > 0;

            const isControlledGate =
              hasGate && step.gate.toLowerCase().startsWith("c") && step.qubits.length > 1;

            const targetQubit = hasQubits
              ? isControlledGate
                ? step.qubits[step.qubits.length - 1]
                : step.qubits[0]
              : 0;

            const controlQubits = isControlledGate ? step.qubits.slice(0, -1) : [];

            const minQ = hasQubits ? Math.min(...step.qubits) : 0;
            const maxQ = hasQubits ? Math.max(...step.qubits) : 0;

            // Only show dashed/highlight when in interactive "step-by-step" mode
            const showDashed = mode === "step-by-step" && i === currentStep;

            return (
              <g key={i}>
                {/* Centered dashed line between gates (only in step-by-step mode) */}
                {showDashed && (
                  <>
                    {/* For normal steps, center between this gate and the next gate */}
                    <line
                      x1={x + gateWidth + spacing / 2}
                      y1={0}
                      x2={x + gateWidth + spacing / 2}
                      y2={circuitData.num_qubits * 50}
                      stroke="#636e72"
                      strokeWidth={2}
                      strokeDasharray="4,4"
                    />

                    {/* Special: if currentStep is 0, also draw a left boundary half-spacing before first gate */}
                    {currentStep === 0 && (
                      <line
                        x1={x - spacing / 2}
                        y1={0}
                        x2={x - spacing / 2}
                        y2={circuitData.num_qubits * 50}
                        stroke="#636e72"
                        strokeWidth={2}
                        strokeDasharray="4,4"
                      />
                    )}

                    {/* Ket label |ψᵢ⟩ below the circuit */}
                    <text
                      x={x + gateWidth / 2}
                      y={circuitData.num_qubits * 50 + 35}
                      fontSize={16}
                      textAnchor="middle"
                      fill="#2d3436"
                    >
                      <tspan>|ψ</tspan>
                      <tspan baselineShift="sub" fontSize="12">
                        {i}
                      </tspan>
                      <tspan>⟩</tspan>
                    </text>
                  </>
                )}

                {/* Controlled gate vertical connector */}
                {hasGate && isControlledGate && (
                  <line
                    x1={x + gateWidth / 2}
                    y1={minQ * 50 + 25}
                    x2={x + gateWidth / 2}
                    y2={maxQ * 50 + 25}
                    stroke="#2d3436"
                    strokeWidth={2}
                  />
                )}

                {/* Control dots */}
                {hasGate &&
                  controlQubits.map((ctrl) => (
                    <circle
                      key={`ctrl-${i}-${ctrl}`}
                      cx={x + gateWidth / 2}
                      cy={ctrl * 50 + 25}
                      r={5}
                      fill="#2d3436"
                    />
                  ))}

                {/* Target gate rectangle (only if this step actually has a gate) */}
                {hasGate && (
                  <>
                    <rect
                      x={x}
                      y={targetQubit * 50 + 10}
                      width={gateWidth}
                      height={30}
                      fill={
                        // highlight only in interactive step-by-step mode, not in view-only
                        mode === "step-by-step" && i === currentStep
                          ? "#ffeaa7"
                          : gateColors[step.gate] || gateColors.default
                      }
                      stroke="#2d3436"
                      rx={5}
                    />
                    <text
                      x={x + gateWidth / 2}
                      y={targetQubit * 50 + 30}
                      fontSize={12}
                      textAnchor="middle"
                      fill="#2d3436"
                    >
                      {step.gate.toUpperCase()}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Centered compact statistics table (only in interactive mode) */}
      {mode === "step-by-step" && (
        <div style={{ marginTop: 25, display: "flex", justifyContent: "center" }}>
          <table
            style={{
              borderCollapse: "collapse",
              width: "350px",
              textAlign: "center",
              fontSize: "14px",
              border: "1px solid #ccc",
            }}
          >
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ccc", padding: "6px" }}>State</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "6px" }}>
                  Amplitude
                </th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "6px" }}>
                  Probability
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedIndices.map((idx) => {
                // Convert this index to big-endian string (MSB-left)
                const stateStrBE = idxToBigEndian(idx, circuitData.num_qubits);
                // Parse decimal value corresponding to the displayed binary
                const stateDec = parseInt(stateStrBE, 2);

                // use the index to pick amplitude/probability from provided arrays
                const [re, im] = circuitData.steps[currentStep].statevector[idx];
                const prob = circuitData.steps[currentStep].probabilities[idx];

                return (
                  <tr key={idx}>
                    <td style={{ padding: "4px" }}>
                      {stateStrBE} ({stateDec})
                    </td>
                    <td style={{ padding: "4px" }}>
                      {re.toFixed(3)} + {im.toFixed(3)}i
                    </td>
                    <td style={{ padding: "4px" }}>{prob.toFixed(4)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
