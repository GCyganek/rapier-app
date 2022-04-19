import { FightEndConditionName } from './fight-end-condition.interface';
import { Response } from './response.interface';

export interface FightEndConditionFulfilledResponse extends Response {
  conditionName: FightEndConditionName;
}
