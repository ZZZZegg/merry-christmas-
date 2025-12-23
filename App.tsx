import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import Experience from './components/Experience';
import UI from './components/UI';
import GestureController from './components/GestureController';
import { AnimationMode, HandCursorPosition } from './types';

// Christmas BGM
const BGM_URL = "https://cdn.pixabay.com/download/audio/2022/11/24/audio_c1c496033e.mp3?filename=christmas-background-music-126487.mp3";

const App: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [gestureMode, setGestureMode] = useState(false);
  const [mode, setMode] = useState<AnimationMode>('TREE');
  const [rotationOffset, setRotationOffset] = useState(0);
  const [handCursor, setHandCursor] = useState<HandCursorPosition | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (started && audioRef.current && !isMuted) {
      audioRef.current.play().catch(e => console.log("Autoplay blocked", e));
      audioRef.current.volume = 0.3;
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [started, isMuted]);

  const handleStart = (useGesture: boolean) => {
    setStarted(true);
    setGestureMode(useGesture);
  };

  return (
    <div className="relative w-full h-full bg-[#050103] overflow-hidden">
      
      {/* Background Music */}
      <audio ref={audioRef} src={BGM_URL} loop />

      {/* 3D Scene */}
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 15], fov: 45, near: 0.1, far: 100 }}
        gl={{ antialias: false, alpha: false, stencil: false }}
      >
        <color attach="background" args={['#050103']} />
        
        <Suspense fallback={null}>
          <Experience mode={mode} gestureRotation={rotationOffset} isGestureActive={gestureMode} />
        </Suspense>
      </Canvas>
      
      {/* UI Overlay */}
      <UI 
        started={started}
        onStart={handleStart}
        mode={mode} 
        setMode={setMode} 
        isMuted={isMuted}
        toggleMute={() => setIsMuted(!isMuted)}
        gestureMode={gestureMode}
      />

      {/* Gesture Controller */}
      {started && gestureMode && (
        <>
          <GestureController 
            onModeChange={setMode}
            onRotationChange={setRotationOffset}
            onCursorUpdate={setHandCursor}
          />
          {/* Custom Hand Cursor */}
          {handCursor && (
            <div 
              className={`hand-cursor ${handCursor.isPinching ? 'pinched' : ''}`}
              style={{ left: handCursor.x, top: handCursor.y }}
            />
          )}
        </>
      )}

      <Loader containerStyles={{ background: '#050103' }} dataStyles={{ fontFamily: 'monospace', color: '#FF69B4' }} />
    </div>
  );
};

export default App;