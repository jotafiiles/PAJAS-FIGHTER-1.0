import React, { useState } from 'react';
import { CHARACTERS } from './data/characters';
import { DEFAULT_SETTINGS } from './data/settings';
import { STAGES } from './data/stages';
import {
  CharacterData,
  ColorVariant,
  GameMode,
  GameScreen,
  GameSettings,
  MatchResult,
  StageData,
} from './types';
import { MainMenu } from './screens/MainMenu';
import { CharacterSelect } from './screens/CharacterSelect';
import { StageSelect } from './screens/StageSelect';
import { FightScreen } from './screens/FightScreen';
import { VictoryScreen } from './screens/VictoryScreen';
import { OptionsScreen } from './screens/OptionsScreen';
import { ControlsModal } from './screens/ControlsModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('MAIN_MENU');
  const [gameMode, setGameMode] = useState<GameMode>('VERSUS');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  // Selected Match Configuration
  const [p1Character, setP1Character] = useState<CharacterData>(CHARACTERS[0]);
  const [p1Color, setP1Color] = useState<ColorVariant>(CHARACTERS[0].colors[0]);

  const [p2Character, setP2Character] = useState<CharacterData>(CHARACTERS[1] || CHARACTERS[0]);
  const [p2Color, setP2Color] = useState<ColorVariant>(
    CHARACTERS[1]?.colors[0] || CHARACTERS[0].colors[1]
  );

  const [selectedStage, setSelectedStage] = useState<StageData>(STAGES[0]);
  const [lastMatchResult, setLastMatchResult] = useState<MatchResult | null>(null);

  // Modals
  const [showControlsModal, setShowControlsModal] = useState<boolean>(false);

  // Handlers
  const handleSelectMode = (mode: GameMode) => {
    setGameMode(mode);
    setCurrentScreen('CHARACTER_SELECT');
  };

  const handleConfirmCharacters = (
    p1Char: CharacterData,
    p1Clr: ColorVariant,
    p2Char: CharacterData,
    p2Clr: ColorVariant
  ) => {
    setP1Character(p1Char);
    setP1Color(p1Clr);
    setP2Character(p2Char);
    setP2Color(p2Clr);
    setCurrentScreen('STAGE_SELECT');
  };

  const handleConfirmStage = (stage: StageData) => {
    setSelectedStage(stage);
    setCurrentScreen('FIGHT');
  };

  const handleMatchEnd = (result: MatchResult) => {
    setLastMatchResult(result);
    setCurrentScreen('VICTORY');
  };

  const handleRematch = () => {
    setCurrentScreen('FIGHT');
  };

  return (
    <div className="relative w-full min-h-screen bg-[#08070d] text-slate-100 font-tech">
      {/* 1. MAIN MENU */}
      {currentScreen === 'MAIN_MENU' && (
        <MainMenu
          onSelectMode={handleSelectMode}
          onOpenOptions={() => setCurrentScreen('OPTIONS')}
          onOpenControls={() => setShowControlsModal(true)}
        />
      )}

      {/* 2. CHARACTER SELECT */}
      {currentScreen === 'CHARACTER_SELECT' && (
        <CharacterSelect
          mode={gameMode}
          onConfirmSelection={handleConfirmCharacters}
          onBack={() => setCurrentScreen('MAIN_MENU')}
        />
      )}

      {/* 3. STAGE SELECT */}
      {currentScreen === 'STAGE_SELECT' && (
        <StageSelect
          p1Char={p1Character}
          p1Color={p1Color}
          p2Char={p2Character}
          p2Color={p2Color}
          onConfirmStage={handleConfirmStage}
          onBack={() => setCurrentScreen('CHARACTER_SELECT')}
        />
      )}

      {/* 4. FIGHT SCREEN */}
      {currentScreen === 'FIGHT' && (
        <FightScreen
          mode={gameMode}
          p1Char={p1Character}
          p1Color={p1Color}
          p2Char={p2Character}
          p2Color={p2Color}
          stage={selectedStage}
          settings={settings}
          onMatchEnd={handleMatchEnd}
          onExitToMenu={() => setCurrentScreen('MAIN_MENU')}
        />
      )}

      {/* 5. VICTORY SCREEN */}
      {currentScreen === 'VICTORY' && lastMatchResult && (
        <VictoryScreen
          result={lastMatchResult}
          onRematch={handleRematch}
          onChangeCharacters={() => setCurrentScreen('CHARACTER_SELECT')}
          onChangeStage={() => setCurrentScreen('STAGE_SELECT')}
          onMainMenu={() => setCurrentScreen('MAIN_MENU')}
        />
      )}

      {/* 6. OPTIONS SCREEN */}
      {currentScreen === 'OPTIONS' && (
        <OptionsScreen
          settings={settings}
          onUpdateSettings={setSettings}
          onBack={() => setCurrentScreen('MAIN_MENU')}
        />
      )}

      {/* CONTROLS MODAL */}
      {showControlsModal && (
        <ControlsModal onClose={() => setShowControlsModal(false)} />
      )}
    </div>
  );
}
