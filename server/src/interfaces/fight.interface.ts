import { Event } from './event.interface.js';
import { Socket } from 'socket.io';
import { Timer } from '../classes/timer/timer.class.js';

export interface Fight {
  id: string;
  state: FightState;

  mainJudgeId: string;
  redJudgeId: string;
  blueJudgeId: string;

  mainJudgeSocket: Socket;
  redJudgeSocket: Socket;
  blueJudgeSocket: Socket;

  redPlayerId: string;
  bluePlayerId: string;

  redEventsHistory: Event[];
  blueEventsHistory: Event[];

  timer: Timer;
}

export enum FightState {
  Scheduled,
  Running,
  Paused,
  Finished,
}
