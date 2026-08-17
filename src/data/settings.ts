import { GameSettings } from '../types';

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.7,
  sfxVolume: 0.85,
  roundCount: 3, // Best of 3 (first to 2)
  roundTimerSeconds: 99,
  screenShake: true,
  crtScanlines: true,
  showHitboxes: false,
  aiDifficulty: 'NORMAL',
};
