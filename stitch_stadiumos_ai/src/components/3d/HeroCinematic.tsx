import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HeroCinematicProps {
  onComplete: () => void;
  onSkip: () => void;
}

const CinematicScene: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const footballRef = useRef<THREE.Mesh>(null);
  const trophyLeftRef = useRef<THREE.Mesh>(null);
  const trophyRightRef = useRef<THREE.Mesh>(null);
  const coreGlowRef = useRef<THREE.Mesh>(null);
  const completedRef = useRef(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (time < 2) {
      // Phase 1: Football rolls across screen
      if (footballRef.current) {
        footballRef.current.position.x = -12 + time * 12;
        footballRef.current.rotation.z -= 0.1;
      }
    } else if (time < 4) {
      // Phase 2: Football hides, gold trophy rises
      if (footballRef.current) footballRef.current.visible = false;
      const t = (time - 2) / 2;
      const py = -4 + t * 4;
      if (trophyLeftRef.current) trophyLeftRef.current.position.y = py;
      if (trophyRightRef.current) trophyRightRef.current.position.y = py;
    } else if (time < 6) {
      // Phase 3: Trophy splits left/right revealing blue core glow
      const t = (time - 4) / 2;
      if (trophyLeftRef.current) trophyLeftRef.current.position.x = -t * 2;
      if (trophyRightRef.current) trophyRightRef.current.position.x = t * 2;
      if (coreGlowRef.current) {
        const mat = coreGlowRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.min(t, 1);
      }
    } else if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  });

  return (
    <group>
      {/* Lights */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 7]} intensity={1.2} />

      {/* Football */}
      <mesh ref={footballRef} position={[-12, 0, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshPhongMaterial color="#ffffff" specular="#111111" shininess={30} flatShading />
      </mesh>

      {/* Trophy Left Half */}
      <mesh ref={trophyLeftRef} position={[0, -10, 0]}>
        <cylinderGeometry args={[0.5, 1.5, 4, 32]} />
        <meshStandardMaterial color="#C7A44A" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Trophy Right Half */}
      <mesh ref={trophyRightRef} position={[0, -10, 0]}>
        <cylinderGeometry args={[0.5, 1.5, 4, 32]} />
        <meshStandardMaterial color="#C7A44A" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Intelligence Core Glow */}
      <mesh ref={coreGlowRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshBasicMaterial color="#1455d9" transparent opacity={0} />
      </mesh>
    </group>
  );
};

export const HeroCinematic: React.FC<HeroCinematicProps> = ({ onComplete, onSkip }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSkip]);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center transition-all duration-1000">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} style={{ background: '#ffffff' }}>
        <CinematicScene onComplete={onComplete} />
      </Canvas>

      <button
        onClick={onSkip}
        className="absolute bottom-10 right-10 z-[110] px-6 py-2 glass-panel fresnel-edge rounded-full text-[#003fad] font-label-sm tracking-widest hover:bg-[#003fad]/10 transition-all uppercase"
      >
        Skip Intro
      </button>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] text-center pointer-events-none">
        <h1 className="font-display text-5xl md:text-7xl font-bold text-[#003fad] tracking-tight">
          StadiumOS AI
        </h1>
        <p className="text-sm font-medium text-[#4e5f7b] tracking-widest mt-2 uppercase">
          World Cup 2026 Intelligence Layer
        </p>
      </div>
    </div>
  );
};
