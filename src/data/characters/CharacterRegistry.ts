import { CharacterData } from '../../types';
import { QUE_PAJA_V1 } from './quePajaV1';
import { EL_PAJA } from './elPaja';
import { DJ_SCRATCH } from './djScratch';
import { BBOY_CUMBIA } from './bboyCumbia';
import { ROCKER_PUNK } from './rockerPunk';
import { LOCKED_ROSTER_PLACEHOLDERS } from './secretBoss';

/**
 * Universal Data-Driven Plug-and-Play Character Registry for PAJAS FIGHTER.
 * 
 * Characters are fully discoverable and loadable without hardcoding.
 * Adding a folder into `public/assets/characters/` with its `character.json`
 * automatically registers the fighter into the game roster.
 */
class CharacterRegistryService {
  private characters: Map<string, CharacterData> = new Map();
  private isLoaded: boolean = false;

  constructor() {
    this.registerDefaults();
    this.autoDiscoverFromGlob();
    this.loadFromManifest();
  }

  /**
   * Registers default baseline roster (ensures zero-latency synchronous boot).
   */
  private registerDefaults() {
    const defaultRoster: CharacterData[] = [
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
   * Auto-discovers all character.json files inside public/assets/characters/
   * at build/bundling time via Vite eager glob.
   */
  private autoDiscoverFromGlob() {
    try {
      // Vite supports import.meta.glob for compile-time and runtime auto-discovery
      const jsonGlob = (import.meta as unknown as {
        glob: (pattern: string, options?: { eager?: boolean }) => Record<string, { default?: CharacterData } | CharacterData>;
      }).glob;

      if (typeof jsonGlob === 'function') {
        const modules = jsonGlob('/public/assets/characters/*/character.json', { eager: true });
        for (const [filePath, mod] of Object.entries(modules)) {
          // Ignore template folder in roster
          if (filePath.includes('_character-template')) continue;

          const data = (mod && 'default' in mod ? mod.default : mod) as CharacterData;
          if (data && data.id && !data.id.includes('template')) {
            this.register(data);
          }
        }
      }
    } catch {
      // Fallback to registered defaults
    }
  }

  /**
   * Loads or updates characters asynchronously at runtime from characters.manifest.json.
   */
  public async loadFromManifest(): Promise<CharacterData[]> {
    try {
      const metaEnv = (import.meta as unknown as { env?: { BASE_URL?: string } }).env;
      const base = metaEnv?.BASE_URL || './';
      const baseUrl = base.endsWith('/') ? base : `${base}/`;

      const manifestRes = await fetch(`${baseUrl}assets/characters/characters.manifest.json`);
      if (manifestRes.ok) {
        const manifest = (await manifestRes.json()) as { characters: string[] };
        if (manifest && Array.isArray(manifest.characters)) {
          for (const folder of manifest.characters) {
            if (folder.startsWith('_')) continue;
            try {
              const charRes = await fetch(`${baseUrl}assets/characters/${folder}/character.json`);
              if (charRes.ok) {
                const charData = (await charRes.json()) as CharacterData;
                if (charData && charData.id) {
                  this.register(charData);
                }
              }
            } catch {
              // Ignore network error for individual file, keep existing
            }
          }
        }
      }
    } catch {
      // Offline / synchronous mode
    }

    this.isLoaded = true;
    return this.getAll();
  }

  /**
   * Registers a character into the game.
   */
  public register(character: CharacterData) {
    if (!character || !character.id) return;
    this.characters.set(character.id, character);
  }

  /**
   * Retrieves a character by ID.
   */
  public get(id: string): CharacterData | undefined {
    return this.characters.get(id);
  }

  /**
   * Retrieves all characters (including locked placeholders).
   */
  public getAll(): CharacterData[] {
    return Array.from(this.characters.values());
  }

  /**
   * Retrieves all playable (unlocked) fighters.
   */
  public getPlayable(): CharacterData[] {
    return this.getAll().filter((c) => !c.isLocked);
  }
}

export const CharacterRegistry = new CharacterRegistryService();
