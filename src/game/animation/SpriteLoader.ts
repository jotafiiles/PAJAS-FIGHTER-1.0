import {
  CharacterData,
  ColorVariant,
  FighterActionAnimation,
  AnimationTrackConfig,
} from '../../types';

export interface LoadedFrameSequence {
  frames: HTMLImageElement[];
  isReady: boolean;
  hasErrors: boolean;
  trackConfig: AnimationTrackConfig;
}

export class SpriteLoader {
  private static instance: SpriteLoader;
  private cache: Map<string, LoadedFrameSequence> = new Map();
  private failedPaths: Set<string> = new Set();
  private baseUrl: string;

  private constructor() {
    // Robust relative base URL resolution for Vite & GitHub Pages
    const metaEnv = (import.meta as unknown as { env?: { BASE_URL?: string } }).env;
    const base = metaEnv?.BASE_URL || './';
    this.baseUrl = base.endsWith('/') ? base : `${base}/`;
  }

  public static getInstance(): SpriteLoader {
    if (!SpriteLoader.instance) {
      SpriteLoader.instance = new SpriteLoader();
    }
    return SpriteLoader.instance;
  }

  /**
   * Generates a cache key for character, variant, and animation action.
   */
  private getCacheKey(
    characterId: string,
    variantId: string,
    action: FighterActionAnimation
  ): string {
    return `${characterId}:${variantId}:${action}`;
  }

  /**
   * Preloads an animation track for a character.
   */
  public preloadTrack(
    character: CharacterData,
    variant: ColorVariant,
    action: FighterActionAnimation
  ): LoadedFrameSequence {
    const key = this.getCacheKey(character.id, variant.id, action);
    const existing = this.cache.get(key);
    if (existing) return existing;

    const spriteConfig = character.spriteConfig;
    const animConfig: AnimationTrackConfig = spriteConfig?.animations?.[action] || {
      folderName: action.toLowerCase().replace('_', '-'),
      frameCount: 1,
      frameRate: 10,
      loop: true,
    };

    const charFolder = spriteConfig?.characterFolder || character.id.replace('_', '-');
    const variantFolder = variant.variantFolder || 'default';
    let folderName = animConfig.folderName || action.toLowerCase().replace('_', '-');
    
    // Normalize folder name to ensure it looks under sprites/ if not specified
    if (!folderName.startsWith('sprites/') && !folderName.startsWith('variants/')) {
      folderName = `sprites/${folderName}`;
    }

    const sequence: LoadedFrameSequence = {
      frames: [],
      isReady: false,
      hasErrors: false,
      trackConfig: animConfig,
    };

    this.cache.set(key, sequence);

    // Frame sequence files e.g. 01.png, 02.png or customFrames
    const frameCount = animConfig.frameCount || 1;
    let loadedCount = 0;
    let errorCount = 0;

    for (let i = 1; i <= frameCount; i++) {
      const padNum = i < 10 ? `0${i}` : `${i}`;
      const frameFileName = animConfig.customFrames?.[i - 1] || `${padNum}.png`;

      // Path supports variant-specific overrides or standard character sprites
      const url = `${this.baseUrl}assets/characters/${charFolder}/${folderName}/${frameFileName}`;
      
      const img = new Image();
      img.src = url;

      img.onload = () => {
        loadedCount++;
        if (loadedCount + errorCount >= frameCount) {
          sequence.isReady = loadedCount === frameCount;
        }
      };

      img.onerror = () => {
        errorCount++;
        this.failedPaths.add(url);
        if (loadedCount + errorCount >= frameCount) {
          sequence.hasErrors = true;
          sequence.isReady = loadedCount === frameCount; // only ready if all frames exist
        }
      };

      sequence.frames.push(img);
    }

    return sequence;
  }

  /**
   * Retrieves the current frame image for an action, or null if no valid image is loaded.
   */
  public getFrameImage(
    character: CharacterData,
    variant: ColorVariant,
    action: FighterActionAnimation,
    animTime: number
  ): {
    image: HTMLImageElement;
    frameIndex: number;
    trackConfig: AnimationTrackConfig;
    scale: number;
    offsetX: number;
    offsetY: number;
  } | null {
    const key = this.getCacheKey(character.id, variant.id, action);
    let seq = this.cache.get(key);

    if (!seq) {
      seq = this.preloadTrack(character, variant, action);
    }

    if (!seq || !seq.isReady || seq.frames.length === 0) {
      return null;
    }

    const fps = seq.trackConfig.frameRate || 10;
    const totalFrames = seq.frames.length;
    let frameIndex: number;

    if (seq.trackConfig.loop !== false) {
      frameIndex = Math.floor(animTime * fps) % totalFrames;
    } else {
      frameIndex = Math.min(Math.floor(animTime * fps), totalFrames - 1);
    }

    const img = seq.frames[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      return null;
    }

    const baseScale = character.spriteConfig?.baseScale || 1.0;
    const trackScale = seq.trackConfig.scale || 1.0;
    const offsetX = (character.spriteConfig?.offsetX || 0) + (seq.trackConfig.offsetX || 0);
    const offsetY = (character.spriteConfig?.offsetY || 0) + (seq.trackConfig.offsetY || 0);

    return {
      image: img,
      frameIndex,
      trackConfig: seq.trackConfig,
      scale: baseScale * trackScale,
      offsetX,
      offsetY,
    };
  }

  /**
   * Preloads all main animations for a character and variant.
   */
  public preloadCharacter(character: CharacterData, variant: ColorVariant) {
    const actions: FighterActionAnimation[] = [
      'IDLE',
      'WALK_FORWARD',
      'WALK_BACKWARD',
      'CROUCH',
      'JUMP',
      'LIGHT_PUNCH',
      'HEAVY_PUNCH',
      'LIGHT_KICK',
      'HEAVY_KICK',
      'SPECIAL',
      'HIT_LIGHT',
      'BLOCK',
      'KNOCKDOWN',
      'GET_UP',
      'VICTORY',
      'DEFEAT',
    ];

    actions.forEach(action => {
      this.preloadTrack(character, variant, action);
    });
  }
}
