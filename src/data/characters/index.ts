import { CharacterData } from '../../types';
import { CharacterRegistry } from './CharacterRegistry';
import { QUE_PAJA_V1 } from './quePajaV1';
import { EL_PAJA } from './elPaja';
import { DJ_SCRATCH } from './djScratch';
import { BBOY_CUMBIA } from './bboyCumbia';
import { ROCKER_PUNK } from './rockerPunk';
import { LOCKED_ROSTER_PLACEHOLDERS } from './secretBoss';

export const PLAYABLE_CHARACTERS: CharacterData[] = CharacterRegistry.getPlayable();
export const ALL_ROSTER_CHARACTERS: CharacterData[] = CharacterRegistry.getAll();
export const CHARACTERS: CharacterData[] = ALL_ROSTER_CHARACTERS;

export function getCharacterById(id: string): CharacterData | undefined {
  return CharacterRegistry.get(id);
}

export { CharacterRegistry, QUE_PAJA_V1, EL_PAJA, DJ_SCRATCH, BBOY_CUMBIA, ROCKER_PUNK, LOCKED_ROSTER_PLACEHOLDERS };
