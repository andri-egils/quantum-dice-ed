import React, { useState } from "react";
import { useTranslation } from "../i18n";

export default function CoinFlipTab() {
  const { t } = useTranslation();
  const [last, setLast] = useState<string | null>(null);

  const flip = () => {
    const r = Math.random() < 0.5 ? "Heads" : "Tails";
    setLast(r);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ textAlign: "center" }}>{t("coin.title")}</h2>
      <div className="card">
        <button onClick={flip} style={{ padding: "8px 12px" }}>{t("coin.flip")}</button>
        <div style={{ marginTop: 12 }}>{t("coin.last")} {last ?? t("coin.noFlips")}</div>
      </div>
    </div>
  );
}
