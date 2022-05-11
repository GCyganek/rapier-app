import { Body, Controller, Post } from '@nestjs/common';
import { FightsService } from '../services/fights.service';
import { PlayersService } from '../services/players.service';
import { Player } from '../interfaces/player.interface';
import { ResponseStatus } from '../interfaces/response.interface';
import { FightDataInterface } from '../interfaces/fight-data.interface';

@Controller()
export class AdminController {
  constructor(
    private readonly fightsService: FightsService,
    private readonly playersService: PlayersService,
  ) {}

  @Post('load-players')
  loadPlayers(@Body('players') playersJson: string): string[] {
    const players: Player[] = JSON.parse(playersJson);

    const successful: string[] = [];
    players.forEach((player) => {
      if (this.playersService.newPlayer(player) == ResponseStatus.OK)
        successful.push(player.id);
    });

    return successful;
  }

  @Post('load-fights')
  loadFights(@Body('fights') fightsJson: string): string[] {
    const fights: FightDataInterface[] = JSON.parse(fightsJson);

    const successful: string[] = [];
    fights.forEach((fight) => {
      if (this.fightsService.newFightFromData(fight)) successful.push(fight.id);
    });

    return successful;
  }
}
