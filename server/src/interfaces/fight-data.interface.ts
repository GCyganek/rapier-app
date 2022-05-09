import { FightEndConditionName } from './fight.interface';

export interface FightDataInterface {
  id: string;
  mainJudgeId: string;
  redJudgeId: string;
  blueJudgeId: string;
  redPlayerId: string;
  bluePlayerId: string;
  endConditions: FightEndCondition[];
}

export interface FightEndCondition {
  name: FightEndConditionName;
  value: number;
}
