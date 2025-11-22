import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh } from "three";

type Coin3DProps = {
  spinning: boolean;
  // result: 0 = heads, 1 = tails, null = unknown
  result: number | null;
  label?: string;
  size?: number;
};

function CoinMesh({ spinning, result, size = 1 }: Omit<Coin3DProps, "label">) {
  const ref = useRef<Mesh | null>(null);
  // rotate while spinning; when stopped, snap to show the face for `result`
  useFrame((_, delta) => {
    if (!ref.current) return;
    if (spinning) {
      // spin upward: rotate around X axis quickly
      ref.current.rotation.x += 12 * delta;
      // small wobble on Z for a natural flip
      ref.current.rotation.z += 3 * delta;
    } else {
      // when not spinning, gently settle to show the correct face (0=heads, 1=tails)
      const target = result === 1 ? Math.PI : 0;
      let cur = ref.current.rotation.x % (Math.PI * 2);
      if (cur < 0) cur += Math.PI * 2;
      // compute shortest path to target
      let diff = target - cur;
      // wrap to [-PI, PI]
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      ref.current.rotation.x += diff * Math.min(0.2, 6 * delta);
      // damp z wobble
      ref.current.rotation.z *= 0.85;
    }
  });

  return (
    // Use a flat double-sided circle to represent a 2D coin
    <mesh ref={ref} rotation={[0, 0, 0]}> 
      <circleGeometry args={[size * 0.9, 64]} />
      <meshStandardMaterial
        color="#ffdd33"
        emissive="#ffee88"
        emissiveIntensity={0.18}
        metalness={0.9}
        roughness={0.16}
        side={2}
      />
    </mesh>
  );
}

export default function Coin2D({ spinning, result, label, size = 1 }: Coin3DProps) {
  return (
    <div style={{ width: 260, height: 260, margin: "0 auto" }}>
      <Canvas camera={{ position: [0, 0, 3.5] }}>
        <ambientLight intensity={0.6} />
        <directionalLight intensity={0.9} position={[5, 5, 5]} />
        <directionalLight intensity={0.2} position={[-5, -5, -5]} />
        <CoinMesh spinning={spinning} result={result} size={size} />
      </Canvas>
      {label && (
        <div style={{ textAlign: "center", marginTop: 8, fontWeight: 600 }}>{label}</div>
      )}
    </div>
  );
}

