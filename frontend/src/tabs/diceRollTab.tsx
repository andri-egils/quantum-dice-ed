import React, { useEffect, useState } from "react";
import axios from "axios";
import { CircuitViewer, Distribution } from "../components";

interface BuildResponse {
  n: number;
  method: string;
  svg: string;
  theoretical: Record<string, number>;
}

interface RollSingleResponse {
  raw_value: number;
  mapped_value: number | null;
}

interface RollMultipleResponse {
  counts_raw: Record<string, number>;
  counts_mapped: Record<string, number>;
}

export default function DiceRollTab() {
  const [n, setN] = useState<number>(6);
  const [method, setMethod] = useState<string>("rejection");

  const [svg, setSvg] = useState<string | null>(null);
  const [dist, setDist] = useState<Record<string, number>>({});

  const [lastRollRaw, setLastRollRaw] = useState<number | null>(null);
  const [lastRollMapped, setLastRollMapped] = useState<number | null>(null);

  const [samples, setSamples] = useState<Record<string, number>>({}); // cumulative histogram

  //
  // --- Fetch circuit whenever n or method changes ---
  //
  useEffect(() => {
    buildCircuit();
    setSamples({}); // reset histogram when parameters change
  }, [n, method]);

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
      setSvg("<div>Failed to load circuit</div>");
      setDist({});
    }
  };

  //
  // --- Single roll ---
  //
  const rollSingle = async () => {
    try {
      const { data } = await axios.post<RollSingleResponse>(
        `${import.meta.env.VITE_API_BASE}/roll`,
        { n, method }
      );

      setLastRollRaw(data.raw_value);
      setLastRollMapped(null);

      // Update cumulative histogram
      const key = String(data.raw_value);

      setSamples((prev) => ({
        ...prev,
        [key]: (prev[key] ?? 0) + 1,
      }));
    } catch (err) {
      console.error(err);
      setLastRollMapped(null);
      setLastRollRaw(null);
    }
  };

  //
  // --- Add 100 rolls ---
  //
  const add100Rolls = async () => {
    try {
      const { data } = await axios.post<RollMultipleResponse>(
        `${import.meta.env.VITE_API_BASE}/roll_multiple`,
        { n, method, shots: 100 }
      );

      // Merge new samples into cumulative histogram
      setSamples((prev) => {
        const updated = { ...prev };
        Object.entries(data.counts_raw).forEach(([key, count]) => {
          updated[key] = (updated[key] ?? 0) + count;
        });
        return updated;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const resetHistogram = () => setSamples({});

  //
  // --------- RENDER ----------
  //
  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ textAlign: "center" }}>Quantum Dice Roll</h2>

      {/* --- TOP SECTION: LEFT/RIGHT SPLIT --- */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          marginTop: "1rem",
        }}
      >
        {/* ---------- LEFT COLUMN ---------- */}
        <div style={{ flex: 1 }}>
          {/* Row 1: dice image + single roll result */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1rem",
              gap: "1rem",
            }}
          >
            <img
              src="/placeholder-dice.png"
              alt="Dice"
              style={{ width: "100px" }}
            />

            <div style={{ fontSize: "1.4rem" }}>
              <div>🎲 Last Roll:</div>

              {lastRollRaw !== null ? (
                <div>
                  Raw:
                  <span
                    style={{
                      color: lastRollRaw >= n ? "red" : "black",
                      fontWeight: "bold",
                    }}
                  >
                    {lastRollRaw}
                  </span>
                </div>
              ) : (
                <div>No rolls yet</div>
              )}

            </div>
          </div>

          {/* Row 2: controls */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ marginBottom: "0.5rem" }}>Number of sides:</div>
            <select
              value={n}
              onChange={(e) => setN(parseInt(e.target.value))}
              style={{ width: "100%", marginBottom: "1rem" }}
            >
              {Array.from({ length: 19 }, (_, i) => i + 2).map((value) => (
                <option key={value} value={value}>
                  {value}-sided
                </option>
              ))}
            </select>

            <div style={{ marginBottom: "0.5rem" }}>Method:</div>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="rejection">Rejection Sampling</option>
              <option value="exact">Exact State</option>
            </select>
          </div>

          {/* Row 3: Single Roll button */}
          <button
            onClick={rollSingle}
            style={{
              padding: "0.6rem 1.2rem",
              width: "100%",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Roll Once
          </button>
        </div>

        {/* ---------- RIGHT COLUMN ---------- */}
        <div style={{ flex: 1 }}>
          <h3>Cumulative Histogram</h3>

          <Distribution
            distribution={samples}
            theoretical={dist}
            highlightInvalid={true}
            n={n}
          />

          <button
            onClick={add100Rolls}
            style={{
              padding: "0.6rem 1.2rem",
              width: "100%",
              marginTop: "1rem",
              cursor: "pointer",
            }}
          >
            Add 100 Rolls
          </button>

          <button
            onClick={resetHistogram}
            style={{
              padding: "0.6rem 1.2rem",
              width: "100%",
              marginTop: "0.5rem",
              cursor: "pointer",
              backgroundColor: "#ddd",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* --- CIRCUIT VIEWER SECTION --- */}
      {svg && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Quantum Circuit</h3>
          <CircuitViewer svg={svg} />
        </div>
      )}
    </div>
  );
}
