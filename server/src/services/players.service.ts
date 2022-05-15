import { Injectable } from '@nestjs/common';
import { ResponseStatus } from '../interfaces/response.interface';
import { Player } from '../interfaces/player.interface';
import { InjectModel } from '@nestjs/mongoose';
import { MongoPlayer, PlayerDocument } from '../schemas/player.schema';
import { Model } from 'mongoose';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(MongoPlayer.name) private playerModel: Model<PlayerDocument>,
  ) {}

  private async savePlayerToDb(player: Player): Promise<MongoPlayer> {
    const createdPlayer = await this.playerModel.create(player);
    return createdPlayer;
  }

  async newPlayer(player: Player): Promise<ResponseStatus> {
    if (await this.isPlayer(player.id)) return ResponseStatus.BadRequest;

    try {
      await this.savePlayerToDb(player);
    } catch (error) {
      return ResponseStatus.InternalServerError;
    }

    return ResponseStatus.OK;
  }

  async getPlayer(id: string): Promise<MongoPlayer> {
    return this.playerModel.findOne({ id: id }).exec();
  }

  async isPlayer(id: string): Promise<boolean> {
    return (await this.getPlayer(id)) !== null;
  }
}
