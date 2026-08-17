# 🥊 PLANTILLA OFICIAL DE PERSONAJE — PAJAS FIGHTER (PLUG-AND-PLAY)
**Desarrollado por Que Paja Records**

Esta carpeta `_character-template` contiene la estructura completa y autosuficiente para agregar nuevos personajes al juego de forma 100% **Plug-and-Play**.

---

## 📁 ESTRUCTURA DE ARCHIVOS DE UN PERSONAJE

Cada personaje es completamente data-driven y vive dentro de su propia carpeta:

```
public/assets/characters/tu-nuevo-personaje/
├── character.json          <- Definición técnica (nombre, stats, animaciones, ataques, hitbox)
├── portrait.png            <- Retrato para el selector de personajes y HUD
├── README.md               <- Esta guía de referencia
└── sprites/                <- Secuencias numeradas de sprites PNG
    ├── idle/               <- 01.png, 02.png, 03.png, 04.png, 05.png
    ├── walk/               <- 01.png, 02.png, 03.png, 04.png, 05.png, 06.png
    ├── walk-back/          <- 01.png, 02.png, 03.png, 04.png, 05.png, 06.png
    ├── jump/               <- 01.png, 02.png, 03.png, 04.png
    ├── crouch/             <- 01.png, 02.png
    ├── block/              <- 01.png, 02.png
    ├── hit/                <- 01.png, 02.png, 03.png
    ├── knockdown/          <- 01.png, 02.png, 03.png, 04.png, 05.png
    ├── get-up/             <- 01.png, 02.png, 03.png, 04.png
    ├── victory/            <- 01.png, 02.png, 03.png, 04.png, 05.png, 06.png
    ├── defeat/             <- 01.png, 02.png, 03.png, 04.png
    ├── punch-light/        <- 01.png, 02.png, 03.png, 04.png
    ├── punch-heavy/        <- 01.png, 02.png, 03.png, 04.png, 05.png, 06.png
    ├── kick-light/         <- 01.png, 02.png, 03.png, 04.png
    ├── kick-heavy/         <- 01.png, 02.png, 03.png, 04.png, 05.png, 06.png
    └── special/            <- 01.png, 02.png, 03.png, 04.png, 05.png, 06.png, 07.png, 08.png
```

---

## ⚡ CÓMO AGREGAR UN PERSONAJE PASO A PASO (SIN TOCAR CÓDIGO)

1. **Copiar la carpeta:** Copia la carpeta `_character-template` y cámbiale el nombre a tu personaje dentro de `public/assets/characters/` (ejemplo: `public/assets/characters/nuevo-personaje/`).
2. **Editar `character.json`:** Ajusta el `id`, `name`, `displayName`, `tagline`, `description`, `stats`, `attacks` y `animations` (cantidad de fotogramas, FPS, etc.).
3. **Colocar los sprites:** Guarda tus fotogramas PNG (`01.png`, `02.png`, `03.png`...) en cada subcarpeta de animación dentro de `sprites/` y tu imagen de retrato en `portrait.png`.
4. **Registrar en el manifiesto:** Agrega el nombre de la carpeta a `public/assets/characters/characters.manifest.json`:
   ```json
   {
     "characters": [
       "que_paja_v1",
       "el-paja",
       "dj-scratch",
       "b-boy-cumbia",
       "rocker-punk",
       "nuevo-personaje"
     ]
   }
   ```
5. **¡Listo!** El motor del juego descubrirá y cargará automáticamente al nuevo personaje, mostrándolo en el selector de personajes, en el combate contra CPU, en modo Versus y con todas sus estadísticas y movimientos sin tener que editar ningún archivo TypeScript ni componente React.

---

## 🛡️ TOLERANCIA Y FALLBACK ROBUSTO
- Si un frame o animación no se encuentra, el motor de sprites utiliza un fallback visual garantizado para que el combate nunca se rompa.
- Todos los valores de velocidad, daño, hitboxes, tiempos de animación y retroceso se calculan matemáticamente desde `character.json`.
