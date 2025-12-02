import React, { useEffect, useState } from "react";
import axios from "axios";
import { CircuitViewer, Distribution, QuantumVisual } from "../components";
import Dice3D from "../components/Dice3D";
import { useTranslation } from "../i18n";

interface StepData {
  gate: string;
  params: number[];
  qubits: number[];
  description: string;
  statevector: [number, number][]; // updated for real/imag format
  probabilities: number[];
}

interface CircuitVisualResponse {
  num_qubits: number;
  steps: StepData[];
}

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
  const { t, lang } = useTranslation();

  useEffect(() => {
    console.debug("DiceRollTab language:", lang, "title->", t("dice.title"));
  }, [lang, t]);

  const [n, setN] = useState<number>(6);
  const [method, setMethod] = useState<string>("rejection");

  const [svg, setSvg] = useState<string | null>(null);
  const [dist, setDist] = useState<Record<string, number>>({});

  const [circuitData, setCircuitData] = useState<CircuitVisualResponse | null>(null);

  const [lastRollRaw, setLastRollRaw] = useState<number | null>(null);

  const [samples, setSamples] = useState<Record<string, number>>({});
  const [rolling, setRolling] = useState(false);
  const [showResult, setShowResult] = useState(false);

  //
  // --- Fetch circuit whenever n or method changes ---
  //
  useEffect(() => {
    let cancelled = false;

    const fetchSvg = async () => {
      try {
        const { data } = await axios.post<BuildResponse>(
          `${import.meta.env.VITE_API_BASE}/build_circuit`,
          { n, method }
        );
        if (!cancelled) {
          setSvg(data.svg);
          setDist(data.theoretical);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setSvg("<div>Failed to load circuit</div>");
          setDist({});
        }
      } finally {
        if (!cancelled) setSamples({});
      }
    };

    const fetchCircuitVisual = async () => {
      try {
        const { data } = await axios.post<CircuitVisualResponse>(
          `${import.meta.env.VITE_API_BASE}/circuit_visual`,
          { n, method }
        );

        if (cancelled) return;

        // Add initial |000...0> state
        const numQubits = data.num_qubits;
        const dim = 2 ** numQubits;

        const initialStatevector: [number, number][] = Array.from(
          { length: dim },
          (_, i) => (i === 0 ? [1, 0] : [0, 0])
        );

        const initialProbabilities = Array.from(
          { length: dim },
          (_, i) => (i === 0 ? 1 : 0)
        );

        const initialStep: StepData = {
          gate: "init",
          params: [],
          qubits: [],
          description: "Initial state |0…0⟩",
          statevector: initialStatevector,
          probabilities: initialProbabilities,
        };

        setCircuitData({
          ...data,
          steps: [initialStep, ...data.steps],
        });
      } catch (err) {
        console.error("Failed to fetch circuitData:", err);
      }
    };

    fetchSvg();
    fetchCircuitVisual();

    return () => {
      cancelled = true;
    };
  }, [n, method]);

  //
  // --- Single roll ---
  //
  const rollSingle = async () => {
    setRolling(true);
    setShowResult(false);

    const req = axios.post<RollSingleResponse>(
      `${import.meta.env.VITE_API_BASE}/roll`,
      { n, method }
    );

    const animation = new Promise((resolve) =>
      setTimeout(resolve, 1500)
    );

    try {
      const [res] = await Promise.all([req, animation]);
      const raw = res?.data?.raw_value ?? null;

      if (raw !== null) {
        setLastRollRaw(raw);
        const key = String(raw);
        setSamples((prev) => ({
          ...prev,
          [key]: (prev[key] ?? 0) + 1,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRolling(false);
      setShowResult(true);
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
    <div>
      <h2 style={{ textAlign: "center" }}>{t("dice.title")}</h2>

      {/* --- Dice Roll Section --- */}
      <div className="card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1rem",
            gap: "1rem",
          }}
        >
          <Dice3D
            sides={n}
            rolling={rolling}
            label={
              showResult && lastRollRaw !== null
                ? `${t("dice.resultPrefix")} ${lastRollRaw}`
                : `D${n}`
            }
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>{t("dice.choose")}</div>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1rem",
              flexWrap: "wrap",
            }}
          >
            {[4, 6, 8, 12, 20].map((sides) => (
              <button
                key={sides}
                onClick={() => setN(sides)}
                style={{
                  padding: "0.5rem 1rem",
                  border: n === sides ? "2px solid #3a4ca3" : "1px solid #ccc",
                  background: n === sides ? "#eaf6ff" : "#fff",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: n === sides ? "bold" : "normal",
                }}
              >
                {`D${sides}`}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: "0.5rem" }}>{t("dice.method")}</div>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{ width: "100%" }}
          >
            <option value="rejection">{t("dice.method.rejection")}</option>
            <option value="exact">{t("dice.method.exact")}</option>
          </select>
        </div>

        <button
          onClick={rollSingle}
          style={{
            padding: "0.6rem 1.2rem",
            width: "100%",
            cursor: "pointer",
            fontSize: "1rem",
            background: "#3a4ca3",
            color: "#fff",
            borderRadius: "8px",
            border: "none",
          }}
        >
          {t("dice.rollOnce")}
        </button>
      </div>

      {/* --- Histogram Section --- */}
      <div className="card">
        <h3>{t("histogram.title")}</h3>

        <Distribution
          distribution={samples}
          theoretical={dist}
          highlightInvalid={true}
          n={n}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <div style={{ fontSize: "1rem", color: "#333" }}>
            {t("dice.lastRoll")}
          </div>
          <div
            style={{
              fontSize: "1rem",
              color:
                showResult &&
                lastRollRaw !== null &&
                lastRollRaw >= n
                  ? "#d64545"
                  : "#333",
              fontWeight: 700,
            }}
          >
            {t("dice.raw")}{" "}
            {showResult && lastRollRaw !== null ? lastRollRaw : "-"}
          </div>
        </div>

        <button
          onClick={add100Rolls}
          style={{
            padding: "0.6rem 1.2rem",
            width: "100%",
            marginTop: "1rem",
            cursor: "pointer",
            borderRadius: "8px",
            border: "none",
            background: "#3a4ca3",
            color: "#fff",
          }}
        >
          {t("dice.add100")}
        </button>

        <button
          onClick={resetHistogram}
          style={{
            padding: "0.6rem 1.2rem",
            width: "100%",
            marginTop: "0.5rem",
            cursor: "pointer",
            borderRadius: "8px",
            border: "none",
            background: "#eaf6ff",
            color: "#3a4ca3",
          }}
        >
          {t("dice.reset")}
        </button>
      </div>

      {/* --- Circuit Section (QuantumVisual) --- */}
      {circuitData && (
        <div className="card">
          <h3>{t("circuit.title")}</h3>
          <QuantumVisual circuitData={circuitData} mode="view-only" />
        </div>
      )}
    </div>
  );
}
