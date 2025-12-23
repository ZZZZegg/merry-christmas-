import React from 'react';
import { AnimationMode } from '../types';

interface UIProps {
  started: boolean;
  onStart: (gestureMode: boolean) => void;
  mode: AnimationMode;
  setMode: (mode: AnimationMode) => void;
  isMuted: boolean;
  toggleMute: () => void;
  gestureMode: boolean;
}

const UI: React.FC<UIProps> = ({ 
  started, 
  onStart, 
  mode, 
  setMode, 
  isMuted, 
  toggleMute, 
  gestureMode 
}) => {
  
  // Landing Page
  if (!started) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xl text-center">
        <h1 className="text-6xl md:text-8xl text-[#FF69B4] mb-8 drop-shadow-[0_0_30px_rgba(255,105,180,0.8)]" style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic' }}>
          MarryChristmas
        </h1>
        <div className="flex gap-6 mt-8">
          <button
            onClick={() => onStart(false)}
            className="px-8 py-3 border border-white/30 hover:border-[#FF69B4] hover:bg-[#FF69B4]/10 text-white font-mono tracking-widest text-sm transition-all duration-300 rounded-sm"
          >
            ENTER
          </button>
          <button
            onClick={() => onStart(true)}
            className="px-8 py-3 border border-[#FF69B4] bg-[#FF69B4] text-black font-mono tracking-widest text-sm hover:bg-[#FF69B4]/80 transition-all duration-300 rounded-sm shadow-[0_0_20px_rgba(255,105,180,0.4)]"
          >
            GESTURE MODE
          </button>
        </div>
        <p className="mt-6 text-white/40 text-xs font-mono max-w-md leading-relaxed">
          Experience a Neon Cyber-Christmas. Enable gesture mode to control the tree with your hands via webcam.
        </p>
      </div>
    );
  }

  // Main UI
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="text-white/80 font-mono tracking-widest uppercase text-sm">
          <h1 className="text-2xl font-bold text-[#FF69B4] drop-shadow-[0_0_10px_rgba(255,105,180,0.8)]">
            Cyber Christmas
          </h1>
          <p className="text-[10px] mt-1 opacity-70">
            {gestureMode ? 'AI HAND TRACKING ACTIVE' : 'MOUSE INTERACTION'}
          </p>
        </div>
        
        <button 
          onClick={toggleMute}
          className="text-[#FF69B4] hover:text-white transition-colors p-2 font-mono text-xs border border-[#FF69B4]/30 rounded-full"
        >
          {isMuted ? 'UNMUTE' : 'MUTE'}
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 pointer-events-auto">
        {!gestureMode && (
          <button
            onClick={() => setMode(mode === 'TREE' ? 'EXPLODE' : 'TREE')}
            className={`
              relative px-8 py-3 font-bold text-sm tracking-widest uppercase transition-all duration-500
              border border-[#FF69B4] rounded-full backdrop-blur-md
              ${mode === 'TREE' 
                ? 'bg-[#FF69B4]/10 text-[#FF69B4] hover:bg-[#FF69B4] hover:text-black shadow-[0_0_20px_rgba(255,105,180,0.4)]' 
                : 'bg-white/10 text-white hover:bg-white hover:text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] border-white'}
            `}
          >
            <span className="relative z-10">
              {mode === 'TREE' ? 'Detonate' : 'Assemble'}
            </span>
          </button>
        )}
        
        {gestureMode && (
          <div className="flex flex-col items-center gap-2 mb-4">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF69B4] animate-pulse"></span>
                <span className="text-[#FF69B4] text-xs font-mono">PINCH TO ASSEMBLE</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full border border-[#FF69B4]"></span>
                <span className="text-[#FF69B4] text-xs font-mono">OPEN TO EXPLODE</span>
             </div>
          </div>
        )}
        
        <div className="text-[10px] text-[#FFB7C5]/50 font-mono">
          {mode === 'TREE' ? 'STATUS: STABLE' : 'STATUS: CHAOS'}
        </div>
      </div>
    </div>
  );
};

export default UI;