import React, { useState, useEffect } from "react";
import axios from "axios";

export default function DiceRollTab() {
  const [numSides, setNumSides] = useState<number>(6);
  const [method, setMethod] = useState<string>("rejection");
  const [placeholderImage] = useState<string>("https://via.placeholder.com/150");
  const [rollResult, setRollResult] = useState<number | null>(null);

  // Automatically fetch backend update when sides change
  useEffect(() => {
    const updateDiceSettings = async () => {
      try {
        await axios.post(`${import.meta.env.VITE_API_BASE}/update_dice_settings`, {
          numSides,
          method,
        });
      } catch (err) {
        console.error("Failed to update settings", err);
      }
    };

    updateDiceSettings();
  }, [numSides, method]);

  const rollDice = async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE}/roll_dice`,
        { numSides, method }
      );
      setRollResult(data.result);
    } catch (err) {
      console.error("Roll failed", err);
      setRollResult(null);
    }
  };

  return (
    <div style={{ padding: "1rem", textAlign: "center" }}>
      <h2>Dice Roller</h2>

      {/* Placeholder Image */}
      <img
        src={placeholderImage}
        alt="Dice placeholder"
        style={{ display: "block", margin: "0 auto 1rem", width: "150px" }}
      />

      {/* Number of Sides */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Number of Sides:
          <select
            value={numSides}
            onChange={(e) => setNumSides(parseInt(e.target.value))}
            style={{ marginLeft: "0.5rem", padding: "0.25rem" }}
          >
            {Array.from({ length: 19 }, (_, i) => i + 2).map((side) => (
              <option key={side} value={side}>
                {side}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Method selection */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Method:
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{ marginLeft: "0.5rem", padding: "0.25rem" }}
          >
            <option value="rejection">Rejection Sampling</option>
            <option value="exact">Exact State</option>
          </select>
        </label>
      </div>

      {/* Roll Button */}
      <button
        onClick={rollDice}
        style={{
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          display: "block",
          margin: "0.5rem auto",
        }}
      >
        Roll
      </button>

      {/* Show result */}
      {rollResult !== null && (
        <div style={{ marginTop: "1rem", fontSize: "1.5rem" }}>
          🎲 Result: <strong>{rollResult}</strong>
        </div>
      )}
    </div>
  );
}
