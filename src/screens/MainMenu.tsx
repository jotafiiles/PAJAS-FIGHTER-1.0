import React, { useEffect, useState } from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { GameMode } from '../types';
import { Volume2, VolumeX, Shield, Zap, Music, Flame, Award, Gamepad2, Disc } from 'lucide-react';
import { CharacterRegistry } from '../data/characters/CharacterRegistry';

interface MainMenuProps {
  onSelectMode: (mode: GameMode) => void;
  onOpenOptions: () => void;
  onOpenControls: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onSelectMode,
  onOpenOptions,
  onOpenControls,
}) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const playableCount = CharacterRegistry.getPlayable().length;

  useEffect(() => {
    soundSystem.startMusic('MENU');
  }, []);

  // Keyboard navigation for main menu (W/S or Up/Down + Enter/Space/F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const totalItems = 5;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        soundSystem.playMenuMove();
        setSelectedItemIndex((prev) => (prev + 1) % totalItems);
      } else if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        soundSystem.playMenuMove();
        setSelectedItemIndex((prev) => (prev - 1 + totalItems) % totalItems);
      } else if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyF') {
        soundSystem.playMenuSelect();
        if (selectedItemIndex === 0) onSelectMode('VERSUS');
        else if (selectedItemIndex === 1) onSelectMode('ARCADE');
        else if (selectedItemIndex === 2) onSelectMode('TRAINING');
        else if (selectedItemIndex === 3) onOpenControls();
        else if (selectedItemIndex === 4) onOpenOptions();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemIndex, onSelectMode, onOpenControls, onOpenOptions]);

  const handleStartMode = (mode: GameMode) => {
    soundSystem.playMenuSelect();
    onSelectMode(mode);
  };

  const handleToggleMute = () => {
    soundSystem.toggleMute();
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-screen h-screen bg-[#080505] text-white overflow-hidden select-none flex flex-col justify-between font-oswald p-6">
      {/* Background Shared Atmosphere */}
      <div className="bg" />
      <div className="silhouette">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none">
          <polygon
            points="0,400 0,260 60,200 120,270 180,180 250,260 310,150 380,250 440,190 500,260 560,170 630,255 700,200 760,260 830,180 900,250 960,210 1000,260 1000,400"
            fill="#000"
          />
        </svg>
      </div>
      <div className="grain" />
      <div className="vignette" />

      {/* TOPBAR */}
      <div className="flex items-center justify-between z-10 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#ff5500] to-[#b43403] flex items-center justify-center font-black text-xl text-black border border-[#ff8a2a] shadow-[0_0_15px_rgba(255,85,0,0.4)]">
            QP
          </div>
          <div>
            <div className="text-lg font-black tracking-widest text-[#ff8a2a] uppercase">QUE PAJA RECORDS</div>
            <div className="text-xs text-zinc-400 tracking-wider font-mono uppercase">ARCADE FIGHTING ENGINE · V2.5 PLUG-AND-PLAY</div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm font-mono tracking-wider">
          <div className="px-3 py-1 bg-zinc-900/90 border border-zinc-700/80 rounded text-[#ff8a2a] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-ping" />
            CREDITS: <b className="text-white">FREE PLAY</b>
          </div>
          <button
            onClick={handleToggleMute}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900/80 border border-zinc-700/60 rounded hover:border-[#ff5500] hover:text-white transition uppercase cursor-pointer"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-red-500" />
                <span className="text-red-400 font-bold">AUDIO OFF</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#ff8a2a]" />
                <span className="text-zinc-200 font-bold">AUDIO ON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MAIN BANNER & TWO-COLUMN BALANCED COMPOSITION */}
      <div className="flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto z-10 py-4">
        {/* TITLE BLOCK */}
        <div className="mb-6">
          <div className="text-xs md:text-sm font-mono tracking-[0.3em] text-[#ff8a2a] uppercase mb-1 flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#ff5500]" />
            <span>QUE PAJA RECORDS PRESENTA</span>
          </div>
          <div className="text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            PAJAS <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] via-[#ff8a2a] to-[#facc15]">FIGHTER</span>
          </div>
        </div>

        {/* 2-COLUMN BALANCED GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT: ARCADE MENU (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-3 justify-center">
            {/* 1. MODO VERSUS */}
            <div
              className={`group flex items-center justify-between p-4 rounded bg-zinc-950/80 border-2 cursor-pointer transition-all duration-150 ${
                selectedItemIndex === 0
                  ? 'border-[#ff5500] bg-gradient-to-r from-[#ff5500]/25 via-zinc-900 to-zinc-950 shadow-[0_0_20px_rgba(255,85,0,0.35)] translate-x-2'
                  : 'border-zinc-800/80 hover:border-zinc-600'
              }`}
              onClick={() => handleStartMode('VERSUS')}
              onMouseEnter={() => {
                soundSystem.playMenuMove();
                setSelectedItemIndex(0);
              }}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded ${selectedItemIndex === 0 ? 'bg-[#ff5500] text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black tracking-wide text-white uppercase group-hover:text-[#ff8a2a] transition">
                    MODO VERSUS
                  </div>
                  <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    2 JUGADORES · MISMO TECLADO O GAMEPAD
                  </div>
                </div>
              </div>
              <div className={`text-2xl font-black ${selectedItemIndex === 0 ? 'text-[#ff5500] animate-pulse' : 'text-zinc-700'}`}>
                ▶
              </div>
            </div>

            {/* 2. MODO ARCADE */}
            <div
              className={`group flex items-center justify-between p-4 rounded bg-zinc-950/80 border-2 cursor-pointer transition-all duration-150 ${
                selectedItemIndex === 1
                  ? 'border-[#ff5500] bg-gradient-to-r from-[#ff5500]/25 via-zinc-900 to-zinc-950 shadow-[0_0_20px_rgba(255,85,0,0.35)] translate-x-2'
                  : 'border-zinc-800/80 hover:border-zinc-600'
              }`}
              onClick={() => handleStartMode('ARCADE')}
              onMouseEnter={() => {
                soundSystem.playMenuMove();
                setSelectedItemIndex(1);
              }}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded ${selectedItemIndex === 1 ? 'bg-[#ff5500] text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black tracking-wide text-white uppercase group-hover:text-[#ff8a2a] transition">
                    MODO ARCADE
                  </div>
                  <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    1 JUGADOR VS CPU INTELIGENTE
                  </div>
                </div>
              </div>
              <div className={`text-2xl font-black ${selectedItemIndex === 1 ? 'text-[#ff5500] animate-pulse' : 'text-zinc-700'}`}>
                ▶
              </div>
            </div>

            {/* 3. MODO PRÁCTICA */}
            <div
              className={`group flex items-center justify-between p-4 rounded bg-zinc-950/80 border-2 cursor-pointer transition-all duration-150 ${
                selectedItemIndex === 2
                  ? 'border-[#ff5500] bg-gradient-to-r from-[#ff5500]/25 via-zinc-900 to-zinc-950 shadow-[0_0_20px_rgba(255,85,0,0.35)] translate-x-2'
                  : 'border-zinc-800/80 hover:border-zinc-600'
              }`}
              onClick={() => handleStartMode('TRAINING')}
              onMouseEnter={() => {
                soundSystem.playMenuMove();
                setSelectedItemIndex(2);
              }}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded ${selectedItemIndex === 2 ? 'bg-[#ff5500] text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black tracking-wide text-white uppercase group-hover:text-[#ff8a2a] transition">
                    MODO PRÁCTICA
                  </div>
                  <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    ENTRENAMIENTO LIBRE · COMBOS & FRAME DATA
                  </div>
                </div>
              </div>
              <div className={`text-2xl font-black ${selectedItemIndex === 2 ? 'text-[#ff5500] animate-pulse' : 'text-zinc-700'}`}>
                ▶
              </div>
            </div>

            {/* 4. CONTROLES */}
            <div
              className={`group flex items-center justify-between p-3.5 rounded bg-zinc-950/80 border-2 cursor-pointer transition-all duration-150 ${
                selectedItemIndex === 3
                  ? 'border-[#ff5500] bg-gradient-to-r from-[#ff5500]/25 via-zinc-900 to-zinc-950 shadow-[0_0_20px_rgba(255,85,0,0.35)] translate-x-2'
                  : 'border-zinc-800/80 hover:border-zinc-600'
              }`}
              onClick={() => {
                soundSystem.playMenuMove();
                onOpenControls();
              }}
              onMouseEnter={() => {
                soundSystem.playMenuMove();
                setSelectedItemIndex(3);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="text-lg font-black tracking-wide text-zinc-200 uppercase group-hover:text-[#ff8a2a] transition">
                  GUÍA DE CONTROLES
                </div>
                <span className="text-xs font-mono text-zinc-500 uppercase">WASD + FLECHAS</span>
              </div>
              <div className={`text-xl font-black ${selectedItemIndex === 3 ? 'text-[#ff5500]' : 'text-zinc-700'}`}>
                ▶
              </div>
            </div>

            {/* 5. OPCIONES */}
            <div
              className={`group flex items-center justify-between p-3.5 rounded bg-zinc-950/80 border-2 cursor-pointer transition-all duration-150 ${
                selectedItemIndex === 4
                  ? 'border-[#ff5500] bg-gradient-to-r from-[#ff5500]/25 via-zinc-900 to-zinc-950 shadow-[0_0_20px_rgba(255,85,0,0.35)] translate-x-2'
                  : 'border-zinc-800/80 hover:border-zinc-600'
              }`}
              onClick={() => {
                soundSystem.playMenuMove();
                onOpenOptions();
              }}
              onMouseEnter={() => {
                soundSystem.playMenuMove();
                setSelectedItemIndex(4);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="text-lg font-black tracking-wide text-zinc-200 uppercase group-hover:text-[#ff8a2a] transition">
                  AJUSTES & OPCIONES
                </div>
                <span className="text-xs font-mono text-zinc-500 uppercase">AUDIO · HITBOXES · DIFICULTAD</span>
              </div>
              <div className={`text-xl font-black ${selectedItemIndex === 4 ? 'text-[#ff5500]' : 'text-zinc-700'}`}>
                ▶
              </div>
            </div>
          </div>

          {/* RIGHT: ARCADE HIGHLIGHTS & SHOWCASE (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4 justify-center">
            {/* ARCADE FEATURE 1: ROSTER STATS */}
            <div className="p-5 rounded bg-zinc-900/70 border border-zinc-800 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff5500]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#ff8a2a] uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-[#ff8a2a]" />
                  ROSTER PLUG-AND-PLAY
                </div>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-[#ff5500]/20 text-[#ff8a2a] border border-[#ff5500]/40">
                  {playableCount} LUCHADORES ACTIVOS
                </span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed font-sans mb-3">
                Sistema modular 100% data-driven. Cada luchador posee sus propios fotogramas numerados, frame data de impacto, super movimientos y comportamiento de IA arcade.
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-mono text-zinc-400">
                <span className="px-2 py-1 bg-black/60 rounded border border-zinc-700/60">QUE PAJA V1</span>
                <span className="px-2 py-1 bg-black/60 rounded border border-zinc-700/60">EL PAJA</span>
                <span className="px-2 py-1 bg-black/60 rounded border border-zinc-700/60">DJ SCRATCH</span>
                <span className="px-2 py-1 bg-black/60 rounded border border-zinc-700/60">B-BOY CUMBIA</span>
                <span className="px-2 py-1 bg-black/60 rounded border border-zinc-700/60">ROCKER PUNK</span>
              </div>
            </div>

            {/* ARCADE FEATURE 2: COMBAT MECHANICS */}
            <div className="p-5 rounded bg-zinc-900/70 border border-zinc-800 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-cyan-400 uppercase tracking-wider mb-2">
                <Award className="w-4 h-4 text-cyan-400" />
                MECÁNICAS COMPETITIVAS
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 bg-black/50 rounded border border-zinc-800">
                  <div className="text-base font-black text-white">HITSTOP</div>
                  <div className="text-[11px] text-zinc-400 font-sans">Congelación de impacto</div>
                </div>
                <div className="p-2.5 bg-black/50 rounded border border-zinc-800">
                  <div className="text-base font-black text-white">SUPER METER</div>
                  <div className="text-[11px] text-zinc-400 font-sans">Ataque especial sónico</div>
                </div>
                <div className="p-2.5 bg-black/50 rounded border border-zinc-800">
                  <div className="text-base font-black text-white">COMBO LINK</div>
                  <div className="text-[11px] text-zinc-400 font-sans">Cadena de golpes</div>
                </div>
              </div>
            </div>

            {/* ARCADE FEATURE 3: SOUNDTRACK & LABEL */}
            <div className="p-4 rounded bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-zinc-800 text-[#ff8a2a]">
                  <Disc className="w-5 h-5 animate-spin text-[#ff8a2a]" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-200 uppercase">ORIGINAL SOUNDTRACK</div>
                  <div className="text-xs text-zinc-400 font-sans">Producción exclusiva de Que Paja Records</div>
                </div>
              </div>
              <span className="text-xs font-mono text-[#ff8a2a] px-2 py-1 bg-black/40 rounded border border-[#ff5500]/30">
                130 BPM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-t border-zinc-800/80 pt-3 z-10">
        <div>© 2026 QUE PAJA RECORDS · ARCADE FIGHTING ENGINE</div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-zinc-800 text-white rounded font-bold">W / S / ↑ / ↓</span>
          <span>NAVEGAR</span>
          <span className="px-2 py-0.5 bg-[#ff5500] text-black rounded font-bold">ENTER / ESPACIO</span>
          <span>SELECCIONAR</span>
        </div>
      </div>

      {/* METAL BORDER & CORNER BRACKETS */}
      <div className="metal-border" />
      <div className="corner tl" />
      <div className="corner tr" />
      <div className="corner bl" />
      <div className="corner br" />
    </div>
  );
};
