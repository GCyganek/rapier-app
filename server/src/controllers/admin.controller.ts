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
  async loadPlayers(@Body('players') playersJson: string): Promise<string[]> {
    const players: Player[] = JSON.parse(playersJson);

    const successful: string[] = [];
    await Promise.all(
      players.map(async (player) => {
        if ((await this.playersService.newPlayer(player)) == ResponseStatus.OK)
          successful.push(player.id);
      }),
    );

    return successful;
  }

  @Post('load-fights')
  async loadFights(@Body('fights') fightsJson: string): Promise<string[]> {
    const fights: FightDataInterface[] = JSON.parse(fightsJson);

    const successful: string[] = [];
    await Promise.all(
      fights.map(async (fight) => {
        if (await this.fightsService.newFightFromData(fight))
          successful.push(fight.id);
      }),
    );

    return successful;
  }
}
