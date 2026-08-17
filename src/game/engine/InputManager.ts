import { Fighter } from '../entities/Fighter';
import { InputState, PlayerControls } from '../../types';

export class InputManager {
  private activeKeys: Set<string> = new Set();
  private p1Controls: PlayerControls;
  private p2Controls: PlayerControls;

  // CPU AI State
  private aiActionTimer: number = 0;
  private aiCurrentInput: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    punch: false,
    kick: false,
    special: false,
  };

  constructor(p1Controls: PlayerControls, p2Controls: PlayerControls) {
    this.p1Controls = p1Controls;
    this.p2Controls = p2Controls;
    this.bindEvents();
  }

  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  public destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.activeKeys.clear();
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Prevent scrolling with arrows/space during game
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    this.activeKeys.add(e.code);
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.activeKeys.delete(e.code);
  };

  public getP1Input(): InputState {
    return {
      up: this.isAnyPressed(this.p1Controls.up),
      down: this.isAnyPressed(this.p1Controls.down),
      left: this.isAnyPressed(this.p1Controls.left),
      right: this.isAnyPressed(this.p1Controls.right),
      punch: this.isAnyPressed(this.p1Controls.punch),
      kick: this.isAnyPressed(this.p1Controls.kick),
      special: this.isAnyPressed(this.p1Controls.special),
    };
  }

  public getP2Input(p2Fighter?: Fighter, p1Fighter?: Fighter, aiDifficulty: string = 'NORMAL'): InputState {
    if (p2Fighter && p2Fighter.isCPU && p1Fighter) {
      return this.computeCPUInput(p2Fighter, p1Fighter, aiDifficulty);
    }

    return {
      up: this.isAnyPressed(this.p2Controls.up),
      down: this.isAnyPressed(this.p2Controls.down),
      left: this.isAnyPressed(this.p2Controls.left),
      right: this.isAnyPressed(this.p2Controls.right),
      punch: this.isAnyPressed(this.p2Controls.punch),
      kick: this.isAnyPressed(this.p2Controls.kick),
      special: this.isAnyPressed(this.p2Controls.special),
    };
  }

  private isAnyPressed(keyCodes: string[]): boolean {
    return keyCodes.some(code => this.activeKeys.has(code));
  }

  private computeCPUInput(cpu: Fighter, player: Fighter, difficulty: string): InputState {
    this.aiActionTimer++;

    // Re-evaluate AI actions every few frames based on difficulty
    const updateRate = difficulty === 'HARD' ? 6 : difficulty === 'EASY' ? 24 : 12;

    if (this.aiActionTimer % updateRate === 0) {
      const distance = Math.abs(cpu.x - player.x);
      const isPlayerAttacking = player.currentAttack !== null;

      // Reset
      this.aiCurrentInput = {
        up: false,
        down: false,
        left: false,
        right: false,
        punch: false,
        kick: false,
        special: false,
      };

      // 1. Defend / Block if player attacks nearby
      if (isPlayerAttacking && distance < 110 && Math.random() < (difficulty === 'HARD' ? 0.85 : 0.45)) {
        this.aiCurrentInput.down = Math.random() > 0.5;
        this.aiCurrentInput.left = cpu.x > player.x;
        this.aiCurrentInput.right = cpu.x < player.x;
        return this.aiCurrentInput;
      }

      // 2. Close range combat
      if (distance < 75) {
        const rand = Math.random();
        if (cpu.specialMeter >= 25 && rand > 0.6) {
          this.aiCurrentInput.special = true;
        } else if (rand > 0.5) {
          this.aiCurrentInput.punch = true;
        } else if (rand > 0.25) {
          this.aiCurrentInput.kick = true;
        } else {
          // Low crouch attack
          this.aiCurrentInput.down = true;
          this.aiCurrentInput.kick = true;
        }
      } 
      // 3. Medium range (approach or projectile)
      else if (distance < 220) {
        if (cpu.specialMeter >= 25 && Math.random() > 0.4) {
          this.aiCurrentInput.special = true;
        } else {
          // Advance towards player
          if (cpu.x > player.x) {
            this.aiCurrentInput.left = true;
          } else {
            this.aiCurrentInput.right = true;
          }
          if (Math.random() < 0.15) {
            this.aiCurrentInput.up = true; // Jump approach
          }
        }
      } 
      // 4. Far range: approach
      else {
        if (cpu.x > player.x) {
          this.aiCurrentInput.left = true;
        } else {
          this.aiCurrentInput.right = true;
        }
      }
    }

    return this.aiCurrentInput;
  }
}
