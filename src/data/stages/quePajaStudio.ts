import { StageData } from '../../types';

export const QUE_PAJA_STUDIO: StageData = {
  id: 'qp_studio',
  name: 'ESTUDIO UNDERGROUND',
  location: 'Que Paja Records HQ — Sala A',
  description: 'El corazón analógico del sello discográfico. Cintas maestras, tornamesas vintage, luces ámbar cálidas y monitores de estudio que vibran con los graves.',
  previewColor: '#ff4e00',
  groundY: 100,
  width: 1400,
  height: 600,
  theme: {
    skyColor: '#0a0a0b',
    groundColor: '#151619',
    ambientColor: '#ff4e00',
    accentColor: '#fbbf24',
  },
  parallaxLayers: [
    { speed: 0.1, type: 'sky', color: '#0a0a0b', opacity: 1 },
    { speed: 0.25, type: 'buildings', color: '#151619', opacity: 0.8 },
    { speed: 0.5, type: 'lights', color: '#ff4e00', opacity: 0.7 },
    { speed: 0.8, type: 'crowd', color: '#1e2026', opacity: 0.9 },
  ],
};
