import React, { useState, useEffect } from "react";
import { QuantumVisual } from "../components";
import { useTranslation } from "../i18n";
import axios from "axios";

interface StepData {
  gate: string;
  params: number[];
  qubits: number[];
  description: string;
  statevector: [number, number][]; // real/imag format
  probabilities: number[];
}

interface BuildResponse {
  num_qubits: number;
  steps: StepData[];
}

export default function StepByStepTab() {
  const { t } = useTranslation();

  const [circuitData, setCircuitData] = useState<BuildResponse | null>(null);
  const [nSides, setNSides] = useState<number>(6); // default dice

  // Fetch circuit whenever nSides changes
  useEffect(() => {
    const fetchCircuit = async () => {
      try {
        const { data } = await axios.post<BuildResponse>(
          `${import.meta.env.VITE_API_BASE}/circuit_visual`,
          { n: nSides, method: "exact" }
        );

        // ---- INSERT INITIAL STATE STEP ----
        const numQubits = data.num_qubits;
        const dim = 2 ** numQubits;

        const initialStatevector: [number, number][] = Array.from({ length: dim }, (_, i) =>
          i === 0 ? [1, 0] : [0, 0] // |00..0> = amplitude 1 on index 0
        );

        const initialProbabilities = Array.from({ length: dim }, (_, i) =>
          i === 0 ? 1 : 0
        );

        const initialStep: StepData = {
          gate: "init",
          params: [],
          qubits: [],
          description: t("step.initialState"),
          statevector: initialStatevector,
          probabilities: initialProbabilities,
        };

        setCircuitData({ ...data, steps: [initialStep, ...data.steps] });
      } catch (err) {
        console.error("Failed to fetch circuit:", err);
      }
    };

    fetchCircuit();
  }, [nSides, t]);

  if (!circuitData) return <div>{t("step.loading")}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 15 }}>{t("step.title")}</h2>

      {/* Dice selector */}
      <div
        style={{
          marginBottom: 20,
          marginTop: 20,
        }}
      >
        <span>{t("step.selectDice")} </span>
        {[2, 3, 4, 5, 6, 7, 8].map((sides) => (
          <button
            key={sides}
            onClick={() => setNSides(sides)}
            style={{
              marginLeft: 5,
              padding: "4px 8px",
              background: nSides === sides ? "#3a4ca3" : "#ededed",
              color: nSides === sides ? "#fff" : "#000",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {`${sides}-${t("step.sided")}`}
          </button>
        ))}
      </div>

      <QuantumVisual circuitData={circuitData} mode="step-by-step" />
    </div>
  );
}
