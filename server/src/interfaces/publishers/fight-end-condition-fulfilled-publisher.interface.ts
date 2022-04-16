import { FightEndCondition } from '../fight-end-condition-fulfilled-response.interface';
import { Fight } from '../fight.interface';
import { FightEndConditionFulfilledObserver } from '../observers/fight-end-condition-fulfilled-observer.interface';

export interface FightEndConditionFulfilledPublisher {
  addFightEndConditionFulfilledObserver(
    observer: FightEndConditionFulfilledObserver,
  ): void;
  removeFightEndConditionFulfilledObserver(
    observer: FightEndConditionFulfilledObserver,
  ): void;
  notifyFightEndConditionFulfilled(
    condition: FightEndCondition,
    fight: Fight,
  ): void;
}
