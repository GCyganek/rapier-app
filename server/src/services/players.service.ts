import { Injectable } from '@nestjs/common';
import { ResponseStatus } from '../interfaces/response.interface';
import { Player } from '../interfaces/player.interface';
import { InjectModel } from '@nestjs/mongoose';
import { MongoPlayer, PlayerDocument } from 'src/schemas/player.schema';
import { Model } from 'mongoose';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(MongoPlayer.name) private playerModel: Model<PlayerDocument>,
  ) {}

  private async savePlayerToDb(player: Player): Promise<MongoPlayer> {
    const createdPlayer = new this.playerModel(player);
    return createdPlayer.save();
  }

  async newPlayer(player: Player): Promise<ResponseStatus> {
    if (await this.isPlayer(player.id)) return ResponseStatus.BadRequest;

    try {
      await this.savePlayerToDb(player);
    } catch (error) {
      console.error(error);
      return ResponseStatus.InternalServerError;
    }

    return ResponseStatus.OK;
  }

  async getPlayer(id: string): Promise<MongoPlayer> {
    return this.playerModel.findOne({ id: id });
  }

  async isPlayer(id: string): Promise<boolean> {
    return (await this.getPlayer(id)) !== null;
  }
}
