import { Body, Controller, Post } from '@nestjs/common';
import { FightsService } from '../services/fights.service';
import { PlayersService } from '../services/players.service';
import { Player } from '../interfaces/player.interface';
import { ResponseStatus } from '../interfaces/response.interface';
import { FightData } from '../interfaces/fight-data.interface';
import { FightResponse } from '../interfaces/fight-response.interface';

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
  async loadFights(
    @Body('fights') fightsJson: string,
  ): Promise<FightResponse[]> {
    const fights: FightData[] = JSON.parse(fightsJson);

    const response: FightResponse[] = [];
    await Promise.all(
      fights.map(async (fight) => {
        if (
          (await this.playersService.getPlayer(fight.redPlayerId)) == null ||
          (await this.playersService.getPlayer(fight.bluePlayerId)) == null
        ) {
          response.push(undefined);
          return;
        }

        const result = await this.fightsService.newFightFromData(fight);
        if (result !== undefined) {
          response.push({
            id: result.id,
            mainJudgeId: result.mainJudgeId,
            redJudgeId: result.redJudgeId,
            blueJudgeId: result.blueJudgeId,
          });
        } else {
          response.push(undefined);
        }
      }),
    );

    return response.reverse();
  }
}
