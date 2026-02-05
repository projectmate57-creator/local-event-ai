import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Float } from "@react-three/drei";
import * as THREE from "three";

interface IconMeshProps {
  type: "calendar" | "location" | "sparkle";
}

function CalendarMesh() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Calendar base */}
        <RoundedBox args={[1.2, 1.4, 0.15]} radius={0.08} smoothness={4}>
          <meshStandardMaterial color="#f5f5f5" metalness={0.1} roughness={0.3} />
        </RoundedBox>
        {/* Calendar header */}
        <RoundedBox args={[1.2, 0.35, 0.18]} radius={0.06} smoothness={4} position={[0, 0.52, 0.02]}>
          <meshStandardMaterial color="#d4af37" metalness={0.4} roughness={0.2} />
        </RoundedBox>
        {/* Calendar dots (representing dates) */}
        {[-0.3, 0, 0.3].map((x, i) =>
          [-0.1, -0.35].map((y, j) => (
            <mesh key={`${i}-${j}`} position={[x, y, 0.1]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color={i === 1 && j === 0 ? "#d4af37" : "#e0e0e0"} />
            </mesh>
          ))
        )}
      </group>
    </Float>
  );
}

function LocationMesh() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.6}>
      <group ref={groupRef}>
        {/* Pin body */}
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
          <meshStandardMaterial color="#d4af37" metalness={0.5} roughness={0.2} />
        </mesh>
        {/* Pin point */}
        <mesh position={[0, -0.4, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.35, 0.6, 32]} />
          <meshStandardMaterial color="#d4af37" metalness={0.5} roughness={0.2} />
        </mesh>
        {/* Inner circle */}
        <mesh position={[0, 0.25, 0.35]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </Float>
  );
}

function SparkleMesh() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.5;
      groupRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={0.8}>
      <group ref={groupRef}>
        {/* Center */}
        <mesh>
          <octahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.1} emissive="#d4af37" emissiveIntensity={0.3} />
        </mesh>
        {/* Rays */}
        {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((angle, i) => (
          <mesh key={i} rotation={[0, 0, angle]} position={[Math.cos(angle) * 0.5, Math.sin(angle) * 0.5, 0]}>
            <boxGeometry args={[0.4, 0.08, 0.08]} />
            <meshStandardMaterial color="#d4af37" metalness={0.5} roughness={0.2} emissive="#d4af37" emissiveIntensity={0.2} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function IconMesh({ type }: IconMeshProps) {
  switch (type) {
    case "calendar":
      return <CalendarMesh />;
    case "location":
      return <LocationMesh />;
    case "sparkle":
      return <SparkleMesh />;
  }
}

interface AnimatedIcon3DProps {
  type: "calendar" | "location" | "sparkle";
  className?: string;
}

export function AnimatedIcon3D({ type, className = "" }: AnimatedIcon3DProps) {
  return (
    <div className={`${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 35 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <pointLight position={[0, 2, 2]} intensity={0.5} color="#d4af37" />
        <IconMesh type={type} />
      </Canvas>
    </div>
  );
}
