import React, { useEffect, useRef, useState, useCallback } from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { Camera } from '../game/engine/Camera';
import { InputManager } from '../game/engine/InputManager';
import { ParticleSystem } from '../game/engine/ParticleSystem';
import { ScreenShake } from '../game/engine/ScreenShake';
import { StageRenderer } from '../game/engine/StageRenderer';
import { Fighter } from '../game/entities/Fighter';
import { CombatEngine } from '../game/combat/CombatEngine';
import { DEFAULT_P1_CONTROLS, DEFAULT_P2_CONTROLS } from '../data/controls';
import {
  CharacterData,
  ColorVariant,
  GameMode,
  GameSettings,
  MatchResult,
  StageData,
} from '../types';
import { Pause, Play, RotateCcw, Home, Sparkles } from 'lucide-react';

interface FightScreenProps {
  mode: GameMode;
  p1Char: CharacterData;
  p1Color?: ColorVariant;
  p2Char: CharacterData;
  p2Color?: ColorVariant;
  stage: StageData;
  settings: GameSettings;
  onMatchEnd: (result: MatchResult) => void;
  onExitToMenu: () => void;
}

export const FightScreen: React.FC<FightScreenProps> = ({
  mode,
  p1Char,
  p1Color,
  p2Char,
  p2Color,
  stage,
  settings,
  onMatchEnd,
  onExitToMenu,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hudState, setHudState] = useState<{
    p1Health: number;
    p2Health: number;
    p1LagHealth: number;
    p2LagHealth: number;
    p1Super: number;
    p2Super: number;
    timer: number;
    round: number;
    p1Rounds: number;
    p2Rounds: number;
    p1Combo: number;
    p2Combo: number;
    announcement: string;
    announcementSubtext: string;
  }>({
    p1Health: 100,
    p2Health: 100,
    p1LagHealth: 100,
    p2LagHealth: 100,
    p1Super: 0,
    p2Super: 0,
    timer: settings.roundTimerSeconds,
    round: 1,
    p1Rounds: 0,
    p2Rounds: 0,
    p1Combo: 0,
    p2Combo: 0,
    announcement: 'ROUND 1',
    announcementSubtext: 'READY...',
  });

  const engineRef = useRef<CombatEngine | null>(null);
  const inputManagerRef = useRef<InputManager | null>(null);

  // Initialize engine and game loop
  useEffect(() => {
    soundSystem.startMusic('FIGHT');

    const particles = new ParticleSystem();
    const screenShake = new ScreenShake();
    const camera = new Camera();

    const color1 = p1Color || p1Char.colors?.[0] || {
      id: 'default',
      name: 'Default',
      primaryColor: '#18181b',
      secondaryColor: '#ff5500',
      hairColor: '#09090b',
      skinColor: '#8d5524',
      pantColor: '#27272a',
      accentColor: '#ff6524',
    };

    const color2 = p2Color || p2Char.colors?.[0] || {
      id: 'default',
      name: 'Default',
      primaryColor: '#082f49',
      secondaryColor: '#00f2ff',
      hairColor: '#0369a1',
      skinColor: '#8d5524',
      pantColor: '#0f172a',
      accentColor: '#38bdf8',
    };

    const isP2CPU = mode === 'ARCADE';
    const p1 = new Fighter(1, p1Char, color1, stage.width * 0.35, false);
    const p2 = new Fighter(2, p2Char, color2, stage.width * 0.65, isP2CPU);

    const inputManager = new InputManager(DEFAULT_P1_CONTROLS, DEFAULT_P2_CONTROLS);
    inputManagerRef.current = inputManager;

    const combatEngine = new CombatEngine(
      p1,
      p2,
      stage,
      settings,
      particles,
      screenShake,
      camera
    );

    combatEngine.onMatchEnd = (result) => {
      onMatchEnd(result);
    };

    engineRef.current = combatEngine;
    combatEngine.startRound();

    let animationFrameId: number;
    let lastTime = performance.now();
    let animTime = 0;

    let p1Lag = 100;
    let p2Lag = 100;

    const gameLoop = (currentTime: number) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;
      animTime += dt;

      const canvas = canvasRef.current;
      if (canvas && combatEngine) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // 1. UPDATE GAME STATE IF NOT PAUSED
          if (!isPaused) {
            const p1Input = inputManager.getP1Input();
            const p2Input = inputManager.getP2Input(p2, p1, settings.aiDifficulty);

            p1.update(p1Input, p2, stage.width, dt);
            p2.update(p2Input, p1, stage.width, dt);

            // In Training Mode, replenish dummy health and P1 special meter
            if (mode === 'TRAINING') {
              if (p2.health < 40) p2.health = Math.min(100, p2.health + 0.4);
              if (p1.specialMeter < 100) p1.specialMeter = Math.min(100, p1.specialMeter + 0.2);
            }

            combatEngine.update(dt);
            particles.update();
            screenShake.update();
            camera.update(p1.x, p2.x, stage.width, canvas.width);

            // Smooth damage lag catch-up
            if (p1Lag > p1.health) {
              p1Lag = Math.max(p1.health, p1Lag - dt * 25);
            } else {
              p1Lag = p1.health;
            }

            if (p2Lag > p2.health) {
              p2Lag = Math.max(p2.health, p2Lag - dt * 25);
            } else {
              p2Lag = p2.health;
            }

            // Sync HUD state
            setHudState({
              p1Health: p1.health,
              p2Health: p2.health,
              p1LagHealth: p1Lag,
              p2LagHealth: p2Lag,
              p1Super: p1.specialMeter,
              p2Super: p2.specialMeter,
              timer: combatEngine.roundState.timer,
              round: combatEngine.roundState.currentRound,
              p1Rounds: combatEngine.roundState.p1RoundsWon,
              p2Rounds: combatEngine.roundState.p2RoundsWon,
              p1Combo: combatEngine.p1Combo,
              p2Combo: combatEngine.p2Combo,
              announcement: combatEngine.roundState.announcementText,
              announcementSubtext: combatEngine.roundState.announcementSubtext,
            });
          }

          // 2. RENDER THE GAME CANVAS
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          ctx.save();
          if (screenShake.offsetX !== 0 || screenShake.offsetY !== 0) {
            ctx.translate(screenShake.offsetX, screenShake.offsetY);
          }

          // Render Stage
          StageRenderer.renderStage(ctx, stage, camera.x, animTime, canvas.width, canvas.height);

          // World to Screen Translation
          ctx.save();
          ctx.translate(-camera.x, canvas.height - stage.groundY);

          // Render Fighters
          p1.render(ctx, false, false);
          p2.render(ctx, false, false);

          // Render Particles & Hit Sparks
          particles.render(ctx);

          // Render Projectiles
          combatEngine.renderProjectiles(ctx);

          ctx.restore();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, p1Char, p1Color, p2Char, p2Color, stage, settings, onMatchEnd, isPaused]);

  // Handle Window Resize to keep aspect ratio
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && canvasRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        canvasRef.current.width = clientWidth;
        canvasRef.current.height = clientHeight;
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Keyboard Pause (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.p1.reset(stage.width * 0.35, 1);
      engineRef.current.p2.reset(stage.width * 0.65, -1);
      engineRef.current.startRound();
      setIsPaused(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen bg-[#050303] text-white overflow-hidden select-none font-oswald"
    >
      {/* 1. COMBAT CANVAS VIEWPORT */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block z-0"
      />

      {/* CRT Scanline and Grain Layer */}
      <div className="grain pointer-events-none" />

      {/* 2. TOP ARCADE HUD */}
      <div className="absolute top-4 left-6 right-6 z-20 flex items-start justify-between pointer-events-none">
        {/* 1P SIDE (LEFT) */}
        <div className="flex-1 flex flex-col items-start max-w-[42%]">
          {/* 1P Name & Round Wins */}
          <div className="w-full flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-sm bg-gradient-to-r from-[#ff5500] to-[#e11d48] text-black font-black text-xs tracking-wider shadow">
                1P
              </span>
              <span className="text-xl md:text-2xl font-black italic tracking-wider text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {p1Char.name}
              </span>
            </div>

            {/* 1P Round Victory Medallions */}
            <div className="flex items-center gap-1.5">
              {[...Array(settings.roundCount === 1 ? 1 : 2)].map((_, i) => {
                const won = i < hudState.p1Rounds;
                return (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center text-[9px] font-black ${
                      won
                        ? 'bg-yellow-400 border-yellow-200 text-black shadow-[0_0_8px_rgba(250,204,21,0.8)] scale-110'
                        : 'bg-zinc-950/80 border-zinc-700 text-zinc-600'
                    }`}
                  >
                    {won ? 'V' : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1P HEALTH BAR CONTAINER */}
          <div className="w-full h-6 bg-black/90 border-2 border-zinc-700 rounded-sm p-0.5 relative overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            {/* Damage Lag Buffer (Red/Yellow drain) */}
            <div
              className="absolute top-0.5 bottom-0.5 right-0.5 bg-red-600/80 transition-all"
              style={{ width: `${Math.max(0, hudState.p1LagHealth)}%` }}
            />
            {/* Realtime Active Health Fill (Flows Right to Left) */}
            <div
              className="absolute top-0.5 bottom-0.5 right-0.5 bg-gradient-to-l from-[#ff5500] via-[#ff8a2a] to-[#facc15] shadow-[0_0_10px_rgba(255,85,0,0.6)]"
              style={{ width: `${Math.max(0, hudState.p1Health)}%` }}
            />
          </div>

          {/* 1P Dynamic Combo Banner */}
          {hudState.p1Combo > 1 && (
            <div className="mt-2 text-2xl md:text-3xl font-black italic text-[#ff5500] drop-shadow-[0_0_15px_rgba(255,85,0,0.9)] animate-bounce">
              {hudState.p1Combo} HITS COMBO!
            </div>
          )}
        </div>

        {/* CENTER TIMER BEZEL */}
        <div className="px-4 flex flex-col items-center">
          <div className="w-16 h-14 bg-gradient-to-b from-zinc-800 to-zinc-950 border-2 border-zinc-600 rounded flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.9)]">
            <span
              className={`text-3xl md:text-4xl font-black italic tracking-tighter ${
                hudState.timer <= 10
                  ? 'text-red-500 animate-pulse drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]'
                  : 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]'
              }`}
            >
              {hudState.timer}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-widest uppercase mt-1">
            ROUND {hudState.round}
          </span>
        </div>

        {/* 2P SIDE (RIGHT) */}
        <div className="flex-1 flex flex-col items-end max-w-[42%]">
          {/* 2P Name & Round Wins */}
          <div className="w-full flex items-center justify-between mb-1">
            {/* 2P Round Victory Medallions */}
            <div className="flex items-center gap-1.5">
              {[...Array(settings.roundCount === 1 ? 1 : 2)].map((_, i) => {
                const won = i < hudState.p2Rounds;
                return (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center text-[9px] font-black ${
                      won
                        ? 'bg-yellow-400 border-yellow-200 text-black shadow-[0_0_8px_rgba(250,204,21,0.8)] scale-110'
                        : 'bg-zinc-950/80 border-zinc-700 text-zinc-600'
                    }`}
                  >
                    {won ? 'V' : ''}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl font-black italic tracking-wider text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {p2Char.name}
              </span>
              <span className="px-2 py-0.5 rounded-sm bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black text-xs tracking-wider shadow">
                {mode === 'VERSUS' ? '2P' : 'CPU'}
              </span>
            </div>
          </div>

          {/* 2P HEALTH BAR CONTAINER */}
          <div className="w-full h-6 bg-black/90 border-2 border-zinc-700 rounded-sm p-0.5 relative overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            {/* Damage Lag Buffer (Red drain) */}
            <div
              className="absolute top-0.5 bottom-0.5 left-0.5 bg-red-600/80 transition-all"
              style={{ width: `${Math.max(0, hudState.p2LagHealth)}%` }}
            />
            {/* Realtime Active Health Fill (Flows Left to Right) */}
            <div
              className="absolute top-0.5 bottom-0.5 left-0.5 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 shadow-[0_0_10px_rgba(34,211,238,0.6)]"
              style={{ width: `${Math.max(0, hudState.p2Health)}%` }}
            />
          </div>

          {/* 2P Dynamic Combo Banner */}
          {hudState.p2Combo > 1 && (
            <div className="mt-2 text-2xl md:text-3xl font-black italic text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.9)] animate-bounce">
              {hudState.p2Combo} HITS COMBO!
            </div>
          )}
        </div>
      </div>

      {/* 3. CENTER ARCADE ROUND OVERLAYS */}
      {hudState.announcement && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-5xl md:text-7xl font-black italic tracking-wider text-white uppercase drop-shadow-[0_0_35px_rgba(255,85,0,0.9)] animate-pulse">
            {hudState.announcement}
          </div>
          {hudState.announcementSubtext && (
            <div className="text-xl md:text-2xl font-black tracking-widest text-yellow-400 uppercase mt-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {hudState.announcementSubtext}
            </div>
          )}
        </div>
      )}

      {/* 4. BOTTOM BAR: SUPER METERS & STAGE INFO */}
      <div className="absolute bottom-4 left-6 right-6 z-20 flex items-end justify-between pointer-events-none">
        {/* P1 Super Meter */}
        <div className="w-56 p-2 bg-black/80 border-2 border-[#ff5500]/60 rounded-sm pointer-events-auto backdrop-blur-sm shadow-[0_0_15px_rgba(255,85,0,0.2)]">
          <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider mb-1">
            <span className="text-[#ff5500]">SUPER METER (1P)</span>
            <span className={hudState.p1Super >= 25 ? 'text-yellow-400 font-black animate-pulse' : ''}>
              {hudState.p1Super >= 25 ? '★ SPECIAL READY [H]' : `${Math.floor(hudState.p1Super)}%`}
            </span>
          </div>
          <div className="h-3 bg-zinc-950 border border-zinc-800 rounded-xs overflow-hidden">
            <div
              className={`h-full transition-all ${
                hudState.p1Super >= 25
                  ? 'bg-gradient-to-r from-yellow-400 to-[#ff5500] shadow-[0_0_12px_rgba(255,85,0,0.8)]'
                  : 'bg-zinc-700'
              }`}
              style={{ width: `${hudState.p1Super}%` }}
            />
          </div>
        </div>

        {/* Center Pause Button & Stage Tag */}
        <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
          <div className="text-[11px] font-mono text-zinc-400 tracking-wider uppercase bg-black/60 px-3 py-0.5 rounded border border-zinc-800">
            QUE PAJA RECORDS · {stage.name}
          </div>
          <button
            onClick={() => {
              soundSystem.playMenuSelect();
              setIsPaused(true);
            }}
            className="px-4 py-1 bg-zinc-900/90 hover:bg-[#ff5500] text-zinc-300 hover:text-black border border-zinc-700 hover:border-[#ff5500] rounded text-xs font-mono font-bold tracking-wider uppercase transition flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <Pause className="w-3.5 h-3.5" /> PAUSA (ESC)
          </button>
        </div>

        {/* P2 Super Meter */}
        <div className="w-56 p-2 bg-black/80 border-2 border-cyan-400/60 rounded-sm pointer-events-auto backdrop-blur-sm shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider mb-1">
            <span className={hudState.p2Super >= 25 ? 'text-cyan-300 font-black animate-pulse' : ''}>
              {hudState.p2Super >= 25 ? '★ SPECIAL READY [P/Ñ]' : `${Math.floor(hudState.p2Super)}%`}
            </span>
            <span className="text-cyan-400">SUPER METER (2P)</span>
          </div>
          <div className="h-3 bg-zinc-950 border border-zinc-800 rounded-xs overflow-hidden flex justify-end">
            <div
              className={`h-full transition-all ${
                hudState.p2Super >= 25
                  ? 'bg-gradient-to-l from-yellow-400 to-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]'
                  : 'bg-zinc-700'
              }`}
              style={{ width: `${hudState.p2Super}%` }}
            />
          </div>
        </div>
      </div>

      {/* METAL BORDER & CORNER BRACKETS */}
      <div className="metal-border pointer-events-none" />
      <div className="corner tl pointer-events-none" />
      <div className="corner tr pointer-events-none" />
      <div className="corner bl pointer-events-none" />
      <div className="corner br pointer-events-none" />

      {/* ARCADE PAUSE MENU MODAL */}
      {isPaused && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-oswald">
          <div className="w-full max-w-md bg-zinc-950 border-2 border-[#ff5500] rounded-md p-6 shadow-[0_0_60px_rgba(255,85,0,0.4)] text-center text-white space-y-4">
            <h2 className="text-4xl font-black uppercase italic tracking-widest text-[#ff5500] drop-shadow-[0_0_15px_rgba(255,85,0,0.6)]">
              JUEGO EN PAUSA
            </h2>
            <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest">
              PAJAS FIGHTER · QUE PAJA RECORDS ARCADE
            </p>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  soundSystem.playMenuSelect();
                  setIsPaused(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-[#ff5500] to-[#e11d48] hover:brightness-110 text-black font-black text-lg uppercase tracking-wider rounded transition shadow-[0_0_20px_rgba(255,85,0,0.4)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5" /> CONTINUAR COMBATE
              </button>

              <button
                onClick={() => {
                  soundSystem.playMenuSelect();
                  handleRestart();
                }}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 rounded font-bold text-base uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#ff5500]" /> REINICIAR PELEA
              </button>

              <button
                onClick={() => {
                  soundSystem.playMenuCancel();
                  onExitToMenu();
                }}
                className="w-full py-2.5 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 rounded font-bold text-base uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4 text-red-400" /> SALIR AL MENÚ PRINCIPAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
