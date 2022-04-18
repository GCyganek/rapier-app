import { Socket } from 'socket.io';
import { Timer } from '../classes/timer.class.js';
import { Event } from './event.interface';
import { FightEndCondition } from 'src/interfaces/fight-end-condition.interface';

export interface Fight {
  id: string;

  state: FightState;
  timer?: Timer;

  mainJudge: JudgeState;
  redJudge: JudgeState;
  blueJudge: JudgeState;

  redPlayer: PlayerState;
  bluePlayer: PlayerState;

  endConditions: Set<FightEndCondition>;

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
