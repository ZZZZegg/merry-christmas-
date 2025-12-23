import React, { useRef } from 'react';
import { OrbitControls, Environment, PerspectiveCamera, Stars, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import ChristmasTree from './ChristmasTree';
import { AnimationMode } from '../types';

interface ExperienceProps {
  mode: AnimationMode;
  gestureRotation: number;
  isGestureActive: boolean;
}

const Experience: React.FC<ExperienceProps> = ({ mode, gestureRotation, isGestureActive }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current && isGestureActive) {
      // Smoothly interpolate rotation based on hand position
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, gestureRotation, 0.1);
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 14]} />
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={5}
        maxDistance={25}
        rotateSpeed={0.5}
        // Disable horizontal rotation interaction if gesture mode is active to prevent fighting
        enableRotate={!isGestureActive} 
        autoRotate={!isGestureActive}
        autoRotateSpeed={0.5}
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} color="#FFB7C5" />
      <spotLight position={[10, 20, 10]} angle={0.15} penumbra={1} intensity={2} color="#ffffff" castShadow />
      <pointLight position={[-10, 5, -10]} intensity={5} color="#FF69B4" distance={20} />
      
      {/* Rim light effect from behind */}
      <spotLight position={[0, 10, -10]} intensity={10} color="#00ffff" distance={20} angle={0.5} />

      {/* Environment for reflections */}
      <Environment preset="city" />
      
      {/* Background Ambience */}
      <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

      {/* Main Content */}
      <group position={[0, -3.5, 0]} ref={groupRef}>
        <ChristmasTree mode={mode} />
        
        {/* Soft Contact Shadows instead of plane */}
        <ContactShadows 
           opacity={0.8} 
           scale={20} 
           blur={2.5} 
           far={5} 
           resolution={512} 
           color="#FF1493" 
        />
      </group>

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={1.1} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export default Experience;