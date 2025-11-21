import React from "react";
import { useTranslation } from "../i18n";

export default function StepByStepTab() {
  const { t } = useTranslation();
  return (
    <div>
  <h2 style={{ textAlign: "center" }}>{t("tab.step")}</h2>
      <div className="card">
        <p>Visualize the quantum circuit gate by gate and see how the distribution evolves.</p>
        {/* Add your step simulator component here */}
      </div>
    </div>
  );
}
