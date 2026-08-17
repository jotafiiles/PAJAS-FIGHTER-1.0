import React, { useState, useEffect } from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { CHARACTERS } from '../data/characters';
import { CharacterData, ColorVariant, GameMode } from '../types';
import { VariantSelectModal } from './VariantSelectModal';
import { FighterAvatarSvg } from '../components/FighterAvatarSvg';

interface CharacterSelectProps {
  mode: GameMode;
  onConfirmSelection: (
    p1Char: CharacterData,
    p1Color: ColorVariant,
    p2Char: CharacterData,
    p2Color: ColorVariant
  ) => void;
  onBack: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  mode,
  onConfirmSelection,
  onBack,
}) => {
  const [p1Index, setP1Index] = useState<number>(0);
  const [p2Index, setP2Index] = useState<number>(1);
  const [p1Locked, setP1Locked] = useState<boolean>(false);
  const [p2Locked, setP2Locked] = useState<boolean>(false);

  const [p1Color, setP1Color] = useState<ColorVariant>(CHARACTERS[0].colors[0]);
  const [p2Color, setP2Color] = useState<ColorVariant>(
    CHARACTERS[1]?.colors[0] || CHARACTERS[0].colors[1]
  );

  const [selectingColorFor, setSelectingColorFor] = useState<1 | 2 | null>(null);

  const p1Char = CHARACTERS[p1Index] || CHARACTERS[0];
  const p2Char = CHARACTERS[p2Index] || CHARACTERS[1];

  // Update default color when index changes
  useEffect(() => {
    if (p1Char && p1Char.colors && p1Char.colors.length > 0) {
      setP1Color(p1Char.colors[0]);
    }
  }, [p1Index]);

  useEffect(() => {
    if (p2Char && p2Char.colors && p2Char.colors.length > 0) {
      setP2Color(p2Char.colors[0]);
    }
  }, [p2Index]);

  // Keyboard navigation for character select
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectingColorFor !== null) return;

      const cols = 4;
      const total = CHARACTERS.length;

      // P1 Navigation (W/A/S/D + F to confirm)
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
          if (!CHARACTERS[p1Index].isLocked) {
            soundSystem.playMenuSelect();
            setSelectingColorFor(1);
          }
        }
      }

      // P2 Navigation (Arrow Keys + K to confirm)
      if (!p2Locked) {
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
          if (!CHARACTERS[p2Index].isLocked) {
            soundSystem.playMenuSelect();
            setSelectingColorFor(2);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [p1Index, p2Index, p1Locked, p2Locked, selectingColorFor]);

  // Check if both players ready
  useEffect(() => {
    if (p1Locked && p2Locked) {
      const timer = setTimeout(() => {
        onConfirmSelection(p1Char, p1Color, p2Char, p2Color);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [p1Locked, p2Locked, p1Char, p1Color, p2Char, p2Color, onConfirmSelection]);

  // If in Arcade mode, auto-lock P2 CPU
  useEffect(() => {
    if (mode === 'ARCADE' && p1Locked && !p2Locked) {
      const available = CHARACTERS.filter((c) => !c.isLocked);
      const randomCpu = available[Math.floor(Math.random() * available.length)];
      const cpuIndex = CHARACTERS.findIndex((c) => c.id === randomCpu.id);
      setP2Index(cpuIndex >= 0 ? cpuIndex : 1);
      setP2Color(randomCpu.colors[0]);
      setP2Locked(true);
    }
  }, [mode, p1Locked, p2Locked]);

  const handleSelectSlot = (index: number, player: 1 | 2) => {
    if (CHARACTERS[index].isLocked) return;
    soundSystem.playMenuMove();

    if (player === 1 && !p1Locked) {
      setP1Index(index);
      setSelectingColorFor(1);
    } else if (player === 2 && !p2Locked) {
      setP2Index(index);
      setSelectingColorFor(2);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#0a0505] text-[#fff2e0] overflow-hidden select-none font-oswald">
      {/* Background Shared Atmosphere */}
      <div className="bg" />
      <div className="grain" />
      <div className="vignette" />

      {/* Back button & Roster Tag */}
      <div
        className="cs-back"
        onClick={() => {
          soundSystem.playMenuCancel();
          onBack();
        }}
      >
        ← VOLVER AL MENÚ
      </div>

      <div className="cs-roster-tag">
        <div className="r1">ROSTER V1.0 · 8 SLOTS</div>
        <div className="r2">CHALLENGER SELECT</div>
      </div>

      {/* Header */}
      <div className="cs-header">
        <div className="cs-title">SELECCIÓN DE LUCHADOR</div>
        <div className="cs-sub">
          {mode === 'ARCADE'
            ? 'MODO 1P VS CPU · ARCADE MATCH'
            : 'MODO 2P VERSUS · LOCAL DUAL INPUT'}
        </div>
      </div>

      {/* Body: 3-column chassis matching reference visual */}
      <div className="cs-body">
        {/* PANEL 1P (LEFT) */}
        <div className="cs-panel p1">
          <div className="cs-panel-head">
            <span>{p1Locked ? '1P ✓ CONFIRMADO' : '1P SELECCIONANDO'}</span>
            <span>WASD + F</span>
          </div>

          <div className="cs-portrait-box">
            <FighterAvatarSvg
              id="p1_portrait"
              character={p1Char}
              colorVariant={p1Color}
              width={150}
              height={215}
            />
          </div>

          <div className="cs-fname">{p1Char.name}</div>
          <div className="cs-ftitle">{p1Char.nickname}</div>
          <div className="cs-fdesc">{p1Char.description}</div>

          <div className="cs-stats">
            <div className="cs-stat-row">
              <div className="cs-stat-name">FUERZA</div>
              <div className="cs-stat-bar">
                <div
                  className="cs-stat-fill"
                  style={{ width: `${(p1Char.stats.strength / 10) * 100}%` }}
                />
              </div>
              <div className="cs-stat-val">{p1Char.stats.strength}</div>
            </div>

            <div className="cs-stat-row">
              <div className="cs-stat-name">VELOCIDAD</div>
              <div className="cs-stat-bar">
                <div
                  className="cs-stat-fill"
                  style={{ width: `${(p1Char.stats.speed / 10) * 100}%` }}
                />
              </div>
              <div className="cs-stat-val">{p1Char.stats.speed}</div>
            </div>

            <div className="cs-stat-row">
              <div className="cs-stat-name">DEFENSA</div>
              <div className="cs-stat-bar">
                <div
                  className="cs-stat-fill"
                  style={{ width: `${(p1Char.stats.defense / 10) * 100}%` }}
                />
              </div>
              <div className="cs-stat-val">{p1Char.stats.defense}</div>
            </div>

            <div className="cs-stat-row">
              <div className="cs-stat-name">ALCANCE</div>
              <div className="cs-stat-bar">
                <div
                  className="cs-stat-fill"
                  style={{ width: `${(p1Char.stats.reach / 10) * 100}%` }}
                />
              </div>
              <div className="cs-stat-val">{p1Char.stats.reach}</div>
            </div>

            <div className="cs-stat-row">
              <div className="cs-stat-name">TÉCNICA</div>
              <div className="cs-stat-bar">
                <div
                  className="cs-stat-fill"
                  style={{ width: `${(p1Char.stats.technique / 10) * 100}%` }}
                />
              </div>
              <div className="cs-stat-val">{p1Char.stats.technique}</div>
            </div>
          </div>

          <div
            className="cs-cta"
            onClick={() => {
              if (!p1Locked) {
                soundSystem.playMenuSelect();
                setSelectingColorFor(1);
              }
            }}
          >
            {p1Locked ? '✓ LISTO PARA EL COMBATE' : 'ELEGIR COLOR (1P) ▶'}
          </div>
        </div>

        {/* CENTER 4x2 GRID */}
        <div className="cs-grid-wrap">
          <div className="cs-grid-label">
            <span>P1: SELECCIONA CASILLA</span>
            <span>P2: SELECCIONA CASILLA</span>
          </div>

          <div className="cs-grid">
            {CHARACTERS.map((char, index) => {
              const isP1Here = p1Index === index;
              const isP2Here = p2Index === index;
              const isLocked = char.isLocked;

              if (isLocked) {
                return (
                  <div key={char.id} className="cs-slot locked">
                    <span>?</span>
                  </div>
                );
              }

              return (
                <div
                  key={char.id}
                  onClick={() => {
                    if (!p1Locked) handleSelectSlot(index, 1);
                    else if (!p2Locked) handleSelectSlot(index, 2);
                  }}
                  className={`cs-slot ${isP1Here ? 'cur1' : ''} ${isP2Here ? 'cur2' : ''}`}
                >
                  {isP1Here && <span className="tagp t1">1P</span>}
                  {isP2Here && <span className="tagp t2">2P</span>}
                  <FighterAvatarSvg
                    id={`mini_${char.id}_${index}`}
                    character={char}
                    width={60}
                    height={86}
                  />
                </div>
              );
            })}
          </div>

          <div className="cs-legend">
            <span>
              <b>P1:</b> W/A/S/D · F
            </span>
            <span>
              <b className="b2">P2:</b> FLECHAS · K
            </span>
          </div>
        </div>

        {/* PANEL 2P (RIGHT) */}
        <div className="cs-panel p2">
          <div className="cs-panel-head">
            <span>{p2Locked ? '2P ✓ CONFIRMADO' : '2P SELECCIONANDO'}</span>
            <span>FLECHAS + K</span>
          </div>

          <div className="cs-portrait-box">
            <FighterAvatarSvg
              id="p2_portrait"
              character={p2Char}
              colorVariant={p2Color}
              width={150}
              height={215}
            />
          </div>

          <div className="cs-fname">{p2Char.name}</div>
          <div className="cs-ftitle">{p2Char.nickname}</div>
          <div className="cs-fdesc">{p2Char.description}</div>

          <div className="cs-stats">
            <div className="cs-stat-row">
              <div className="cs-stat-name">FUERZA</div>
              <div className="cs-stat-bar">
                <div
                  className="cs-stat-fill"
                  style={{ width: `${(p2Char.stats.strength / 10) * 100}%` }}
                />
              </div>
              <div className="cs-stat-val">{p2Char.stats.strength}</div>
            </div>

            <div className="cs-stat-row">
              <div className="cs-stat-name">VELOCIDAD</div>
              <div className="cs-stat-bar">
                <div
                  className="cs-stat-fill"
                  style={{ width: `${(p2Char.stats.speed / 10) * 100}%` }}
                />
              </div>
              <div className="cs-stat-val">{p2Char.stats.speed}</div>
            </div>

            <div className="cs-stat-row">
              <div className="cs-stat-name">DEFENSA</div>
              <div className="cs-stat-bar">
                <div
                  className="cs-stat-fill"
                  style={{ width: `${(p2Char.stats.defense / 10) * 100}%` }}
                />
              </div>
              <div className="cs-stat-val">{p2Char.stats.defense}</div>
            </div>

            <div className="cs-stat-row">
              <div className="cs-stat-name">ALCANCE</div>
              <div className="cs-stat-bar">
                <div
                  className="cs-stat-fill"
                  style={{ width: `${(p2Char.stats.reach / 10) * 100}%` }}
                />
              </div>
              <div className="cs-stat-val">{p2Char.stats.reach}</div>
            </div>

            <div className="cs-stat-row">
              <div className="cs-stat-name">TÉCNICA</div>
              <div className="cs-stat-bar">
                <div
                  className="cs-stat-fill"
                  style={{ width: `${(p2Char.stats.technique / 10) * 100}%` }}
                />
              </div>
              <div className="cs-stat-val">{p2Char.stats.technique}</div>
            </div>
          </div>

          <div
            className="cs-cta"
            onClick={() => {
              if (!p2Locked) {
                soundSystem.playMenuSelect();
                setSelectingColorFor(2);
              }
            }}
          >
            {p2Locked ? '✓ LISTO PARA EL COMBATE' : 'ELEGIR COLOR (2P) ▶'}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="cs-footer">AMBOS JUGADORES DEBEN CONFIRMAR PARA INICIAR</div>

      {/* METAL BORDER & CORNER BRACKETS */}
      <div className="metal-border" />
      <div className="corner tl" />
      <div className="corner tr" />
      <div className="corner bl" />
      <div className="corner br" />

      {/* VARIANT SELECT MODAL */}
      {selectingColorFor !== null && (
        <VariantSelectModal
          playerNumber={selectingColorFor}
          character={selectingColorFor === 1 ? p1Char : p2Char}
          selectedColor={selectingColorFor === 1 ? p1Color : p2Color}
          onSelectColor={(color) => {
            if (selectingColorFor === 1) {
              setP1Color(color);
            } else {
              setP2Color(color);
            }
          }}
          onConfirm={() => {
            if (selectingColorFor === 1) {
              setP1Locked(true);
            } else {
              setP2Locked(true);
            }
            setSelectingColorFor(null);
          }}
        />
      )}
    </div>
  );
};
