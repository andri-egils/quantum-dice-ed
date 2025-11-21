import { useState } from "react";
import DiceRollTab from "./tabs/diceRollTab";
import LearnTab from "./tabs/learnTab";
import StepByStepTab from "./tabs/stepByStepTab";
import CoinFlipTab from "./tabs/coinFlipTab";
import { I18nProvider, useTranslation } from "./i18n";

function InnerApp() {
  const { t, lang, setLang } = useTranslation();
  const [activeTab, setActiveTab] = useState<"dice" | "coin" | "learn" | "step">("dice");
  const [menuOpen, setMenuOpen] = useState(false);

  const tabKeys: Array<"dice" | "coin" | "learn" | "step"> = ["dice", "coin", "learn", "step"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "dice":
        return <DiceRollTab />;
      case "coin":
        return <CoinFlipTab />;
      case "learn":
        return <LearnTab />;
      case "step":
        return <StepByStepTab />;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "Inter, system-ui" }}>
      {/* Top header */}
      <div style={{ display: "flex", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid #e6e6e6" }}>
        <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{t("site.title")}</div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {tabKeys.map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: "8px 12px",
                  background: activeTab === key ? "#e6f0ff" : "transparent",
                  border: "1px solid transparent",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                {t(`tab.${key}`)}
              </button>
            ))}
          </div>

          <div>
            <button onClick={() => setMenuOpen((s) => !s)} style={{ padding: "6px 10px", display: "flex", gap: 8, alignItems: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" strokeWidth="1.2" />
                <path d="M2 12h20M12 2c2.5 4 2.5 14 0 20" strokeWidth="0.8" />
              </svg>
              <span>{lang === "en" ? "EN" : "IS"}</span>
            </button>

            {menuOpen && (
              <div style={{ position: "absolute", right: 0, top: "40px", background: "white", border: "1px solid #ddd", borderRadius: 6, padding: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button onClick={() => { setLang("en"); setMenuOpen(false); }} style={{ padding: "6px 8px" }}>EN</button>
                  <button onClick={() => { setLang("is"); setMenuOpen(false); }} style={{ padding: "6px 8px" }}>IS</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>{renderTabContent()}</div>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <InnerApp />
    </I18nProvider>
  );
}
