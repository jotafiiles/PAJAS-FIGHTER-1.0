import { AttackDefinition, BoxRect, CharacterData, ColorVariant, FighterState, InputState } from '../../types';
import { SpriteController } from '../animation/SpriteController';
import { Physics } from '../physics/Physics';

export class Fighter {
  public id: number; // 1 or 2
  public character: CharacterData;
  public color: ColorVariant;
  public isCPU: boolean = false;

  // Position & Motion
  public x: number;
  public y: number; // 0 is ground
  public vx: number = 0;
  public vy: number = 0;
  public facing: number = 1; // 1 for right, -1 for left
  public isGrounded: boolean = true;

  // Combat Attributes
  public maxHealth: number = 100;
  public health: number = 100;
  public specialMeter: number = 0; // 0 to 100
  public state: FighterState = 'idle';
  public animTime: number = 0;

  // Attack & Frame Data
  public currentAttack: AttackDefinition | null = null;
  public attackFrame: number = 0;
  public hasHitThisAttack: boolean = false;
  public hitstunRemaining: number = 0;
  public blockstunRemaining: number = 0;
  public isInvulnerable: boolean = false;
  public invulnerabilityTimer: number = 0;

  // Pushbox & Hurtbox
  public pushboxWidth: number = 36;
  public height: number = 96;

  // Animation controller
  private spriteController: SpriteController;

  // Callbacks
  public onSpawnProjectile?: (fighter: Fighter, attack: AttackDefinition) => void;
  public onPlaySound?: (sound: string) => void;

  constructor(
    id: number,
    character: CharacterData,
    color: ColorVariant,
    startX: number,
    isCPU: boolean = false
  ) {
    this.id = id;
    this.character = character;
    this.color = color;
    this.x = startX;
    this.y = 0;
    this.facing = id === 1 ? 1 : -1;
    this.isCPU = isCPU;
    this.spriteController = new SpriteController(character);
    this.spriteController.preloadVariant(color);
  }

  public setCharacter(character: CharacterData, color: ColorVariant) {
    this.character = character;
    this.color = color;
    this.spriteController = new SpriteController(character);
    this.spriteController.preloadVariant(color);
  }

  public reset(startX: number, facing: number) {
    this.x = startX;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.facing = facing;
    this.health = this.maxHealth;
    this.state = 'idle';
    this.currentAttack = null;
    this.attackFrame = 0;
    this.hitstunRemaining = 0;
    this.blockstunRemaining = 0;
    this.isInvulnerable = false;
    this.invulnerabilityTimer = 0;
    this.animTime = 0;
    this.hasHitThisAttack = false;
  }

  public update(inputs: InputState, opponent: Fighter, stageWidth: number, dt: number) {
    this.animTime += dt;

    // Handle stun & invulnerability timers
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer--;
      this.isInvulnerable = this.invulnerabilityTimer > 0;
    }

    if (this.hitstunRemaining > 0) {
      this.hitstunRemaining--;
      if (this.hitstunRemaining === 0) {
        this.state = this.isGrounded ? 'idle' : 'fall';
      }
    }

    if (this.blockstunRemaining > 0) {
      this.blockstunRemaining--;
      if (this.blockstunRemaining === 0) {
        this.state = this.isGrounded ? 'idle' : 'fall';
      }
    }

    // Process state machine
    switch (this.state) {
      case 'idle':
      case 'walk':
      case 'crouch':
        this.handleNeutralState(inputs, opponent);
        break;

      case 'jump':
      case 'fall':
        this.handleAirborneState(inputs);
        break;

      case 'punch':
      case 'kick':
      case 'special':
        this.handleAttackState();
        break;

      case 'hit':
      case 'block':
        // Stun handled by counters
        break;

      case 'knockdown':
        if (this.isGrounded && this.animTime > 0.8) {
          this.state = 'getup';
          this.animTime = 0;
        }
        break;

      case 'getup':
        if (this.animTime > 0.4) {
          this.state = 'idle';
          this.invulnerabilityTimer = 15; // Brief wakeup frames
        }
        break;

      case 'victory':
      case 'defeat':
        // Freeze movement in end match
        this.vx = 0;
        break;
    }

    // Apply Physics (Gravity & Velocity)
    if (!this.isGrounded) {
      this.vy += Physics.GRAVITY;
      if (this.vy > Physics.TERMINAL_VELOCITY) {
        this.vy = Physics.TERMINAL_VELOCITY;
      }
      this.y += this.vy;

      if (this.y >= 0) {
        this.y = 0;
        this.vy = 0;
        this.isGrounded = true;
        if (this.state === 'jump' || this.state === 'fall') {
          this.state = 'idle';
        }
      }
    }

    // Ground friction
    if (this.isGrounded) {
      this.vx *= Physics.GROUND_FRICTION;
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
    } else {
      this.vx *= Physics.AIR_RESISTANCE;
    }

    this.x += this.vx;

    // Stage boundary clamping
    const halfBox = this.pushboxWidth / 2;
    this.x = Physics.clamp(this.x, halfBox, stageWidth - halfBox);

    // Auto face opponent when not attacking or stunned
    if (
      this.state === 'idle' ||
      this.state === 'walk' ||
      this.state === 'crouch' ||
      (this.isGrounded && !this.currentAttack)
    ) {
      if (opponent.x > this.x + 5) {
        this.facing = 1;
      } else if (opponent.x < this.x - 5) {
        this.facing = -1;
      }
    }
  }

  private handleNeutralState(inputs: InputState, opponent: Fighter) {
    // 1. Attack Inputs (Priority)
    if (inputs.special && this.specialMeter >= 25) {
      const specialAttack = this.character.attacks.find(a => a.type === 'special_proj') || this.character.attacks[0];
      this.startAttack(specialAttack, 'special');
      this.specialMeter = Math.max(0, this.specialMeter - 25);
      return;
    }

    if (inputs.punch) {
      const punch = this.character.attacks.find(a => a.type === 'punch_heavy') || this.character.attacks[0];
      this.startAttack(punch, 'punch');
      return;
    }

    if (inputs.kick) {
      const kick = this.character.attacks.find(a => a.type === 'kick_heavy') || this.character.attacks[2] || this.character.attacks[0];
      this.startAttack(kick, 'kick');
      return;
    }

    // 2. Jump
    if (inputs.up && this.isGrounded) {
      this.isGrounded = false;
      this.vy = -17; // Jump impulse
      this.state = 'jump';
      if (inputs.left) this.vx = -4.5;
      if (inputs.right) this.vx = 4.5;
      if (this.onPlaySound) this.onPlaySound('jump');
      return;
    }

    // 3. Crouch & Block
    if (inputs.down && this.isGrounded) {
      this.state = 'crouch';
      this.vx = 0;
      return;
    }

    // 4. Movement (Walk Forward / Back)
    const moveSpeed = 4.2 * (this.character.stats.speed / 8);

    if (inputs.left) {
      this.vx = -moveSpeed;
      this.state = 'walk';
    } else if (inputs.right) {
      this.vx = moveSpeed;
      this.state = 'walk';
    } else {
      this.state = 'idle';
    }
  }

  private handleAirborneState(inputs: InputState) {
    if (this.vy > 0) {
      this.state = 'fall';
    }

    // Air attacks
    if (inputs.punch && !this.currentAttack) {
      const punch = this.character.attacks.find(a => a.type === 'punch_light') || this.character.attacks[0];
      this.startAttack(punch, 'punch');
    } else if (inputs.kick && !this.currentAttack) {
      const kick = this.character.attacks.find(a => a.type === 'kick_light') || this.character.attacks[2] || this.character.attacks[0];
      this.startAttack(kick, 'kick');
    }
  }

  private handleAttackState() {
    if (!this.currentAttack) {
      this.state = this.isGrounded ? 'idle' : 'fall';
      return;
    }

    this.attackFrame++;
    const totalFrames =
      this.currentAttack.startupFrames +
      this.currentAttack.activeFrames +
      this.currentAttack.recoveryFrames;

    // Check if projectile should be launched on active frame
    if (
      this.currentAttack.isProjectile &&
      this.attackFrame === this.currentAttack.startupFrames &&
      this.onSpawnProjectile
    ) {
      this.onSpawnProjectile(this, this.currentAttack);
    }

    if (this.attackFrame >= totalFrames) {
      this.currentAttack = null;
      this.attackFrame = 0;
      this.hasHitThisAttack = false;
      this.state = this.isGrounded ? 'idle' : 'fall';
    }
  }

  public startAttack(attack: AttackDefinition, state: FighterState) {
    this.currentAttack = attack;
    this.state = state;
    this.attackFrame = 0;
    this.hasHitThisAttack = false;
    if (this.onPlaySound) {
      this.onPlaySound(attack.sound);
    }
  }

  public isAttackActive(): boolean {
    if (!this.currentAttack) return false;
    const start = this.currentAttack.startupFrames;
    const end = start + this.currentAttack.activeFrames;
    return this.attackFrame >= start && this.attackFrame <= end;
  }

  public getActiveHitbox(): BoxRect | null {
    if (!this.isAttackActive() || !this.currentAttack || this.hasHitThisAttack) {
      return null;
    }

    const hb = this.currentAttack.hitbox;
    const x = this.facing === 1 ? this.x + hb.x : this.x - hb.x - hb.width;
    const y = this.y + hb.y;

    return {
      x,
      y,
      width: hb.width,
      height: hb.height,
    };
  }

  public getHurtbox(): BoxRect {
    const isCrouching = this.state === 'crouch';
    const boxHeight = isCrouching ? 60 : 90;
    const boxWidth = 38;

    return {
      x: this.x - boxWidth / 2,
      y: this.y - boxHeight,
      width: boxWidth,
      height: boxHeight,
    };
  }

  public getPushbox(): BoxRect {
    return {
      x: this.x - this.pushboxWidth / 2,
      y: this.y - this.height,
      width: this.pushboxWidth,
      height: this.height,
    };
  }

  public takeDamage(attack: AttackDefinition, attackerFacing: number, isBlocked: boolean): boolean {
    if (this.isInvulnerable || this.health <= 0) return false;

    const damage = isBlocked ? attack.chipDamage : attack.damage;
    this.health = Math.max(0, this.health - damage);

    // Increase special meter on hit
    this.specialMeter = Math.min(100, this.specialMeter + (isBlocked ? 4 : 12));

    if (this.health <= 0) {
      this.state = 'defeat';
      this.vx = attackerFacing * 8;
      this.vy = -10;
      this.isGrounded = false;
      return true; // KO
    }

    if (isBlocked) {
      this.state = 'block';
      this.blockstunRemaining = attack.blockstunFrames;
      this.vx = attackerFacing * 3.5;
    } else {
      this.hitstunRemaining = attack.hitstunFrames;
      this.vx = attackerFacing * attack.knockback.x;
      if (attack.knockback.y < 0) {
        this.vy = attack.knockback.y;
        this.isGrounded = false;
        this.state = 'knockdown';
      } else {
        this.state = 'hit';
      }
    }

    return false;
  }

  public render(ctx: CanvasRenderingContext2D, isHit: boolean = false, hitstop: boolean = false) {
    ctx.save();
    ctx.translate(this.x, this.y);
    this.spriteController.render(
      ctx,
      this.state,
      this.animTime,
      this.color,
      this.facing,
      isHit || this.state === 'hit',
      hitstop,
      this.vx,
      this.currentAttack
    );
    ctx.restore();
  }
}
