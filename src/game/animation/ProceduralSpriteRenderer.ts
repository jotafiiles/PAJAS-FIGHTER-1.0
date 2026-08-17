import { ColorVariant, FighterState } from '../../types';

export class ProceduralSpriteRenderer {
  /**
   * Renders the authentic "QUE PAJA" 2D fighter sprite with dynamic color variants,
   * accurate chunky proportions, mushroom/bowl hair, sunglasses, rock t-shirt logo,
   * baggy sweatpants with white drawstrings, black & white sneakers, and fluid animations.
   */
  public static renderFighter(
    ctx: CanvasRenderingContext2D,
    state: FighterState,
    frame: number,
    color: ColorVariant,
    facing: number, // 1 (facing right) or -1 (facing left)
    isHit: boolean = false,
    hitstop: boolean = false,
    characterId: string = 'que_paja_v1'
  ) {
    ctx.save();
    ctx.scale(facing, 1);

    // Apply flash if in hit recoil
    if (isHit && Math.floor(frame * 12) % 2 === 0) {
      ctx.filter = 'brightness(2.4) contrast(1.5)';
    }

    const skin = color.skinColor || '#a16238';
    const hair = color.hairColor || '#0a0a0c';
    const shirt = color.primaryColor || '#161616';
    const logoColor = color.secondaryColor || '#22c55e';
    const pants = color.pantColor || '#18181b';
    const accent = color.accentColor || '#4ade80';

    // Rhythmic breathing & walk bob cycles
    const breathe = state === 'idle' ? Math.sin(frame * 7) * 2.5 : 0;
    const walkBob = state === 'walk' ? Math.abs(Math.sin(frame * 12)) * 4.5 : 0;
    const walkPhase = state === 'walk' ? Math.sin(frame * 12) : 0;

    // Base origins (0, 0 is centered at feet on the ground)
    let headY = -94 + breathe - walkBob;
    let torsoY = -60 + (breathe * 0.6) - walkBob;
    let crouchOffset = 0;

    if (state === 'crouch') {
      crouchOffset = 26;
      headY += crouchOffset;
      torsoY += crouchOffset;
    } else if (state === 'jump' || state === 'fall') {
      headY -= 12;
      torsoY -= 12;
    } else if (state === 'knockdown') {
      this.renderKnockdown(ctx, skin, hair, shirt, pants, accent);
      ctx.restore();
      return;
    } else if (state === 'defeat') {
      this.renderDefeat(ctx, skin, hair, shirt, pants, accent);
      ctx.restore();
      return;
    }

    // 1. DYNAMIC CONTACT SHADOW ON FLOOR
    const shadowWidth = state === 'crouch' ? 48 : (state === 'jump' || state === 'fall' ? 24 : 44);
    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, shadowWidth);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.92)');
    grad.addColorStop(0.5, 'rgba(15, 6, 4, 0.5)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, shadowWidth, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle accent ambient glow
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.ellipse(0, 0, shadowWidth * 0.7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 2. BACK ARM (GUARD / PUNCH / CLAW)
    this.renderBackArm(ctx, state, frame, skin, shirt, accent, torsoY, breathe, characterId);

    // 3. PANTS & SNEAKERS
    this.renderLegsAndShoes(ctx, state, frame, pants, accent, crouchOffset, walkPhase, characterId);

    // 4. TORSO & APPAREL
    this.renderTorso(ctx, torsoY, shirt, logoColor, accent, pants, characterId);

    // 5. HEAD, HAIR, ACCESSORIES & SUNGLASSES
    this.renderHead(ctx, headY, skin, hair, state, accent, breathe, characterId);

    // 6. FRONT ARM
    this.renderFrontArm(ctx, state, frame, skin, shirt, accent, torsoY, breathe, characterId);

    // 7. SPECIAL SONIC BLAST EFFECT OVERLAY
    if (state === 'special') {
      this.renderSonicAura(ctx, torsoY, frame, accent, logoColor);
    }

    ctx.restore();
  }

  private static renderHead(
    ctx: CanvasRenderingContext2D,
    headY: number,
    skin: string,
    hair: string,
    state: FighterState,
    accent: string,
    breathe: number,
    characterId: string = 'que_paja_v1'
  ) {
    ctx.strokeStyle = '#050303';
    ctx.lineWidth = 2;

    // Robust Neck & Double Chin
    ctx.fillStyle = '#784323';
    ctx.beginPath();
    ctx.roundRect(-10, headY + 18, 20, 10, 3);
    ctx.fill();

    // Round Head Base
    const skinGrad = ctx.createLinearGradient(-16, headY, 16, headY + 28);
    skinGrad.addColorStop(0, skin);
    skinGrad.addColorStop(1, '#784323');

    ctx.fillStyle = skinGrad;
    ctx.beginPath();
    ctx.ellipse(0, headY + 12, 17, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (characterId === 'secret_boss') {
      // Dark cowl & glowing visor
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, headY + 4, 18, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00f2ff';
      ctx.fillRect(-12, headY + 8, 24, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-4, headY + 9, 8, 3);
      return;
    }

    if (characterId === 'rocker_punk') {
      // Rocker punk with pink/yellow mohawk
      ctx.fillStyle = '#050505';
      ctx.fillRect(-8, headY + 10, 4, 4);
      ctx.fillRect(4, headY + 10, 4, 4);

      // Punk spiky mohawk
      ctx.fillStyle = '#ec4899';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-4, headY + 2);
      ctx.lineTo(-6, headY - 18);
      ctx.lineTo(-1, headY - 10);
      ctx.lineTo(2, headY - 22);
      ctx.lineTo(5, headY - 8);
      ctx.lineTo(7, headY - 16);
      ctx.lineTo(4, headY + 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      return;
    }

    if (characterId === 'dj_scratch') {
      // DJ with backwards cap & headphones around neck
      ctx.fillStyle = '#00f2ff';
      ctx.beginPath();
      ctx.arc(0, headY + 4, 17, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.fillRect(-16, headY + 4, 8, 3); // cap visor backwards

      // Headphones around neck
      ctx.strokeStyle = '#00f2ff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, headY + 18, 14, 0, Math.PI);
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#050505';
      ctx.fillRect(-8, headY + 10, 4, 4);
      ctx.fillRect(4, headY + 10, 4, 4);
      return;
    }

    if (characterId === 'bboy_cumbia') {
      // B-Boy with red sideways cap
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, headY + 4, 18, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.fillRect(10, headY + 2, 10, 4); // sideways visor

      // Eyes & beard
      ctx.fillStyle = '#050505';
      ctx.fillRect(-8, headY + 10, 4, 4);
      ctx.fillRect(4, headY + 10, 4, 4);
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, headY + 18, 8, 0, Math.PI);
      ctx.stroke();
      return;
    }

    // Chubby Cheeks / Jawline (for QUE PAJA V1 & EL PAJA)
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, headY + 16, 12, 0, Math.PI);
    ctx.fill();

    // Dark Rounded Sunglasses (Lentes de sol negros)
    ctx.fillStyle = '#050505';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;

    // Left & Right oval lenses
    ctx.beginPath();
    ctx.ellipse(-6, headY + 10, 7, 5.5, 0, 0, Math.PI * 2);
    ctx.ellipse(6, headY + 10, 7, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bridge of sunglasses
    ctx.fillStyle = '#050505';
    ctx.fillRect(-2, headY + 8, 4, 3);

    // Specular White Highlights on sunglasses
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.ellipse(-8, headY + 8.5, 2.5, 1.5, -0.3, 0, Math.PI * 2);
    ctx.ellipse(4, headY + 8.5, 2.5, 1.5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Sunglass subtle accent brow line
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(-12, headY + 5.5, 24, 1.5);
    ctx.globalAlpha = 1.0;

    // Nose
    ctx.fillStyle = '#552a12';
    ctx.beginPath();
    ctx.ellipse(0, headY + 16, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    if (state === 'victory') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, headY + 20, 4, 0, Math.PI);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#401808';
      ctx.fillRect(-4, headY + 21, 8, 2);
    }

    // ICONIC BOWL / MUSHROOM CUT (Corte Champiñón / Casco abundante)
    ctx.fillStyle = hair;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    // Top dome
    ctx.arc(0, headY + 3, 19, Math.PI, 0);
    // Rounded sides and bangs hanging over forehead
    ctx.bezierCurveTo(20, headY + 10, 18, headY + 14, 14, headY + 14);
    ctx.lineTo(-14, headY + 14);
    ctx.bezierCurveTo(-18, headY + 14, -20, headY + 10, -19, headY + 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hair strand / fringe shine & texture
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, headY - 3, 13, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, headY + 2, 14, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
  }

  private static renderTorso(
    ctx: CanvasRenderingContext2D,
    torsoY: number,
    shirt: string,
    logoColor: string,
    accent: string,
    pants: string,
    characterId: string = 'que_paja_v1'
  ) {
    ctx.strokeStyle = '#050303';
    ctx.lineWidth = 2.5;

    // Torso Base
    const torsoGrad = ctx.createLinearGradient(-22, torsoY - 16, 22, torsoY + 26);
    torsoGrad.addColorStop(0, shirt);
    torsoGrad.addColorStop(1, '#0a0a0c');

    ctx.fillStyle = torsoGrad;
    ctx.beginPath();
    // Rounded stocky shape with belly curve
    ctx.roundRect(-22, torsoY - 16, 44, 42, 6);
    ctx.fill();
    ctx.stroke();

    if (characterId === 'el_paja') {
      // Orange hoodie lapels & gold disc
      ctx.fillStyle = '#ff5500';
      ctx.fillRect(-20, torsoY - 14, 8, 38);
      ctx.fillRect(12, torsoY - 14, 8, 38);

      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(0, torsoY + 4, 8, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (characterId === 'bboy_cumbia') {
      // Green tracksuit with yellow zipper line & gold chain
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, torsoY - 16);
      ctx.lineTo(0, torsoY + 26);
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.fillRect(-6, torsoY - 2, 12, 8);
      return;
    }

    if (characterId === 'dj_scratch') {
      // Cyan graphic
      ctx.fillStyle = '#00f2ff';
      ctx.font = '900 8px "Anton", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SCRATCH', 0, torsoY + 2);
      return;
    }

    if (characterId === 'rocker_punk') {
      // Silver studs on leather jacket
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(-12, torsoY - 6, 2, 0, Math.PI * 2);
      ctx.arc(-10, torsoY + 4, 2, 0, Math.PI * 2);
      ctx.arc(12, torsoY - 6, 2, 0, Math.PI * 2);
      ctx.arc(10, torsoY + 4, 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Belly fold shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, torsoY + 22, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // METALLICA / QUE PAJA ROCK GRAPHIC LOGO ON CHEST
    ctx.save();
    ctx.translate(0, torsoY - 2);

    // Jagged background text outline
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = logoColor;
    ctx.lineWidth = 1.2;
    ctx.font = '900 9px "Anton", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '1px';
    ctx.strokeText('QUE PAJA', 0, 0);
    ctx.fillText('QUE PAJA', 0, 0);

    // Green rock energy lightning lines
    ctx.strokeStyle = logoColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-18, 5);
    ctx.lineTo(-10, 8);
    ctx.lineTo(-2, 5);
    ctx.lineTo(6, 8);
    ctx.lineTo(18, 5);
    ctx.stroke();
    ctx.restore();

    // WHITE DRAWSTRINGS AT WAIST (Cordones blancos de los joggers)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Left cord
    ctx.moveTo(-4, torsoY + 25);
    ctx.lineTo(-6, torsoY + 36);
    // Right cord
    ctx.moveTo(3, torsoY + 25);
    ctx.lineTo(5, torsoY + 37);
    ctx.stroke();

    // Cord tips
    ctx.fillStyle = '#d4d4d8';
    ctx.fillRect(-7.5, torsoY + 35, 3, 3);
    ctx.fillRect(3.5, torsoY + 36, 3, 3);
  }

  private static renderLegsAndShoes(
    ctx: CanvasRenderingContext2D,
    state: FighterState,
    frame: number,
    pants: string,
    accent: string,
    crouchOffset: number,
    walkPhase: number,
    characterId: string = 'que_paja_v1'
  ) {
    ctx.strokeStyle = '#050303';
    ctx.lineWidth = 2.5;

    if (state === 'crouch') {
      // SQUATTED LEGS
      ctx.fillStyle = pants;
      ctx.beginPath();
      ctx.roundRect(-24, -30 + crouchOffset, 20, 24, 6);
      ctx.roundRect(4, -30 + crouchOffset, 20, 24, 6);
      ctx.fill();
      ctx.stroke();

      // Jogger cuff folds
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-22, -10 + crouchOffset, 16, 4);
      ctx.fillRect(6, -10 + crouchOffset, 16, 4);

      // Low sneakers
      this.renderSkateShoe(ctx, -26, -6 + crouchOffset, 22, 9, false);
      this.renderSkateShoe(ctx, 4, -6 + crouchOffset, 24, 9, true);
    } else if (state === 'walk') {
      // WALKING STRIDE (Fluid walk cycle with baggy pants motion)
      const leg1Angle = walkPhase * 18;
      const leg2Angle = -walkPhase * 18;

      // Back leg
      const backX = -18 - (leg2Angle * 0.5);
      const backLift = Math.max(0, -walkPhase * 8);
      ctx.fillStyle = pants;
      ctx.beginPath();
      ctx.roundRect(backX, -42, 16, 38 - backLift, 5);
      ctx.fill();
      ctx.stroke();

      // Back sneaker
      this.renderSkateShoe(ctx, backX - 4, -6 - backLift, 22, 9, false);

      // Front leg
      const frontX = 4 + (leg1Angle * 0.5);
      const frontLift = Math.max(0, walkPhase * 8);
      ctx.fillStyle = pants;
      ctx.beginPath();
      ctx.roundRect(frontX, -42, 17, 38 - frontLift, 5);
      ctx.fill();
      ctx.stroke();

      // Front sneaker
      this.renderSkateShoe(ctx, frontX - 2, -6 - frontLift, 24, 9, true);
    } else if (state === 'jump' || state === 'fall') {
      // AERIAL TUCKED LEGS
      ctx.fillStyle = pants;
      ctx.beginPath();
      ctx.roundRect(-20, -48, 16, 32, 5);
      ctx.roundRect(4, -44, 16, 28, 5);
      ctx.fill();
      ctx.stroke();

      this.renderSkateShoe(ctx, -24, -20, 22, 9, false);
      this.renderSkateShoe(ctx, 4, -18, 23, 9, true);
    } else {
      // WIDE MARTIAL STANCE (De pie con piernas abiertas y firmes)
      ctx.fillStyle = pants;
      ctx.beginPath();
      ctx.roundRect(-22, -44, 18, 40, 5);
      ctx.roundRect(4, -44, 18, 40, 5);
      ctx.fill();
      ctx.stroke();

      // Jogger wrinkles & folds
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-18, -26);
      ctx.lineTo(-8, -24);
      ctx.moveTo(8, -26);
      ctx.lineTo(18, -24);
      ctx.stroke();

      // Sneakers firmly on the ground
      this.renderSkateShoe(ctx, -26, -6, 23, 9, false);
      this.renderSkateShoe(ctx, 3, -6, 25, 9, true);
    }
  }

  /**
   * Renders the iconic Black & White skater sneakers (Nike Dunk / Jordan 1 style)
   */
  private static renderSkateShoe(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    isFront: boolean
  ) {
    ctx.save();
    // 1. Black Shoe Upper Base
    ctx.fillStyle = '#18181b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, [3, 5, 2, 2]);
    ctx.fill();
    ctx.stroke();

    // 2. White Toe Box
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(x + (isFront ? width - 9 : 2), y + 1, 7, height - 4, 2);
    ctx.fill();

    // 3. White Laces
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 7, y + 2);
    ctx.lineTo(x + 14, y + 2);
    ctx.moveTo(x + 8, y + 4.5);
    ctx.lineTo(x + 13, y + 4.5);
    ctx.stroke();

    // 4. White Midsole & Dark Outsole
    ctx.fillStyle = '#f4f4f5';
    ctx.fillRect(x, y + height - 3.5, width, 2.5);
    ctx.fillStyle = '#27272a';
    ctx.fillRect(x, y + height - 1, width, 1.5);

    ctx.restore();
  }

  private static renderBackArm(
    ctx: CanvasRenderingContext2D,
    state: FighterState,
    frame: number,
    skin: string,
    shirt: string,
    accent: string,
    torsoY: number,
    breathe: number,
    characterId: string = 'que_paja_v1'
  ) {
    ctx.strokeStyle = '#050303';
    ctx.lineWidth = 2.5;

    if (state === 'punch') {
      // Guarding back fist during light punch
      ctx.fillStyle = shirt;
      ctx.beginPath();
      ctx.roundRect(-26, torsoY - 12, 14, 16, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(-24, torsoY + 2, 12, 12, 4);
      ctx.fill();
      ctx.stroke();
    } else if (state === 'kick') {
      // Counterbalance back arm during kick
      ctx.fillStyle = shirt;
      ctx.beginPath();
      ctx.roundRect(-28, torsoY - 14, 14, 18, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(-34, torsoY + 2, 14, 12, 4);
      ctx.fill();
      ctx.stroke();
    } else if (state === 'block') {
      // Crossing arm shield
      ctx.fillStyle = shirt;
      ctx.beginPath();
      ctx.roundRect(-10, torsoY - 16, 14, 28, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(-8, torsoY - 26, 12, 14, 4);
      ctx.fill();
      ctx.stroke();
    } else {
      // MARTIAL STANCE: RIGHT ARM FOLDED CLOSE WITH CLENCHED FIST (as in v3.png)
      const armBob = breathe * 0.5;

      // Shoulder sleeve
      ctx.fillStyle = shirt;
      ctx.beginPath();
      ctx.roundRect(-24, torsoY - 14 + armBob, 15, 18, 4);
      ctx.fill();
      ctx.stroke();

      // Forearm tucking in
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(-18, torsoY - 4 + armBob, 14, 16, 4);
      ctx.fill();
      ctx.stroke();

      // Clenched solid fist
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.ellipse(-10, torsoY + 6 + armBob, 8, 7, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Knuckle creases
      ctx.strokeStyle = '#552a12';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-14, torsoY + 4 + armBob);
      ctx.lineTo(-6, torsoY + 5 + armBob);
      ctx.moveTo(-14, torsoY + 8 + armBob);
      ctx.lineTo(-7, torsoY + 9 + armBob);
      ctx.stroke();
    }
  }

  private static renderFrontArm(
    ctx: CanvasRenderingContext2D,
    state: FighterState,
    frame: number,
    skin: string,
    shirt: string,
    accent: string,
    torsoY: number,
    breathe: number,
    characterId: string = 'que_paja_v1'
  ) {
    ctx.strokeStyle = '#050303';
    ctx.lineWidth = 2.5;

    if (state === 'punch') {
      // HEAVY EXTENDED JAB / HOOK
      // Shoulder sleeve
      ctx.fillStyle = shirt;
      ctx.beginPath();
      ctx.roundRect(14, torsoY - 14, 16, 16, 4);
      ctx.fill();
      ctx.stroke();

      // Extended muscular forearm
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(26, torsoY - 13, 38, 14, 5);
      ctx.fill();
      ctx.stroke();

      // Massive front impact fist
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(58, torsoY - 16, 18, 18, 5);
      ctx.fill();
      ctx.stroke();

      // Fist impact lines & shockwave spark
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(78, torsoY - 20);
      ctx.lineTo(88, torsoY - 7);
      ctx.lineTo(78, torsoY + 6);
      ctx.stroke();
    } else if (state === 'kick') {
      // Extended thrust kick
      ctx.fillStyle = shirt;
      ctx.beginPath();
      ctx.roundRect(10, torsoY - 14, 14, 16, 4);
      ctx.fill();
      ctx.stroke();

      // Extended kicking leg from hip
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.roundRect(18, torsoY - 4, 46, 16, 5);
      ctx.fill();
      ctx.stroke();

      // Front shoe strike
      this.renderSkateShoe(ctx, 58, torsoY - 6, 26, 12, true);
    } else if (state === 'block') {
      // Front blocking forearm with guard spark
      ctx.fillStyle = shirt;
      ctx.beginPath();
      ctx.roundRect(12, torsoY - 18, 15, 28, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(14, torsoY - 26, 14, 16, 4);
      ctx.fill();
      ctx.stroke();

      // Shield spark
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(24, torsoY - 8, 14, 0, Math.PI * 2);
      ctx.stroke();
    } else if (state === 'victory') {
      // Both fists raised in triumph
      ctx.fillStyle = shirt;
      ctx.beginPath();
      ctx.roundRect(14, torsoY - 24, 14, 20, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(16, torsoY - 42, 12, 22, 4);
      ctx.fill();
      ctx.stroke();

      // Victory fist
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(14, torsoY - 52, 16, 14, 4);
      ctx.fill();
      ctx.stroke();
    } else {
      // MARTIAL STANCE: LEFT ARM EXTENDED FORWARD WITH OPEN CLAW/PALM (as in v3.png)
      const clawBob = breathe * 0.7;

      // Shoulder sleeve
      ctx.fillStyle = shirt;
      ctx.beginPath();
      ctx.roundRect(16, torsoY - 14 + clawBob, 16, 17, 4);
      ctx.fill();
      ctx.stroke();

      // Forearm reaching forward
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.roundRect(28, torsoY - 8 + clawBob, 22, 13, 4);
      ctx.fill();
      ctx.stroke();

      // OPEN CLAW PALM & FINGERS (Pose de combate callejero)
      ctx.save();
      ctx.translate(46, torsoY - 6 + clawBob);

      // Palm base
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.ellipse(4, 4, 8, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 4 Curved Claw Fingers (Dedos en garra)
      ctx.strokeStyle = '#050303';
      ctx.fillStyle = skin;
      ctx.lineWidth = 2;

      // Index finger
      ctx.beginPath();
      ctx.arc(10, -2, 5, 0, Math.PI * 0.8);
      ctx.stroke();

      // Middle finger
      ctx.beginPath();
      ctx.arc(14, 2, 5, 0, Math.PI * 0.8);
      ctx.stroke();

      // Ring finger
      ctx.beginPath();
      ctx.arc(12, 7, 5, 0, Math.PI * 0.8);
      ctx.stroke();

      // Pinky finger
      ctx.beginPath();
      ctx.arc(8, 11, 4, 0, Math.PI * 0.8);
      ctx.stroke();

      // Thumb
      ctx.beginPath();
      ctx.arc(0, -2, 4, Math.PI * 0.8, Math.PI * 1.6);
      ctx.stroke();

      ctx.restore();
    }
  }

  private static renderSonicAura(
    ctx: CanvasRenderingContext2D,
    torsoY: number,
    frame: number,
    accent: string,
    logoColor: string
  ) {
    const pulse = Math.sin(frame * 16);
    ctx.save();

    // Expanding green/neon sonic wave rings
    ctx.strokeStyle = logoColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(45, torsoY - 2, 28 + pulse * 12, -Math.PI * 0.6, Math.PI * 0.6);
    ctx.stroke();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(60, torsoY - 2, 42 + pulse * 14, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();

    ctx.restore();
  }

  private static renderKnockdown(
    ctx: CanvasRenderingContext2D,
    skin: string,
    hair: string,
    shirt: string,
    pants: string,
    accent: string
  ) {
    ctx.strokeStyle = '#050303';
    ctx.lineWidth = 2;

    // Body on floor (horizontal)
    ctx.fillStyle = pants;
    ctx.beginPath();
    ctx.roundRect(-42, -14, 42, 13, 4);
    ctx.fill();
    ctx.stroke();

    // Sneakers
    this.renderSkateShoe(ctx, -52, -14, 18, 9, false);

    // Torso with rock shirt
    ctx.fillStyle = shirt;
    ctx.beginPath();
    ctx.roundRect(-10, -18, 38, 17, 5);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.roundRect(26, -20, 19, 17, 5);
    ctx.fill();
    ctx.stroke();

    // Glasses
    ctx.fillStyle = '#000000';
    ctx.fillRect(30, -16, 12, 6);

    // Hair
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.arc(35, -20, 11, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  }

  private static renderDefeat(
    ctx: CanvasRenderingContext2D,
    skin: string,
    hair: string,
    shirt: string,
    pants: string,
    accent: string
  ) {
    ctx.strokeStyle = '#050303';
    ctx.lineWidth = 2;

    // Kneeling defeated pose
    ctx.fillStyle = pants;
    ctx.beginPath();
    ctx.roundRect(-18, -22, 26, 20, 4);
    ctx.fill();
    ctx.stroke();

    this.renderSkateShoe(ctx, -24, -8, 20, 8, false);

    ctx.fillStyle = shirt;
    ctx.beginPath();
    ctx.roundRect(-14, -44, 28, 26, 5);
    ctx.fill();
    ctx.stroke();

    // Head slumped down
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.roundRect(-4, -62, 19, 21, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.arc(5, -62, 12, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  }
}

