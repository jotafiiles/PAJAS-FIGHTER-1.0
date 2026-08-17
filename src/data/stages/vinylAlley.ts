import { StageData } from '../../types';

export const VINYL_ALLEY: StageData = {
  id: 'vinyl_alley',
  name: 'CALLEJÓN DEL CASSETTE',
  location: 'Barrio Bellavista — Feria Underground',
  description: 'Muros cubiertos de afiches de tocatas clásicas, grafiti, parlantes apilados y luces de farol vintage.',
  previewColor: '#ec4899',
  groundY: 100,
  width: 1400,
  height: 600,
  theme: {
    skyColor: '#180718',
    groundColor: '#271129',
    ambientColor: '#ec4899',
    accentColor: '#f43f5e',
  },
  parallaxLayers: [
    { speed: 0.1, type: 'sky', color: '#0d030f', opacity: 1 },
    { speed: 0.25, type: 'buildings', color: '#1f0d23', opacity: 0.8 },
    { speed: 0.5, type: 'lights', color: '#ec4899', opacity: 0.7 },
    { speed: 0.8, type: 'crowd', color: '#3b1641', opacity: 0.9 },
  ],
};
