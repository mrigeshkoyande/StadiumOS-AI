import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { StadiumModel } from './StadiumModel';
import { GateMarker } from './GateMarker';
import { CrowdVisualization } from './CrowdVisualization';
import { CameraController } from './CameraController';
import { GATE_3D_POSITIONS } from '../../services/mockData';
import type { GateStatus } from '../../types';

interface StadiumSceneProps {
  gates: GateStatus[];
  selectedGateId: string | null;
  focusGateId: string | null;
  onSelectGate: (gateId: string) => void;
}

export function StadiumScene({ gates, selectedGateId, focusGateId, onSelectGate }: StadiumSceneProps) {
  const focusPos = focusGateId ? GATE_3D_POSITIONS[focusGateId] ?? null : null;

  return (
    <div className="w-full h-full" aria-label="3D Stadium Digital Twin" role="img">
      <Canvas
        camera={{ position: [9, 9, 9], fov: 45 }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
        style={{ background: '#f7f9fb' }}
      >
        <Suspense fallback={null}>
          {/* Light-theme ambient & directional light */}
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[10, 15, 8]}
            intensity={1.0}
            castShadow
            shadow-mapSize={[1024, 1024]}
            color="#ffffff"
          />
          <directionalLight position={[-5, 8, -5]} intensity={0.3} color="#dbe1ff" />

          {/* Stadium geometry */}
          <StadiumModel />

          {/* Gate markers */}
          {gates.map(gate => {
            const pos = GATE_3D_POSITIONS[gate.id];
            if (!pos) return null;
            return (
              <GateMarker
                key={gate.id}
                gate={gate}
                position={pos}
                isSelected={selectedGateId === gate.id}
                onClick={() => onSelectGate(gate.id)}
              />
            );
          })}

          {/* Crowd particles */}
          <CrowdVisualization gates={gates} positions={GATE_3D_POSITIONS} />

          {/* Camera controls */}
          <CameraController focusPosition={focusPos} />
        </Suspense>
      </Canvas>
    </div>
  );
}
