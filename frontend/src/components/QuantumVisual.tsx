import React, { useState, useEffect } from "react";
import { useTranslation } from "../i18n";

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
  h: "#d79d6dff",
  measure: "#fab1a0",
  default: "#dfe6e9",
};

export default function QuantumVisual({
  circuitData,
  mode = "step-by-step",
  gateWidth = 60,
  spacing = 20,
}: QuantumVisualProps) {
  const { t } = useTranslation();
  
  const [currentStep, setCurrentStep] = useState<number>(
    mode === "step-by-step" ? 0 : circuitData.steps.length - 1
  );

  useEffect(() => {
    setCurrentStep(mode === "step-by-step" ? 0 : circuitData.steps.length - 1);
  }, [circuitData, mode]);

  const nextStep = () =>
    setCurrentStep((s) => Math.min(s + 1, circuitData.steps.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const qubitLines = Array.from({ length: circuitData.num_qubits }, (_, i) => i);

  function idxToBigEndian(idx: number, numQubits: number): string {
    return idx.toString(2).padStart(numQubits, "0").split("").reverse().join("");
  }

  const sortedIndices = Array.from({ length: 2 ** circuitData.num_qubits }, (_, i) => i).sort(
    (a, b) => {
      const aBE = parseInt(idxToBigEndian(a, circuitData.num_qubits), 2);
      const bBE = parseInt(idxToBigEndian(b, circuitData.num_qubits), 2);
      return aBE - bBE;
    }
  );

  return (
    <div>
      <div
        style={{
          overflowX: "auto",
          border: "2px solid #f0f0f0",
          borderRadius: "6px",
          background: "#ffffff",
          padding: 10,
          whiteSpace: "nowrap",
        }}
      >
        
        <svg
          width={circuitData.steps.length * (gateWidth + spacing) + 100}
          height={mode === "step-by-step" 
                          ? circuitData.num_qubits * 50 + 60
                          : circuitData.num_qubits * 50
          }
        >
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

            const showDashed = mode === "step-by-step" && i === currentStep;

            return (
              <g key={i}>
                {showDashed && (
                  <>
                    <line
                      x1={x + gateWidth + spacing / 2}
                      y1={0}
                      x2={x + gateWidth + spacing / 2}
                      y2={circuitData.num_qubits * 50}
                      stroke="#636e72"
                      strokeWidth={2}
                      strokeDasharray="4,4"
                    />
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
                    <text
                      x={x + gateWidth / 2}
                      y={circuitData.num_qubits * 50 + 35}
                      fontSize={16}
                      textAnchor="middle"
                      fill="#2d3436"
                    >
                      <tspan>|ψ</tspan>
                      <tspan baselineShift="sub" fontSize="12">{i}</tspan>
                      <tspan>⟩</tspan>
                    </text>
                  </>
                )}

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

                {hasGate && controlQubits.map((ctrl) => (
                  <circle
                    key={`ctrl-${i}-${ctrl}`}
                    cx={x + gateWidth / 2}
                    cy={ctrl * 50 + 25}
                    r={5}
                    fill="#2d3436"
                  />
                ))}

                {hasGate && (
                  <>
                    <rect
                      x={x}
                      y={targetQubit * 50 + 10}
                      width={gateWidth}
                      height={30}
                      fill={
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

      {mode === "step-by-step" && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={prevStep}
            style={{
              width: "100px",
              padding: "8px 0",
              background: "#edededff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {t("step.prevButton")}
          </button>
          <span style={{ fontSize: 16, minWidth: "120px", textAlign: "center" }}>
            {t("step.step")} {currentStep}/{circuitData.steps.length - 1}
          </span>
          <button
            onClick={nextStep}
            style={{
              width: "100px",
              padding: "8px 0",
              background: "#edededff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {t("step.nextButton")}
          </button>
        </div>
      )}

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
                <th style={{ borderBottom: "1px solid #ccc", padding: "6px" }}>{t("step.state")}</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "6px" }}>{t("step.amplitude")}</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "6px" }}>{t("step.probability")}</th>
              </tr>
            </thead>
            <tbody>
              {sortedIndices.map((idx) => {
                const stateStrBE = idxToBigEndian(idx, circuitData.num_qubits);
                const stateDec = parseInt(stateStrBE, 2);
                const [re, im] = circuitData.steps[currentStep].statevector[idx];
                const prob = circuitData.steps[currentStep].probabilities[idx];

                return (
                  <tr key={idx}>
                    <td style={{ padding: "4px" }}>{stateStrBE} ({stateDec})</td>
                    <td style={{ padding: "4px" }}>{re.toFixed(3)} + {im.toFixed(3)}i</td>
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
