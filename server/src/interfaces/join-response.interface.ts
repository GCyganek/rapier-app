import { Response } from './response.interface';
import { Player } from './player.interface';

export interface JoinResponse extends Response {
  connected: Array<JudgeRole>;
  role: JudgeRole;
  redPlayer: Player;
  bluePlayer: Player;
}

export enum JudgeRole {
  MainJudge = 'MAIN',
  RedJudge = 'RED',
  BlueJudge = 'BLUE',
}
