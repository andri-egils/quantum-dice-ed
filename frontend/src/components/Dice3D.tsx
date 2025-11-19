import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

type Dice3DProps = {
  sides: number;        // 4, 6, 8, 10, 12, 20
  rolling?: boolean;
  label?: string;       // e.g. "D4" or the rolled value
};

function DiceMesh({ sides, rolling }: { sides: number; rolling: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (meshRef.current && rolling) {
      meshRef.current.rotation.x += 0.2;
      meshRef.current.rotation.y += 0.3;
    }
  });

  // Choose geometry based on number of sides
  let geometry: THREE.BufferGeometry;

  switch (sides) {
    case 4:
      geometry = new THREE.TetrahedronGeometry(1);
      break;
    case 6:
      geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      break;
    case 8:
      geometry = new THREE.OctahedronGeometry(1.2);
      break;
    case 10:
      // approximate d10 as a stretched cylinder
      geometry = new THREE.CylinderGeometry(0.9, 0.9, 1.4, 10);
      break;
    case 12:
      geometry = new THREE.DodecahedronGeometry(1.2);
      break;
    case 20:
      geometry = new THREE.IcosahedronGeometry(1.2);
      break;
    default:
      // fallback: simple sphere
      geometry = new THREE.SphereGeometry(1.2, 32, 32);
  }

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        metalness={0.3}
        roughness={0.4}
        color="#ffffff"
      />
    </mesh>
  );
}

const Dice3D: React.FC<Dice3DProps> = ({ sides, rolling = false, label }) => {
  return (
    <div
      style={{
        width: "260px",
        height: "260px",
        margin: "0 auto 1rem",
        position: "relative",
      }}
    >
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 3]} intensity={0.9} />
  <DiceMesh sides={sides} rolling={rolling} />
        <OrbitControls enableZoom={false} />
      </Canvas>

      {/* Text overlay (e.g. "D4" or "Result: 3") */}
      {label && (
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            left: 0,
            right: 0,
            textAlign: "center",
            fontWeight: 600,
            color: "#444",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default Dice3D;
