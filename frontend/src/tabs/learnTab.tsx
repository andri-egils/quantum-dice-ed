import React from "react";
import { useTranslation } from "../i18n";

export default function LearnTab() {
  const { t } = useTranslation();
  return (
    <div>
  <h2 style={{ textAlign: "center" }}>{t("tab.learn")}</h2>
      <div className="card">
        <p>This tab explains the different methods and how the quantum circuit is prepared.</p>
        {/* Add educational content here */}
      </div>
    </div>
  );
}
