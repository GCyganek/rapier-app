import { Socket } from 'socket.io';
import { Timer } from '../classes/timer.class.js';
import { Event } from './event.interface';

export interface Fight {
  id: string;

  state: FightState;
  timer?: Timer;

  mainJudge: JudgeState;
  redJudge: JudgeState;
  blueJudge: JudgeState;

  redPlayer: PlayerState;
  bluePlayer: PlayerState;

  endConditions: Map<FightEndConditionName, number>;

  eventsHistory: Event[];
}

export enum FightState {
  Scheduled,
  Running,
  Paused,
  Finished,
}

export interface JudgeState {
  id: string;
  socket: Socket;
}

export interface PlayerState {
  id: string;
  points: number;
}

export enum FightEndConditionName {
  TimeEnded = 'TIME_ENDED',
  EnoughPoints = 'ENOUGH_POINTS',
}
