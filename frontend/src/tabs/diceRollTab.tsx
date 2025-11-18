import React, { useState } from "react";
import axios from "axios";
import { CircuitViewer, Distribution } from "../components";

interface BuildResponse {
  n: number;
  method: string;
  num_qubits: number;
  svg: string;
  theoretical: Record<string, number>;
}

export default function DiceRollTab() {
  const [n, setN] = useState<number>(6);
  const [method, setMethod] = useState<string>("rejection");
  const [svg, setSvg] = useState<string | null>(null);
  const [dist, setDist] = useState<Record<string, number>>({});

  const buildCircuit = async () => {
    try {
      const { data } = await axios.post<BuildResponse>(
        `${import.meta.env.VITE_API_BASE}/build_circuit`,
        { n, method }
      );

      setSvg(data.svg);
      setDist(data.theoretical);
    } catch (err) {
      console.error(err);
      setSvg("<div>Failed to fetch circuit</div>");
      setDist({});
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Dice Roll</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          N (number of sides):
          <input
            type="number"
            min={1}
            max={20}
            value={n}
            onChange={(e) => setN(parseInt(e.target.value))}
            style={{ marginLeft: "0.5rem", width: "60px" }}
          />
        </label>

        <label style={{ marginLeft: "1rem" }}>
          Method:
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="rejection">Rejection Sampling</option>
            <option value="exact">Exact State</option>
          </select>
        </label>

        <button onClick={buildCircuit} style={{ marginLeft: "1rem" }}>
          Build Circuit
        </button>
      </div>

      {svg && <CircuitViewer svg={svg} />}
      {Object.keys(dist).length > 0 && <Distribution distribution={dist} />}
    </div>
  );
}
