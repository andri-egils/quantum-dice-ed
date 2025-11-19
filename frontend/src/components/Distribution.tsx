import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LabelList,
  Cell,
} from "recharts";

type NumRecord = Record<string, number>;

interface Props {
  distribution: NumRecord;     // raw sample counts from backend
  theoretical?: NumRecord;     // theoretical distribution
  n: number;                   // valid die range: 0..n-1
  highlightInvalid?: boolean;
  height?: number;
}

export default function Distribution({
  distribution,
  theoretical,
  n,
  highlightInvalid = true,
  height = 360,
}: Props) {
  const totalSamples = Object.values(distribution).reduce((s, v) => s + (v || 0), 0);

  // Figure out total states (constant number of bars)
  const allKeys = Object.keys(theoretical ?? distribution);
  const maxKey = Math.max(...allKeys.map(Number));
  const totalStates = maxKey + 1;

  // Build fixed rows (0 .. totalStates-1)
  const data = Array.from({ length: totalStates }, (_, i) => {
    const key = String(i);
    const samples = distribution[key] ?? 0;
    const percent = totalSamples ? (samples / totalSamples) * 100 : 0;
    const theoreticalPercent = theoretical ? (theoretical[key] || 0) * 100 : 0;

    return {
      label: key,
      samples,
      percent,
      theoreticalPercent,
      isInvalid: i >= n,   // mark as red if out of valid dice range
    };
  });

  const [maxPercent, setMaxPercent] = useState(100);

  useEffect(() => {
    const totalSamples = Object.values(distribution).reduce((s, v) => s + (v || 0), 0);
    const data = Object.entries(distribution).map(([_, count]) => totalSamples ? (count / totalSamples) * 100 : 0);
    const newMax = Math.max(...data, 10); // min 10% for visibility
    setMaxPercent(newMax);
  }, [distribution]);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            type="number"
            domain={[0, maxPercent]}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
          />

          <YAxis type="category" dataKey="label" />

          <Tooltip
            formatter={(v, name, props) => {
              if (name === "Samples (%)") return [`${v.toFixed(2)}%`, name];
              return [v, name];
            }}
          />

          <Legend />

          {/* MAIN BARS */}
          <Bar dataKey="percent" name="Samples (%)">
            {data.map((row, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={row.isInvalid ? "#ff4444" : "#8884d8"}
              />
            ))}

            <LabelList
              dataKey="samples"
              position="right"
              formatter={(v: any) => String(v)}
            />
          </Bar>

          {/* Theoretical distribution */}
          {theoretical && (
            <Line
              type="monotone"
              dataKey="theoreticalPercent"
              name="Theoretical (%)"
              stroke="#000"
              strokeDasharray="6 6"
              dot={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
