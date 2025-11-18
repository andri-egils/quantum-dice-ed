// frontend/src/components/Distribution.tsx
import React from "react";

interface DistributionProps {
  distribution: Record<string, number>;
}

const Distribution: React.FC<DistributionProps> = ({ distribution }) => {
  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>Theoretical Distribution</h3>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {Object.entries(distribution).map(([key, val]) => (
          <div
            key={key}
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              minWidth: "30px",
              textAlign: "center",
              background: "#f9f9f9",
            }}
          >
            <strong>{key}</strong>
            <br />
            {val.toFixed(3)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Distribution;
