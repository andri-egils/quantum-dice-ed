import React, { useState } from "react";
import axios from "axios";

export default function DiceRollTab() {
  const [n, setN] = useState(6);
  const [method, setMethod] = useState("rejection");
  const [svg, setSvg] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  // Fetch the circuit SVG from the backend
  const fetchCircuit = async () => {
    try {
      const response = await axios.post(`${API_BASE}/build_circuit`, {
        n: Number(n),
        method,
      });
      setSvg(response.data.svg);
    } catch (err) {
      console.error("Error fetching circuit:", err);
      alert("Failed to fetch quantum circuit from backend");
    }
  };

  return (
    <div>
      <h2>Dice Roll</h2>

      {/* Input controls */}
      <div style={{ marginBottom: 16 }}>
        <label>
          N:
          <input
            type="number"
            min={1}
            max={20}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            style={{ marginLeft: 8, width: 60 }}
          />
        </label>

        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          style={{ marginLeft: 12 }}
        >
          <option value="rejection">Rejection Sampling</option>
          <option value="exact">Exact</option>
        </select>

        <button
          onClick={fetchCircuit}
          style={{ marginLeft: 12, padding: "6px 12px" }}
        >
          Build Circuit
        </button>
      </div>

      {/* Display SVG */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: 12,
          marginTop: 12,
          overflowX: "auto",
        }}
        dangerouslySetInnerHTML={{ __html: svg || "<p>Click 'Build Circuit' to see the quantum circuit</p>" }}
      />
    </div>
  );
}
