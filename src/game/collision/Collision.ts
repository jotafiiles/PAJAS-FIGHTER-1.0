import { BoxRect } from '../../types';

export class Collision {
  /**
   * Axis-Aligned Bounding Box (AABB) intersection check.
   */
  public static testAABB(r1: BoxRect, r2: BoxRect): boolean {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  /**
   * Transforms a local box offset to world coordinates based on position and facing direction.
   */
  public static getTransformedBox(
    posX: number,
    posY: number,
    facing: number,
    localBox: BoxRect
  ): BoxRect {
    const x = facing === 1 ? posX + localBox.x : posX - localBox.x - localBox.width;
    const y = posY + localBox.y;
    return {
      x,
      y,
      width: localBox.width,
      height: localBox.height,
    };
  }

  /**
   * Resolves pushbox overlap between two fighters so they don't walk through each other.
   */
  public static resolvePushboxOverlap(
    p1Box: BoxRect,
    p2Box: BoxRect
  ): { p1Shift: number; p2Shift: number } {
    if (!this.testAABB(p1Box, p2Box)) {
      return { p1Shift: 0, p2Shift: 0 };
    }

    const p1Center = p1Box.x + p1Box.width / 2;
    const p2Center = p2Box.x + p2Box.width / 2;

    let overlap = 0;
    if (p1Center <= p2Center) {
      overlap = (p1Box.x + p1Box.width) - p2Box.x;
      const half = overlap / 2;
      return { p1Shift: -half, p2Shift: half };
    } else {
      overlap = (p2Box.x + p2Box.width) - p1Box.x;
      const half = overlap / 2;
      return { p1Shift: half, p2Shift: -half };
    }
  }

  /**
   * Debug renderer for Hitboxes (Red), Hurtboxes (Green/Cyan), and Pushboxes (Yellow).
   */
  public static renderDebugBoxes(
    ctx: CanvasRenderingContext2D,
    hitbox: BoxRect | null,
    hurtbox: BoxRect | null,
    pushbox: BoxRect | null
  ) {
    ctx.save();
    ctx.lineWidth = 1.5;

    // 1. Pushbox (Yellow)
    if (pushbox) {
      ctx.strokeStyle = '#eab308';
      ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
      ctx.strokeRect(pushbox.x, pushbox.y, pushbox.width, pushbox.height);
      ctx.fillRect(pushbox.x, pushbox.y, pushbox.width, pushbox.height);
    }

    // 2. Hurtbox (Green/Cyan)
    if (hurtbox) {
      ctx.strokeStyle = '#22c55e';
      ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
      ctx.strokeRect(hurtbox.x, hurtbox.y, hurtbox.width, hurtbox.height);
      ctx.fillRect(hurtbox.x, hurtbox.y, hurtbox.width, hurtbox.height);
    }

    // 3. Hitbox (Red)
    if (hitbox) {
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
      ctx.fillRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
    }

    ctx.restore();
  }
}
