import React, { useState } from "react";
import DiceRollTab from "./tabs/DiceRollTab";
import LearnTab from "./tabs/LearnTab";
import StepByStepTab from "./tabs/StepByStepTab";

export default function App() {
  const [activeTab, setActiveTab] = useState("Dice Roll");

  const renderTabContent = () => {
    switch (activeTab) {
      case "Dice Roll":
        return <DiceRollTab />;
      case "Learn":
        return <LearnTab />;
      case "Step by Step":
        return <StepByStepTab />;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Inter, system-ui" }}>
      {/* Sidebar */}
      <div
        style={{
          width: 200,
          backgroundColor: "#1f2937",
          color: "white",
          display: "flex",
          flexDirection: "column",
          paddingTop: 20,
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Quantum Dice</h2>
        {["Dice Roll", "Learn", "Step by Step"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "12px 16px",
              margin: "4px 8px",
              backgroundColor: activeTab === tab ? "#374151" : "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              textAlign: "left",
              borderRadius: 4,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: 20, overflow: "auto" }}>{renderTabContent()}</div>
    </div>
  );
}
