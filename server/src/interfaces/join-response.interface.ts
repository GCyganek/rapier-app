import { Response } from './response.interface';
import { Player } from './player.interface';

export interface JoinResponse extends Response {
  redPlayer: Player;
  bluePlayer: Player;
}
