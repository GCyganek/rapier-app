import {
  FightEndConditionName,
  FightState,
} from '../../src/interfaces/fight.interface';

export const mockMongoFight = {
  id: 'mock',
  state: FightState.Scheduled,
  mainJudgeId: 'main',
  redJudgeId: 'red',
  blueJudgeId: 'blue',
  redPlayer: 'redPlayer',
  bluePlayer: 'bluePlayer',
  endConditions: new Map<FightEndConditionName, number>([
    [FightEndConditionName.EnoughPoints, 5],
    [FightEndConditionName.TimeEnded, 1],
  ]),
  eventsHistory: [],
};
