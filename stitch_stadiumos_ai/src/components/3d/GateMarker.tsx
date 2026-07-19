import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { GateStatus } from '../../types';

const DENSITY_COLORS: Record<string, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626',
};

interface GateMarkerProps {
  gate: GateStatus;
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
}

/**
 * 3D gate marker with color-coded density, pulsing animation for high/critical,
 * and an HTML overlay showing live stats.
 */
export function GateMarker({ gate, position, isSelected, onClick }: GateMarkerProps) {
  const pulseRef = useRef<any>(null);
  const color = DENSITY_COLORS[gate.density] ?? '#10b981';
  const shouldPulse = gate.density === 'high' || gate.density === 'critical';

  useFrame(({ clock }) => {
    if (pulseRef.current && shouldPulse) {
      const scale = 1 + Math.sin(clock.elapsedTime * 3) * 0.15;
      pulseRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position}>
      {/* Pulse ring for high density */}
      {shouldPulse && (
        <mesh ref={pulseRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.5, 0.7, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      )}

      {/* Main marker sphere */}
      <mesh
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        castShadow
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.6 : 0.2}
        />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color="#2563eb" transparent opacity={0.7} />
        </mesh>
      )}

      {/* HTML overlay label */}
      <Html
        position={[0, 1.2, 0]}
        center
        distanceFactor={8}
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-center whitespace-nowrap"
          style={{ minWidth: '90px' }}
        >
          <div className="text-xs font-bold text-navy-900">{gate.name}</div>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: color }}
            />
            <span className="text-[10px] font-semibold uppercase" style={{ color }}>
              {gate.density}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {gate.queueLength} · {gate.estimatedWaitTime}m
          </div>
        </div>
      </Html>
    </group>
  );
}
