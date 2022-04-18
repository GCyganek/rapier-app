export interface FightEndCondition {
  name: FightEndConditionName;
  value: number;
}

export enum FightEndConditionName {
  TimeEnded = 'TIME_ENDED',
  EnoughPoints = 'ENOUGH_POINTS',
}
