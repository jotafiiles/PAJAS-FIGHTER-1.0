import React, { useState, useEffect } from 'react';
import { soundSystem } from '../audio/SoundSystem';
import { STAGES } from '../data/stages';
import { CharacterData, ColorVariant, StageData } from '../types';

interface StageSelectProps {
  p1Char: CharacterData;
  p1Color: ColorVariant;
  p2Char: CharacterData;
  p2Color: ColorVariant;
  onConfirmStage: (stage: StageData) => void;
  onBack: () => void;
}

export const StageSelect: React.FC<StageSelectProps> = ({
  p1Char,
  p1Color,
  p2Char,
  p2Color,
  onConfirmStage,
  onBack,
}) => {
  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(0);
  const currentStage = STAGES[selectedStageIndex] || STAGES[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        soundSystem.playMenuMove();
        setSelectedStageIndex((prev) => (prev + 1) % STAGES.length);
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        soundSystem.playMenuMove();
        setSelectedStageIndex((prev) => (prev - 1 + STAGES.length) % STAGES.length);
      } else if (
        e.code === 'Enter' ||
        e.code === 'Space' ||
        e.code === 'KeyF' ||
        e.code === 'KeyK'
      ) {
        soundSystem.playFightBell();
        onConfirmStage(currentStage);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStage, onConfirmStage]);

  return (
    <div className="relative w-screen h-screen bg-[#0a0505] text-[#fff2e0] overflow-hidden select-none font-oswald flex flex-col justify-between">
      {/* Background Shared Atmosphere */}
      <div className="bg" />
      <div className="silhouette">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none">
          <polygon
            points="0,400 0,280 80,220 160,290 240,200 320,280 400,180 480,270 560,210 640,280 720,190 800,270 880,220 960,280 1000,260 1000,400"
            fill="#000"
          />
        </svg>
      </div>
      <div className="grain" />
      <div className="vignette" />

      {/* Back button */}
      <div
        className="cs-back"
        onClick={() => {
          soundSystem.playMenuCancel();
          onBack();
        }}
      >
        ← VOLVER A LUCHADORES
      </div>

      {/* Header */}
      <div className="cs-header">
        <div className="cs-title">SELECCIÓN DE ESCENARIO</div>
        <div className="cs-sub">ELIGE EL CAMPO DE BATALLA</div>
      </div>

      {/* Navigation Arrows */}
      <div
        className="st-nav l"
        onClick={() => {
          soundSystem.playMenuMove();
          setSelectedStageIndex((prev) => (prev - 1 + STAGES.length) % STAGES.length);
        }}
      >
        ‹
      </div>
      <div
        className="st-nav r"
        onClick={() => {
          soundSystem.playMenuMove();
          setSelectedStageIndex((prev) => (prev + 1) % STAGES.length);
        }}
      >
        ›
      </div>

      {/* Main Stage Card */}
      <div className="st-card">
        <div className="st-loc">📍 {currentStage.location}</div>
        <div className="st-name">{currentStage.name}</div>
        <div className="st-desc">{currentStage.description}</div>
        <div
          className="st-cta"
          onClick={() => {
            soundSystem.playFightBell();
            onConfirmStage(currentStage);
          }}
        >
          ⚔ ¡INICIAR COMBATE!
        </div>
        <div className="st-dots">
          {STAGES.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => {
                soundSystem.playMenuMove();
                setSelectedStageIndex(idx);
              }}
              className={`st-dot ${selectedStageIndex === idx ? 'on' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div>© 2026 QUE PAJA RECORDS · PROTOTIPO ARCADE ORIGINAL</div>
        <div>
          <b>A/D · FLECHAS</b> NAVEGAR &nbsp;&nbsp; <b>ENTER</b> CONFIRMAR
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
