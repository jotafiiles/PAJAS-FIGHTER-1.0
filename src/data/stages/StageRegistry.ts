import { StageData } from '../../types';
import { QUE_PAJA_STUDIO } from './quePajaStudio';
import { NEON_ROOFTOP } from './neonRooftop';
import { VINYL_ALLEY } from './vinylAlley';

/**
 * Global Registry for all PAJAS FIGHTER stages.
 * Data-Driven & Modular: Adding a stage here automatically populates
 * the Stage Select screen, background renderer, and parallax system.
 */
class StageRegistryService {
  private stages: Map<string, StageData> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    [QUE_PAJA_STUDIO, NEON_ROOFTOP, VINYL_ALLEY].forEach((st) => this.register(st));
  }

  public register(stage: StageData) {
    if (!stage || !stage.id) return;
    this.stages.set(stage.id, stage);
  }

  public get(id: string): StageData | undefined {
    return this.stages.get(id);
  }

  public getAll(): StageData[] {
    return Array.from(this.stages.values());
  }
}

export const StageRegistry = new StageRegistryService();
