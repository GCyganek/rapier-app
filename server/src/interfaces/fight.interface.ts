import { Socket } from 'socket.io';
import { Timer } from '../classes/timer/timer.class.js';
import { Event } from './event.interface';

export interface Fight {
  id: string;

  state: FightState;
  timer: Timer;

  mainJudge: JudgeState;
  redJudge: JudgeState;
  blueJudge: JudgeState;

  redPlayer: PlayerState;
  bluePlayer: PlayerState;
  
  pointsToEndFight: number;

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
