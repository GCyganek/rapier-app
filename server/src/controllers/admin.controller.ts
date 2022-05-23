import { Body, Controller, Post } from '@nestjs/common';
import { FightsService } from '../services/fights.service';
import { PlayersService } from '../services/players.service';
import { FightData } from '../interfaces/fight-data.interface';
import { FightResponse } from '../interfaces/fight-response.interface';
import { PlayerData } from '../interfaces/player-data.interface';

@Controller()
export class AdminController {
  constructor(
    private readonly fightsService: FightsService,
    private readonly playersService: PlayersService,
  ) {}

  @Post('load-players')
  async loadPlayers(@Body('players') playersJson: string): Promise<string[]> {
    const players: PlayerData[] = JSON.parse(playersJson);

    const successful: string[] = [];
    await Promise.all(
      players.map(async (player) => {
        const result = await this.playersService.newPlayer(player);
        if (result !== undefined) {
          successful.push(result.id);
        } else {
          successful.push(null);
        }
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
