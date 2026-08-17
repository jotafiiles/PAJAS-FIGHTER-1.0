import React from 'react';
import { CharacterData, ColorVariant } from '../types';

export interface PaletteDef {
  skin: string;
  skinShade: string;
  shirt: string;
  shirtShade: string;
  pants: string;
  pantsShade: string;
  accent: string;
  hair: string;
}

export function getPaletteForCharacter(char: CharacterData, colorVariant?: ColorVariant): PaletteDef {
  const c = colorVariant || char.colors?.[0];
  const primary = c?.primaryColor || '#18181b';
  const secondary = c?.secondaryColor || '#22c55e';
  const skin = c?.skinColor || '#a16238';
  const hair = c?.hairColor || '#0a0a0c';
  const pants = c?.pantColor || '#161616';
  const accent = c?.accentColor || secondary || '#4ade80';

  const skinShade = darkenHex(skin, 0.3);
  const shirtShade = darkenHex(primary, 0.4);
  const pantsShade = darkenHex(pants, 0.4);

  return {
    skin,
    skinShade,
    shirt: primary,
    shirtShade,
    pants,
    pantsShade,
    accent,
    hair,
  };
}

function darkenHex(hex: string, percent: number): string {
  try {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(x => x + x).join('');
    }
    const num = parseInt(clean, 16);
    if (isNaN(num)) return '#000000';
    let r = num >> 16;
    let g = (num >> 8) & 0x00ff;
    let b = num & 0x0000ff;
    r = Math.max(0, Math.floor(r * (1 - percent)));
    g = Math.max(0, Math.floor(g * (1 - percent)));
    b = Math.max(0, Math.floor(b * (1 - percent)));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch {
    return '#050505';
  }
}

interface FighterAvatarSvgProps {
  id?: string;
  character?: CharacterData;
  colorVariant?: ColorVariant;
  palette?: Partial<PaletteDef>;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const FighterAvatarSvg: React.FC<FighterAvatarSvgProps> = ({
  id = 'f',
  character,
  colorVariant,
  palette: customPalette,
  width = '100%',
  height = '100%',
  className = '',
  style,
}) => {
  const defaultPalette = character
    ? getPaletteForCharacter(character, colorVariant)
    : {
        skin: '#a16238',
        skinShade: '#723e1c',
        shirt: '#161616',
        shirtShade: '#09090a',
        pants: '#18181b',
        pantsShade: '#0c0c0e',
        accent: '#22c55e',
        hair: '#0a0a0c',
      };

  const palette: PaletteDef = {
    ...defaultPalette,
    ...customPalette,
  };

  const { skin, skinShade, shirt, shirtShade, pants, pantsShade, accent, hair } = palette;
  const uniqueId = `f_${id}_${character?.id || 'char'}_${skin.replace('#', '')}_${accent.replace('#', '')}`;
  const charId = character?.id || 'que_paja_v1';

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 240 330"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`grad_skin_${uniqueId}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={skin} />
          <stop offset="100%" stopColor={skinShade} />
        </linearGradient>
        <linearGradient id={`grad_shirt_${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shirt} />
          <stop offset="100%" stopColor={shirtShade} />
        </linearGradient>
        <linearGradient id={`grad_pants_${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pants} />
          <stop offset="100%" stopColor={pantsShade} />
        </linearGradient>
        <radialGradient id={`rim_${uniqueId}`} cx="40%" cy="25%" r="75%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.25" />
          <stop offset="70%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sombra de contacto en el piso */}
      <ellipse cx="120" cy="320" rx="75" ry="10" fill="#000000" opacity="0.85" />
      <ellipse cx="120" cy="320" rx="45" ry="5" fill={accent} opacity="0.2" />

      {/* RENDER DISTINCT CHARACTERS */}
      {charId === 'que_paja_v1' ? (
        // 1. QUE PAJA V1 - AUTHENTIC v3.png
        <QuePajaV1AvatarBody uniqueId={uniqueId} palette={palette} accent={accent} />
      ) : charId === 'el_paja' ? (
        // 2. EL PAJA - STREET HOODIE & GOLD CHAIN
        <ElPajaAvatarBody uniqueId={uniqueId} palette={palette} accent={accent} />
      ) : charId === 'dj_scratch' ? (
        // 3. DJ SCRATCH - HEADPHONES & CAP & TURNTABLE
        <DjScratchAvatarBody uniqueId={uniqueId} palette={palette} accent={accent} />
      ) : charId === 'bboy_cumbia' ? (
        // 4. B-BOY CUMBIA - GREEN TRACKSUIT & SIDEWAYS CAP
        <BboyCumbiaAvatarBody uniqueId={uniqueId} palette={palette} accent={accent} />
      ) : charId === 'rocker_punk' ? (
        // 5. ROCKER PUNK - MOHAWK & SPIKED LEATHER JACKET
        <RockerPunkAvatarBody uniqueId={uniqueId} palette={palette} accent={accent} />
      ) : (
        // 6. SECRET BOSS / LOCKED
        <SecretBossAvatarBody uniqueId={uniqueId} palette={palette} accent={accent} />
      )}

      {/* Luz de borde envolvente */}
      <ellipse cx="120" cy="140" rx="105" ry="165" fill={`url(#rim_${uniqueId})`} pointerEvents="none" />
    </svg>
  );
};

// ==========================================
// 1. QUE PAJA V1 (EXACT RECREATION OF v3.png)
// ==========================================
function QuePajaV1AvatarBody({
  uniqueId,
  palette,
  accent,
}: {
  uniqueId: string;
  palette: PaletteDef;
  accent: string;
}) {
  const { skin, skinShade, hair } = palette;

  return (
    <g>
      {/* PIERNA TRASERA (DERECHA) */}
      <path
        d="M80 185 Q65 240 60 295 L88 295 Q96 240 108 190 Z"
        fill={`url(#grad_pants_${uniqueId})`}
        stroke="#000"
        strokeWidth="2.5"
      />
      <path d="M68 250 Q78 256 88 252" stroke="#09090b" strokeWidth="2" fill="none" />
      <path d="M64 275 Q74 280 84 276" stroke="#09090b" strokeWidth="2" fill="none" />

      {/* ZAPATILLA TRASERA (Estilo Dunk / Jordan B/W) */}
      <path d="M48 298 L88 298 L90 316 L44 316 Z" fill="#18181b" stroke="#000" strokeWidth="2" />
      <path d="M52 298 L72 298 L70 306 L50 306 Z" fill="#ffffff" />
      <path d="M44 310 L90 310 L90 316 L44 316 Z" fill="#e2e8f0" />
      <path d="M54 300 L68 300" stroke="#fff" strokeWidth="1.5" />
      <path d="M56 303 L66 303" stroke="#fff" strokeWidth="1.5" />

      {/* PIERNA DELANTERA (IZQUIERDA) */}
      <path
        d="M130 190 Q150 240 162 295 L190 295 Q180 235 155 185 Z"
        fill={`url(#grad_pants_${uniqueId})`}
        stroke="#000"
        strokeWidth="2.5"
      />
      <path d="M140 245 Q154 252 170 248" stroke="#09090b" strokeWidth="2.5" fill="none" />
      <path d="M148 272 Q162 278 180 274" stroke="#09090b" strokeWidth="2.5" fill="none" />

      {/* ZAPATILLA DELANTERA (Estilo Dunk / Jordan B/W) */}
      <path d="M158 298 L200 298 L202 316 L154 316 Z" fill="#18181b" stroke="#000" strokeWidth="2" />
      <path d="M164 298 L188 298 L184 306 L162 306 Z" fill="#ffffff" />
      <path d="M154 310 L202 310 L202 316 L154 316 Z" fill="#e2e8f0" />
      <path d="M166 300 L182 300" stroke="#fff" strokeWidth="1.5" />
      <path d="M168 303 L180 303" stroke="#fff" strokeWidth="1.5" />

      {/* TORSO ROBUSTO / POLERA NEGRA OVERSIZE */}
      <path
        d="M68 115 Q60 175 75 200 L165 200 Q180 175 172 115 Q155 92 120 90 Q85 92 68 115 Z"
        fill={`url(#grad_shirt_${uniqueId})`}
        stroke="#000"
        strokeWidth="3"
      />
      <path d="M78 188 Q120 205 162 188" stroke="#0a0a0c" strokeWidth="3" fill="none" />

      {/* CORDONES BLANCOS DE SWEATPANTS */}
      <path d="M116 198 Q114 212 112 220" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M124 198 Q126 214 128 222" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* LOGO ROCKERO TIPO METALLICA EN EL PECHO */}
      <g transform="translate(120, 140)">
        <path
          d="M-38 -10 L-34 8 L-28 -4 L-22 8 L-18 -10 L-14 -10 L-14 8 L-8 8 L-8 -10 L-2 -10 L-2 -6 L-6 -6 L-6 8 L0 8 L0 -10 L6 -10 L6 8 L12 8 L12 -10 L18 -10 L18 8 L24 8 L24 -4 L30 8 L34 -10 Z"
          fill="#ffffff"
          stroke={accent}
          strokeWidth="1.8"
          strokeLinejoin="bevel"
        />
        <text
          x="0"
          y="3"
          fontFamily="'Anton', sans-serif"
          fontSize="11"
          fontWeight="900"
          letterSpacing="1px"
          fill="#ffffff"
          stroke={accent}
          strokeWidth="0.8"
          textAnchor="middle"
        >
          QUE PAJA
        </text>
      </g>

      {/* BRAZO DERECHO: PUÑO CERRADO CERCA DEL PECHO */}
      <path
        d="M72 118 Q50 135 60 165 L82 165 Q85 140 92 122 Z"
        fill={`url(#grad_shirt_${uniqueId})`}
        stroke="#000"
        strokeWidth="2.5"
      />
      <path
        d="M62 155 Q56 180 78 182 L86 165 Z"
        fill={`url(#grad_skin_${uniqueId})`}
        stroke="#000"
        strokeWidth="2"
      />
      <ellipse cx="78" cy="172" rx="14" ry="12" fill={`url(#grad_skin_${uniqueId})`} stroke="#000" strokeWidth="2" />
      <path d="M72 166 Q82 168 86 172" stroke="#603010" strokeWidth="2" fill="none" />
      <path d="M70 174 Q80 176 86 178" stroke="#603010" strokeWidth="2" fill="none" />

      {/* CUELLO ROBUSTO Y PAPADA */}
      <path d="M102 86 L138 86 L134 100 Q120 106 106 100 Z" fill={skinShade} />

      {/* CABEZA / CARA MORENA REDONDA */}
      <ellipse cx="120" cy="68" rx="34" ry="30" fill={`url(#grad_skin_${uniqueId})`} stroke="#000" strokeWidth="2.5" />
      <path d="M96 74 Q120 98 144 74" fill={skin} stroke="#000" strokeWidth="2" />
      <ellipse cx="120" cy="84" rx="16" ry="6" fill={skinShade} opacity="0.6" />

      {/* LENTES OSCUROS / SUNGLASSES OVALADOS */}
      <g>
        <ellipse cx="106" cy="68" rx="13" ry="9" fill="#050505" stroke="#000" strokeWidth="2.5" />
        <ellipse cx="134" cy="68" rx="13" ry="9" fill="#050505" stroke="#000" strokeWidth="2.5" />
        <rect x="117" y="65" width="6" height="4" fill="#050505" />
        <ellipse cx="103" cy="65" rx="5" ry="3" fill="#ffffff" opacity="0.75" />
        <ellipse cx="131" cy="65" rx="5" ry="3" fill="#ffffff" opacity="0.75" />
        <path d="M96 66 L116 66" stroke={accent} strokeWidth="1.2" opacity="0.6" />
        <path d="M124 66 L144 66" stroke={accent} strokeWidth="1.2" opacity="0.6" />
      </g>

      <ellipse cx="120" cy="74" rx="3" ry="2" fill="#502510" />
      <path d="M112 80 Q120 84 128 80" stroke="#401808" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* CORTE DE PELO HONGO / CASCO / CHAMPIÑÓN */}
      <path
        d="M82 65 Q78 18 120 16 Q162 18 158 65 Q158 45 120 42 Q82 45 82 65 Z"
        fill={hair}
        stroke="#000"
        strokeWidth="3"
      />
      <path d="M80 62 Q76 78 86 86 L94 68 Z" fill={hair} stroke="#000" strokeWidth="2" />
      <path d="M160 62 Q164 78 154 86 L146 68 Z" fill={hair} stroke="#000" strokeWidth="2" />
      <path d="M96 32 Q120 28 144 32" stroke="#252528" strokeWidth="2" fill="none" />
      <path d="M102 42 Q120 38 138 42" stroke="#252528" strokeWidth="2" fill="none" />

      {/* BRAZO IZQUIERDO: POSTURA DE GARRA MARCIAL */}
      <path
        d="M162 116 Q195 125 198 156 L178 162 Q168 136 156 120 Z"
        fill={`url(#grad_shirt_${uniqueId})`}
        stroke="#000"
        strokeWidth="2.5"
      />
      <path
        d="M188 150 Q205 158 206 172 L185 175 Q180 160 178 152 Z"
        fill={`url(#grad_skin_${uniqueId})`}
        stroke="#000"
        strokeWidth="2"
      />

      {/* MANO EN GARRA CON 4 DEDOS CURVADOS */}
      <g transform="translate(196, 168)">
        <ellipse cx="8" cy="4" rx="10" ry="9" fill={skin} stroke="#000" strokeWidth="2" />
        <path d="M10 -4 Q18 -6 20 0" stroke="#000" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M10 -4 Q18 -6 20 0" stroke={skin} strokeWidth="2" strokeLinecap="round" fill="none" />

        <path d="M14 2 Q22 0 24 6" stroke="#000" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M14 2 Q22 0 24 6" stroke={skin} strokeWidth="2" strokeLinecap="round" fill="none" />

        <path d="M12 8 Q20 8 22 14" stroke="#000" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M12 8 Q20 8 22 14" stroke={skin} strokeWidth="2" strokeLinecap="round" fill="none" />

        <path d="M6 10 Q14 16 16 20" stroke="#000" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M6 10 Q14 16 16 20" stroke={skin} strokeWidth="2" strokeLinecap="round" fill="none" />

        <path d="M2 -2 Q-4 -6 -6 -2" stroke="#000" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M2 -2 Q-4 -6 -6 -2" stroke={skin} strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
    </g>
  );
}

// ==========================================
// 2. EL PAJA (STREET BOSS WITH HOODIE & GOLD CHAIN)
// ==========================================
function ElPajaAvatarBody({
  uniqueId,
  palette,
  accent,
}: {
  uniqueId: string;
  palette: PaletteDef;
  accent: string;
}) {
  const { skin, skinShade, hair } = palette;

  return (
    <g>
      {/* LEGS */}
      <path d="M82 185 L64 295 L92 295 L110 190 Z" fill={`url(#grad_pants_${uniqueId})`} stroke="#000" strokeWidth="2.5" />
      <path d="M128 190 L160 295 L188 295 L154 185 Z" fill={`url(#grad_pants_${uniqueId})`} stroke="#000" strokeWidth="2.5" />
      {/* High-top Street Boots */}
      <path d="M46 295 L94 295 L96 316 L44 316 Z" fill="#ff5500" stroke="#000" strokeWidth="2" />
      <path d="M156 295 L204 295 L206 316 L154 316 Z" fill="#ff5500" stroke="#000" strokeWidth="2" />

      {/* TORSO WITH STREET BOMBER JACKET */}
      <path d="M66 112 Q58 175 75 200 L165 200 Q182 175 174 112 Q155 92 120 90 Q85 92 66 112 Z" fill="#1c1917" stroke="#000" strokeWidth="3" />
      {/* Orange open hoodie lapels */}
      <path d="M72 115 L98 200 L82 200 L66 125 Z" fill="#ff5500" />
      <path d="M168 115 L142 200 L158 200 L174 125 Z" fill="#ff5500" />

      {/* GOLD VINYL DISC MEDALLION */}
      <ellipse cx="120" cy="148" rx="16" ry="16" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
      <ellipse cx="120" cy="148" rx="6" ry="6" fill="#18181b" />
      <path d="M104 110 Q120 140 120 148" stroke="#eab308" strokeWidth="2.5" fill="none" />
      <path d="M136 110 Q120 140 120 148" stroke="#eab308" strokeWidth="2.5" fill="none" />

      {/* ARMS */}
      <path d="M70 120 L58 165 L84 165 L92 122 Z" fill="#ff5500" stroke="#000" strokeWidth="2" />
      <circle cx="78" cy="172" r="12" fill={skin} stroke="#000" strokeWidth="2" />
      <path d="M164 120 L188 165 L168 165 L156 122 Z" fill="#ff5500" stroke="#000" strokeWidth="2" />
      <circle cx="180" cy="172" r="12" fill={skin} stroke="#000" strokeWidth="2" />

      {/* HEAD */}
      <ellipse cx="120" cy="68" rx="33" ry="29" fill={`url(#grad_skin_${uniqueId})`} stroke="#000" strokeWidth="2.5" />
      {/* Aviator Sunglasses */}
      <ellipse cx="106" cy="68" rx="14" ry="10" fill="#09090b" stroke="#ca8a04" strokeWidth="2" />
      <ellipse cx="134" cy="68" rx="14" ry="10" fill="#09090b" stroke="#ca8a04" strokeWidth="2" />
      <rect x="118" y="65" width="4" height="3" fill="#ca8a04" />
      {/* Hair */}
      <path d="M84 62 Q80 18 120 16 Q160 18 156 62 Q156 46 120 44 Q84 46 84 62 Z" fill={hair} stroke="#000" strokeWidth="3" />
    </g>
  );
}

// ==========================================
// 3. DJ SCRATCH (CYAN HEADPHONES & BACKWARDS CAP)
// ==========================================
function DjScratchAvatarBody({
  uniqueId,
  palette,
  accent,
}: {
  uniqueId: string;
  palette: PaletteDef;
  accent: string;
}) {
  const { skin, skinShade } = palette;

  return (
    <g>
      {/* SLIM LEGS */}
      <path d="M84 185 L68 295 L92 295 L106 190 Z" fill="#082f49" stroke="#000" strokeWidth="2.5" />
      <path d="M128 190 L146 295 L170 295 L150 185 Z" fill="#082f49" stroke="#000" strokeWidth="2.5" />
      {/* Cyan Skate Shoes */}
      <path d="M52 295 L96 295 L96 316 L50 316 Z" fill="#00f2ff" stroke="#000" strokeWidth="2" />
      <path d="M142 295 L186 295 L186 316 L140 316 Z" fill="#00f2ff" stroke="#000" strokeWidth="2" />

      {/* TORSO WITH BOMBER VEST */}
      <path d="M74 115 L78 200 L162 200 L166 115 Q120 96 74 115 Z" fill="#0e7490" stroke="#000" strokeWidth="3" />
      <text x="120" y="152" fontFamily="'Anton', sans-serif" fontSize="13" fontWeight="900" fill="#00f2ff" textAnchor="middle">
        SCRATCH
      </text>

      {/* ARMS HOLDING TURNTABLE RECORD */}
      <path d="M76 120 L60 168 L80 168 L92 124 Z" fill="#082f49" stroke="#000" strokeWidth="2" />
      <path d="M164 120 L188 152 L172 165 L156 122 Z" fill="#082f49" stroke="#000" strokeWidth="2" />
      {/* Vinyl Disc in hand */}
      <circle cx="188" cy="165" r="18" fill="#09090b" stroke="#00f2ff" strokeWidth="2" />
      <circle cx="188" cy="165" r="6" fill="#00f2ff" />

      {/* LARGE DJ HEADPHONES AROUND NECK */}
      <path d="M90 92 Q120 120 150 92" stroke="#00f2ff" strokeWidth="6" fill="none" />
      <ellipse cx="88" cy="94" rx="9" ry="12" fill="#082f49" stroke="#00f2ff" strokeWidth="2" />
      <ellipse cx="152" cy="94" rx="9" ry="12" fill="#082f49" stroke="#00f2ff" strokeWidth="2" />

      {/* HEAD & BACKWARDS CAP */}
      <ellipse cx="120" cy="66" rx="30" ry="26" fill={`url(#grad_skin_${uniqueId})`} stroke="#000" strokeWidth="2.5" />
      {/* Backwards Cyan Cap */}
      <path d="M92 56 Q120 28 148 56 Z" fill="#00f2ff" stroke="#000" strokeWidth="2.5" />
      <path d="M84 56 L96 56 L94 62 L82 62 Z" fill="#082f49" stroke="#000" strokeWidth="2" />
      {/* Face & Cool Expression */}
      <ellipse cx="108" cy="68" rx="4" ry="4" fill="#000" />
      <ellipse cx="132" cy="68" rx="4" ry="4" fill="#000" />
      <path d="M112 78 Q120 84 130 76" stroke="#000" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </g>
  );
}

// ==========================================
// 4. B-BOY CUMBIA (GREEN TRACKSUIT & SIDEWAYS CAP)
// ==========================================
function BboyCumbiaAvatarBody({
  uniqueId,
  palette,
  accent,
}: {
  uniqueId: string;
  palette: PaletteDef;
  accent: string;
}) {
  const { skin } = palette;

  return (
    <g>
      {/* HEAVY TRACKSUIT LEGS */}
      <path d="M78 185 L56 295 L88 295 L106 190 Z" fill="#064e3b" stroke="#000" strokeWidth="2.5" />
      <path d="M130 190 L152 295 L184 295 L160 185 Z" fill="#064e3b" stroke="#000" strokeWidth="2.5" />
      {/* Gold side stripes */}
      <path d="M64 220 L58 295" stroke="#facc15" strokeWidth="3" />
      <path d="M176 220 L182 295" stroke="#facc15" strokeWidth="3" />

      {/* RETRO SNEAKERS */}
      <path d="M44 295 L90 295 L90 316 L42 316 Z" fill="#ffffff" stroke="#000" strokeWidth="2" />
      <path d="M150 295 L196 295 L196 316 L148 316 Z" fill="#ffffff" stroke="#000" strokeWidth="2" />

      {/* HEAVY TRACKSUIT TORSO */}
      <path d="M64 112 L70 200 L170 200 L176 112 Q120 90 64 112 Z" fill="#047857" stroke="#000" strokeWidth="3" />
      <path d="M120 110 L120 200" stroke="#facc15" strokeWidth="3" />

      {/* GOLD CHAIN & CASSETTE */}
      <path d="M100 105 Q120 150 140 105" stroke="#facc15" strokeWidth="3" fill="none" />
      <rect x="110" y="142" width="20" height="14" rx="2" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />

      {/* MUSCULAR ARMS */}
      <path d="M68 116 L44 165 L68 175 L88 126 Z" fill="#047857" stroke="#000" strokeWidth="2.5" />
      <circle cx="56" cy="180" r="14" fill={skin} stroke="#000" strokeWidth="2" />
      <path d="M172 116 L196 165 L172 175 L152 126 Z" fill="#047857" stroke="#000" strokeWidth="2.5" />
      <circle cx="184" cy="180" r="14" fill={skin} stroke="#000" strokeWidth="2" />

      {/* HEAD & SIDEWAYS RED CAP */}
      <ellipse cx="120" cy="68" rx="34" ry="30" fill={`url(#grad_skin_${uniqueId})`} stroke="#000" strokeWidth="2.5" />
      {/* Red Cap with visor sideways */}
      <path d="M88 56 Q120 24 152 56 Z" fill="#dc2626" stroke="#000" strokeWidth="2.5" />
      <path d="M148 48 L174 42 L170 54 L146 54 Z" fill="#dc2626" stroke="#000" strokeWidth="2" />
      {/* Beard & smirk */}
      <path d="M102 78 Q120 96 138 78" stroke="#18181b" strokeWidth="3" fill="none" />
    </g>
  );
}

// ==========================================
// 5. ROCKER PUNK (MOHAWK & SPIKED LEATHER JACKET)
// ==========================================
function RockerPunkAvatarBody({
  uniqueId,
  palette,
  accent,
}: {
  uniqueId: string;
  palette: PaletteDef;
  accent: string;
}) {
  const { skin } = palette;

  return (
    <g>
      {/* TORN SKINNY JEANS */}
      <path d="M86 185 L72 295 L92 295 L106 190 Z" fill="#1e1b4b" stroke="#000" strokeWidth="2.5" />
      <path d="M128 190 L144 295 L164 295 L148 185 Z" fill="#1e1b4b" stroke="#000" strokeWidth="2.5" />
      {/* Knee tears */}
      <path d="M78 245 L86 245" stroke={skin} strokeWidth="3" />
      <path d="M150 250 L158 250" stroke={skin} strokeWidth="3" />

      {/* COMBAT BOOTS */}
      <path d="M54 292 L94 292 L94 316 L52 316 Z" fill="#09090b" stroke="#000" strokeWidth="2" />
      <path d="M140 292 L180 292 L180 316 L138 316 Z" fill="#09090b" stroke="#000" strokeWidth="2" />

      {/* SPIKED LEATHER JACKET */}
      <path d="M68 112 L72 200 L168 200 L172 112 Q120 92 68 112 Z" fill="#2e1065" stroke="#000" strokeWidth="3" />
      {/* Silver Lapel Studs */}
      <circle cx="82" cy="130" r="3" fill="#e2e8f0" />
      <circle cx="88" cy="144" r="3" fill="#e2e8f0" />
      <circle cx="158" cy="130" r="3" fill="#e2e8f0" />
      <circle cx="152" cy="144" r="3" fill="#e2e8f0" />

      {/* ARMS WITH WRISTBANDS */}
      <path d="M70 118 L50 168 L70 174 L88 126 Z" fill="#2e1065" stroke="#000" strokeWidth="2" />
      <rect x="52" y="162" width="16" height="8" fill="#09090b" stroke="#e2e8f0" strokeWidth="1" />
      <circle cx="60" cy="180" r="10" fill={skin} stroke="#000" strokeWidth="2" />

      <path d="M170 118 L190 168 L170 174 L152 126 Z" fill="#2e1065" stroke="#000" strokeWidth="2" />
      <circle cx="180" cy="180" r="10" fill={skin} stroke="#000" strokeWidth="2" />

      {/* HEAD */}
      <ellipse cx="120" cy="68" rx="28" ry="26" fill={`url(#grad_skin_${uniqueId})`} stroke="#000" strokeWidth="2.5" />

      {/* PINK / YELLOW ROCK MOHAWK */}
      <path
        d="M112 44 L114 8 L122 14 L126 4 L130 18 L136 10 L132 44 Z"
        fill="#ec4899"
        stroke="#facc15"
        strokeWidth="2"
      />
      {/* Eye makeup & earring */}
      <path d="M104 68 L114 68" stroke="#a855f7" strokeWidth="3" />
      <path d="M126 68 L136 68" stroke="#a855f7" strokeWidth="3" />
      <circle cx="92" cy="72" r="3" fill="#facc15" />
    </g>
  );
}

// ==========================================
// 6. SECRET BOSS / LOCKED FIGHTER
// ==========================================
function SecretBossAvatarBody({
  uniqueId,
  palette,
  accent,
}: {
  uniqueId: string;
  palette: PaletteDef;
  accent: string;
}) {
  return (
    <g>
      {/* Dark shadowy cloak */}
      <path d="M60 100 L40 300 L200 300 L180 100 Q120 70 60 100 Z" fill="#09090b" stroke="#374151" strokeWidth="3" />
      <path d="M120 100 L120 300" stroke="#1f2937" strokeWidth="4" />

      {/* Hood */}
      <path d="M78 80 Q120 20 162 80 Q145 110 120 110 Q95 110 78 80 Z" fill="#0f172a" stroke="#000" strokeWidth="3" />

      {/* Glowing Cybernetic Visor Eyes */}
      <rect x="94" y="66" width="52" height="10" rx="3" fill="#00f2ff" />
      <line x1="90" y1="71" x2="150" y2="71" stroke="#ffffff" strokeWidth="2" />
      <rect x="110" y="68" width="20" height="6" fill="#ef4444" />

      {/* Floating Glitch Pixels */}
      <rect x="45" y="140" width="8" height="8" fill="#00f2ff" opacity="0.8" />
      <rect x="185" y="180" width="10" height="10" fill="#ef4444" opacity="0.8" />
      <rect x="55" y="240" width="6" height="6" fill="#00f2ff" opacity="0.7" />
    </g>
  );
}
