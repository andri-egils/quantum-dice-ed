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

  return (
    <div>
      {mode === "step-by-step" && (
        <div style={{ marginBottom: 10 }}>
          <button onClick={prevStep}>Previous</button>
          <button onClick={nextStep} style={{ marginLeft: 5 }}>
            Next
          </button>
          <span style={{ marginLeft: 10 }}>
            Step {currentStep + 1}/{circuitData.steps.length}
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
          height={circuitData.num_qubits * 50}
        >
          {/* Qubit lines */}
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

          {/* Gates */}
          {circuitData.steps.map((step, i) => {
            const x = i * (gateWidth + spacing);
            return step.qubits.map((q) => (
              <g key={`${i}-${q}`}>
                <rect
                  x={x}
                  y={q * 50 + 10}
                  width={gateWidth}
                  height={30}
                  fill={i === currentStep ? "#ffeaa7" : gateColors[step.gate] || gateColors.default}
                  stroke="#2d3436"
                  rx={5}
                />
                <text
                  x={x + gateWidth / 2}
                  y={q * 50 + 30}
                  fontSize={12}
                  textAnchor="middle"
                  fill="#2d3436"
                >
                  {step.gate.toUpperCase()}
                </text>
              </g>
            ));
          })}
        </svg>
      </div>

      {mode === "step-by-step" && (
        <div style={{ marginTop: 20 }}>
          <h4>Current Step Stats</h4>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>State</th>
                <th>Amplitude</th>
                <th>Probability</th>
              </tr>
            </thead>
            <tbody>
              {circuitData.steps[currentStep].statevector.map(([re, im], idx) => (
                <tr key={idx}>
                  <td>{idx.toString(2).padStart(circuitData.num_qubits, "0")}</td>
                  <td>{`${re.toFixed(3)} + ${im.toFixed(3)}i`}</td>
                  <td>{circuitData.steps[currentStep].probabilities[idx].toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
