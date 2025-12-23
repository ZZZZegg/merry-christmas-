import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { InstancedRigidBodyProps } from '@react-three/rapier'; // Not using physics, just types logic
import { AnimationMode } from '../types';
import { Sparkles } from '@react-three/drei';

// --- Constants & Config ---
const TREE_HEIGHT = 9;
const TREE_BASE_RADIUS = 3.5;
const LEAF_COUNT = 4500;
const ORNAMENT_COUNT = 800; // 400 cubes, 400 icosa
const RIBBON_COUNT = 1500;

// Reusable Object3D for matrix calculations
const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();
const targetVector = new THREE.Vector3();
const initialVector = new THREE.Vector3();

// --- Helper Functions ---

const randomSpherePoint = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius; // Uniform distribution
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  ];
};

const getConePoint = (height: number, baseRadius: number): { pos: [number, number, number], radiusAtHeight: number } => {
  const y = Math.random() * height;
  const radiusAtHeight = (1 - y / height) * baseRadius;
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * radiusAtHeight; // Uniform disc
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;
  return { pos: [x, y, z], radiusAtHeight };
};

// --- Sub-Components ---

// 1. Leaves (Pink Octahedrons)
const Leaves = ({ mode }: { mode: AnimationMode }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const data = useMemo(() => {
    return Array.from({ length: LEAF_COUNT }).map(() => {
      const { pos } = getConePoint(TREE_HEIGHT, TREE_BASE_RADIUS);
      const startPos = randomSpherePoint(15);
      const scale = Math.random() * 0.15 + 0.05;
      const pinkType = Math.random() > 0.5 ? '#FFB7C5' : '#FF69B4';
      
      return {
        target: new THREE.Vector3(...pos),
        initial: new THREE.Vector3(...startPos),
        scale,
        color: new THREE.Color(pinkType),
        rotationSpeed: [Math.random() * 0.02, Math.random() * 0.02, Math.random() * 0.02],
        phase: Math.random() * Math.PI * 2
      };
    });
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    data.forEach((d, i) => {
      tempObject.position.copy(d.initial);
      tempObject.scale.set(d.scale, d.scale, d.scale);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
      meshRef.current!.setColorAt(i, d.color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [data]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const isTree = mode === 'TREE';

    data.forEach((d, i) => {
      // Lerp Position
      meshRef.current!.getMatrixAt(i, tempObject.matrix);
      tempObject.matrix.decompose(tempObject.position, tempObject.quaternion, tempObject.scale);
      
      const dest = isTree ? d.target : d.initial;
      
      // Add a hovering effect to tree mode
      const hoverY = isTree ? Math.sin(time * 2 + d.phase) * 0.05 : 0;
      targetVector.copy(dest).add(new THREE.Vector3(0, hoverY, 0));

      // Interpolation speed
      const speed = isTree ? 0.03 + (i % 50) * 0.0002 : 0.02;
      tempObject.position.lerp(targetVector, speed);

      // Rotate
      tempObject.rotation.x += d.rotationSpeed[0];
      tempObject.rotation.y += d.rotationSpeed[1];
      tempObject.rotation.z += d.rotationSpeed[2];

      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, LEAF_COUNT]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        color="#FF69B4" 
        roughness={0.4} 
        metalness={0.6} 
        flatShading
      />
    </instancedMesh>
  );
};

// 2. Ribbon (White Tetrahedrons Spiral)
const Ribbon = ({ mode }: { mode: AnimationMode }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const data = useMemo(() => {
    return Array.from({ length: RIBBON_COUNT }).map((_, i) => {
      // Spiral Math
      const t = i / RIBBON_COUNT;
      const height = t * TREE_HEIGHT;
      const radius = (1 - t) * (TREE_BASE_RADIUS + 0.5); // Slightly wider than tree
      const angle = t * Math.PI * 12; // 6 loops
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const startPos = randomSpherePoint(20);
      
      return {
        target: new THREE.Vector3(x, height, z),
        initial: new THREE.Vector3(...startPos),
        scale: Math.random() * 0.08 + 0.04,
        phase: Math.random() * Math.PI
      };
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const isTree = mode === 'TREE';
    const time = state.clock.getElapsedTime();

    data.forEach((d, i) => {
      meshRef.current!.getMatrixAt(i, tempObject.matrix);
      tempObject.matrix.decompose(tempObject.position, tempObject.quaternion, tempObject.scale);

      const dest = isTree ? d.target : d.initial;
      
      // Dynamic pulsing logic for ribbon
      const pulse = Math.sin(time * 3 + i * 0.1) * 0.02;
      
      // In tree mode, we want the ribbon to flow
      if (isTree) {
         // Create a flow effect by offsetting target based on time
         // This is complex for baked positions, so we just oscillate slightly
      }

      tempObject.position.lerp(dest, 0.05);
      
      // Always look at center in tree mode
      if (isTree) {
          tempObject.lookAt(0, tempObject.position.y, 0);
      } else {
          tempObject.rotation.x += 0.05;
          tempObject.rotation.y += 0.05;
      }
      
      tempObject.scale.setScalar(d.scale + pulse);

      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, RIBBON_COUNT]}>
      <tetrahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        color="#FFFFFF" 
        emissive="#FFFFFF"
        emissiveIntensity={2}
        toneMapped={false}
      />
    </instancedMesh>
  );
};

// 3. Ornaments (Cubes & Icosahedrons)
const Ornaments = ({ mode }: { mode: AnimationMode }) => {
  const cubeRef = useRef<THREE.InstancedMesh>(null);
  const icoRef = useRef<THREE.InstancedMesh>(null);

  const generateData = (count: number, type: 'CUBE' | 'ICO') => {
    return Array.from({ length: count }).map(() => {
      // Points on surface of cone roughly
      const y = Math.random() * TREE_HEIGHT;
      const rAtH = (1 - y / TREE_HEIGHT) * TREE_BASE_RADIUS;
      const angle = Math.random() * Math.PI * 2;
      const r = rAtH + Math.random() * 0.2; // Slightly outside or inside surface
      
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      
      const startPos = randomSpherePoint(18);
      
      return {
        target: new THREE.Vector3(x, y, z),
        initial: new THREE.Vector3(...startPos),
        scale: Math.random() * 0.15 + 0.1,
        color: type === 'CUBE' ? new THREE.Color('#E6E6FA') : new THREE.Color('#ffffff'), // Lavender & White
        rotSpeed: Math.random() * 0.02
      };
    });
  };

  const cubeData = useMemo(() => generateData(ORNAMENT_COUNT / 2, 'CUBE'), []);
  const icoData = useMemo(() => generateData(ORNAMENT_COUNT / 2, 'ICO'), []);

  const updateMesh = (ref: React.RefObject<THREE.InstancedMesh>, data: any[], isTree: boolean) => {
    if (!ref.current) return;
    
    data.forEach((d, i) => {
      ref.current!.getMatrixAt(i, tempObject.matrix);
      tempObject.matrix.decompose(tempObject.position, tempObject.quaternion, tempObject.scale);
      
      const dest = isTree ? d.target : d.initial;
      tempObject.position.lerp(dest, 0.025); // Slower than leaves
      
      tempObject.rotation.x += d.rotSpeed;
      tempObject.rotation.y += d.rotSpeed;

      // Scale up slightly when in tree mode
      const targetScale = isTree ? d.scale : d.scale * 0.5;
      tempObject.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

      tempObject.updateMatrix();
      ref.current!.setMatrixAt(i, tempObject.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  };

  useFrame(() => {
    const isTree = mode === 'TREE';
    updateMesh(cubeRef, cubeData, isTree);
    updateMesh(icoRef, icoData, isTree);
  });

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    roughness: 0,
    metalness: 0.2,
    transmission: 0.6, // Glass-like
    thickness: 1,
    ior: 1.5,
    clearcoat: 1,
  }), []);

  return (
    <>
      <instancedMesh ref={cubeRef} args={[undefined, undefined, ORNAMENT_COUNT / 2]}>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={material} attach="material" />
      </instancedMesh>
      <instancedMesh ref={icoRef} args={[undefined, undefined, ORNAMENT_COUNT / 2]}>
        <icosahedronGeometry args={[0.7, 0]} />
        <primitive object={material} attach="material" />
      </instancedMesh>
    </>
  );
};

// 4. The Star
const Star = ({ mode }: { mode: AnimationMode }) => {
  const ref = useRef<THREE.Group>(null);
  const targetPos = useMemo(() => new THREE.Vector3(0, TREE_HEIGHT + 0.5, 0), []);
  const initialPos = useMemo(() => new THREE.Vector3(0, 30, 0), []);

  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const spikes = 5;
    const outerRadius = 1;
    const innerRadius = 0.4;
    
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const a = (i / (spikes * 2)) * Math.PI * 2;
      const x = Math.cos(a + Math.PI / 2) * r;
      const y = Math.sin(a + Math.PI / 2) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const isTree = mode === 'TREE';
    
    const dest = isTree ? targetPos : initialPos;
    ref.current.position.lerp(dest, 0.04);
    
    ref.current.rotation.y += 0.02;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
  });

  return (
    <group ref={ref}>
      <mesh>
        <extrudeGeometry args={[starShape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 2 }]} />
        <meshStandardMaterial 
          color="#FFD700" 
          emissive="#FFD700" 
          emissiveIntensity={2} 
          toneMapped={false}
        />
      </mesh>
      {/* Sparkles around the star */}
      <Sparkles count={50} scale={4} size={4} speed={0.4} opacity={1} color="#FFF" />
      
      {/* Central light for the star */}
      <pointLight distance={5} intensity={5} color="#FFD700" />
    </group>
  );
};

// Main Component
const ChristmasTree: React.FC<{ mode: AnimationMode }> = ({ mode }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
     if(groupRef.current) {
         // Subtle floating of entire tree structure
         const t = state.clock.getElapsedTime();
         groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.2;
     }
  });

  return (
    <group ref={groupRef}>
      <Leaves mode={mode} />
      <Ribbon mode={mode} />
      <Ornaments mode={mode} />
      <Star mode={mode} />
      
      {/* Ground Reflection hints */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#050103" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

export default ChristmasTree;