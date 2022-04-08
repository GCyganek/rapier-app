import { Injectable } from '@nestjs/common';
import { PlayerInterface } from 'src/interfaces/player.interface';
import { ResponseStatus } from '../interfaces/response.interface';

@Injectable()
export class PlayersService {
  private readonly players: Map<string, PlayerInterface> = new Map<
    string,
    PlayerInterface
  >();

  newPlayer(player: PlayerInterface): ResponseStatus{
    if (this.players.has(player.id)){
        return ResponseStatus.BadRequest;
    }
    this.players.set(player.id, player);
    return ResponseStatus.OK
  }

  getPlayer(id: string): PlayerInterface {
    return this.players.get(id);
  }

}
