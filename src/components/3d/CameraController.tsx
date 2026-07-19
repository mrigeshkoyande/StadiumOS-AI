import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface CameraControllerProps {
  focusPosition: [number, number, number] | null;
}

/**
 * Smooth orbit controls with the ability to auto-focus on a 3D position.
 * When focusPosition changes, the camera smoothly lerps to look at that point.
 */
export function CameraController({ focusPosition }: CameraControllerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));
  const isAnimating = useRef(false);

  useFrame(() => {
    if (focusPosition && controlsRef.current) {
      const target = new THREE.Vector3(...focusPosition);
      targetRef.current.lerp(target, 0.04);
      controlsRef.current.target.copy(targetRef.current);

      // Move camera closer to the focused gate
      const desiredCamPos = new THREE.Vector3(
        focusPosition[0] * 0.5 + 4,
        6,
        focusPosition[2] * 0.5 + 4,
      );
      camera.position.lerp(desiredCamPos, 0.03);

      if (!isAnimating.current) {
        isAnimating.current = true;
      }
      if (camera.position.distanceTo(desiredCamPos) < 0.1) {
        isAnimating.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.1}
      maxPolarAngle={Math.PI / 2.2}
      minDistance={4}
      maxDistance={20}
    />
  );
}
