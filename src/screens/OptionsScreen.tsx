import React from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { GameSettings } from '../types';
import { Volume2, Sliders, Monitor, ShieldAlert, Check, ArrowLeft } from 'lucide-react';

interface OptionsScreenProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onBack: () => void;
}

export const OptionsScreen: React.FC<OptionsScreenProps> = ({
  settings,
  onUpdateSettings,
  onBack,
}) => {
  const handleChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);

    if (key === 'sfxVolume' || key === 'musicVolume') {
      soundSystem.setVolumes(
        key === 'sfxVolume' ? (value as number) : settings.sfxVolume,
        key === 'musicVolume' ? (value as number) : settings.musicVolume
      );
      soundSystem.playMenuMove();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-[#0a0505] text-[#fff8ec] select-none overflow-hidden font-oswald">
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

      {/* Main Options Cabinet Chassis */}
      <div className="relative z-20 w-full max-w-2xl bg-gradient-to-b from-[#180a06] to-[#0c0403] border-2 border-[#5a2c16] border-t-4 border-t-[#ff8a2a] clip-chamfer-lg p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.95)]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#ff8a2a]/30 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#1a0805] border-2 border-[#5a2c16] flex items-center justify-center clip-chamfer">
              <Sliders className="w-6 h-6 text-[#ff8a2a]" />
            </div>
            <div>
              <h1 className="maintitle-mk text-3xl sm:text-4xl font-black uppercase italic tracking-wider leading-none">
                CONFIGURACIÓN <span className="maintitle-mk-accent">ARCADE</span>
              </h1>
              <p className="text-xs text-[#ff8a2a] font-anton uppercase tracking-wider mt-1">
                AJUSTES DE AUDIO, REGLAS DE COMBATE Y PANTALLA
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              soundSystem.playMenuCancel();
              onBack();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a0805] hover:bg-[#2e0e09] text-[#ffb46a] hover:text-white border border-[#5a2c16] hover:border-[#ff8a2a] clip-chamfer transition font-anton text-sm uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4 text-[#ff8a2a]" />
            VOLVER
          </button>
        </div>

        {/* Settings Chassis Body */}
        <div className="space-y-4">
          
          {/* AUDIO SECTION */}
          <div className="bg-[#080302] p-4 sm:p-5 border border-[#5a2c16] clip-chamfer">
            <h2 className="text-xs font-bold text-[#ff8a2a] uppercase tracking-widest mb-4 flex items-center gap-2 font-anton text-sm">
              <Volume2 className="w-4 h-4 text-[#ff8a2a]" />
              AJUSTES DE SONIDO Y VOLUMEN
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-[#d4bca0] mb-1 font-oswald uppercase tracking-wider">
                  <span>Efectos de Sonido (SFX / Golpes)</span>
                  <span className="font-anton text-[#ffb46a] text-sm">{Math.round(settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => handleChange('sfxVolume', parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#200a05] appearance-none cursor-pointer accent-[#ff8a2a]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#d4bca0] mb-1 font-oswald uppercase tracking-wider">
                  <span>Música de Fondo (Sintetizadores Arcade)</span>
                  <span className="font-anton text-[#ffb46a] text-sm">{Math.round(settings.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => handleChange('musicVolume', parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#200a05] appearance-none cursor-pointer accent-[#ff8a2a]"
                />
              </div>
            </div>
          </div>

          {/* COMBAT RULES SECTION */}
          <div className="bg-[#080302] p-4 sm:p-5 border border-[#5a2c16] clip-chamfer">
            <h2 className="text-xs font-bold text-[#00f2ff] uppercase tracking-widest mb-4 flex items-center gap-2 font-anton text-sm">
              <ShieldAlert className="w-4 h-4 text-[#00f2ff]" />
              REGLAS DE ENCUENTRO
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#d4bca0] mb-2 font-oswald uppercase tracking-wider">Formato de Rounds</label>
                <div className="flex gap-2">
                  {[1, 3].map((count) => (
                    <button
                      key={count}
                      onClick={() => {
                        soundSystem.playMenuMove();
                        handleChange('roundCount', count as 1 | 3);
                      }}
                      className={`flex-1 py-2.5 px-3 text-xs font-black font-anton uppercase tracking-wider clip-chamfer transition ${
                        settings.roundCount === count
                          ? 'bg-[#ff8a2a] text-[#160600] shadow-[0_0_15px_rgba(255,138,42,0.6)]'
                          : 'bg-[#1a0805] border border-[#5a2c16] text-[#a87d60] hover:text-[#fff8ec]'
                      }`}
                    >
                      {count === 1 ? '1 ROUND' : 'MEJOR DE 3'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#d4bca0] mb-2 font-oswald uppercase tracking-wider">Dificultad CPU</label>
                <div className="flex gap-2">
                  {(['EASY', 'NORMAL', 'HARD'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => {
                        soundSystem.playMenuMove();
                        handleChange('aiDifficulty', diff);
                      }}
                      className={`flex-1 py-2.5 px-3 text-xs font-black font-anton uppercase tracking-wider clip-chamfer transition ${
                        settings.aiDifficulty === diff
                          ? 'bg-[#00f2ff] text-[#021017] shadow-[0_0_15px_rgba(0,242,255,0.6)]'
                          : 'bg-[#1a0805] border border-[#5a2c16] text-[#a87d60] hover:text-[#fff8ec]'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* VISUAL & FX SECTION */}
          <div className="bg-[#080302] p-4 sm:p-5 border border-[#5a2c16] clip-chamfer">
            <h2 className="text-xs font-bold text-[#ffb46a] uppercase tracking-widest mb-3 flex items-center gap-2 font-anton text-sm">
              <Monitor className="w-4 h-4 text-[#ff8a2a]" />
              EFECTOS VISUALES ARCADE
            </h2>
            <div className="space-y-2">
              <label className="flex items-center justify-between cursor-pointer p-2.5 bg-[#120603] border border-[#5a2c16] clip-chamfer hover:border-[#ff8a2a] transition">
                <span className="text-xs text-[#fff8ec] font-oswald uppercase tracking-wider">Vibración de Pantalla (Screen Shake)</span>
                <input
                  type="checkbox"
                  checked={settings.screenShake}
                  onChange={(e) => {
                    soundSystem.playMenuMove();
                    handleChange('screenShake', e.target.checked);
                  }}
                  className="w-5 h-5 accent-[#ff8a2a] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2.5 bg-[#120603] border border-[#5a2c16] clip-chamfer hover:border-[#ff8a2a] transition">
                <span className="text-xs text-[#fff8ec] font-oswald uppercase tracking-wider">Filtro Retro CRT & Scanlines</span>
                <input
                  type="checkbox"
                  checked={settings.crtScanlines}
                  onChange={(e) => {
                    soundSystem.playMenuMove();
                    handleChange('crtScanlines', e.target.checked);
                  }}
                  className="w-5 h-5 accent-[#ff8a2a] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2.5 bg-[#120603] border border-[#5a2c16] clip-chamfer hover:border-[#ff8a2a] transition">
                <span className="text-xs text-[#fff8ec] font-oswald uppercase tracking-wider">Visualizador de Hitboxes / Hurtboxes (Debug)</span>
                <input
                  type="checkbox"
                  checked={settings.showHitboxes}
                  onChange={(e) => {
                    soundSystem.playMenuMove();
                    handleChange('showHitboxes', e.target.checked);
                  }}
                  className="w-5 h-5 accent-[#ff8a2a] cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-6">
          <button
            onClick={() => {
              soundSystem.playMenuSelect();
              onBack();
            }}
            className="w-full py-4 bg-gradient-to-r from-[#ff8a2a] via-[#f25c05] to-[#c9330f] hover:brightness-110 text-[#160600] font-black font-anton text-2xl uppercase tracking-wider clip-chamfer transition shadow-[0_0_25px_rgba(255,138,42,0.5)] flex items-center justify-center gap-2 border border-white/20"
          >
            <Check className="w-6 h-6" />
            GUARDAR Y REGRESAR
          </button>
        </div>
      </div>
    </div>
  );
};

