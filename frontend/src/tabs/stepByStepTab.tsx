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
          { n: 3, method: "exact" }
        );
        setCircuitData(data); // important!
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
