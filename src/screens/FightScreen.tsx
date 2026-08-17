import React, { useEffect, useRef, useState, useCallback } from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { Camera } from '../game/engine/Camera';
import { InputManager } from '../game/engine/InputManager';
import { ParticleSystem } from '../game/engine/ParticleSystem';
import { ScreenShake } from '../game/engine/ScreenShake';
import { StageRenderer } from '../game/engine/StageRenderer';
import { Fighter } from '../game/entities/Fighter';
import { CombatEngine } from '../game/combat/CombatEngine';
import { Collision } from '../game/collision/Collision';
import { DEFAULT_P1_CONTROLS, DEFAULT_P2_CONTROLS } from '../data/controls';
import {
  CharacterData,
  ColorVariant,
  GameMode,
  GameSettings,
  MatchResult,
  StageData,
} from '../types';
import { Pause, Play, RotateCcw, Home } from 'lucide-react';

interface FightScreenProps {
  mode: GameMode;
  p1Char: CharacterData;
  p1Color: ColorVariant;
  p2Char: CharacterData;
  p2Color: ColorVariant;
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

    const isP2CPU = mode === 'ARCADE';
    const p1 = new Fighter(1, p1Char, p1Color, stage.width * 0.35, false);
    const p2 = new Fighter(2, p2Char, p2Color, stage.width * 0.65, isP2CPU);

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

            // Update React HUD state periodically
            setHudState({
              p1Health: p1.health,
              p2Health: p2.health,
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

          // 2. RENDER STAGE, FIGHTERS & PARTICLES ON CANVAS
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.save();

          // Camera transform & Screen shake
          camera.update(p1.x, p2.x, stage.width, canvas.width);
          screenShake.update();
          ctx.translate(screenShake.offsetX, screenShake.offsetY);

          // Render Stage with parallax
          StageRenderer.renderStage(ctx, stage, camera.x, animTime, canvas.width, canvas.height);

          // Calculate Ground Position Y
          const groundY = canvas.height - stage.groundY;

          // Apply Camera World offset for Fighters & Visual Effects at stage floor level
          ctx.save();
          ctx.translate(-camera.x, groundY);

          // Render Fighters
          p1.render(ctx, settings.showHitboxes);
          p2.render(ctx, settings.showHitboxes);

          // Render Projectiles & Particles
          combatEngine.renderProjectiles(ctx);
          particles.render(ctx);

          ctx.restore(); // restore camera world offset
          ctx.restore(); // restore screen shake
        }
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [p1Char, p1Color, p2Char, p2Color, stage, settings, mode, onMatchEnd, isPaused]);

  // Handle Window Resize to keep 16:9 arcade canvas resolution
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard Pause Toggle (Escape or KeyP)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRestart = () => {
    setIsPaused(false);
    if (engineRef.current) {
      engineRef.current.roundState.currentRound = 1;
      engineRef.current.roundState.p1RoundsWon = 0;
      engineRef.current.roundState.p2RoundsWon = 0;
      engineRef.current.startRound();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen bg-[#0a0505] overflow-hidden select-none font-oswald"
    >
      {/* 1. FIGHT CANVAS */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pixelated z-0"
      />

      {/* Grain overlay */}
      <div className="grain" />

      {/* 2. TOP HUD: ARCADE BARS, ROUND PIPS & TIMER */}
      <div className="fx-hud">
        {/* 1P SIDE (LEFT) */}
        <div className="fx-side left">
          <div className="fx-name">{p1Char.name}</div>
          <div className="fx-bar-frame">
            <div
              className="fx-bar-fill"
              style={{ width: `${Math.max(0, hudState.p1Health)}%` }}
            />
          </div>
          <div className="fx-rounds">
            {[...Array(settings.roundCount === 1 ? 1 : 2)].map((_, i) => (
              <div
                key={i}
                className={`fx-pip ${i < hudState.p1Rounds ? 'won' : ''}`}
              />
            ))}
          </div>

          {/* Combo counter */}
          {hudState.p1Combo > 1 && (
            <div className="mt-2 text-2xl font-black font-anton italic text-[#ff8a2a] drop-shadow-[0_0_12px_#ff8a2a] animate-bounce">
              {hudState.p1Combo} HITS COMBO!
            </div>
          )}
        </div>

        {/* CENTER TIMER */}
        <div className="fx-timer-wrap">
          <div
            className={`fx-timer ${hudState.timer <= 10 ? 'text-red-500 animate-pulse' : ''}`}
          >
            {hudState.timer}
          </div>
        </div>

        {/* 2P SIDE (RIGHT) */}
        <div className="fx-side right">
          <div className="fx-name">{p2Char.name}</div>
          <div className="fx-bar-frame">
            <div
              className="fx-bar-fill"
              style={{ width: `${Math.max(0, hudState.p2Health)}%` }}
            />
          </div>
          <div className="fx-rounds">
            {[...Array(settings.roundCount === 1 ? 1 : 2)].map((_, i) => (
              <div
                key={i}
                className={`fx-pip ${i < hudState.p2Rounds ? 'won' : ''}`}
              />
            ))}
          </div>

          {/* Combo counter */}
          {hudState.p2Combo > 1 && (
            <div className="mt-2 text-2xl font-black font-anton italic text-[#2fc7ff] drop-shadow-[0_0_12px_#2fc7ff] animate-bounce">
              {hudState.p2Combo} HITS COMBO!
            </div>
          )}
        </div>
      </div>

      {/* 3. CENTER ARCADE ANNOUNCEMENTS */}
      {hudState.announcement && (
        <div className="fx-center">
          <div className="fx-round">{hudState.announcement}</div>
          {hudState.announcementSubtext && (
            <div className="fx-ready">{hudState.announcementSubtext}</div>
          )}
        </div>
      )}

      {/* 4. BOTTOM MATCH CARD & SUPER METERS */}
      <div className="fx-vscard">
        QUE PAJA RECORDS · {stage.location} · {stage.name}
      </div>

      {/* Super meter gauges & Pause trigger on bottom */}
      <div className="absolute bottom-3 left-6 right-6 z-20 flex items-end justify-between pointer-events-none">
        {/* P1 Super Meter */}
        <div className="w-52 bg-[#140804]/80 p-2 border border-[#ff8a2a]/40 clip-chamfer pointer-events-auto">
          <div className="flex justify-between text-[9px] font-anton text-[#a86a3f] uppercase tracking-wider mb-1">
            <span>SUPER QP (1P)</span>
            <span className={hudState.p1Super >= 25 ? 'text-[#ff8a2a] font-black' : ''}>
              {hudState.p1Super >= 25 ? '★ READY [H]' : `${Math.floor(hudState.p1Super)}%`}
            </span>
          </div>
          <div className="h-2.5 bg-[#0a0503] border border-[#ff8a2a]/20">
            <div
              className={`h-full transition-all ${
                hudState.p1Super >= 25
                  ? 'bg-[#ff8a2a] shadow-[0_0_10px_#ff8a2a]'
                  : 'bg-[#5a2c16]'
              }`}
              style={{ width: `${hudState.p1Super}%` }}
            />
          </div>
        </div>

        {/* Pause Button */}
        <button
          onClick={() => {
            soundSystem.playMenuSelect();
            setIsPaused(true);
          }}
          className="pointer-events-auto px-4 py-1.5 bg-[#1a0805] hover:bg-[#ff8a2a] text-[#ffb46a] hover:text-[#160600] border border-[#ff8a2a]/40 clip-chamfer transition font-anton text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg mb-1"
        >
          <Pause className="w-3.5 h-3.5" />
          PAUSA (ESC)
        </button>

        {/* P2 Super Meter */}
        <div className="w-52 bg-[#08121a]/80 p-2 border border-[#2fc7ff]/40 clip-chamfer pointer-events-auto">
          <div className="flex justify-between text-[9px] font-anton text-[#4a8a9f] uppercase tracking-wider mb-1">
            <span className={hudState.p2Super >= 25 ? 'text-[#2fc7ff] font-black' : ''}>
              {hudState.p2Super >= 25 ? '★ READY [P/Ñ]' : `${Math.floor(hudState.p2Super)}%`}
            </span>
            <span>SUPER QP (2P)</span>
          </div>
          <div className="h-2.5 bg-[#030a10] border border-[#2fc7ff]/20 flex justify-end">
            <div
              className={`h-full transition-all ${
                hudState.p2Super >= 25
                  ? 'bg-[#2fc7ff] shadow-[0_0_10px_#2fc7ff]'
                  : 'bg-[#1560a0]'
              }`}
              style={{ width: `${hudState.p2Super}%` }}
            />
          </div>
        </div>
      </div>

      {/* METAL BORDER & CORNER BRACKETS */}
      <div className="metal-border" />
      <div className="corner tl" />
      <div className="corner tr" />
      <div className="corner bl" />
      <div className="corner br" />

      {/* ARCADE PAUSE MENU MODAL */}
      {isPaused && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-oswald">
          <div className="w-full max-w-md bg-gradient-to-b from-[#180a06] to-[#0c0403] border-2 border-[#5a2c16] clip-chamfer-lg p-6 shadow-[0_0_60px_rgba(0,0,0,0.95)] text-center text-[#fff8ec] space-y-4">
            <h2 className="text-4xl font-black font-anton uppercase italic tracking-widest text-[#ff8a2a] drop-shadow-[0_0_20px_rgba(255,138,42,0.6)]">
              JUEGO EN PAUSA
            </h2>
            <p className="text-xs text-[#a87d60] font-anton uppercase tracking-widest">
              PAJAS FIGHTER · QUE PAJA RECORDS ARCADE
            </p>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  soundSystem.playMenuSelect();
                  setIsPaused(false);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-[#ff8a2a] to-[#c9330f] hover:brightness-110 text-[#160600] font-anton text-xl uppercase tracking-wider clip-chamfer transition shadow-[0_0_20px_rgba(255,138,42,0.5)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5" />
                CONTINUAR COMBATE
              </button>

              <button
                onClick={() => {
                  soundSystem.playMenuSelect();
                  handleRestart();
                }}
                className="w-full py-3 bg-[#1a0805] hover:bg-[#2e0e09] text-[#fff8ec] border border-[#5a2c16] font-anton text-lg uppercase tracking-wider clip-chamfer transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#ff8a2a]" />
                REINICIAR PELEA
              </button>

              <button
                onClick={() => {
                  soundSystem.playMenuCancel();
                  onExitToMenu();
                }}
                className="w-full py-3 bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-200 font-anton text-lg uppercase tracking-wider clip-chamfer transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4 text-red-400" />
                SALIR AL MENÚ PRINCIPAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
