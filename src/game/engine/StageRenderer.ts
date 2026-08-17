import { StageData } from '../../types';

export class StageRenderer {
  public static renderStage(
    ctx: CanvasRenderingContext2D,
    stage: StageData,
    cameraX: number,
    animTime: number,
    canvasWidth: number,
    canvasHeight: number
  ) {
    const groundY = canvasHeight - stage.groundY;

    // 1. SKY / ATMOSPHERE GRADIENT
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, stage.theme.skyColor);
    skyGrad.addColorStop(0.7, '#14080a');
    skyGrad.addColorStop(1, '#240d0e');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvasWidth, groundY);

    // 2. PARALLAX CITY SKYLINE & RETRO BUILDING SILHOUETTES
    const cityOffset = cameraX * 0.25;
    ctx.fillStyle = '#0a0405';
    for (let i = -2; i < 24; i++) {
      const bWidth = 65 + ((i * 47) % 60);
      const bHeight = 160 + ((i * 53) % 220);
      const bX = i * 85 - (cityOffset % 85);

      ctx.fillRect(bX, groundY - bHeight, bWidth, bHeight);

      // Building windows / sound studio audio panels
      ctx.fillStyle = (i % 2 === 0) ? stage.theme.ambientColor : stage.theme.accentColor;
      ctx.globalAlpha = 0.18;
      for (let wy = groundY - bHeight + 16; wy < groundY - 20; wy += 24) {
        for (let wx = bX + 10; wx < bX + bWidth - 10; wx += 18) {
          if ((wx + wy) % 5 !== 0) {
            ctx.fillRect(wx, wy, 8, 12);
          }
        }
      }
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#0a0405';
    }

    // 3. BACKGROUND NEON BILLBOARD SIGN (Parallax Layer 2)
    const signX = (canvasWidth / 2) - 180 - ((cameraX - (stage.width - canvasWidth) / 2) * 0.15);
    const signY = Math.max(40, groundY - 320);
    const pulse = 0.85 + Math.sin(animTime * 5) * 0.15;

    ctx.save();
    ctx.shadowColor = stage.theme.accentColor;
    ctx.shadowBlur = 24 * pulse;
    ctx.strokeStyle = stage.theme.accentColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(signX, signY, 360, 65);

    ctx.fillStyle = stage.theme.accentColor;
    ctx.font = '900 32px "Anton", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '3px';
    const signTitle = stage.id === 'neon_rooftop'
      ? 'AZOTEA SANTIAGO · 18F'
      : stage.id === 'vinyl_alley'
      ? 'CALLEJÓN DEL DISCO'
      : 'QUE PAJA RECORDS';
    ctx.fillText(signTitle, signX + 180, signY + 33);
    ctx.restore();

    // 4. CORNER SOUND STACKS (Pulsing Subwoofers in World Space)
    const beatPulse = 1 + Math.abs(Math.sin(animTime * 10)) * 0.18;
    this.renderSpeakerTower(ctx, 30 - cameraX, groundY, stage.theme.accentColor, beatPulse);
    this.renderSpeakerTower(ctx, stage.width - 130 - cameraX, groundY, stage.theme.accentColor, beatPulse);

    // 5. STAGE GROUND & FLOOR PLATFORM
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, canvasHeight);
    groundGrad.addColorStop(0, stage.theme.groundColor);
    groundGrad.addColorStop(0.15, '#120504');
    groundGrad.addColorStop(1, '#050102');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, canvasWidth, canvasHeight - groundY);

    // Glowing Neon Stage Horizon Line
    ctx.save();
    ctx.shadowColor = stage.theme.ambientColor;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = stage.theme.ambientColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvasWidth, groundY);
    ctx.stroke();
    ctx.restore();

    // Perspective Floor Grid Lines
    ctx.strokeStyle = 'rgba(255, 140, 50, 0.12)';
    ctx.lineWidth = 1.5;
    const startX = -(cameraX % 60);
    for (let x = startX - 120; x < canvasWidth + 120; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      const slantX = x + (x - canvasWidth / 2) * 0.5;
      ctx.lineTo(slantX, canvasHeight);
      ctx.stroke();
    }
  }

  private static renderSpeakerTower(
    ctx: CanvasRenderingContext2D,
    x: number,
    groundY: number,
    accentColor: string,
    beatPulse: number
  ) {
    const width = 90;
    const height = 220;
    const y = groundY - height;

    // Outer Cabinet
    ctx.fillStyle = '#140807';
    ctx.strokeStyle = '#3a1710';
    ctx.lineWidth = 3;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);

    // Metallic protective grille accent
    ctx.fillStyle = '#1f0c08';
    ctx.fillRect(x + 6, y + 6, width - 12, height - 12);

    // 3 Subwoofer Drivers
    for (let i = 0; i < 3; i++) {
      const coneY = y + 36 + i * 68;
      const coneRadius = 24 * (i === 1 ? beatPulse : 1);

      ctx.fillStyle = '#080202';
      ctx.beginPath();
      ctx.arc(x + width / 2, coneY, 28, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing rim
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + width / 2, coneY, coneRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Center dust cap
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(x + width / 2, coneY, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

