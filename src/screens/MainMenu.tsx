import React, { useEffect, useState } from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { GameMode } from '../types';
import { Volume2, VolumeX } from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import { FighterAvatarSvg } from '../components/FighterAvatarSvg';

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

  const featuredChar = CHARACTERS[0]; // EL PAJA

  useEffect(() => {
    soundSystem.startMusic('MENU');
  }, []);

  // Keyboard navigation for main menu (W/S or Up/Down + Enter/Space)
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
    <div className="relative w-screen h-screen bg-[#0a0505] text-white overflow-hidden select-none flex flex-col justify-between font-oswald">
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
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">QP</div>
          <div className="brand-text">
            <div className="t1">QUE PAJA RECORDS</div>
            <div className="t2">ARCADE FIGHTER · ORIGINAL ENGINE</div>
          </div>
        </div>
        <div className="topright">
          <div>
            CREDITS: <b>FREE PLAY</b>
          </div>
          <button
            onClick={handleToggleMute}
            className="flex items-center gap-1.5 hover:text-white transition uppercase cursor-pointer"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-red-500" />
                <span className="text-red-400 font-bold">AUDIO OFF</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#ff8a2a]" />
                <b>AUDIO ON</b>
              </>
            )}
          </button>
        </div>
      </div>

      {/* TITLE BLOCK */}
      <div className="titleblock">
        <span className="pretitle">QUE PAJA RECORDS PRESENTA</span>
        <div className="maintitle">
          PAJAS <span className="accent">FIGHTER</span>
        </div>
      </div>

      {/* MAIN: MENU & SPOTLIGHT */}
      <div className="main-menu-layout">
        <div className="menu">
          {/* 1. MODO VERSUS */}
          <div
            className={`menu-item ${selectedItemIndex === 0 ? 'active' : ''}`}
            onClick={() => handleStartMode('VERSUS')}
            onMouseEnter={() => {
              soundSystem.playMenuMove();
              setSelectedItemIndex(0);
            }}
          >
            <div>
              <div className="label">MODO VERSUS</div>
              <div className="sub">2 JUGADORES · MISMO TECLADO</div>
            </div>
            <div className="arrow">▶</div>
          </div>

          {/* 2. MODO ARCADE */}
          <div
            className={`menu-item ${selectedItemIndex === 1 ? 'active' : ''}`}
            onClick={() => handleStartMode('ARCADE')}
            onMouseEnter={() => {
              soundSystem.playMenuMove();
              setSelectedItemIndex(1);
            }}
          >
            <div>
              <div className="label">MODO ARCADE</div>
              <div className="sub">1 JUGADOR VS CPU</div>
            </div>
            <div className="arrow">▶</div>
          </div>

          {/* 3. MODO PRÁCTICA */}
          <div
            className={`menu-item ${selectedItemIndex === 2 ? 'active' : ''}`}
            onClick={() => handleStartMode('TRAINING')}
            onMouseEnter={() => {
              soundSystem.playMenuMove();
              setSelectedItemIndex(2);
            }}
          >
            <div>
              <div className="label">MODO PRÁCTICA</div>
              <div className="sub">ENTRENAMIENTO LIBRE</div>
            </div>
            <div className="arrow">▶</div>
          </div>

          {/* 4. CONTROLES */}
          <div
            className={`menu-item ${selectedItemIndex === 3 ? 'active' : ''}`}
            onClick={() => {
              soundSystem.playMenuMove();
              onOpenControls();
            }}
            onMouseEnter={() => {
              soundSystem.playMenuMove();
              setSelectedItemIndex(3);
            }}
          >
            <div>
              <div className="label">CONTROLES</div>
              <div className="sub">WASD + FLECHAS</div>
            </div>
            <div className="arrow">▶</div>
          </div>

          {/* 5. OPCIONES */}
          <div
            className={`menu-item ${selectedItemIndex === 4 ? 'active' : ''}`}
            onClick={() => {
              soundSystem.playMenuMove();
              onOpenOptions();
            }}
            onMouseEnter={() => {
              soundSystem.playMenuMove();
              setSelectedItemIndex(4);
            }}
          >
            <div>
              <div className="label">OPCIONES</div>
              <div className="sub">AUDIO · HITBOXES</div>
            </div>
            <div className="arrow">▶</div>
          </div>
        </div>

        {/* SPOTLIGHT */}
        <div className="spotlight">
          <div className="fighter-pedestal" style={{ alignItems: 'flex-end' }}>
            <FighterAvatarSvg
              id="menu_showcase"
              character={featuredChar}
              width={230}
              height={330}
              className="drop-shadow-[0_15px_25px_rgba(0,0,0,0.85)]"
            />
          </div>
          <div className="spot-frame">
            <div className="tag">SPECIAL MOVE — RANK S</div>
            <div className="move">ONDA DE VINILO SÓNICA</div>
            <div className="desc">
              Poder devastador capaz de romper la guardia rival a media distancia.
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div>© 2026 QUE PAJA RECORDS · PROTOTIPO ARCADE ORIGINAL</div>
        <div>
          <b>↑/↓</b> NAVEGAR &nbsp;&nbsp; <b>ENTER</b> SELECCIONAR
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
