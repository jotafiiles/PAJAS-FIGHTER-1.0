import React, { useEffect, useRef, useMemo } from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { CharacterData, ColorVariant } from '../types';
import { SpriteController } from '../game/animation/SpriteController';
import { ArrowRight, Check } from 'lucide-react';

interface VariantSelectModalProps {
  playerNumber: 1 | 2;
  character: CharacterData;
  selectedColor: ColorVariant;
  onSelectColor: (color: ColorVariant) => void;
  onConfirm: () => void;
}

export const VariantSelectModal: React.FC<VariantSelectModalProps> = ({
  playerNumber,
  character,
  selectedColor,
  onSelectColor,
  onConfirm,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spriteCtrl = useMemo(() => new SpriteController(character), [character]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height - 25);
      ctx.scale(2.1, 2.1);

      spriteCtrl.render(
        ctx,
        'idle',
        frame,
        selectedColor,
        playerNumber === 1 ? 1 : -1,
        false,
        false
      );
      ctx.restore();

      frame += 0.05;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [selectedColor, playerNumber, spriteCtrl]);

  const isP1 = playerNumber === 1;
  const accentColor = isP1 ? '#ff4e00' : '#00f2ff';
  const badgeBg = isP1
    ? 'linear-gradient(135deg, #ff8a2a, #ff4e00)'
    : 'linear-gradient(135deg, #38bdf8, #0284c7)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none font-oswald animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#140604] border-2 border-[#5a2c16] p-6 shadow-[0_0_80px_rgba(0,0,0,0.98)] text-[#fff8ec]"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))',
        }}
      >
        {/* Metal Corner Accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#ff8a2a]/60 pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#ff8a2a]/60 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#ff8a2a]/60 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#ff8a2a]/60 pointer-events-none" />

        {/* Top Header Plate */}
        <div className="flex items-center justify-between border-b-2 border-[#5a2c16] pb-3 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="px-3.5 py-1 font-anton text-2xl text-[#160600] font-black tracking-wider uppercase shadow-lg"
              style={{
                background: badgeBg,
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              }}
            >
              {playerNumber}P
            </div>
            <div>
              <h2
                className="text-3xl font-black uppercase italic tracking-wider font-anton leading-none"
                style={{
                  color: '#fff8ec',
                  textShadow: isP1
                    ? '0 0 20px rgba(255, 78, 0, 0.6), 2px 2px 0 #1a0500'
                    : '0 0 20px rgba(0, 242, 255, 0.6), 2px 2px 0 #001a24',
                }}
              >
                SELECCIONA VARIANTE DE COLOR
              </h2>
              <p className="text-xs text-[#a87d60] font-anton uppercase tracking-widest mt-0.5">
                {character.name} — <span style={{ color: accentColor }}>{character.nickname}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center Preview & Palette List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center mb-5">
          {/* Animated Canvas Fighter Preview */}
          <div
            className="flex flex-col items-center justify-center bg-[#090302] border-2 border-[#421d0e] p-4 h-64 relative overflow-hidden"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
            }}
          >
            {/* Ambient Radial Spotlight */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${selectedColor.accentColor} 0%, transparent 70%)`,
              }}
            />

            {/* Fighter Canvas */}
            <canvas
              ref={canvasRef}
              width={220}
              height={200}
              className="pixelated z-10 drop-shadow-[0_12px_24px_rgba(0,0,0,0.95)]"
            />

            {/* Pedestal Base Line */}
            <div className="absolute bottom-6 w-3/4 h-1 bg-gradient-to-r from-transparent via-[#ff8a2a]/60 to-transparent" />

            {/* Active Variant Badge */}
            <div
              className="px-4 py-0.5 text-xs font-anton tracking-widest text-[#160600] uppercase font-black z-10 mt-1 shadow-md"
              style={{
                background: badgeBg,
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
              }}
            >
              {selectedColor.name}
            </div>
          </div>

          {/* Color Palettes Selection */}
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {character.colors.map((color, idx) => {
              const isSelected = selectedColor.id === color.id;
              return (
                <button
                  key={color.id}
                  onClick={() => {
                    soundSystem.playMenuMove();
                    onSelectColor(color);
                  }}
                  className={`w-full p-3 border flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? isP1
                        ? 'bg-[#2f1107] border-[#ff8a2a] text-white shadow-[0_0_20px_rgba(255,138,42,0.45)] translate-x-1'
                        : 'bg-[#06212d] border-[#00f2ff] text-white shadow-[0_0_20px_rgba(0,242,255,0.45)] translate-x-1'
                      : 'bg-[#170905] border-[#4a200f] hover:border-[#ff8a2a]/60 text-[#a87d60] hover:text-white'
                  }`}
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Index Number */}
                    <span className="font-anton text-sm opacity-60 w-5 text-left">
                      0{idx + 1}
                    </span>

                    {/* Color Swatches */}
                    <div className="flex -space-x-1 items-center">
                      <div
                        className="w-5 h-5 border border-black shadow"
                        style={{ backgroundColor: color.primaryColor }}
                        title="Color Primario"
                      />
                      <div
                        className="w-5 h-5 border border-black shadow"
                        style={{ backgroundColor: color.secondaryColor }}
                        title="Color Secundario"
                      />
                      <div
                        className="w-5 h-5 border border-black shadow"
                        style={{ backgroundColor: color.accentColor }}
                        title="Color de Acento"
                      />
                    </div>

                    {/* Palette Name */}
                    <span className="text-sm font-anton tracking-wider uppercase text-[#fff8ec]">
                      {color.name}
                    </span>
                  </div>

                  {isSelected && (
                    <div
                      className="w-6 h-6 text-[#160600] flex items-center justify-center font-bold text-xs shadow"
                      style={{ background: badgeBg }}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={() => {
            soundSystem.playMenuSelect();
            onConfirm();
          }}
          className="w-full py-3.5 text-[#160600] uppercase tracking-wider transition font-anton text-2xl font-black flex items-center justify-center gap-2 cursor-pointer hover:brightness-125 active:scale-[0.99]"
          style={{
            background: badgeBg,
            boxShadow: `0 0 30px ${accentColor}88`,
            clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
          }}
        >
          <span>CONFIRMAR PALETA Y LISTO</span>
          <ArrowRight className="w-6 h-6 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};


