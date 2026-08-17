import { PlayerControls } from '../types';

export const DEFAULT_P1_CONTROLS: PlayerControls = {
  up: ['KeyW'],
  down: ['KeyS'],
  left: ['KeyA'],
  right: ['KeyD'],
  punch: ['KeyF'],
  kick: ['KeyG'],
  special: ['KeyH'],
  pause: ['Escape'],
};

export const DEFAULT_P2_CONTROLS: PlayerControls = {
  up: ['ArrowUp'],
  down: ['ArrowDown'],
  left: ['ArrowLeft'],
  right: ['ArrowRight'],
  punch: ['KeyK', 'Numpad4'],
  kick: ['KeyL', 'Numpad5'],
  special: ['Semicolon', 'Quote', 'KeyP', 'Numpad6', 'Slash'],
  pause: ['Escape'],
};
