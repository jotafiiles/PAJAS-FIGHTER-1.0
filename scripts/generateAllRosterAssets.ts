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

  public toPngBuffer(): Buffer {
    return encodeRgbaToPng(this.width, this.height, this.data);
  }
}

// Character visual specifications
interface CharSpec {
  folder: string;
  name: string;
  skin: RGBAColor;
  hair: RGBAColor;
  shirt: RGBAColor;
  pants: RGBAColor;
  accent: RGBAColor;
  headStyle: 'mushroom' | 'cap_backwards' | 'cap_sideways' | 'mohawk' | 'hood';
  specialItem: 'claw' | 'hoodie' | 'turntable' | 'chain' | 'studs' | 'cyber';
}

const ROSTER_SPECS: CharSpec[] = [
  {
    folder: 'el-paja',
    name: 'EL PAJA',
    skin: { r: 141, g: 85, b: 36, a: 255 },
    hair: { r: 10, g: 10, b: 12, a: 255 },
    shirt: { r: 24, g: 24, b: 27, a: 255 },
    pants: { r: 39, g: 39, b: 42, a: 255 },
    accent: { r: 255, g: 78, b: 0, a: 255 },
    headStyle: 'mushroom',
    specialItem: 'hoodie',
  },
  {
    folder: 'dj-scratch',
    name: 'DJ SCRATCH',
    skin: { r: 155, g: 95, b: 50, a: 255 },
    hair: { r: 3, g: 105, b: 161, a: 255 },
    shirt: { r: 14, g: 116, b: 144, a: 255 },
    pants: { r: 8, g: 47, b: 73, a: 255 },
    accent: { r: 0, g: 242, b: 255, a: 255 },
    headStyle: 'cap_backwards',
    specialItem: 'turntable',
  },
  {
    folder: 'b-boy-cumbia',
    name: 'B-BOY CUMBIA',
    skin: { r: 160, g: 98, b: 48, a: 255 },
    hair: { r: 20, g: 20, b: 24, a: 255 },
    shirt: { r: 4, g: 120, b: 87, a: 255 },
    pants: { r: 6, g: 78, b: 59, a: 255 },
    accent: { r: 250, g: 204, b: 21, a: 255 },
    headStyle: 'cap_sideways',
    specialItem: 'chain',
  },
  {
    folder: 'rocker-punk',
    name: 'ROCKER PUNK',
    skin: { r: 165, g: 105, b: 55, a: 255 },
    hair: { r: 236, g: 72, b: 153, a: 255 },
    shirt: { r: 46, g: 16, b: 101, a: 255 },
    pants: { r: 30, g: 27, b: 75, a: 255 },
    accent: { r: 244, g: 63, b: 94, a: 255 },
    headStyle: 'mohawk',
    specialItem: 'studs',
  },
  {
    folder: '_character-template',
    name: 'TEMPLATE FIGHTER',
    skin: { r: 141, g: 85, b: 36, a: 255 },
    hair: { r: 24, g: 24, b: 27, a: 255 },
    shirt: { r: 39, g: 39, b: 42, a: 255 },
    pants: { r: 24, g: 24, b: 27, a: 255 },
    accent: { r: 255, g: 78, b: 0, a: 255 },
    headStyle: 'mushroom',
    specialItem: 'claw',
  },
];

const ANIMATION_SPECS: Record<string, { folder: string; frameCount: number }> = {
  idle: { folder: 'sprites/idle', frameCount: 5 },
  walk: { folder: 'sprites/walk', frameCount: 6 },
  'walk-back': { folder: 'sprites/walk-back', frameCount: 6 },
  jump: { folder: 'sprites/jump', frameCount: 4 },
  crouch: { folder: 'sprites/crouch', frameCount: 2 },
  block: { folder: 'sprites/block', frameCount: 2 },
  hit: { folder: 'sprites/hit', frameCount: 3 },
  knockdown: { folder: 'sprites/knockdown', frameCount: 5 },
  'get-up': { folder: 'sprites/get-up', frameCount: 4 },
  victory: { folder: 'sprites/victory', frameCount: 6 },
  defeat: { folder: 'sprites/defeat', frameCount: 4 },
  'punch-light': { folder: 'sprites/punch-light', frameCount: 4 },
  'punch-heavy': { folder: 'sprites/punch-heavy', frameCount: 6 },
  'kick-light': { folder: 'sprites/kick-light', frameCount: 4 },
  'kick-heavy': { folder: 'sprites/kick-heavy', frameCount: 6 },
  special: { folder: 'sprites/special', frameCount: 8 },
};

function renderCharacterFrame(
  canvas: PixelCanvas,
  spec: CharSpec,
  action: string,
  frameIdx: number,
  totalFrames: number
) {
  const cx = 64;
  const groundY = 120;
  const black: RGBAColor = { r: 5, g: 5, b: 5, a: 255 };
  const white: RGBAColor = { r: 255, g: 255, b: 255, a: 255 };

  const phase = (frameIdx / totalFrames) * Math.PI * 2;
  let breathe = 0;
  let torsoY = groundY - 60;
  let headY = groundY - 88;
  let crouchY = 0;

  if (action === 'idle') {
    breathe = Math.sin(phase) * 2;
    torsoY += breathe * 0.5;
    headY += breathe;
  } else if (action === 'crouch') {
    crouchY = 22;
    torsoY += crouchY;
    headY += crouchY;
  } else if (action === 'jump') {
    const jumpArc = Math.sin((frameIdx / (totalFrames - 1)) * Math.PI) * 16;
    torsoY -= jumpArc;
    headY -= jumpArc;
  } else if (action === 'knockdown' || action === 'defeat') {
    // Fallen body
    canvas.fillEllipse(cx, groundY - 14, 38, 14, spec.pants);
    canvas.fillEllipse(cx + 20, groundY - 18, 20, 16, spec.shirt);
    canvas.fillCircle(cx + 34, groundY - 20, 12, spec.skin);
    canvas.fillRect(cx - 36, groundY - 16, 18, 10, black);
    return;
  }

  // 1. Contact Shadow
  canvas.fillEllipse(cx, groundY, crouchY > 0 ? 36 : 30, 8, { r: 0, g: 0, b: 0, a: 160 });

  // 2. Legs
  if (crouchY > 0) {
    canvas.fillRect(cx - 20, groundY - 24, 16, 20, spec.pants);
    canvas.fillRect(cx + 4, groundY - 24, 16, 20, spec.pants);
    canvas.fillRect(cx - 24, groundY - 8, 20, 8, black);
    canvas.fillRect(cx + 4, groundY - 8, 20, 8, black);
  } else if (action === 'walk' || action === 'walk-back') {
    const stride = Math.sin(phase) * 14;
    canvas.fillRect(cx - 14 - stride, groundY - 40, 14, 36, spec.pants);
    canvas.fillRect(cx + 2 + stride, groundY - 40, 14, 36, spec.pants);
    canvas.fillRect(cx - 18 - stride, groundY - 8, 20, 8, black);
    canvas.fillRect(cx + 2 + stride, groundY - 8, 20, 8, black);
  } else {
    canvas.fillRect(cx - 16, groundY - 42, 14, 38, spec.pants);
    canvas.fillRect(cx + 2, groundY - 42, 14, 38, spec.pants);
    canvas.fillRect(cx - 20, groundY - 8, 20, 8, black);
    canvas.fillRect(cx + 2, groundY - 8, 20, 8, black);
  }

  // 3. Torso
  canvas.fillRect(cx - 18, torsoY, 36, 32, spec.shirt);
  if (spec.specialItem === 'hoodie') {
    canvas.fillRect(cx - 18, torsoY, 6, 32, spec.accent);
    canvas.fillRect(cx + 12, torsoY, 6, 32, spec.accent);
    canvas.fillCircle(cx, torsoY + 12, 6, { r: 234, g: 179, b: 8, a: 255 });
  } else if (spec.specialItem === 'chain') {
    canvas.fillRect(cx - 6, torsoY + 10, 12, 6, spec.accent);
  } else if (spec.specialItem === 'studs') {
    canvas.fillCircle(cx - 10, torsoY + 8, 2, white);
    canvas.fillCircle(cx + 10, torsoY + 8, 2, white);
  } else {
    // Logo line
    canvas.fillRect(cx - 10, torsoY + 8, 20, 4, spec.accent);
  }

  // Drawstrings
  canvas.fillRect(cx - 4, torsoY + 28, 2, 8, white);
  canvas.fillRect(cx + 2, torsoY + 28, 2, 8, white);

  // 4. Head
  canvas.fillCircle(cx, headY + 10, 14, spec.skin);

  // Headstyle
  if (spec.headStyle === 'mushroom') {
    canvas.fillEllipse(cx, headY + 4, 17, 12, spec.hair);
    canvas.fillRect(cx - 10, headY + 8, 8, 6, black);
    canvas.fillRect(cx + 2, headY + 8, 8, 6, black);
    canvas.fillRect(cx - 8, headY + 9, 3, 2, white);
    canvas.fillRect(cx + 4, headY + 9, 3, 2, white);
  } else if (spec.headStyle === 'cap_backwards') {
    canvas.fillEllipse(cx, headY + 4, 15, 10, spec.accent);
    canvas.fillRect(cx - 16, headY + 6, 6, 3, spec.shirt);
    canvas.fillRect(cx - 8, headY + 10, 4, 4, black);
    canvas.fillRect(cx + 4, headY + 10, 4, 4, black);
    // Headphones
    canvas.fillCircle(cx - 14, headY + 14, 5, spec.accent);
    canvas.fillCircle(cx + 14, headY + 14, 5, spec.accent);
  } else if (spec.headStyle === 'cap_sideways') {
    canvas.fillEllipse(cx, headY + 4, 16, 10, { r: 220, g: 38, b: 38, a: 255 });
    canvas.fillRect(cx + 10, headY + 4, 8, 4, { r: 220, g: 38, b: 38, a: 255 });
    canvas.fillRect(cx - 8, headY + 10, 4, 4, black);
    canvas.fillRect(cx + 4, headY + 10, 4, 4, black);
  } else if (spec.headStyle === 'mohawk') {
    canvas.fillRect(cx - 3, headY - 10, 6, 16, spec.hair);
    canvas.fillCircle(cx, headY - 10, 4, { r: 250, g: 204, b: 21, a: 255 });
    canvas.fillRect(cx - 8, headY + 10, 4, 4, black);
    canvas.fillRect(cx + 4, headY + 10, 4, 4, black);
  }

  // 5. Arms & Action Pose
  if (action === 'punch-light' || action === 'punch-heavy') {
    const ext = action === 'punch-heavy' ? 24 : 16;
    canvas.fillRect(cx + 12, torsoY + 4, ext, 10, spec.skin);
    canvas.fillCircle(cx + 12 + ext, torsoY + 9, 8, spec.skin);
    canvas.fillRect(cx - 20, torsoY + 8, 10, 14, spec.shirt);
  } else if (action === 'kick-light' || action === 'kick-heavy') {
    const ext = action === 'kick-heavy' ? 26 : 18;
    canvas.fillRect(cx + 10, torsoY + 16, ext, 10, spec.pants);
    canvas.fillRect(cx + 10 + ext, torsoY + 14, 14, 12, black);
  } else if (action === 'special') {
    // Special attack aura
    canvas.fillCircle(cx + 28, torsoY + 10, 16, spec.accent);
    canvas.fillCircle(cx + 28, torsoY + 10, 8, white);
  } else if (action === 'block') {
    canvas.fillRect(cx + 8, torsoY - 4, 10, 26, spec.skin);
    canvas.fillRect(cx + 14, torsoY - 8, 12, 12, spec.accent);
  } else if (action === 'hit') {
    canvas.fillRect(cx - 18, torsoY + 6, 12, 16, spec.skin);
    canvas.fillCircle(cx + 4, torsoY + 8, 10, spec.accent);
  } else {
    // Default / Walk / Idle arms
    canvas.fillRect(cx - 22, torsoY + 4, 8, 20, spec.skin);
    canvas.fillRect(cx + 14, torsoY + 4, 14, 14, spec.skin);
    if (spec.specialItem === 'turntable') {
      canvas.fillCircle(cx + 22, torsoY + 18, 10, black);
      canvas.fillCircle(cx + 22, torsoY + 18, 3, spec.accent);
    }
  }
}

function renderPortrait(spec: CharSpec): PixelCanvas {
  const canvas = new PixelCanvas(180, 240);
  const cx = 90;
  const cy = 130;
  const black: RGBAColor = { r: 10, g: 10, b: 12, a: 255 };
  const white: RGBAColor = { r: 255, g: 255, b: 255, a: 255 };

  // Background gradient / framing
  for (let y = 0; y < 240; y++) {
    for (let x = 0; x < 180; x++) {
      const gradRatio = y / 240;
      canvas.setPixel(x, y, {
        r: Math.round(spec.accent.r * 0.4 * (1 - gradRatio) + 15),
        g: Math.round(spec.accent.g * 0.4 * (1 - gradRatio) + 15),
        b: Math.round(spec.accent.b * 0.4 * (1 - gradRatio) + 20),
        a: 255,
      });
    }
  }

  // Torso / Shoulders
  canvas.fillEllipse(cx, cy + 80, 70, 50, spec.shirt);
  if (spec.specialItem === 'hoodie') {
    canvas.fillRect(cx - 40, cy + 40, 14, 70, spec.accent);
    canvas.fillRect(cx + 26, cy + 40, 14, 70, spec.accent);
    canvas.fillCircle(cx, cy + 70, 12, { r: 234, g: 179, b: 8, a: 255 });
  }

  // Neck
  canvas.fillRect(cx - 16, cy + 10, 32, 30, spec.skin);

  // Head
  canvas.fillCircle(cx, cy - 20, 38, spec.skin);

  // Headwear / Hair
  if (spec.headStyle === 'mushroom') {
    canvas.fillEllipse(cx, cy - 36, 44, 30, spec.hair);
    // Sunglasses
    canvas.fillEllipse(cx - 18, cy - 18, 14, 10, black);
    canvas.fillEllipse(cx + 18, cy - 18, 14, 10, black);
    canvas.fillRect(cx - 6, cy - 20, 12, 4, black);
    canvas.fillRect(cx - 24, cy - 20, 8, 3, white);
    canvas.fillRect(cx + 12, cy - 20, 8, 3, white);
  } else if (spec.headStyle === 'cap_backwards') {
    canvas.fillEllipse(cx, cy - 36, 40, 24, spec.accent);
    canvas.fillRect(cx - 46, cy - 32, 16, 8, spec.shirt);
    canvas.fillCircle(cx - 18, cy - 18, 6, black);
    canvas.fillCircle(cx + 18, cy - 18, 6, black);
    // Headphones
    canvas.fillEllipse(cx - 40, cy - 10, 10, 18, spec.accent);
    canvas.fillEllipse(cx + 40, cy - 10, 10, 18, spec.accent);
  } else if (spec.headStyle === 'cap_sideways') {
    canvas.fillEllipse(cx, cy - 38, 42, 26, { r: 220, g: 38, b: 38, a: 255 });
    canvas.fillRect(cx + 24, cy - 40, 24, 10, { r: 220, g: 38, b: 38, a: 255 });
    canvas.fillCircle(cx - 18, cy - 18, 6, black);
    canvas.fillCircle(cx + 18, cy - 18, 6, black);
  } else if (spec.headStyle === 'mohawk') {
    canvas.fillRect(cx - 8, cy - 75, 16, 46, spec.hair);
    canvas.fillCircle(cx, cy - 72, 10, { r: 250, g: 204, b: 21, a: 255 });
    canvas.fillCircle(cx - 18, cy - 18, 6, black);
    canvas.fillCircle(cx + 18, cy - 18, 6, black);
  }

  // Smirk / Chin
  canvas.fillRect(cx - 8, cy + 6, 16, 4, black);

  // Metal Border
  for (let i = 0; i < 4; i++) {
    canvas.drawLine(i, i, 180 - i, i, spec.accent);
    canvas.drawLine(i, 240 - i, 180 - i, 240 - i, spec.accent);
    canvas.drawLine(i, i, i, 240 - i, spec.accent);
    canvas.drawLine(180 - i, i, 180 - i, 240 - i, spec.accent);
  }

  return canvas;
}

export function generateAllRosterAssets() {
  const baseDir = path.resolve(process.cwd(), 'public/assets/characters');

  for (const spec of ROSTER_SPECS) {
    const charDir = path.join(baseDir, spec.folder);
    if (!fs.existsSync(charDir)) {
      fs.mkdirSync(charDir, { recursive: true });
    }

    // 1. Generate Portrait
    const portraitCanvas = renderPortrait(spec);
    fs.writeFileSync(path.join(charDir, 'portrait.png'), portraitCanvas.toPngBuffer());

    // 2. Generate Animation Frames
    for (const [actionName, animDef] of Object.entries(ANIMATION_SPECS)) {
      const animDir = path.join(charDir, animDef.folder);
      if (!fs.existsSync(animDir)) {
        fs.mkdirSync(animDir, { recursive: true });
      }

      for (let f = 1; f <= animDef.frameCount; f++) {
        const frameCanvas = new PixelCanvas(128, 128);
        renderCharacterFrame(frameCanvas, spec, actionName, f - 1, animDef.frameCount);
        const pad = f < 10 ? `0${f}` : `${f}`;
        fs.writeFileSync(path.join(animDir, `${pad}.png`), frameCanvas.toPngBuffer());
      }
    }

    console.log(`Generated complete sprite assets and portrait for: ${spec.folder}`);
  }
}

generateAllRosterAssets();
