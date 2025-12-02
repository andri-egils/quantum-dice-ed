import React, { useState, useEffect } from "react";
import { QuantumVisual } from "../components";
import { useTranslation } from "../i18n";
import axios from "axios";

interface StepData {
  gate: string;
  params: number[];
  qubits: number[];
  description: string;
  statevector: [number, number][]; // updated for real/imag format
  probabilities: number[];
}

interface BuildResponse {
  num_qubits: number;
  steps: StepData[];
}

export default function StepByStepTab() {
  const { t } = useTranslation();
  const [circuitData, setCircuitData] = useState<BuildResponse | null>(null);

  useEffect(() => {
    const fetchCircuit = async () => {
      try {
        const { data } = await axios.post<BuildResponse>(
          `${import.meta.env.VITE_API_BASE}/circuit_visual`,
          { n: 6, method: "exact" }
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

        const initialStep = {
          gate: "init",
          params: [],
          qubits: [],
          description: "Initial state |0…0⟩",
          statevector: initialStatevector,
          probabilities: initialProbabilities
        };

        // Prepend the initial step
        const fixedData = {
          ...data,
          steps: [initialStep, ...data.steps],
        };

        setCircuitData(fixedData);
      } catch (err) {
        console.error("Failed to fetch circuit:", err);
      }
    };

    fetchCircuit();
  }, []);


  if (!circuitData) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Step-by-Step Viewer</h2>
      <QuantumVisual circuitData={circuitData} mode="step-by-step" />

      <h2 style={{ marginTop: 50 }}>Home Page View</h2>
      <QuantumVisual circuitData={circuitData} mode="view-only" />
    </div>
  );
}
