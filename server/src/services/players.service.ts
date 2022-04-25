import { Injectable } from '@nestjs/common';
import { ResponseStatus } from '../interfaces/response.interface';
import { Player } from '../interfaces/player.interface';

@Injectable()
export class PlayersService {
  private readonly players: Map<string, Player> = new Map<string, Player>();

  constructor() {
    const player1: Player = {
        id: "player1",
        firstName: "Ala",
        lastName: "Kowalska"
    }
    const player2: Player = {
        id: "player2",
        firstName: "Jan",
        lastName: "Kowalski"
    }
    this.newPlayer(player1);
    this.newPlayer(player2);
  }

  newPlayer(player: Player): ResponseStatus {
    if (this.isPlayer(player.id)) return ResponseStatus.BadRequest;

    this.players.set(player.id, player);
    return ResponseStatus.OK;
  }

  getPlayer(id: string): Player {
    return this.players.get(id);
  }

  isPlayer(id: string): boolean {
    if (this.players.get(id) == undefined) return false;
    return true;
  }
}
