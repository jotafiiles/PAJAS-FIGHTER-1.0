import React, { useState, useEffect } from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { CharacterRegistry } from '../data/characters/CharacterRegistry';
import { CharacterData, GameMode } from '../types';
import { FighterAvatarSvg } from '../components/FighterAvatarSvg';
import { Zap, Shield, Flame, Activity, Crosshair, ArrowLeft, Check, Lock } from 'lucide-react';

interface CharacterSelectProps {
  mode: GameMode;
  onConfirmSelection: (
    p1Char: CharacterData,
    p2Char: CharacterData
  ) => void;
  onBack: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  mode,
  onConfirmSelection,
  onBack,
}) => {
  const [characters, setCharacters] = useState<CharacterData[]>(CharacterRegistry.getAll());
  const [p1Index, setP1Index] = useState<number>(0);
  const [p2Index, setP2Index] = useState<number>(1);
  const [p1Locked, setP1Locked] = useState<boolean>(false);
  const [p2Locked, setP2Locked] = useState<boolean>(false);

  // Sync with registry in case asynchronous manifest loads new characters
  useEffect(() => {
    CharacterRegistry.loadFromManifest().then((loaded) => {
      if (loaded && loaded.length > 0) {
        setCharacters(CharacterRegistry.getAll());
      }
    });
  }, []);

  const p1Char = characters[p1Index] || characters[0];
  const p2Char = characters[p2Index] || characters[1] || characters[0];

  // Auto proceed when both are locked
  useEffect(() => {
    if (mode === 'ARCADE' || mode === 'TRAINING') {
      if (p1Locked) {
        // In Arcade/Training, CPU randomly selects from other playable characters
        const playable = characters.filter((c) => !c.isLocked && c.id !== p1Char.id);
        const cpuChar = playable.length > 0 
          ? playable[Math.floor(Math.random() * playable.length)] 
          : p2Char;
        
        soundSystem.playFightBell();
        const timer = setTimeout(() => {
          onConfirmSelection(p1Char, cpuChar);
        }, 600);
        return () => clearTimeout(timer);
      }
    } else {
      // In Versus, wait for both P1 and P2
      if (p1Locked && p2Locked) {
        soundSystem.playFightBell();
        const timer = setTimeout(() => {
          onConfirmSelection(p1Char, p2Char);
        }, 700);
        return () => clearTimeout(timer);
      }
    }
  }, [p1Locked, p2Locked, mode, p1Char, p2Char, characters, onConfirmSelection]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const cols = 4;
      const total = characters.length;

      // P1 Navigation (W/A/S/D + F / Space to confirm)
      if (!p1Locked) {
        if (e.code === 'KeyD') {
          soundSystem.playMenuMove();
          setP1Index((prev) => (prev + 1) % total);
        } else if (e.code === 'KeyA') {
          soundSystem.playMenuMove();
          setP1Index((prev) => (prev - 1 + total) % total);
        } else if (e.code === 'KeyS') {
          soundSystem.playMenuMove();
          setP1Index((prev) => (prev + cols) % total);
        } else if (e.code === 'KeyW') {
          soundSystem.playMenuMove();
          setP1Index((prev) => (prev - cols + total) % total);
        } else if (e.code === 'KeyF' || e.code === 'Space') {
          if (!characters[p1Index]?.isLocked) {
            soundSystem.playMenuSelect();
            setP1Locked(true);
          }
        }
      }

      // P2 Navigation in Versus (Arrows + K / Enter to confirm)
      if (mode === 'VERSUS' && !p2Locked) {
        if (e.code === 'ArrowRight') {
          soundSystem.playMenuMove();
          setP2Index((prev) => (prev + 1) % total);
        } else if (e.code === 'ArrowLeft') {
          soundSystem.playMenuMove();
          setP2Index((prev) => (prev - 1 + total) % total);
        } else if (e.code === 'ArrowDown') {
          soundSystem.playMenuMove();
          setP2Index((prev) => (prev + cols) % total);
        } else if (e.code === 'ArrowUp') {
          soundSystem.playMenuMove();
          setP2Index((prev) => (prev - cols + total) % total);
        } else if (e.code === 'KeyK' || e.code === 'Enter') {
          if (!characters[p2Index]?.isLocked) {
            soundSystem.playMenuSelect();
            setP2Locked(true);
          }
        }
      }

      if (e.code === 'Escape') {
        if (p1Locked) {
          setP1Locked(false);
        } else if (p2Locked) {
          setP2Locked(false);
        } else {
          onBack();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [p1Locked, p2Locked, p1Index, p2Index, characters, mode, onBack]);

  const renderStats = (char: CharacterData, themeColor: string) => {
    const stats = char.stats || { strength: 7, speed: 7, defense: 7, reach: 7, technique: 7 };
    return (
      <div className="flex flex-col gap-1.5 text-xs font-mono">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-zinc-400">
            <Flame className="w-3.5 h-3.5" style={{ color: themeColor }} /> FUERZA
          </span>
          <div className="w-28 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div className="h-full rounded-full" style={{ width: `${stats.strength * 10}%`, backgroundColor: themeColor }} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-zinc-400">
            <Zap className="w-3.5 h-3.5" style={{ color: themeColor }} /> VELOCIDAD
          </span>
          <div className="w-28 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div className="h-full rounded-full" style={{ width: `${stats.speed * 10}%`, backgroundColor: themeColor }} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-zinc-400">
            <Shield className="w-3.5 h-3.5" style={{ color: themeColor }} /> DEFENSA
          </span>
          <div className="w-28 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div className="h-full rounded-full" style={{ width: `${stats.defense * 10}%`, backgroundColor: themeColor }} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-zinc-400">
            <Crosshair className="w-3.5 h-3.5" style={{ color: themeColor }} /> ALCANCE
          </span>
          <div className="w-28 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div className="h-full rounded-full" style={{ width: `${stats.reach * 10}%`, backgroundColor: themeColor }} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-zinc-400">
            <Activity className="w-3.5 h-3.5" style={{ color: themeColor }} /> TÉCNICA
          </span>
          <div className="w-28 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div className="h-full rounded-full" style={{ width: `${stats.technique * 10}%`, backgroundColor: themeColor }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-screen h-screen bg-[#080505] text-white overflow-hidden select-none flex flex-col justify-between font-oswald p-5">
      {/* Background Shared Atmosphere */}
      <div className="bg" />
      <div className="grain" />
      <div className="vignette" />

      {/* TOP HEADER */}
      <div className="flex items-center justify-between z-10 border-b border-zinc-800/80 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 border border-zinc-700/80 rounded hover:border-[#ff5500] hover:text-white transition text-xs font-mono tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> VOLVER AL MENÚ
        </button>

        <div className="text-center">
          <div className="text-xs font-mono tracking-[0.3em] text-[#ff8a2a] uppercase">QUE PAJA FIGHTER</div>
          <div className="text-2xl md:text-3xl font-black italic tracking-wider text-white uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            SELECCIONA TU <span className="text-[#ff5500]">LUCHADOR</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded text-zinc-300 uppercase">
            MODO: <b className="text-[#ff8a2a]">{mode}</b>
          </span>
        </div>
      </div>

      {/* MAIN 3-PANEL ROSTER STAGE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center max-w-7xl w-full mx-auto z-10 py-3">
        {/* 1P FIGHTER CARD (3.5 cols) */}
        <div className="lg:col-span-3 h-full flex flex-col justify-between p-4 rounded bg-zinc-950/80 border-2 border-[#ff5500]/70 shadow-[0_0_20px_rgba(255,85,0,0.25)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-black bg-[#ff5500] text-black uppercase">
              1P JUGADOR
            </span>
            {p1Locked ? (
              <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-950/80 px-2 py-0.5 rounded border border-green-700">
                <Check className="w-3.5 h-3.5" /> ¡CONFIRMADO!
              </span>
            ) : (
              <span className="text-xs font-mono text-[#ff8a2a] animate-pulse">ELIGE CON WASD + F</span>
            )}
          </div>

          {/* 1P Avatar & Portrait */}
          <div className="relative w-full h-44 rounded bg-black/60 border border-zinc-800 flex items-center justify-center overflow-hidden mb-3">
            {p1Char.portraitImage ? (
              <img
                src={p1Char.portraitImage}
                alt={p1Char.name}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <FighterAvatarSvg characterId={p1Char.id} colorVariant={p1Char.colors?.[0]} className="w-32 h-32" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <div className="text-xs font-mono text-[#ff8a2a] uppercase">{p1Char.archetype || 'LUCHADOR'}</div>
              <div className="text-xl font-black text-white leading-none">{p1Char.name}</div>
            </div>
          </div>

          <p className="text-xs text-zinc-300 font-sans line-clamp-2 mb-3">{p1Char.description || p1Char.tagline}</p>

          {/* 1P Stats */}
          {renderStats(p1Char, '#ff5500')}

          <button
            onClick={() => {
              if (!p1Char.isLocked) {
                soundSystem.playMenuSelect();
                setP1Locked(!p1Locked);
              }
            }}
            className={`w-full py-2.5 mt-3 rounded font-black tracking-wider text-sm transition uppercase cursor-pointer ${
              p1Locked
                ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                : 'bg-gradient-to-r from-[#ff5500] to-[#e11d48] text-white hover:brightness-110 shadow-[0_0_15px_rgba(255,85,0,0.4)]'
            }`}
          >
            {p1Locked ? 'CANCELAR ELECCIÓN' : 'CONFIRMAR 1P (ESPACIO/F)'}
          </button>
        </div>

        {/* CENTER: ROSTER GRID (5.5 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-3 rounded bg-zinc-900/40 border border-zinc-800">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3">
            SELECCIONA TU LUCHADOR · {characters.length} DISPONIBLES
          </div>

          {/* GRID */}
          <div className="grid grid-cols-4 gap-3 w-full max-w-xl">
            {characters.map((char, index) => {
              const isP1 = p1Index === index;
              const isP2 = p2Index === index && mode === 'VERSUS';
              const isLocked = char.isLocked;

              return (
                <div
                  key={char.id}
                  onClick={() => {
                    if (isLocked) return;
                    soundSystem.playMenuMove();
                    if (!p1Locked) {
                      setP1Index(index);
                    } else if (mode === 'VERSUS' && !p2Locked) {
                      setP2Index(index);
                    }
                  }}
                  className={`group relative aspect-square rounded-md overflow-hidden bg-zinc-950 border-2 cursor-pointer transition-all duration-150 ${
                    isP1 && isP2
                      ? 'border-yellow-400 ring-2 ring-yellow-400 scale-105 z-20 shadow-[0_0_20px_rgba(250,204,21,0.6)]'
                      : isP1
                      ? 'border-[#ff5500] ring-2 ring-[#ff5500] scale-105 z-20 shadow-[0_0_20px_rgba(255,85,0,0.6)]'
                      : isP2
                      ? 'border-cyan-400 ring-2 ring-cyan-400 scale-105 z-20 shadow-[0_0_20px_rgba(34,211,238,0.6)]'
                      : 'border-zinc-800 hover:border-zinc-500 hover:scale-102'
                  }`}
                >
                  {/* Portrait or Avatar */}
                  {char.portraitImage ? (
                    <img
                      src={char.portraitImage}
                      alt={char.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                      <FighterAvatarSvg characterId={char.id} colorVariant={char.colors?.[0]} className="w-16 h-16" />
                    </div>
                  )}

                  {/* Overlay indicators */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Lock icon if locked */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-zinc-500">
                      <Lock className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-mono">BLOQUEADO</span>
                    </div>
                  )}

                  {/* Character Name Label */}
                  <div className="absolute bottom-1 left-1 right-1 text-center">
                    <span className="text-[11px] font-black tracking-tight text-white uppercase truncate block">
                      {char.name}
                    </span>
                  </div>

                  {/* 1P Indicator Badge */}
                  {isP1 && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#ff5500] text-black font-black text-[10px] tracking-wider shadow">
                      1P
                    </div>
                  )}

                  {/* 2P Indicator Badge */}
                  {isP2 && (
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-cyan-400 text-black font-black text-[10px] tracking-wider shadow">
                      2P
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-xs font-mono text-zinc-500 flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#ff5500]" /> 1P: WASD + F
            </span>
            {mode === 'VERSUS' && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-cyan-400" /> 2P: FLECHAS + K
              </span>
            )}
          </div>
        </div>

        {/* 2P FIGHTER CARD (3.5 cols) */}
        <div className="lg:col-span-3 h-full flex flex-col justify-between p-4 rounded bg-zinc-950/80 border-2 border-cyan-500/70 shadow-[0_0_20px_rgba(6,182,212,0.25)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-black bg-cyan-400 text-black uppercase">
              {mode === 'VERSUS' ? '2P JUGADOR' : 'CPU ADVERSARIO'}
            </span>
            {p2Locked || mode !== 'VERSUS' ? (
              <span className="flex items-center gap-1 text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700">
                <Check className="w-3.5 h-3.5" /> ¡LISTO!
              </span>
            ) : (
              <span className="text-xs font-mono text-cyan-400 animate-pulse">ELIGE CON FLECHAS + K</span>
            )}
          </div>

          {/* 2P Avatar & Portrait */}
          <div className="relative w-full h-44 rounded bg-black/60 border border-zinc-800 flex items-center justify-center overflow-hidden mb-3">
            {p2Char.portraitImage ? (
              <img
                src={p2Char.portraitImage}
                alt={p2Char.name}
                className="w-full h-full object-cover object-top scale-x-[-1]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <FighterAvatarSvg characterId={p2Char.id} colorVariant={p2Char.colors?.[0]} className="w-32 h-32 scale-x-[-1]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <div className="text-xs font-mono text-cyan-400 uppercase">{p2Char.archetype || 'LUCHADOR'}</div>
              <div className="text-xl font-black text-white leading-none">{p2Char.name}</div>
            </div>
          </div>

          <p className="text-xs text-zinc-300 font-sans line-clamp-2 mb-3">{p2Char.description || p2Char.tagline}</p>

          {/* 2P Stats */}
          {renderStats(p2Char, '#22d3ee')}

          {mode === 'VERSUS' ? (
            <button
              onClick={() => {
                if (!p2Char.isLocked) {
                  soundSystem.playMenuSelect();
                  setP2Locked(!p2Locked);
                }
              }}
              className={`w-full py-2.5 mt-3 rounded font-black tracking-wider text-sm transition uppercase cursor-pointer ${
                p2Locked
                  ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              }`}
            >
              {p2Locked ? 'CANCELAR ELECCIÓN' : 'CONFIRMAR 2P (ENTER/K)'}
            </button>
          ) : (
            <div className="w-full py-2.5 mt-3 rounded bg-zinc-900 border border-zinc-800 text-center font-mono text-xs text-zinc-400 uppercase">
              SELECCIÓN AUTOMÁTICA DE CPU
            </div>
          )}
        </div>
      </div>

      {/* FOOTER NAVIGATION GUIDE */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-t border-zinc-800/80 pt-3 z-10">
        <div>PAJAS FIGHTER · QUE PAJA RECORDS</div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-[#ff5500] text-black rounded font-bold">ESPACIO / F</span>
          <span>BLOQUEAR 1P</span>
          {mode === 'VERSUS' && (
            <>
              <span className="px-2 py-0.5 bg-cyan-400 text-black rounded font-bold">ENTER / K</span>
              <span>BLOQUEAR 2P</span>
            </>
          )}
          <span className="px-2 py-0.5 bg-zinc-800 text-white rounded font-bold">ESC</span>
          <span>VOLVER</span>
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
