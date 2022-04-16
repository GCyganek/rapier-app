import { Fight } from '../fight.interface';

export interface FightTimeEndedObserver {
  fightTimeEnded(fightId: string): void;
}
