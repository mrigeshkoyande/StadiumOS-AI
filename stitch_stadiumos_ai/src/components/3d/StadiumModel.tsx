import * as THREE from 'three';
import { useMemo } from 'react';

/**
 * Procedurally generated light-theme stadium model matching Stitch DESIGN.md.
 * Rendered using Three.js primitives to guarantee repo size remains under 10MB.
 */
export function StadiumModel() {
  const bowlGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRx = 6, outerRy = 5;
    const innerRx = 4.5, innerRy = 3.5;

    shape.absellipse(0, 0, outerRx, outerRy, 0, Math.PI * 2, false, 0);

    const hole = new THREE.Path();
    hole.absellipse(0, 0, innerRx, innerRy, 0, Math.PI * 2, true, 0);
    shape.holes.push(hole);

    const extrudeSettings = { depth: 1.8, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1 };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  return (
    <group>
      {/* Ground plane (Stadium White #f7f9fb) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#f7f9fb" roughness={0.9} />
      </mesh>

      {/* Stadium seating bowl */}
      <mesh
        geometry={bowlGeometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#e2e8f0" metalness={0.1} roughness={0.6} />
      </mesh>

      {/* Upper seating tier */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.8, 0]} castShadow>
        <ringGeometry args={[4.8, 6.3, 64]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.2} roughness={0.5} />
      </mesh>

      {/* Pitch surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} scale={[1.3125, 1, 1]} receiveShadow>
        <ringGeometry args={[0, 3.2, 64]} />
        <meshStandardMaterial color="#86efac" roughness={0.4} />
      </mesh>

      {/* Field markings (Tournament Blue #003fad) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[0.8, 0.85, 32]} />
        <meshStandardMaterial color="#003fad" emissive="#003fad" emissiveIntensity={0.3} />
      </mesh>

      {/* Center line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <planeGeometry args={[8.4, 0.04]} />
        <meshStandardMaterial color="#003fad" emissive="#003fad" emissiveIntensity={0.3} />
      </mesh>

      {/* Architectural Accents (Premium Gold #C7A44A) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.9, 0]}>
        <ringGeometry args={[6.3, 6.35, 64]} />
        <meshStandardMaterial color="#C7A44A" emissive="#C7A44A" emissiveIntensity={0.6} />
      </mesh>

      {/* Glassy Roof Canopy */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(angle) * 5.5,
            3.5,
            Math.sin(angle) * 4.5,
          ]}
          rotation={[0, -angle, Math.PI / 12]}
        >
          <boxGeometry args={[3.5, 0.08, 1.8]} />
          <meshPhysicalMaterial 
            color="#ffffff" 
            metalness={0.1} 
            roughness={0.1} 
            transparent 
            opacity={0.8} 
            transmission={0.6}
          />
        </mesh>
      ))}

      {/* Support Columns */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <mesh
          key={`col-${i}`}
          position={[
            Math.cos(angle) * 5.8,
            1.75,
            Math.sin(angle) * 4.8,
          ]}
        >
          <cylinderGeometry args={[0.08, 0.04, 3.5, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
