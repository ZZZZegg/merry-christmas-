import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { AnimationMode, HandCursorPosition } from '../types';

interface GestureControllerProps {
  onModeChange: (mode: AnimationMode) => void;
  onRotationChange: (rotationY: number) => void;
  onCursorUpdate: (cursor: HandCursorPosition | null) => void;
}

const GestureController: React.FC<GestureControllerProps> = ({ 
  onModeChange, 
  onRotationChange,
  onCursorUpdate 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;
    let animationFrameId: number;

    const setupMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        setLoaded(true);
        startCamera();
      } catch (error) {
        console.error("Error initializing MediaPipe:", error);
      }
    };

    const startCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 320, height: 240, facingMode: "user" } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        }
      }
    };

    let lastVideoTime = -1;

    const predictWebcam = () => {
      const video = videoRef.current;
      if (!video || !handLandmarker) return;

      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const startTimeMs = performance.now();
        const results = handLandmarker.detectForVideo(video, startTimeMs);

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          
          // 4 is Thumb tip, 8 is Index tip
          const thumbTip = landmarks[4];
          const indexTip = landmarks[8];
          
          // Calculate pinch distance (simple Euclidean distance)
          const distance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) + 
            Math.pow(thumbTip.y - indexTip.y, 2)
          );

          // Threshold for pinch
          const isPinching = distance < 0.08;

          // Update Mode
          if (isPinching) {
            onModeChange('TREE');
          } else {
            onModeChange('EXPLODE');
          }

          // Cursor Position (Mirror X)
          const cursorX = (1 - indexTip.x) * window.innerWidth;
          const cursorY = indexTip.y * window.innerHeight;
          
          onCursorUpdate({
            x: cursorX,
            y: cursorY,
            isPinching
          });

          // Rotation Control (Map X position 0..1 to -PI..PI)
          // We use the center of the palm (0) or index tip (8)
          // Mirroring x for intuition
          if (!isPinching) {
             const rotX = 1 - indexTip.x; 
             const rotationAngle = (rotX - 0.5) * Math.PI * 4; // Range -2PI to 2PI
             onRotationChange(rotationAngle);
          }

        } else {
          onCursorUpdate(null);
        }
      }
      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    setupMediaPipe();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      if (handLandmarker) {
        handLandmarker.close();
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute bottom-4 right-4 z-50 overflow-hidden rounded-xl border-2 border-[#FF69B4] shadow-[0_0_20px_rgba(255,105,180,0.6)] bg-black/50 w-40 h-32">
       {!loaded && <div className="absolute inset-0 flex items-center justify-center text-[#FF69B4] text-xs font-mono">Loading AI...</div>}
       <video 
         ref={videoRef} 
         autoPlay 
         playsInline 
         className="w-full h-full object-cover -scale-x-100" // Mirror the video
       />
    </div>
  );
};

export default GestureController;