export class Camera {
  public x: number = 0;
  public y: number = 0;
  public zoom: number = 1;
  public targetX: number = 0;
  public targetY: number = 0;

  public update(p1X: number, p2X: number, stageWidth: number, viewportWidth: number) {
    const midpoint = (p1X + p2X) / 2;
    const distance = Math.abs(p1X - p2X);

    // Desired camera center
    this.targetX = midpoint - viewportWidth / 2;

    // Clamp camera within stage bounds
    const minX = 0;
    const maxX = Math.max(0, stageWidth - viewportWidth);
    this.targetX = Math.max(minX, Math.min(maxX, this.targetX));

    // Smooth lerp
    this.x += (this.targetX - this.x) * 0.1;
  }
}
