import React, { useState } from 'react';
import axios from 'axios';
import CircuitViewer from './components/CircuitViewer';
import Distribution from './components/Distribution';

function App() {
  const [n, setN] = useState(6);
  const [method, setMethod] = useState('rejection');
  const [svg, setSvg] = useState<string | null>(null);
  const [theoretical, setTheoretical] = useState<any>(null);
  const [counts, setCounts] = useState<any>(null);

  // Backend base URL
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

  // Call /build_circuit
  async function buildCircuit() {
    try {
      const res = await axios.post(API_BASE + '/build_circuit', { n: Number(n), method });
      setSvg(res.data.svg);
      setTheoretical(res.data.theoretical);
      setCounts(null);
    } catch (err) {
      console.error(err);
      alert("Error fetching circuit from backend");
    }
  }

  // Call /simulate
  async function runSimulation() {
    try {
      const res = await axios.post(API_BASE + '/simulate', { n: Number(n), method, shots: 1000 });
      setCounts(res.data.counts_mapped);
    } catch (err) {
      console.error(err);
      alert("Error running simulation");
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: '0 auto', fontFamily: 'Inter, system-ui' }}>
      <h1>Quantum Dice — Starter</h1>

      <div style={{ marginTop: 12 }}>
        <label>Choose N: </label>
        <input
          type="number"
          min={1}
          max={20}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
        />
        <select value={method} onChange={(e) => setMethod(e.target.value)} style={{ marginLeft: 8 }}>
          <option value="rejection">Rejection Sampling</option>
          <option value="exact">Exact (reject overflows)</option>
        </select>
        <button onClick={buildCircuit} style={{ marginLeft: 8 }}>
          Build Circuit
        </button>
        <button onClick={runSimulation} style={{ marginLeft: 8 }}>
          Run 1000 shots
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
        <div style={{ flex: 1 }}>
          <h3>Theoretical Distribution</h3>
          {theoretical ? <Distribution data={theoretical} /> : <div>Click "Build Circuit"</div>}
        </div>
        <div style={{ flex: 1 }}>
          <h3>Circuit</h3>
          {svg ? <CircuitViewer svg={svg} /> : <div>Click "Build Circuit"</div>}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Simulated Results</h3>
        {counts ? <Distribution data={counts} /> : <div>Run simulation to see results</div>}
      </div>
    </div>
  );
}

export default App;
