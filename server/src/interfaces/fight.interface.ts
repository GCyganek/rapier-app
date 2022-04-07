import { EventInterface } from './event.interface.js';
import { Socket } from 'socket.io';

export interface FightInterface {
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

  redEventsHistory: EventInterface[];
  blueEventsHistory: EventInterface[];
}

export enum FightState {
  Scheduled,
  Running,
  Paused,
  Finished,
}
