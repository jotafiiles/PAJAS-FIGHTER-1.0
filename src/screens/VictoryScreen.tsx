import React, { useEffect, useRef } from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { MatchResult } from '../types';
import { ProceduralSpriteRenderer } from '../game/animation/ProceduralSpriteRenderer';
import { Trophy, RotateCcw, Users, MapPin, Home, Zap, Clock, ShieldCheck, Crown } from 'lucide-react';

interface VictoryScreenProps {
  result: MatchResult;
  onRematch: () => void;
  onChangeCharacters: () => void;
  onChangeStage: () => void;
  onMainMenu: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  result,
  onRematch,
  onChangeCharacters,
  onChangeStage,
  onMainMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const winnerChar = result.winnerPlayer === 1 ? result.p1Character : result.p2Character;
  const winnerColor = result.winnerPlayer === 1 ? result.p1Color : result.p2Color;

  useEffect(() => {
    soundSystem.playVictoryFanfare();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height - 20);
      ctx.scale(2.4, 2.4);

      ProceduralSpriteRenderer.renderFighter(
        ctx,
        'victory',
        frame,
        winnerColor,
        1,
        false,
        false
      );
      ctx.restore();

      frame += 0.05;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [winnerColor]);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 bg-[#0a0505] text-[#fff8ec] select-none overflow-hidden font-oswald">
      {/* Background Ambience */}
      <div className="bg-mk-arcade absolute inset-0 pointer-events-none" />
      <div className="scratches-overlay" />
      <div className="grain-overlay" />
      <div className="vignette-heavy" />

      {/* Outer Metal Frame + Corner Brackets */}
      <div className="metal-frame-outer" />
      <div className="corner-bracket corner-bracket-tl" />
      <div className="corner-bracket corner-bracket-tr" />
      <div className="corner-bracket corner-bracket-bl" />
      <div className="corner-bracket corner-bracket-br" />

      {/* TOP HEADER: Victory Announcement */}
      <header className="relative z-20 text-center pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ff8a2a] text-[#160600] font-anton text-sm uppercase tracking-widest clip-chamfer shadow-[0_0_20px_#ff8a2a] mb-2 font-black">
          <Crown className="w-4 h-4 text-[#160600]" />
          <span>¡VICTORIA DEFINITIVA!</span>
        </div>
        <h1 className="maintitle-mk text-5xl sm:text-8xl font-black tracking-wider italic uppercase">
          JUGADOR {result.winnerPlayer} <span className="maintitle-mk-accent">GANA</span>
        </h1>
      </header>

      {/* CENTER WINNER SHOWCASE & STATS */}
      <main className="relative z-20 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full items-center my-auto py-2">
        {/* Winner Showcase Card Chassis */}
        <div className="bg-gradient-to-b from-[#180a06] to-[#0c0403] border-2 border-[#5a2c16] border-t-4 border-t-[#ff8a2a] clip-chamfer-lg p-6 shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col items-center text-center">
          <div className="bg-[#080302] border-2 border-[#5a2c16] clip-chamfer p-4 w-full h-64 flex items-center justify-center mb-4">
            <canvas ref={canvasRef} width={260} height={230} className="pixelated" />
          </div>

          <div className="px-3 py-1 bg-[#140804] border border-[#5a2c16] text-[#ff8a2a] font-anton text-xs uppercase tracking-widest mb-1 clip-chamfer">
            CAMPEÓN DEL ENCUENTRO
          </div>
          <h2 className="text-5xl font-black font-anton italic uppercase text-[#fff8ec] tracking-wider drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            {winnerChar.name}
          </h2>
          <p className="text-sm text-[#ff8a2a] font-anton uppercase tracking-wider">{winnerChar.nickname}</p>
          <p className="text-xs text-[#d4bca0] font-oswald mt-2 italic bg-[#080302] p-2.5 border border-[#5a2c16] clip-chamfer w-full">
            "{winnerChar.tagline}"
          </p>
        </div>

        {/* Match Statistics & Control Chassis */}
        <div className="space-y-4">
          <div className="bg-gradient-to-b from-[#180a06] to-[#0c0403] border-2 border-[#5a2c16] clip-chamfer p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-[#ffb46a] uppercase tracking-widest border-b border-[#5a2c16] pb-2 flex items-center gap-2 font-anton text-sm">
              <ShieldCheck className="w-4 h-4 text-[#ff8a2a]" />
              ESTADÍSTICAS DEL COMBATE
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#080302] p-3 border border-[#5a2c16] clip-chamfer">
                <span className="text-[#a87d60] font-oswald block mb-1 uppercase tracking-wider text-[11px]">ROUNDS GANADOS</span>
                <span className="text-3xl font-black font-anton italic text-[#fff8ec]">
                  P1: {result.p1Rounds} — {result.p2Rounds} :P2
                </span>
              </div>

              <div className="bg-[#080302] p-3 border border-[#5a2c16] clip-chamfer">
                <span className="text-[#a87d60] font-oswald block mb-1 uppercase tracking-wider text-[11px]">TIEMPO TOTAL</span>
                <span className="text-3xl font-black font-anton italic text-[#ffb46a] flex items-center gap-1.5">
                  <Clock className="w-5 h-5 text-[#ff8a2a]" />
                  {result.totalTimeSeconds}s
                </span>
              </div>

              <div className="bg-[#080302] p-3 border border-[#5a2c16] clip-chamfer">
                <span className="text-[#a87d60] font-oswald block mb-1 uppercase tracking-wider text-[11px]">MÁX COMBO P1</span>
                <span className="text-3xl font-black font-anton italic text-[#ff8a2a] flex items-center gap-1">
                  <Zap className="w-5 h-5" />
                  {result.maxComboP1} HITS
                </span>
              </div>

              <div className="bg-[#080302] p-3 border border-[#5a2c16] clip-chamfer">
                <span className="text-[#a87d60] font-oswald block mb-1 uppercase tracking-wider text-[11px]">MÁX COMBO P2</span>
                <span className="text-3xl font-black font-anton italic text-[#00f2ff] flex items-center gap-1">
                  <Zap className="w-5 h-5" />
                  {result.maxComboP2} HITS
                </span>
              </div>
            </div>

            <div className="bg-[#080302] p-3 border border-[#5a2c16] clip-chamfer flex items-center justify-between text-xs font-oswald">
              <span className="text-[#a87d60] uppercase tracking-wider">ESCENARIO:</span>
              <span className="text-[#ff8a2a] font-anton text-sm uppercase tracking-wider">{result.stage.name}</span>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                soundSystem.playFightBell();
                onRematch();
              }}
              className="py-3.5 px-4 bg-gradient-to-r from-[#ff8a2a] via-[#f25c05] to-[#c9330f] hover:brightness-110 text-[#160600] font-black font-anton text-2xl uppercase tracking-wider clip-chamfer transition shadow-[0_0_25px_rgba(255,138,42,0.5)] flex items-center justify-center gap-2 border border-white/20"
            >
              <RotateCcw className="w-6 h-6" />
              REVANCHA
            </button>

            <button
              onClick={() => {
                soundSystem.playMenuSelect();
                onChangeCharacters();
              }}
              className="py-3.5 px-4 bg-[#1a0805] hover:bg-[#2e0e09] border border-[#5a2c16] hover:border-[#ff8a2a] text-[#fff8ec] font-anton text-xl uppercase tracking-wider clip-chamfer transition flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5 text-[#ff8a2a]" />
              LUCHADORES
            </button>

            <button
              onClick={() => {
                soundSystem.playMenuSelect();
                onChangeStage();
              }}
              className="py-3 px-4 bg-[#1a0805] hover:bg-[#2e0e09] border border-[#5a2c16] hover:border-[#00f2ff] text-[#fff8ec] font-anton text-xl uppercase tracking-wider clip-chamfer transition flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5 text-[#00f2ff]" />
              ESCENARIO
            </button>

            <button
              onClick={() => {
                soundSystem.playMenuCancel();
                onMainMenu();
              }}
              className="py-3 px-4 bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 hover:border-red-600 text-red-200 font-anton text-xl uppercase tracking-wider clip-chamfer transition flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5 text-red-400" />
              MENÚ
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 text-center py-2 border-t-2 border-[#ff8a2a]/30 text-xs text-[#a87d60] font-anton uppercase tracking-wider">
        QUE PAJA RECORDS · PROTOTIPO ARCADE ORIGINAL
      </footer>
    </div>
  );
};

