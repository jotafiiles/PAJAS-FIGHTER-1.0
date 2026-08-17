export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Physics {
  public static GRAVITY = 0.9;
  public static TERMINAL_VELOCITY = 18;
  public static GROUND_FRICTION = 0.82;
  public static AIR_RESISTANCE = 0.96;

  public static clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
  }
}
