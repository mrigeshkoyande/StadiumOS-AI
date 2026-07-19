import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GateStatus } from '../../types';

const DENSITY_COLORS: Record<string, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626',
};

interface CrowdVisualizationProps {
  gates: GateStatus[];
  positions: Record<string, [number, number, number]>;
}

/**
 * Animated particle rings around each gate.
 * Particle count and speed scale with queue density.
 * Low = few slow green dots, High = many fast red dots.
 */
export function CrowdVisualization({ gates, positions }: CrowdVisualizationProps) {
  return (
    <group>
      {gates.map(gate => {
        const pos = positions[gate.id];
        if (!pos) return null;
        return (
          <GateCrowdRing key={gate.id} gate={gate} position={pos} />
        );
      })}
    </group>
  );
}

function GateCrowdRing({ gate, position }: { gate: GateStatus; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Points>(null);
  const count = gate.density === 'low' ? 12 : gate.density === 'medium' ? 24 : 40;
  const speed = gate.density === 'low' ? 0.3 : gate.density === 'medium' ? 0.6 : 1.2;
  const color = DENSITY_COLORS[gate.density] ?? '#10b981';

  const positions_array = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.8 + Math.random() * 0.3;
      arr[i * 3] = Math.cos(angle) * radius;
      arr[i * 3 + 1] = 0.05 + Math.random() * 0.1;
      arr[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    const posAttr = geo.attributes.position;
    if (!posAttr) return;

    for (let i = 0; i < count; i++) {
      const baseAngle = (i / count) * Math.PI * 2;
      const angle = baseAngle + clock.elapsedTime * speed;
      const radius = 0.8 + Math.sin(clock.elapsedTime * 2 + i) * 0.15;
      posAttr.setXYZ(
        i,
        Math.cos(angle) * radius,
        0.05 + Math.sin(clock.elapsedTime * 3 + i * 0.5) * 0.05,
        Math.sin(angle) * radius,
      );
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions_array, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.08} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}
