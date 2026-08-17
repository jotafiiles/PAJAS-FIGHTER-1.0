import { CharacterData } from '../../types';
import { QUE_PAJA_V1 } from './quePajaV1';
import { EL_PAJA } from './elPaja';
import { DJ_SCRATCH } from './djScratch';
import { BBOY_CUMBIA } from './bboyCumbia';
import { ROCKER_PUNK } from './rockerPunk';
import { LOCKED_ROSTER_PLACEHOLDERS } from './secretBoss';

/**
 * Global Registry for all PAJAS FIGHTER characters.
 * Data-Driven & Modular: Adding a character here makes it immediately
 * available to the Character Select screen, HUD, AI system, and Combat Engine.
 */
class CharacterRegistryService {
  private characters: Map<string, CharacterData> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    const defaultRoster = [
      QUE_PAJA_V1,
      EL_PAJA,
      DJ_SCRATCH,
      BBOY_CUMBIA,
      ROCKER_PUNK,
      ...LOCKED_ROSTER_PLACEHOLDERS,
    ];

    defaultRoster.forEach((char) => this.register(char));
  }

  /**
   * Registers a new character into the game.
   */
  public register(character: CharacterData) {
    if (!character || !character.id) {
      console.warn('[CharacterRegistry] Attempted to register invalid character', character);
      return;
    }
    this.characters.set(character.id, character);
  }

  /**
   * Retrieves a character by their unique ID.
   */
  public get(id: string): CharacterData | undefined {
    return this.characters.get(id);
  }

  /**
   * Gets all registered characters in the roster (including locked/secret fighters).
   */
  public getAll(): CharacterData[] {
    return Array.from(this.characters.values());
  }

  /**
   * Gets all playable (non-locked) fighters.
   */
  public getPlayable(): CharacterData[] {
    return this.getAll().filter((c) => !c.isLocked);
  }
}

export const CharacterRegistry = new CharacterRegistryService();
