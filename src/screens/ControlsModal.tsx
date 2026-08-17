import React from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { Zap, Shield, Flame, Swords, ArrowRight, X } from 'lucide-react';

interface ControlsModalProps {
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none font-oswald">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#180a06] to-[#0c0403] border-2 border-[#5a2c16] clip-chamfer-lg p-6 shadow-[0_0_60px_rgba(0,0,0,0.95)] text-[#fff8ec]">
        
        {/* Close Button */}
        <button
          onClick={() => {
            soundSystem.playMenuCancel();
            onClose();
          }}
          className="absolute top-4 right-4 text-[#a87d60] hover:text-white p-2 bg-[#1a0805] hover:bg-[#2e0e09] border border-[#ff8a2a]/40 clip-chamfer transition"
        >
          <X className="w-5 h-5 text-[#ff8a2a]" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b-2 border-[#5a2c16] pb-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-[#ff8a2a] to-[#c9330f] clip-chamfer flex items-center justify-center text-[#160600] shadow-[0_0_15px_#ff8a2a]">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-wider font-anton leading-none text-[#fff8ec]">
              GUÍA DE CONTROLES Y COMBATE ARCADE
            </h2>
            <p className="text-xs text-[#ff8a2a] font-anton uppercase tracking-widest mt-0.5">
              2 JUGADORES EN EL MISMO TECLADO · QUE PAJA FIGHTER
            </p>
          </div>
        </div>

        {/* Dual Input Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* PLAYER 1 CONTROLS */}
          <div className="bg-[#120603] border-2 border-[#5a2c16] border-l-4 border-l-[#ff8a2a] clip-chamfer p-4">
            <div className="flex items-center justify-between mb-3 border-b border-[#5a2c16] pb-2">
              <span className="font-anton italic text-[#ff8a2a] text-xl uppercase tracking-wider">
                JUGADOR 1 (P1)
              </span>
              <div className="px-2 py-0.5 bg-[#ff8a2a] text-[#160600] font-anton text-xs font-bold uppercase tracking-wider">
                LADO IZQUIERDO
              </div>
            </div>
            <div className="space-y-2 text-xs font-oswald">
              <div className="flex justify-between items-center py-1 border-b border-[#3a150b]">
                <span className="text-[#a87d60] uppercase">Mover / Agachar / Saltar</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-0.5 bg-[#200a05] border border-[#5a2c16] font-mono font-bold text-xs text-white">W</kbd>
                  <kbd className="px-2 py-0.5 bg-[#200a05] border border-[#5a2c16] font-mono font-bold text-xs text-white">A</kbd>
                  <kbd className="px-2 py-0.5 bg-[#200a05] border border-[#5a2c16] font-mono font-bold text-xs text-white">S</kbd>
                  <kbd className="px-2 py-0.5 bg-[#200a05] border border-[#5a2c16] font-mono font-bold text-xs text-white">D</kbd>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#3a150b]">
                <span className="text-[#a87d60] uppercase">Golpe (Punch)</span>
                <kbd className="px-2.5 py-0.5 bg-[#ff8a2a] text-[#160600] font-mono font-bold text-xs shadow-[0_0_8px_#ff8a2a]">F</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#3a150b]">
                <span className="text-[#a87d60] uppercase">Patada (Kick)</span>
                <kbd className="px-2.5 py-0.5 bg-[#ffb46a] text-[#160600] font-mono font-bold text-xs shadow-[0_0_8px_#ffb46a]">G</kbd>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#a87d60] uppercase">Ataque Especial (Super QP)</span>
                <kbd className="px-2.5 py-0.5 bg-red-600 text-white font-mono font-bold text-xs shadow-[0_0_8px_#dc2626]">H</kbd>
              </div>
            </div>
          </div>

          {/* PLAYER 2 CONTROLS */}
          <div className="bg-[#050e14] border-2 border-[#16384a] border-l-4 border-l-[#00f2ff] clip-chamfer p-4">
            <div className="flex items-center justify-between mb-3 border-b border-[#16384a] pb-2">
              <span className="font-anton italic text-[#00f2ff] text-xl uppercase tracking-wider">
                JUGADOR 2 (P2)
              </span>
              <div className="px-2 py-0.5 bg-[#00f2ff] text-black font-anton text-xs font-bold uppercase tracking-wider">
                LADO DERECHO
              </div>
            </div>
            <div className="space-y-2 text-xs font-oswald">
              <div className="flex justify-between items-center py-1 border-b border-[#0c2432]">
                <span className="text-[#6a8da0] uppercase">Mover / Agachar / Saltar</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-0.5 bg-[#091a24] border border-[#16384a] font-mono font-bold text-xs text-white">↑</kbd>
                  <kbd className="px-2 py-0.5 bg-[#091a24] border border-[#16384a] font-mono font-bold text-xs text-white">←</kbd>
                  <kbd className="px-2 py-0.5 bg-[#091a24] border border-[#16384a] font-mono font-bold text-xs text-white">↓</kbd>
                  <kbd className="px-2 py-0.5 bg-[#091a24] border border-[#16384a] font-mono font-bold text-xs text-white">→</kbd>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#0c2432]">
                <span className="text-[#6a8da0] uppercase">Golpe (Punch)</span>
                <kbd className="px-2.5 py-0.5 bg-[#00f2ff] text-black font-mono font-bold text-xs shadow-[0_0_8px_#00f2ff]">K</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#0c2432]">
                <span className="text-[#6a8da0] uppercase">Patada (Kick)</span>
                <kbd className="px-2.5 py-0.5 bg-sky-400 text-black font-mono font-bold text-xs shadow-[0_0_8px_#38bdf8]">L</kbd>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#6a8da0] uppercase">Ataque Especial (Super QP)</span>
                <kbd className="px-2.5 py-0.5 bg-blue-500 text-white font-mono font-bold text-xs shadow-[0_0_8px_#3b82f6]">P / Ñ</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* COMBAT MECHANICS */}
        <div className="bg-[#120603] border border-[#5a2c16] clip-chamfer p-4 mb-5">
          <h3 className="text-xs font-bold text-[#ff8a2a] uppercase tracking-widest mb-2.5 flex items-center gap-2 font-anton text-sm">
            <Zap className="w-4 h-4 text-[#ff8a2a]" />
            MECÁNICAS DE COMBATE AVANZADAS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-oswald text-[#a87d60]">
            <div className="bg-[#1c0a06] p-2.5 border border-[#5a2c16]">
              <strong className="text-[#fff8ec] block font-anton text-sm uppercase mb-0.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#00f2ff]" />
                Bloqueo (Guardia):
              </strong>
              Mantén la dirección contraria al rival para reducir el impacto a chip damage.
            </div>
            <div className="bg-[#1c0a06] p-2.5 border border-[#5a2c16]">
              <strong className="text-[#fff8ec] block font-anton text-sm uppercase mb-0.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#ff8a2a]" />
                Barra de Super QP:
              </strong>
              Se carga golpeando. Con 25%+, desata ondas sónicas devastadoras.
            </div>
            <div className="bg-[#1c0a06] p-2.5 border border-[#5a2c16]">
              <strong className="text-[#fff8ec] block font-anton text-sm uppercase mb-0.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#ffb46a]" />
                Cadenas de Combo:
              </strong>
              Encadena golpes rápidos antes de la recuperación rival para multiplicar el daño.
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            soundSystem.playMenuSelect();
            onClose();
          }}
          className="w-full py-3.5 bg-gradient-to-r from-[#ff8a2a] to-[#c9330f] hover:brightness-110 text-[#160600] font-anton text-2xl uppercase tracking-wider transition shadow-[0_0_25px_rgba(255,138,42,0.6)] flex items-center justify-center gap-2 clip-chamfer"
        >
          <span>¡ENTENDIDO, A PELEAR!</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

