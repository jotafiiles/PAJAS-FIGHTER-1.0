# QUE PAJA FIGHTER — 2D Arcade Fighting Game

Prototipo jugable de videojuego de lucha 2D para navegador desarrollado para **Que Paja Records**. 
Inspirado en los clásicos fighting games arcade de los 90s/2000s con identidad visual 100% original, físicas en tiempo real en Canvas 2D, sistema de personajes data-driven, selección de variantes de color, escenarios con parallax, soporte de 2 jugadores en el mismo teclado y modo vs CPU.

---

## 🕹️ Flujo del Prototipo

1. **Menú Principal**: Acceso directo a Modo Versus (2P), Modo Arcade (vs CPU con IA), Opciones y Guía de Controles.
2. **Selección de Personaje**: Roster en cuadrícula 4x2 con previsualizaciones animadas en tiempo real y barras de estadísticas (Fuerza, Velocidad, Defensa, Alcance, Técnica).
3. **Selección de Variante de Color**: Personalización de trajes y paletas de color con previsualización en vivo.
4. **Selección de Escenario**: Escenarios con ambientación y música dinámica.
5. **Combate 2D Canvas**: Movimiento lateral, salto, agachado, bloqueo, golpes leves/pesados, patadas, proyectiles sónicos especiales, hitboxes/hurtboxes, hit sparks, screen shake, barra de vida retro, contador de tiempo y sistema de rounds (mejor de 3).
6. **Pantalla de Victoria**: Estadísticas de combate (tiempo total, combos máximos, rounds) y opciones de revancha inmediata o vuelta al menú.

---

## ⌨️ Controles (2 Jugadores en el Mismo Teclado)

| Acción | Jugador 1 (P1 - Izquierda) | Jugador 2 (P2 - Derecha) |
| :--- | :--- | :--- |
| **Moverse / Saltar / Agacharse** | `W` (Salto), `A` (Izquierda), `S` (Agachar), `D` (Derecha) | `↑` (Salto), `←` (Izquierda), `↓` (Agachar), `→` (Derecha) |
| **Golpe (Punch)** | `F` | `K` o `Numpad 4` |
| **Patada (Kick)** | `G` | `L` o `Numpad 5` |
| **Ataque Especial (Super)** | `H` | `P` o `Ñ` o `Numpad 6` |
| **Bloqueo (Guardia)** | Mantener dirección opuesta / agachado | Mantener dirección opuesta / agachado |
| **Pausa** | `Escape` | `Escape` |

---

## 🚀 Despliegue en GitHub Pages (Subpath Ready)

Este proyecto está configurado para ejecutarse en subdirectorios de GitHub Pages (ej. `https://usuario.github.io/que-paja-fighter/`) sin sufrir problemas de rutas 404 ni paths absolutos rotos.

### 1. Configuración de `base` en `vite.config.ts`
El archivo `vite.config.ts` incluye:
```typescript
export default defineConfig({
  base: './', // Permite carga relativa desde cualquier subdirectorio en GitHub Pages
  // ...
});
```

### 2. Pasos para Compilar y Desplegar
```bash
# 1. Instalar dependencias
npm install

# 2. Probar en entorno local de desarrollo
npm run dev

# 3. Generar build estático para producción
npm run build
```

Los archivos finales se generarán en la carpeta `dist/`.

### 3. Publicación en GitHub Pages
Puedes publicar la carpeta `dist/` usando la rama `gh-pages` o mediante un GitHub Action estándar:
- **Opción A (gh-pages CLI)**:
  ```bash
  npm install -D gh-pages
  npx gh-pages -d dist
  ```
- **Opción B (GitHub Actions)**:
  Crea un workflow `.github/workflows/deploy.yml` con el action oficial `actions/deploy-pages`.

---

## 📁 Estructura del Proyecto

```
src/
├── audio/
│   └── SoundSystem.ts         # Sintetizador Web Audio API para SFX retro, voces arcade y música dinámica
├── data/
│   ├── characters.ts          # Definición 100% data-driven de personajes, ataques, frame data y colores
│   ├── controls.ts            # Mapeo de teclas por defecto para P1 y P2
│   ├── settings.ts            # Configuración de audio, rounds y efectos
│   └── stages.ts              # Configuración de escenarios, límites y paletas
├── game/
│   ├── animation/
│   │   ├── ProceduralSpriteRenderer.ts # Renderizado procedural de sprites pixel-art por capas
│   │   └── SpriteController.ts         # Controlador de sprites con fallback tolerante a imágenes faltantes
│   ├── collision/
│   │   └── Collision.ts       # Detección AABB de hitboxes, hurtboxes y pushboxes
│   ├── combat/
│   │   └── CombatEngine.ts    # Motor de combate, daño, combos, proyectiles y ciclo de rounds
│   ├── engine/
│   │   ├── Camera.ts          # Cámara 2D con seguimiento suave entre luchadores
│   │   ├── InputManager.ts    # Captura simultánea de teclas e IA para modo CPU
│   │   ├── ParticleSystem.ts  # Partículas de impacto, chispas y ondas de choque
│   │   ├── ScreenShake.ts     # Vibración de pantalla en golpes críticos y K.O.
│   │   └── StageRenderer.ts   # Renderizado de escenario con parallax y parlantes con pulsación rítmica
│   ├── entities/
│   │   └── Fighter.ts         # Máquina de estados del luchador y físicas de movimiento
│   └── physics/
│       └── Physics.ts         # Gravedad, fricción y límites de escenario
├── screens/
│   ├── MainMenu.tsx           # Menú arcade con modos de juego
│   ├── CharacterSelect.tsx    # Cuadrícula de personajes con stats en vivo
│   ├── VariantSelectModal.tsx # Selector de paletas y atuendos
│   ├── StageSelect.tsx        # Selector de escenario con carousel
│   ├── FightScreen.tsx        # Pantalla de pelea en Canvas 2D con HUD retro
│   ├── VictoryScreen.tsx      # Pantalla de victoria y estadísticas
│   ├── OptionsScreen.tsx      # Ajustes de volumen, rounds y filtros CRT
│   └── ControlsModal.tsx      # Modal explicativo de controles
├── types/
│   └── index.ts               # Interfaces y tipos TypeScript
├── App.tsx                    # Orquestador del flujo y pantallas
└── index.css                  # Estilos globales, tipografías arcade y efectos CRT
```

---

## 🎨 Cómo Agregar Nuevos Personajes o Escenarios (Data-Driven)

Para agregar un personaje nuevo, **no es necesario modificar el motor de combate**. Solo agrega un nuevo objeto al array `CHARACTERS` en `src/data/characters.ts`:

```typescript
{
  id: 'mi_personaje',
  name: 'NOMBRE',
  nickname: 'APODO',
  tagline: 'Lema del personaje',
  description: 'Descripción e historia',
  stats: { strength: 8, speed: 7, defense: 8, reach: 7, technique: 8 },
  portraitBg: 'linear-gradient(...)',
  colors: [
    { id: 'default', name: 'Original', primaryColor: '#...', secondaryColor: '#...', ... }
  ],
  attacks: [
    { id: 'punch_light', name: 'Jab', type: 'punch_light', damage: 8, ... }
  ]
}
```

Si deseas colocar sprites PNG personalizados, colócalos en `public/assets/characters/<id>/<estado>/01.png`. Si no existen, el juego utilizará automáticamente el renderizado pixel-art procedural sin generar errores 404 ni detenerse.
