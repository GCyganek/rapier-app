import { FightEndConditionName } from './fight.interface';
import { Response } from './response.interface';

export interface FightEndConditionFulfilledResponse extends Response {
  conditionName: FightEndConditionName;
}
