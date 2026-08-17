export class ScreenShake {
  private intensity: number = 0;
  private duration: number = 0;
  public offsetX: number = 0;
  public offsetY: number = 0;

  public trigger(intensity: number = 8, durationFrames: number = 12) {
    this.intensity = intensity;
    this.duration = durationFrames;
  }

  public update() {
    if (this.duration > 0) {
      this.duration--;
      this.offsetX = (Math.random() - 0.5) * this.intensity * (this.duration / 10);
      this.offsetY = (Math.random() - 0.5) * this.intensity * (this.duration / 10);
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
    }
  }
}
