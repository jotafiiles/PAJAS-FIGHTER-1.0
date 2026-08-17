# GUÍA DE PLANTILLA DE PERSONAJE — PAJAS FIGHTER
Desarrollado por Que Paja Records

Esta carpeta `_character-template` es la plantilla de referencia oficial para agregar nuevos luchadores al roster de PAJAS FIGHTER de manera 100% modular y data-driven.

---

## 📁 ESTRUCTURA DE ARCHIVOS DE UN PERSONAJE

```
public/assets/characters/tu-personaje/
├── character.json          <- Configuración completa (stats, ataques, animaciones, variantes)
├── portrait.png            <- Retrato para el selector y HUD (256x256 o similar)
├── select.png              <- Ilustración de cuerpo entero / tarjeta (opcional)
├── sprites/                <- Carpetas con secuencias PNG por animación
│   ├── idle/               <- 01.png, 02.png, 03.png...
│   ├── walk/               <- 01.png, 02.png...
│   ├── jump/               <- 01.png, 02.png...
│   ├── crouch/             <- 01.png...
│   ├── punch-light/        <- 01.png, 02.png...
│   ├── punch-heavy/        <- 01.png, 02.png...
│   ├── kick-light/         <- 01.png, 02.png...
│   ├── kick-heavy/         <- 01.png, 02.png...
│   ├── special/            <- 01.png, 02.png...
│   ├── hit/                <- 01.png, 02.png...
│   ├── block/              <- 01.png...
│   ├── knockdown/          <- 01.png, 02.png...
│   ├── get-up/             <- 01.png...
│   ├── victory/            <- 01.png, 02.png...
│   └── defeat/             <- 01.png...
└── variants/               <- Variantes de trajes o paletas alternativas
    ├── default/
    ├── alt-1/
    └── alt-2/
```

---

## ⚙️ CÓMO AGREGAR UN NUEVO PERSONAJE EN 3 PASOS

### Paso 1: Duplicar esta carpeta
Copia `_character-template` a `public/assets/characters/[id-de-tu-personaje]/`.
Ejemplo: `public/assets/characters/mc-ritmo/`

### Paso 2: Editar `character.json`
Configura el nombre, estadísticas, ataques, cajas de colisión y rutas de animación.

### Paso 3: Registrar el personaje en el Roster
En `src/data/characters/index.ts` o creando `src/data/characters/mcRitmo.ts`:
```ts
import { CharacterData } from '../../types';
import mcRitmoJson from '../../../public/assets/characters/mc-ritmo/character.json';

export const MC_RITMO: CharacterData = mcRitmoJson as CharacterData;
```
Y agrégalo a la lista `PLAYABLE_CHARACTERS`.

¡Listo! El personaje aparecerá automáticamente en la pantalla de selección, con su tarjeta, estadísticas, movimientos, variantes y animaciones.

---

## 🎨 FALLBACK PROCEDURAL AUTOMÁTICO
Si aún no tienes listos todos los sprites PNG de un personaje:
- El motor detectará si faltan los PNGs y utilizará automáticamente el **Procedural Pixel Fighter Fallback**.
- En cuanto agregues los archivos `01.png`, `02.png`, etc., en su carpeta de sprites, el motor cargará los sprites reales de forma prioritaria e instantánea.
