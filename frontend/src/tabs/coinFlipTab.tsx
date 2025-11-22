import React, { useEffect, useState } from "react";
import axios from "axios";
import Coin2D from "../components/Coin2D";
import { CircuitViewer, Distribution } from "../components";
import { useTranslation } from "../i18n";

interface BuildResponse {
  n: number;
  method: string;
  svg: string;
  theoretical: Record<string, number>;
}

interface RollSingleResponse {
  raw_value: number;
}

interface RollMultipleResponse {
  counts_raw: Record<string, number>;
}

const N_COIN = 2; // coin has two outcomes: 0, 1

export default function CoinFlipTab() {
  const { t, lang } = useTranslation();

  useEffect(() => {
    console.debug("CoinFlipTab language:", lang);
  }, [lang]);

  const [method, setMethod] = useState<string>("rejection");

  const [svg, setSvg] = useState<string | null>(null);
  const [dist, setDist] = useState<Record<string, number>>({});

  const [lastFlipRaw, setLastFlipRaw] = useState<number | null>(null); // 0 or 1

  const [samples, setSamples] = useState<Record<string, number>>({});
  const [flipping, setFlipping] = useState(false);
  const [showResult, setShowResult] = useState(false);

  //
  // --- Fetch circuit whenever method changes (n is fixed to 2) ---
  //
  useEffect(() => {
    let cancelled = false;

    const doBuild = async () => {
      try {
        const { data } = await axios.post<BuildResponse>(
          `${import.meta.env.VITE_API_BASE}/build_circuit`,
          { n: N_COIN, method }
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

    doBuild();

    return () => {
      cancelled = true;
    };
  }, [method]);

  //
  // --- Single flip ---
  //
  const flipOnce = async () => {
    setFlipping(true);
    setShowResult(false);

    const req = axios.post<RollSingleResponse>(
      `${import.meta.env.VITE_API_BASE}/roll`,
      { n: N_COIN, method }
    );

    const animation = new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const [res] = await Promise.all([req, animation]);
      const raw = res?.data?.raw_value ?? null;
      if (raw !== null) {
        setLastFlipRaw(raw);
        const key = String(raw);
        setSamples((prev) => ({
          ...prev,
          [key]: (prev[key] ?? 0) + 1,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFlipping(false);
      setShowResult(true);
    }
  };

  //
  // --- Add 100 flips ---
  //
  const add100Flips = async () => {
    try {
      const { data } = await axios.post<RollMultipleResponse>(
        `${import.meta.env.VITE_API_BASE}/roll_multiple`,
        { n: N_COIN, method, shots: 100 }
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

  const resetHistogram = () => {
    setSamples({});
    setLastFlipRaw(null);
    setShowResult(false);
  };

  const lastFlipLabel =
    showResult && lastFlipRaw !== null
      ? lastFlipRaw === 0
        ? t("coin.heads")
        : t("coin.tails")
      : "-";

  //
  // --------- RENDER ----------
  //
  return (
    <div>
      <h2 style={{ textAlign: "center" }}>{t("coin.title")}</h2>

      {/* --- Coin Flip Section --- */}
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
          <Coin2D spinning={flipping} result={lastFlipRaw} />
        </div>

        <div style={{ margin: "0 auto 1rem", width: 220 }}>
          {/* Show result above method when available */}
          {showResult && lastFlipRaw !== null && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: "0.95rem", color: "#333" }}>{t("coin.last")}</div>
              <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>{lastFlipLabel}</div>
            </div>
          )}
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
          onClick={flipOnce}
          style={{
            padding: "0.6rem 1.2rem",
            width: "60%",
            maxWidth: 300,
            cursor: "pointer",
            fontSize: "1rem",
            background: "#3a4ca3",
            color: "#fff",
            borderRadius: "8px",
            border: "none",
          }}
        >
          {t("coin.flipButton")}
        </button>
      </div>

      {/* --- Histogram Section --- */}
      <div className="card">
        <h3>{t("histogram.title")}</h3>

        {/* Here the outcomes are "0" (Heads) and "1" (Tails) */}
        <Distribution
          distribution={samples}
          theoretical={dist}
          highlightInvalid={true}
          n={N_COIN}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <div style={{ fontSize: "1rem", color: "#333" }}>Last flip</div>
          <div style={{ fontSize: "1rem", fontWeight: 700 }}>
            {lastFlipLabel}{" "}
            {showResult && lastFlipRaw !== null ? `(${lastFlipRaw})` : ""}
          </div>
        </div>

        <button
          onClick={add100Flips}
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
          {t("coin.add100")}
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
          {t("coin.reset")}
        </button>
      </div>

      {/* --- Circuit Section --- */}
      {svg && (
        <div className="card">
          <h3>{t("circuit.title")}</h3>
          <CircuitViewer svg={svg} />
        </div>
      )}
    </div>
  );
}
