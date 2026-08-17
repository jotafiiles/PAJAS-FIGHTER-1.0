import { StageData } from '../../types';
import { StageRegistry } from './StageRegistry';
import { QUE_PAJA_STUDIO } from './quePajaStudio';
import { NEON_ROOFTOP } from './neonRooftop';
import { VINYL_ALLEY } from './vinylAlley';

export const STAGES: StageData[] = StageRegistry.getAll();

export function getStageById(id: string): StageData | undefined {
  return StageRegistry.get(id);
}

export { StageRegistry, QUE_PAJA_STUDIO, NEON_ROOFTOP, VINYL_ALLEY };
