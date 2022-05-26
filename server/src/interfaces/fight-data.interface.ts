import { FightEndConditionName } from './fight.interface';

export interface FightData {
  redPlayerId: string;
  bluePlayerId: string;
  endConditions: FightEndCondition[];
}

export interface FightEndCondition {
  name: FightEndConditionName;
  value: number;
}
