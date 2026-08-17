import {
  AttackDefinition,
  CharacterData,
  ColorVariant,
  FighterActionAnimation,
  FighterState,
} from '../../types';
import { ProceduralSpriteRenderer } from './ProceduralSpriteRenderer';
import { SpriteLoader } from './SpriteLoader';

export class SpriteController {
  private character: CharacterData;
  private spriteLoader: SpriteLoader;

  constructor(character: CharacterData) {
    this.character = character;
    this.spriteLoader = SpriteLoader.getInstance();
  }

  public preloadVariant(variant: ColorVariant) {
    this.spriteLoader.preloadCharacter(this.character, variant);
  }

  /**
   * Maps current fighter state and attack to the corresponding FighterActionAnimation.
   */
  public getActionFromState(
    state: FighterState,
    vx: number,
    facing: number,
    currentAttack?: AttackDefinition | null
  ): FighterActionAnimation {
    if (currentAttack && currentAttack.animationAction) {
      return currentAttack.animationAction;
    }

    switch (state) {
      case 'idle':
        return 'IDLE';
      case 'walk':
      case 'walk_back':
        // If moving backwards relative to facing direction
        if ((vx > 0 && facing === -1) || (vx < 0 && facing === 1)) {
          return 'WALK_BACKWARD';
        }
        return 'WALK_FORWARD';
      case 'crouch':
        return 'CROUCH';
      case 'jump':
        return 'JUMP';
      case 'fall':
        return 'JUMP_FALL';
      case 'punch':
      case 'punch_medium':
        return 'LIGHT_PUNCH';
      case 'punch_heavy':
        return 'HEAVY_PUNCH';
      case 'kick':
      case 'kick_medium':
        return 'LIGHT_KICK';
      case 'kick_heavy':
        return 'HEAVY_KICK';
      case 'special':
        return 'SPECIAL';
      case 'hit':
        return 'HIT_LIGHT';
      case 'hit_heavy':
        return 'HIT_HEAVY';
      case 'block':
        return 'BLOCK';
      case 'knockdown':
        return 'KNOCKDOWN';
      case 'getup':
        return 'GET_UP';
      case 'victory':
        return 'VICTORY';
      case 'defeat':
        return 'DEFEAT';
      case 'intro':
        return 'INTRO';
      default:
        return 'IDLE';
    }
  }

  /**
   * Renders the fighter using loaded sprite frames if present; otherwise uses the procedural renderer.
   */
  public render(
    ctx: CanvasRenderingContext2D,
    state: FighterState,
    animTime: number,
    color: ColorVariant,
    facing: number,
    isHit: boolean,
    hitstop: boolean,
    vx: number = 0,
    currentAttack?: AttackDefinition | null
  ) {
    const action = this.getActionFromState(state, vx, facing, currentAttack);
    const spriteFrame = this.spriteLoader.getFrameImage(this.character, color, action, animTime);

    if (spriteFrame && spriteFrame.image) {
      const img = spriteFrame.image;
      const pivotX = this.character.spriteConfig?.pivotX ?? 0.5;
      const pivotY = this.character.spriteConfig?.pivotY ?? 1.0;
      const scale = spriteFrame.scale;

      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = -drawW * pivotX + spriteFrame.offsetX;
      const drawY = -drawH * pivotY + spriteFrame.offsetY;

      ctx.save();
      ctx.scale(facing, 1);

      if (isHit && Math.floor(animTime * 10) % 2 === 0) {
        ctx.filter = 'brightness(2.2) contrast(1.5)';
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
      return;
    }

    // High fidelity procedural pixel fighter fallback
    ProceduralSpriteRenderer.renderFighter(ctx, state, animTime, color, facing, isHit, hitstop, this.character.id);
  }
}
