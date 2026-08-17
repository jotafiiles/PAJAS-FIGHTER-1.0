import fs from 'node:fs';
import path from 'node:path';
import { encodeRgbaToPng } from '../src/utils/pngEncoder';

interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

class PixelCanvas {
  public width: number;
  public height: number;
  public data: Uint8Array;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height * 4);
  }

  public setPixel(x: number, y: number, color: RGBAColor) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) return;
    const index = (iy * this.width + ix) * 4;

    const srcA = color.a / 255;
    const dstA = this.data[index + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);

    if (outA <= 0) return;

    this.data[index] = Math.round((color.r * srcA + this.data[index] * dstA * (1 - srcA)) / outA);
    this.data[index + 1] = Math.round((color.g * srcA + this.data[index + 1] * dstA * (1 - srcA)) / outA);
    this.data[index + 2] = Math.round((color.b * srcA + this.data[index + 2] * dstA * (1 - srcA)) / outA);
    this.data[index + 3] = Math.round(outA * 255);
  }

  public fillRect(x: number, y: number, w: number, h: number, color: RGBAColor) {
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        this.setPixel(px, py, color);
      }
    }
  }

  public fillCircle(cx: number, cy: number, r: number, color: RGBAColor) {
    const r2 = r * r;
    for (let py = cy - r; py <= cy + r; py++) {
      for (let px = cx - r; px <= cx + r; px++) {
        const dx = px - cx;
        const dy = py - cy;
        if (dx * dx + dy * dy <= r2) {
          this.setPixel(px, py, color);
        }
      }
    }
  }

  public fillEllipse(cx: number, cy: number, rx: number, ry: number, color: RGBAColor) {
    const rx2 = rx * rx;
    const ry2 = ry * ry;
    for (let py = cy - ry; py <= cy + ry; py++) {
      for (let px = cx - rx; px <= cx + rx; px++) {
        const dx = px - cx;
        const dy = py - cy;
        if ((dx * dx) / rx2 + (dy * dy) / ry2 <= 1.0) {
          this.setPixel(px, py, color);
        }
      }
    }
  }

  public drawLine(x0: number, y0: number, x1: number, y1: number, color: RGBAColor, width: number = 1) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let cx = x0;
    let cy = y0;
    while (true) {
      if (width <= 1) {
        this.setPixel(cx, cy, color);
      } else {
        this.fillCircle(cx, cy, width / 2, color);
      }
      if (Math.abs(cx - x1) < 1 && Math.abs(cy - y1) < 1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        cx += sx;
      }
      if (e2 < dx) {
        err += dx;
        cy += sy;
      }
    }
  }

  public toPng(): Buffer {
    return encodeRgbaToPng(this.width, this.height, this.data);
  }
}

// Colors from v3.png
const C = {
  black: { r: 10, g: 10, b: 12, a: 255 },
  darkShade: { r: 5, g: 5, b: 6, a: 255 },
  skin: { r: 161, g: 98, b: 56, a: 255 },
  skinShade: { r: 114, g: 62, b: 28, a: 255 },
  skinHighlight: { r: 194, g: 130, b: 84, a: 255 },
  shirt: { r: 22, g: 22, b: 24, a: 255 },
  shirtShade: { r: 12, g: 12, b: 14, a: 255 },
  pants: { r: 24, g: 24, b: 27, a: 255 },
  pantsShade: { r: 14, g: 14, b: 16, a: 255 },
  white: { r: 255, g: 255, b: 255, a: 255 },
  shoeSole: { r: 220, g: 225, b: 230, a: 255 },
  shoeBlack: { r: 20, g: 20, b: 24, a: 255 },
  metallicaGreen: { r: 34, g: 197, b: 94, a: 255 },
  accentGreen: { r: 74, g: 222, b: 128, a: 255 },
  sunglasses: { r: 5, g: 5, b: 5, a: 255 },
  shadow: { r: 0, g: 0, b: 0, a: 160 },
  spark: { r: 56, g: 189, b: 248, a: 255 },
};

/**
 * Draws Que Paja V1 onto a canvas.
 * Canvas resolution: 140 x 160 (centered at x=70, ground at y=150)
 */
function drawQuePajaFrame(
  cv: PixelCanvas,
  action: string,
  frameIndex: number,
  totalFrames: number
) {
  const cx = 70;
  const groundY = 150;

  // Animation cycle factors
  const phase = (frameIndex / totalFrames) * Math.PI * 2;
  let breatheY = 0;
  let crouchOffset = 0;
  let punchExt = 0;
  let kickExt = 0;
  let jumpY = 0;
  let walkPhase = 0;
  let isHurt = false;
  let isDefeat = false;
  let isVictory = false;
  let isBlock = false;
  let isSpecial = false;

  switch (action) {
    case 'idle':
      breatheY = Math.sin(phase) * 2;
      break;
    case 'walk':
      walkPhase = Math.sin(phase);
      breatheY = Math.abs(Math.sin(phase * 2)) * 3;
      break;
    case 'crouch':
      crouchOffset = 18;
      break;
    case 'jump':
      if (frameIndex === 0) jumpY = -12;
      else if (frameIndex === 1) jumpY = -26;
      else jumpY = -14;
      break;
    case 'punch-light':
      punchExt = frameIndex === 1 ? 26 : (frameIndex === 2 ? 14 : 0);
      break;
    case 'punch-heavy':
      punchExt = frameIndex === 1 ? 10 : (frameIndex === 2 ? 34 : (frameIndex === 3 ? 20 : 0));
      break;
    case 'kick-light':
      kickExt = frameIndex === 1 ? 28 : (frameIndex === 2 ? 16 : 0);
      break;
    case 'kick-heavy':
      kickExt = frameIndex === 1 ? 12 : (frameIndex === 2 ? 38 : (frameIndex === 3 ? 22 : 0));
      break;
    case 'special':
      isSpecial = true;
      punchExt = frameIndex >= 2 ? 22 : 8;
      break;
    case 'hit':
      isHurt = true;
      breatheY = 4;
      break;
    case 'block':
      isBlock = true;
      break;
    case 'knockdown':
      // Laying on ground
      drawKnockdown(cv, cx, groundY, frameIndex);
      return;
    case 'get-up':
      crouchOffset = frameIndex === 0 ? 20 : 10;
      break;
    case 'victory':
      isVictory = true;
      breatheY = Math.sin(phase) * 3;
      break;
    case 'defeat':
      isDefeat = true;
      drawDefeat(cv, cx, groundY);
      return;
  }

  // 1. FLOOR SHADOW
  const shadowW = 28 - jumpY * 0.4;
  cv.fillEllipse(cx, groundY, shadowW, 6, C.shadow);

  const headCenterY = 45 + breatheY + crouchOffset + jumpY;
  const torsoCenterY = 76 + breatheY * 0.7 + crouchOffset + jumpY;
  const legBaseY = 100 + crouchOffset + jumpY;

  // 2. BACK ARM (RIGHT ARM)
  if (isVictory) {
    // Raised fist
    cv.fillEllipse(cx - 24, headCenterY - 14, 8, 12, C.skin);
    cv.fillEllipse(cx - 24, headCenterY - 24, 7, 7, C.skin);
  } else if (isBlock) {
    // Cross guard
    cv.fillEllipse(cx - 6, torsoCenterY - 4, 8, 18, C.shirt);
    cv.fillEllipse(cx - 4, torsoCenterY - 16, 7, 8, C.skin);
  } else {
    // Martial tucked fist near chest
    const armBob = breatheY * 0.5;
    cv.fillEllipse(cx - 22, torsoCenterY - 12 + armBob, 10, 10, C.shirt);
    cv.fillEllipse(cx - 16, torsoCenterY + armBob, 8, 10, C.skin);
    cv.fillCircle(cx - 10, torsoCenterY + 4 + armBob, 7, C.skin);
    // Knuckle shadow
    cv.fillRect(cx - 13, torsoCenterY + 3 + armBob, 6, 2, C.skinShade);
  }

  // 3. LEGS & BAGGY JOGGERS & DUNK SNEAKERS
  if (crouchOffset > 0) {
    // Squatting
    cv.fillEllipse(cx - 14, groundY - 14, 12, 14, C.pants);
    cv.fillEllipse(cx + 14, groundY - 14, 12, 14, C.pants);
    drawSneaker(cv, cx - 22, groundY - 8, 20, 8, false);
    drawSneaker(cv, cx + 2, groundY - 8, 22, 8, true);
  } else if (walkPhase !== 0) {
    // Walking
    const backX = cx - 14 - walkPhase * 10;
    const frontX = cx + 10 + walkPhase * 10;
    const backLift = Math.max(0, -walkPhase * 6);
    const frontLift = Math.max(0, walkPhase * 6);

    cv.fillEllipse(backX, legBaseY + 16 - backLift, 9, 20, C.pants);
    cv.fillEllipse(frontX, legBaseY + 16 - frontLift, 10, 20, C.pants);
    drawSneaker(cv, backX - 8, groundY - 8 - backLift, 18, 8, false);
    drawSneaker(cv, frontX - 2, groundY - 8 - frontLift, 20, 8, true);
  } else if (kickExt > 0) {
    // Kicking leg
    cv.fillEllipse(cx - 14, legBaseY + 16, 9, 22, C.pants);
    drawSneaker(cv, cx - 20, groundY - 8, 18, 8, false);

    cv.fillEllipse(cx + 14 + kickExt * 0.5, torsoCenterY + 14, 10 + kickExt * 0.4, 9, C.pants);
    drawSneaker(cv, cx + 16 + kickExt, torsoCenterY + 10, 22, 9, true);
  } else {
    // Standing martial stance (legs apart)
    cv.fillEllipse(cx - 15, legBaseY + 18, 11, 24, C.pants);
    cv.fillEllipse(cx + 14, legBaseY + 18, 11, 24, C.pants);
    drawSneaker(cv, cx - 23, groundY - 8, 20, 8, false);
    drawSneaker(cv, cx + 3, groundY - 8, 22, 8, true);
  }

  // 4. CHUBBY TORSO & METALLICA ROCK SHIRT
  cv.fillEllipse(cx, torsoCenterY, 26, 25, C.shirt);
  cv.fillEllipse(cx, torsoCenterY + 14, 23, 10, C.shirtShade);

  // Metallica / Que Paja Graphic on Chest
  cv.fillRect(cx - 18, torsoCenterY - 8, 36, 4, C.white);
  cv.fillRect(cx - 14, torsoCenterY - 11, 28, 3, C.metallicaGreen);
  cv.fillRect(cx - 16, torsoCenterY - 4, 32, 2, C.metallicaGreen);
  // White Drawstrings
  cv.fillRect(cx - 4, torsoCenterY + 20, 2, 8, C.white);
  cv.fillRect(cx + 3, torsoCenterY + 20, 2, 9, C.white);

  // 5. HEAD, SUNGLASSES, MUSHROOM HAIR & BEARD
  // Neck
  cv.fillEllipse(cx, headCenterY + 14, 12, 7, C.skinShade);
  // Head / Face
  cv.fillEllipse(cx, headCenterY, 19, 18, C.skin);
  // Double chin / jaw
  cv.fillEllipse(cx, headCenterY + 11, 14, 7, C.skin);
  cv.fillEllipse(cx, headCenterY + 14, 9, 3, C.skinShade);

  // Dark Oval Sunglasses
  cv.fillEllipse(cx - 8, headCenterY + 1, 7, 5, C.sunglasses);
  cv.fillEllipse(cx + 8, headCenterY + 1, 7, 5, C.sunglasses);
  cv.fillRect(cx - 3, headCenterY, 6, 2, C.sunglasses);
  // White Specular Highlight on lenses
  cv.fillRect(cx - 11, headCenterY - 1, 3, 2, C.white);
  cv.fillRect(cx + 5, headCenterY - 1, 3, 2, C.white);

  // Mouth
  if (isVictory) {
    cv.fillRect(cx - 5, headCenterY + 12, 10, 3, C.white);
  } else {
    cv.fillRect(cx - 4, headCenterY + 13, 8, 2, C.skinShade);
  }

  // MUSHROOM / BOWL CUT HAIR (Thick Black Dome over head)
  cv.fillCircle(cx, headCenterY - 8, 21, C.black);
  cv.fillEllipse(cx, headCenterY - 3, 22, 12, C.black);
  // Hair shine curve
  cv.fillRect(cx - 12, headCenterY - 18, 24, 2, { r: 60, g: 60, b: 70, a: 255 });

  // 6. FRONT ARM (MARTIAL CLAW GUARD / PUNCH)
  if (isVictory) {
    cv.fillEllipse(cx + 24, headCenterY - 14, 8, 12, C.skin);
    cv.fillEllipse(cx + 24, headCenterY - 24, 7, 7, C.skin);
  } else if (punchExt > 0) {
    // Extended fist
    cv.fillEllipse(cx + 16, torsoCenterY - 6, 9, 10, C.shirt);
    cv.fillEllipse(cx + 28 + punchExt * 0.5, torsoCenterY - 4, 12 + punchExt * 0.5, 7, C.skin);
    cv.fillCircle(cx + 34 + punchExt, torsoCenterY - 4, 9, C.skin);
    // Knuckle highlight
    cv.fillRect(cx + 36 + punchExt, torsoCenterY - 7, 4, 6, C.skinHighlight);
  } else if (isBlock) {
    cv.fillEllipse(cx + 10, torsoCenterY - 4, 8, 18, C.shirt);
    cv.fillEllipse(cx + 12, torsoCenterY - 16, 7, 8, C.skin);
    // Spark effect
    cv.fillCircle(cx + 20, torsoCenterY - 10, 6, C.spark);
  } else {
    // Martial Open Claw Stance (from v3.png)
    const clawBob = breatheY * 0.7;
    cv.fillEllipse(cx + 16, torsoCenterY - 8 + clawBob, 10, 10, C.shirt);
    cv.fillEllipse(cx + 28, torsoCenterY - 2 + clawBob, 12, 7, C.skin);

    // Open Claw Palm & 4 curved fingers
    const palmX = cx + 38;
    const palmY = torsoCenterY + clawBob;
    cv.fillCircle(palmX, palmY, 7, C.skin);
    // 4 claw fingers
    cv.fillRect(palmX + 4, palmY - 5, 5, 2, C.skin);
    cv.fillRect(palmX + 7, palmY - 2, 5, 2, C.skin);
    cv.fillRect(palmX + 6, palmY + 2, 5, 2, C.skin);
    cv.fillRect(palmX + 3, palmY + 6, 4, 2, C.skin);
    // Thumb
    cv.fillRect(palmX - 2, palmY - 6, 3, 3, C.skin);
  }

  // 7. SPECIAL SONIC BLAST EFFECT
  if (isSpecial) {
    const waveRadius = 14 + frameIndex * 10;
    cv.fillCircle(cx + 45, torsoCenterY, waveRadius, { r: 34, g: 197, b: 94, a: 90 });
    cv.fillCircle(cx + 45, torsoCenterY, waveRadius - 3, { r: 0, g: 0, b: 0, a: 0 }); // ring
    cv.fillCircle(cx + 55, torsoCenterY, waveRadius * 0.7, { r: 74, g: 222, b: 128, a: 120 });
  }

  // Hit flash
  if (isHurt && frameIndex % 2 === 0) {
    for (let i = 0; i < cv.data.length; i += 4) {
      if (cv.data[i + 3] > 0) {
        cv.data[i] = Math.min(255, cv.data[i] + 120);
        cv.data[i + 1] = Math.min(255, cv.data[i + 1] + 120);
        cv.data[i + 2] = Math.min(255, cv.data[i + 2] + 120);
      }
    }
  }
}

function drawSneaker(
  cv: PixelCanvas,
  x: number,
  y: number,
  w: number,
  h: number,
  isFront: boolean
) {
  // Black shoe upper
  cv.fillRect(x, y, w, h - 2, C.shoeBlack);
  // White toe box
  cv.fillRect(x + (isFront ? w - 7 : 1), y, 6, h - 3, C.white);
  // White laces
  cv.fillRect(x + 4, y + 1, 6, 1, C.white);
  cv.fillRect(x + 5, y + 3, 5, 1, C.white);
  // White midsole
  cv.fillRect(x, y + h - 2, w, 2, C.shoeSole);
  // Dark bottom sole
  cv.fillRect(x, y + h - 1, w, 1, C.darkShade);
}

function drawKnockdown(cv: PixelCanvas, cx: number, groundY: number, frame: number) {
  const y = groundY - 12;
  cv.fillEllipse(cx, groundY, 40, 6, C.shadow);
  // Horizontal body
  cv.fillEllipse(cx - 20, y, 18, 8, C.pants);
  drawSneaker(cv, cx - 36, y - 2, 16, 7, false);
  cv.fillEllipse(cx + 8, y - 4, 20, 12, C.shirt);
  cv.fillCircle(cx + 28, y - 6, 12, C.skin);
  cv.fillCircle(cx + 34, y - 8, 12, C.black); // hair
  cv.fillRect(cx + 26, y - 6, 8, 4, C.sunglasses);
}

function drawDefeat(cv: PixelCanvas, cx: number, groundY: number) {
  cv.fillEllipse(cx, groundY, 30, 6, C.shadow);
  // Slumped pose
  cv.fillEllipse(cx - 10, groundY - 10, 14, 10, C.pants);
  drawSneaker(cv, cx - 18, groundY - 6, 16, 6, false);
  cv.fillEllipse(cx + 4, groundY - 24, 18, 16, C.shirt);
  cv.fillCircle(cx + 12, groundY - 38, 12, C.skin);
  cv.fillCircle(cx + 14, groundY - 42, 13, C.black);
  cv.fillRect(cx + 10, groundY - 37, 6, 4, C.sunglasses);
}

// Generate all sprite files into public/assets/characters/que_paja_v1/
const outputDir = path.resolve(process.cwd(), 'public/assets/characters/que_paja_v1');

const animations: Record<string, number> = {
  'idle': 4,
  'walk': 6,
  'punch-light': 3,
  'punch-heavy': 4,
  'kick-light': 3,
  'kick-heavy': 4,
  'crouch': 2,
  'jump': 3,
  'special': 5,
  'hit': 2,
  'block': 2,
  'knockdown': 3,
  'get-up': 2,
  'victory': 4,
  'defeat': 2,
};

console.log('Generating QUE PAJA V1 sprite frames in:', outputDir);

for (const [animName, frameCount] of Object.entries(animations)) {
  const animFolder = path.join(outputDir, 'sprites', animName);
  fs.mkdirSync(animFolder, { recursive: true });

  for (let i = 0; i < frameCount; i++) {
    const cv = new PixelCanvas(140, 160);
    drawQuePajaFrame(cv, animName, i, frameCount);
    const pad = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
    const filePath = path.join(animFolder, `${pad}.png`);
    fs.writeFileSync(filePath, cv.toPng());
  }
}

// Generate Portrait (180x240)
const portraitCv = new PixelCanvas(180, 240);
drawQuePajaFrame(portraitCv, 'idle', 0, 1);
fs.writeFileSync(path.join(outputDir, 'portrait.png'), portraitCv.toPng());

console.log('All QUE PAJA V1 sprites generated successfully!');
