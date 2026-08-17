export type GameScreen = 
  | 'MAIN_MENU'
  | 'CHARACTER_SELECT'
  | 'STAGE_SELECT'
  | 'FIGHT'
  | 'VICTORY'
  | 'OPTIONS'
  | 'CONTROLS'
  | 'CREDITS';

export type GameMode = 'VERSUS' | 'ARCADE' | 'TRAINING';

export type FighterState = 
  | 'idle'
  | 'walk'
  | 'walk_back'
  | 'run'
  | 'jump'
  | 'fall'
  | 'crouch'
  | 'punch'
  | 'punch_medium'
  | 'punch_heavy'
  | 'kick'
  | 'kick_medium'
  | 'kick_heavy'
  | 'special'
  | 'hit'
  | 'hit_heavy'
  | 'block'
  | 'knockdown'
  | 'getup'
  | 'victory'
  | 'defeat'
  | 'intro';

export type FighterActionAnimation =
  | 'IDLE'
  | 'WALK_FORWARD'
  | 'WALK_BACKWARD'
  | 'CROUCH'
  | 'JUMP_START'
  | 'JUMP'
  | 'JUMP_FALL'
  | 'LIGHT_PUNCH'
  | 'MEDIUM_PUNCH'
  | 'HEAVY_PUNCH'
  | 'LIGHT_KICK'
  | 'MEDIUM_KICK'
  | 'HEAVY_KICK'
  | 'SPECIAL'
  | 'HIT_LIGHT'
  | 'HIT_HEAVY'
  | 'BLOCK'
  | 'KNOCKDOWN'
  | 'GET_UP'
  | 'VICTORY'
  | 'DEFEAT'
  | 'INTRO';

export interface BoxRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameCollisionBoxes {
  frameIndex: number;
  hitbox?: BoxRect | null;
  hurtbox?: BoxRect;
  pushbox?: BoxRect;
}

export interface AnimationTrackConfig {
  folderName: string; // e.g. 'idle', 'light-punch', 'walk'
  frameCount: number; // e.g. 5 for 01.png to 05.png
  frameRate?: number; // default 10 or 12 fps
  loop?: boolean;
  startFrame?: number; // 1
  endFrame?: number;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  customFrames?: string[]; // e.g. ['01.png', '02.png']
  frameBoxes?: FrameCollisionBoxes[];
}

export interface CharacterSpriteConfig {
  characterFolder: string; // e.g. 'el-paja' or 'dj-scratch'
  baseScale: number; // 1.0 default
  offsetX: number;
  offsetY: number;
  pivotX: number; // 0.5 center
  pivotY: number; // 1.0 feet
  animations: Partial<Record<FighterActionAnimation, AnimationTrackConfig>>;
}

export interface AttackDefinition {
  id: string;
  name: string;
  type: 'punch_light' | 'punch_medium' | 'punch_heavy' | 'kick_light' | 'kick_medium' | 'kick_heavy' | 'special_proj' | 'special_uppercut' | 'special_super';
  animationAction?: FighterActionAnimation;
  damage: number;
  chipDamage: number;
  startupFrames: number;
  activeFrames: number;
  recoveryFrames: number;
  hitstunFrames: number;
  blockstunFrames: number;
  knockback: { x: number; y: number };
  hitbox: BoxRect;
  hurtboxOverride?: BoxRect;
  sound: 'punch_light' | 'punch_heavy' | 'kick_light' | 'kick_heavy' | 'special' | 'whoosh' | 'block' | 'hit';
  screenShake?: { intensity: number; duration: number };
  particles?: { count: number; type: 'spark' | 'ring' | 'star'; color?: string };
  isProjectile?: boolean;
  projectileSpeed?: number;
  projectileRadius?: number;
  isCrouching?: boolean;
  isAerial?: boolean;
  frameHitboxes?: FrameCollisionBoxes[];
}

export interface ColorVariant {
  id: string;
  name: string;
  variantFolder?: string; // e.g. 'default', 'green', 'crimson'
  primaryColor: string;
  secondaryColor: string;
  hairColor: string;
  skinColor: string;
  pantColor: string;
  accentColor: string;
}

export interface FighterStats {
  strength: number; // 0 - 10
  speed: number;    // 0 - 10
  defense: number;  // 0 - 10
  reach: number;    // 0 - 10
  technique: number;// 0 - 10
}

export interface CharacterData {
  id: string;
  name: string;
  nickname: string;
  archetype?: string; // e.g. 'Brawler Sónico', 'Agile DJ', 'Heavy Rhythm'
  tagline: string;
  description: string;
  stats: FighterStats;
  colors: ColorVariant[];
  attacks: AttackDefinition[];
  spriteConfig?: CharacterSpriteConfig;
  portraitBg: string;
  portraitImage?: string;
  isLocked?: boolean;
}

export interface StageLayer {
  speed: number;
  type: 'sky' | 'buildings' | 'lights' | 'crowd' | 'foreground' | 'ambient';
  color: string;
  imagePath?: string;
  opacity?: number;
}

export interface StageData {
  id: string;
  name: string;
  location: string;
  description: string;
  previewColor: string;
  groundY: number; // pixel distance from bottom of screen
  width: number;
  height: number;
  cameraBounds?: { minX: number; maxX: number };
  theme: {
    skyColor: string;
    groundColor: string;
    ambientColor: string;
    accentColor: string;
  };
  parallaxLayers: StageLayer[];
}

export interface PlayerControls {
  up: string[];
  down: string[];
  left: string[];
  right: string[];
  punch: string[];
  punchMedium?: string[];
  punchHeavy?: string[];
  kick: string[];
  kickMedium?: string[];
  kickHeavy?: string[];
  special: string[];
  pause?: string[];
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  punch: boolean;
  kick: boolean;
  special: boolean;
}

export interface Projectile {
  id: string;
  ownerId: number; // 1 or 2
  x: number;
  y: number;
  vx: number;
  radius: number;
  damage: number;
  color: string;
  active: boolean;
  life: number;
}

export interface HitParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  shape: 'spark' | 'ring' | 'smoke' | 'star';
}

export interface RoundState {
  currentRound: number;
  p1RoundsWon: number;
  p2RoundsWon: number;
  timer: number;
  phase: 'INTRO' | 'COUNTDOWN' | 'FIGHT' | 'ROUND_OVER' | 'MATCH_OVER';
  phaseTimer: number;
  announcementText: string;
  announcementSubtext: string;
  winner: number | null; // 1, 2, or null
}

export interface MatchResult {
  winnerPlayer: 1 | 2;
  p1Character: CharacterData;
  p2Character: CharacterData;
  p1Color: ColorVariant;
  p2Color: ColorVariant;
  p1Rounds: number;
  p2Rounds: number;
  totalTimeSeconds: number;
  maxComboP1: number;
  maxComboP2: number;
  stage: StageData;
}

export interface GameSettings {
  musicVolume: number; // 0 - 1
  sfxVolume: number;   // 0 - 1
  roundCount: 1 | 2 | 3; // best of (3 = first to 2)
  roundTimerSeconds: 60 | 99 | 999;
  screenShake: boolean;
  crtScanlines: boolean;
  showHitboxes: boolean;
  aiDifficulty: 'EASY' | 'NORMAL' | 'HARD';
}
