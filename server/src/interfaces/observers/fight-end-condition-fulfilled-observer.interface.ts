import { FightImpl } from 'src/classes/fight.class';
import { FightEndConditionName } from '../fight.interface';

export interface FightEndConditionFulfilledObserver {
  fightEndConditionFulfilled(
    conditionName: FightEndConditionName,
    fight: FightImpl,
  ): void;
}
