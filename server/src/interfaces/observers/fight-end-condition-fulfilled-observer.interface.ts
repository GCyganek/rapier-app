import { FightImpl } from 'src/classes/fight.class';
import { FightEndConditionName } from '../fight-end-condition.interface';

export interface FightEndConditionFulfilledObserver {
  fightEndConditionFulfilled(
    conditionName: FightEndConditionName,
    fight: FightImpl,
  ): void;
}
