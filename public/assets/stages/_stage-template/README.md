# GUÍA DE PLANTILLA DE ESCENARIO — PAJAS FIGHTER
Desarrollado por Que Paja Records

Esta carpeta `_stage-template` es la plantilla de referencia para agregar nuevos escenarios al juego.

## 📁 ESTRUCTURA DE ARCHIVOS DE UN ESCENARIO

```
public/assets/stages/tu-escenario/
├── stage.json          <- Configuración del escenario (dimensiones, colores, paralaje, música)
├── background.png      <- Fondo principal o capas de paralaje (opcional)
├── bgm.mp3             <- Música de fondo del escenario (opcional)
└── layers/             <- Capas individuales de paralaje
    ├── 01_sky.png
    ├── 02_buildings.png
    ├── 03_lights.png
    └── 04_crowd.png
```

## ⚙️ CÓMO AGREGAR UN NUEVO ESCENARIO
1. Copia `_stage-template` a `public/assets/stages/[id-de-tu-escenario]/`
2. Configura `stage.json` con las capas de paralaje, colores temáticos y descripción.
3. Regístralo en `src/data/stages/index.ts`.
