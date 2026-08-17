import { soundSystem } from '../../audio/SoundSystem';
import { Collision } from '../collision/Collision';
import { Camera } from '../engine/Camera';
import { ParticleSystem } from '../engine/ParticleSystem';
import { ScreenShake } from '../engine/ScreenShake';
import { Fighter } from '../entities/Fighter';
import {
  AttackDefinition,
  GameSettings,
  MatchResult,
  Projectile,
  RoundState,
  StageData,
} from '../../types';

export class CombatEngine {
  public p1: Fighter;
  public p2: Fighter;
  public stage: StageData;
  public settings: GameSettings;
  public particles: ParticleSystem;
  public screenShake: ScreenShake;
  public camera: Camera;

  public projectiles: Projectile[] = [];
  public roundState: RoundState;
  public hitstopRemaining: number = 0;

  // Combo tracking
  public p1Combo: number = 0;
  public p2Combo: number = 0;
  public p1ComboTimer: number = 0;
  public p2ComboTimer: number = 0;
  public maxComboP1: number = 0;
  public maxComboP2: number = 0;

  public matchStartTime: number = Date.now();
  public onMatchEnd?: (result: MatchResult) => void;

  constructor(
    p1: Fighter,
    p2: Fighter,
    stage: StageData,
    settings: GameSettings,
    particles: ParticleSystem,
    screenShake: ScreenShake,
    camera: Camera
  ) {
    this.p1 = p1;
    this.p2 = p2;
    this.stage = stage;
    this.settings = settings;
    this.particles = particles;
    this.screenShake = screenShake;
    this.camera = camera;

    this.roundState = {
      currentRound: 1,
      p1RoundsWon: 0,
      p2RoundsWon: 0,
      timer: settings.roundTimerSeconds,
      phase: 'INTRO',
      phaseTimer: 60,
      announcementText: 'ROUND 1',
      announcementSubtext: 'READY...',
      winner: null,
    };

    // Attach callbacks
    this.p1.onSpawnProjectile = this.spawnProjectile;
    this.p2.onSpawnProjectile = this.spawnProjectile;
    this.p1.onPlaySound = (snd) => this.playSoundEffect(snd);
    this.p2.onPlaySound = (snd) => this.playSoundEffect(snd);
  }

  public startRound() {
    const roundNumber = this.roundState.p1RoundsWon + this.roundState.p2RoundsWon + 1;
    this.roundState.currentRound = roundNumber;
    this.roundState.timer = this.settings.roundTimerSeconds;
    this.roundState.phase = 'INTRO';
    this.roundState.phaseTimer = 70;
    this.roundState.announcementText = `ROUND ${roundNumber}`;
    this.roundState.announcementSubtext = 'READY...';
    this.roundState.winner = null;

    this.p1.reset(this.stage.width * 0.35, 1);
    this.p2.reset(this.stage.width * 0.65, -1);
    this.projectiles = [];
    this.particles.clear();
    soundSystem.playMenuMove();
  }

  public update(dt: number) {
    // 1. Process Hitstop freeze frame
    if (this.hitstopRemaining > 0) {
      this.hitstopRemaining--;
      return;
    }

    // 2. Combo Timers
    if (this.p1ComboTimer > 0) {
      this.p1ComboTimer--;
      if (this.p1ComboTimer === 0) this.p1Combo = 0;
    }
    if (this.p2ComboTimer > 0) {
      this.p2ComboTimer--;
      if (this.p2ComboTimer === 0) this.p2Combo = 0;
    }

    // 3. Round Lifecycle State Machine
    this.updateRoundState();

    // 4. Player Pushbox resolution (no walking through each other)
    this.resolvePushboxes();

    // 5. Combat Hitbox vs Hurtbox evaluation
    if (this.roundState.phase === 'FIGHT') {
      this.checkHitbox(this.p1, this.p2, 1);
      this.checkHitbox(this.p2, this.p1, 2);
      this.updateProjectiles();
    }

    // 6. Camera & Screen Shake update
    this.camera.update(this.p1.x, this.p2.x, this.stage.width, 1000);
    this.screenShake.update();
  }

  private updateRoundState() {
    this.roundState.phaseTimer--;

    if (this.roundState.phase === 'INTRO' && this.roundState.phaseTimer <= 0) {
      this.roundState.phase = 'COUNTDOWN';
      this.roundState.phaseTimer = 50;
      this.roundState.announcementText = 'FIGHT!';
      this.roundState.announcementSubtext = '';
      soundSystem.playFightBell();
    } else if (this.roundState.phase === 'COUNTDOWN' && this.roundState.phaseTimer <= 0) {
      this.roundState.phase = 'FIGHT';
      this.roundState.announcementText = '';
    } else if (this.roundState.phase === 'FIGHT') {
      // Decrement match timer
      if (this.roundState.phaseTimer % 60 === 0 && this.roundState.timer > 0) {
        this.roundState.timer--;
      }

      // Check win condition
      if (this.p1.health <= 0 || this.p2.health <= 0 || this.roundState.timer <= 0) {
        this.handleRoundEnd();
      }
    } else if (this.roundState.phase === 'ROUND_OVER' && this.roundState.phaseTimer <= 0) {
      const roundsToWin = this.settings.roundCount === 1 ? 1 : 2;

      if (this.roundState.p1RoundsWon >= roundsToWin || this.roundState.p2RoundsWon >= roundsToWin) {
        this.roundState.phase = 'MATCH_OVER';
        this.roundState.phaseTimer = 180;
        const winner = this.roundState.p1RoundsWon >= roundsToWin ? 1 : 2;
        this.roundState.winner = winner;
        this.roundState.announcementText = `PLAYER ${winner} WINS!`;
        this.roundState.announcementSubtext = 'PERFECT VICTORY';
        soundSystem.playVictoryFanfare();

        if (winner === 1) {
          this.p1.state = 'victory';
          this.p2.state = 'defeat';
        } else {
          this.p2.state = 'victory';
          this.p1.state = 'defeat';
        }
      } else {
        // Next round
        this.startRound();
      }
    } else if (this.roundState.phase === 'MATCH_OVER' && this.roundState.phaseTimer <= 0) {
      if (this.onMatchEnd) {
        const winner = (this.roundState.p1RoundsWon >= this.roundState.p2RoundsWon ? 1 : 2) as 1 | 2;
        this.onMatchEnd({
          winnerPlayer: winner,
          p1Character: this.p1.character,
          p2Character: this.p2.character,
          p1Color: this.p1.color,
          p2Color: this.p2.color,
          p1Rounds: this.roundState.p1RoundsWon,
          p2Rounds: this.roundState.p2RoundsWon,
          totalTimeSeconds: Math.floor((Date.now() - this.matchStartTime) / 1000),
          maxComboP1: this.maxComboP1,
          maxComboP2: this.maxComboP2,
          stage: this.stage,
        });
      }
    }
  }

  private handleRoundEnd() {
    this.roundState.phase = 'ROUND_OVER';
    this.roundState.phaseTimer = 120;

    if (this.p1.health <= 0 && this.p2.health <= 0) {
      // Double KO
      this.roundState.announcementText = 'DOUBLE K.O.!';
      soundSystem.playKO();
    } else if (this.p1.health <= 0) {
      this.roundState.p2RoundsWon++;
      this.roundState.announcementText = 'K.O.!';
      this.roundState.announcementSubtext = 'PLAYER 2 WINS ROUND';
      soundSystem.playKO();
    } else if (this.p2.health <= 0) {
      this.roundState.p1RoundsWon++;
      this.roundState.announcementText = 'K.O.!';
      this.roundState.announcementSubtext = 'PLAYER 1 WINS ROUND';
      soundSystem.playKO();
    } else if (this.roundState.timer <= 0) {
      this.roundState.announcementText = 'TIME OVER!';
      if (this.p1.health > this.p2.health) {
        this.roundState.p1RoundsWon++;
        this.roundState.announcementSubtext = 'PLAYER 1 WINS BY DECISION';
      } else if (this.p2.health > this.p1.health) {
        this.roundState.p2RoundsWon++;
        this.roundState.announcementSubtext = 'PLAYER 2 WINS BY DECISION';
      } else {
        this.roundState.announcementSubtext = 'DRAW';
      }
      soundSystem.playFightBell();
    }

    if (this.settings.screenShake) {
      this.screenShake.trigger(14, 20);
    }
  }

  private resolvePushboxes() {
    const p1Box = this.p1.getPushbox();
    const p2Box = this.p2.getPushbox();

    if (Collision.testAABB(p1Box, p2Box)) {
      const overlapX = (p1Box.width / 2 + p2Box.width / 2) - Math.abs(this.p1.x - this.p2.x);
      if (overlapX > 0) {
        const pushAmount = overlapX / 2;
        if (this.p1.x < this.p2.x) {
          this.p1.x -= pushAmount;
          this.p2.x += pushAmount;
        } else {
          this.p1.x += pushAmount;
          this.p2.x -= pushAmount;
        }
      }
    }
  }

  private checkHitbox(attacker: Fighter, defender: Fighter, attackerId: number) {
    const hitbox = attacker.getActiveHitbox();
    if (!hitbox) return;

    const hurtbox = defender.getHurtbox();

    if (Collision.testAABB(hitbox, hurtbox)) {
      attacker.hasHitThisAttack = true;

      // Check if defender is actively blocking
      const isHoldingBack =
        (defender.facing === 1 && defender.vx < 0) ||
        (defender.facing === -1 && defender.vx > 0) ||
        defender.state === 'block' ||
        defender.state === 'crouch';

      const isBlocked = isHoldingBack && !defender.isInvulnerable;

      const isKO = defender.takeDamage(attacker.currentAttack!, attacker.facing, isBlocked);

      // Hit effects
      const impactX = (hitbox.x + hitbox.width / 2 + hurtbox.x + hurtbox.width / 2) / 2;
      const impactY = (hitbox.y + hitbox.height / 2 + hurtbox.y + hurtbox.height / 2) / 2;

      this.hitstopRemaining = isBlocked ? 3 : 6;

      if (isBlocked) {
        this.particles.spawnHitSparks(impactX, impactY, '#38bdf8', 8);
        soundSystem.playBlock();
      } else {
        const isHeavy = attacker.currentAttack?.type.includes('heavy') || attacker.currentAttack?.type.includes('special');
        this.particles.spawnHitSparks(impactX, impactY, isHeavy ? '#f97316' : '#fbbf24', isHeavy ? 18 : 10);
        
        if (isHeavy) {
          soundSystem.playHeavyHit();
          if (this.settings.screenShake) this.screenShake.trigger(10, 14);
        } else {
          soundSystem.playLightHit();
        }

        // Combo register
        if (attackerId === 1) {
          this.p1Combo++;
          this.p1ComboTimer = 50;
          if (this.p1Combo > this.maxComboP1) this.maxComboP1 = this.p1Combo;
        } else {
          this.p2Combo++;
          this.p2ComboTimer = 50;
          if (this.p2Combo > this.maxComboP2) this.maxComboP2 = this.p2Combo;
        }
      }

      if (isKO && this.settings.screenShake) {
        this.screenShake.trigger(16, 25);
      }
    }
  }

  private spawnProjectile = (fighter: Fighter, attack: AttackDefinition) => {
    const vx = fighter.facing * (attack.projectileSpeed || 8.5);
    const y = fighter.y - 45;
    const x = fighter.facing === 1 ? fighter.x + 35 : fighter.x - 35;

    this.projectiles.push({
      id: `proj_${Date.now()}_${Math.random()}`,
      ownerId: fighter.id,
      x,
      y,
      vx,
      radius: 18,
      damage: attack.damage,
      color: fighter.color.accentColor,
      active: true,
      life: 0,
    });

    soundSystem.playSpecialLaunch();
  };

  private updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx;
      proj.life++;

      // Spawn trail
      if (proj.life % 2 === 0) {
        this.particles.spawnHitSparks(proj.x, proj.y, proj.color, 2);
      }

      // Check bounds
      if (proj.x < 0 || proj.x > this.stage.width || proj.life > 120) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Target hurtbox
      const target = proj.ownerId === 1 ? this.p2 : this.p1;
      const targetBox = target.getHurtbox();
      const projBox = {
        x: proj.x - proj.radius,
        y: proj.y - proj.radius,
        width: proj.radius * 2,
        height: proj.radius * 2,
      };

      if (Collision.testAABB(projBox, targetBox)) {
        const dummyAttack: AttackDefinition = {
          id: 'proj_hit',
          name: 'Sonic Burst',
          type: 'special_proj',
          damage: proj.damage,
          chipDamage: 6,
          startupFrames: 0,
          activeFrames: 0,
          recoveryFrames: 0,
          hitstunFrames: 24,
          blockstunFrames: 14,
          knockback: { x: 8, y: -4 },
          hitbox: { x: 0, y: 0, width: 0, height: 0 },
          sound: 'special',
        };

        const isBlocked = (target.state === 'block' || target.state === 'crouch') && !target.isInvulnerable;
        target.takeDamage(dummyAttack, proj.vx > 0 ? 1 : -1, isBlocked);

        this.particles.spawnHitSparks(proj.x, proj.y, proj.color, 16);
        soundSystem.playHeavyHit();
        if (this.settings.screenShake) this.screenShake.trigger(8, 12);

        this.projectiles.splice(i, 1);
      }
    }
  }

  private playSoundEffect(sound: string) {
    switch (sound) {
      case 'punch_light':
      case 'kick_light':
        soundSystem.playLightHit();
        break;
      case 'punch_heavy':
      case 'kick_heavy':
        soundSystem.playHeavyHit();
        break;
      case 'special':
        soundSystem.playSpecialLaunch();
        break;
      case 'whoosh':
        soundSystem.playWhoosh();
        break;
      case 'jump':
        soundSystem.playJump();
        break;
    }
  }

  public renderProjectiles(ctx: CanvasRenderingContext2D) {
    this.projectiles.forEach(p => {
      ctx.save();
      // Glowing sonic wave vinyl ring
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 4;
      ctx.fillStyle = '#ffffff';

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Vinyl groove lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.7, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    });
  }
}
