import { FightEndConditionName } from '../fight.interface';
import { FightEndConditionFulfilledObserver } from '../observers/fight-end-condition-fulfilled-observer.interface';

export interface FightEndConditionFulfilledPublisher {
  addFightEndConditionFulfilledObserver(
    observer: FightEndConditionFulfilledObserver,
  ): void;
  removeFightEndConditionFulfilledObserver(
    observer: FightEndConditionFulfilledObserver,
  ): void;
  notifyFightEndConditionFulfilled(conditionName: FightEndConditionName): void;
}
