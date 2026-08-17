import { StageData } from '../../types';

export const NEON_ROOFTOP: StageData = {
  id: 'neon_rooftop',
  name: 'AZOTEA NEÓN',
  location: 'Santiago Nocturno — Piso 18',
  description: 'Vista panorámica de la ciudad con carteles luminosos, antenas de radio clandestinas y un cielo nocturno cian eléctrico.',
  previewColor: '#00f2ff',
  groundY: 100,
  width: 1400,
  height: 600,
  theme: {
    skyColor: '#050814',
    groundColor: '#0f172a',
    ambientColor: '#00f2ff',
    accentColor: '#38bdf8',
  },
  parallaxLayers: [
    { speed: 0.1, type: 'sky', color: '#030712', opacity: 1 },
    { speed: 0.3, type: 'buildings', color: '#0f172a', opacity: 0.8 },
    { speed: 0.6, type: 'lights', color: '#00f2ff', opacity: 0.7 },
    { speed: 0.8, type: 'crowd', color: '#1e293b', opacity: 0.9 },
  ],
};
