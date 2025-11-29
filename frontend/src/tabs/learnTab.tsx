import { useState } from "react";
import { useTranslation } from "../i18n";

export default function LearnTab() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});

  const toggle = (key: string) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  return (
    <div>
  <h2 style={{ textAlign: "center" }}>{t("tab.learn")}</h2>
      <div className="card">
        <p style={{ marginTop: 0 }}></p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Rejection Sampling */}
          <div
            className="card"
            style={{ cursor: "pointer", padding: "0.75rem" }}
            onClick={() => toggle("rejection")}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{t("learn.card.rejection.title")}</div>
            {open["rejection"] && (
              <div style={{ fontSize: "0.95rem", color: "#333" }}>{t("learn.card.rejection.body")}</div>
            )}
          </div>

          {/* Exact State */}
          <div
            className="card"
            style={{ cursor: "pointer", padding: "0.75rem" }}
            onClick={() => toggle("exact")}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{t("learn.card.exact.title")}</div>
            {open["exact"] && (
              <div style={{ fontSize: "0.95rem", color: "#333" }}>{t("learn.card.exact.body")}</div>
            )}
          </div>

          {/* Circuit Preparation */}
          <div
            className="card"
            style={{ cursor: "pointer", padding: "0.75rem" }}
            onClick={() => toggle("circuit")}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{t("learn.card.circuit.title")}</div>
            {open["circuit"] && (
              <div style={{ fontSize: "0.95rem", color: "#333" }}>{t("learn.card.circuit.body")}</div>
            )}
          </div>

          {/* Quantum Randomness */}
          <div
            className="card"
            style={{ cursor: "pointer", padding: "0.75rem" }}
            onClick={() => toggle("qr")}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{t("learn.card.qr.title")}</div>
            {open["qr"] && (
              <div style={{ fontSize: "0.95rem", color: "#333" }}>{t("learn.card.qr.body")}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
