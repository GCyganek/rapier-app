import { Injectable } from '@nestjs/common';
import { Player } from '../interfaces/player.interface';
import { InjectModel } from '@nestjs/mongoose';
import { MongoPlayer, PlayerDocument } from '../schemas/player.schema';
import { Model } from 'mongoose';
import { PlayerData } from '../interfaces/player-data.interface';
import { customAlphabet } from 'nanoid';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(MongoPlayer.name) private playerModel: Model<PlayerDocument>,
  ) {}

  private async savePlayerToDb(player: Player): Promise<MongoPlayer> {
    return await this.playerModel.create(player);
  }

  async generatePlayerId(nanoid: () => string): Promise<string> {
    let new_id;
    do {
      new_id = nanoid();
    } while ((await this.getPlayer(new_id)) !== null);

    return new_id;
  }

  async newPlayer(playerData: PlayerData): Promise<Player> {
    const nanoid = customAlphabet('0123456789', 7);
    const playerId = await this.generatePlayerId(nanoid);

    const player: Player = {
      id: playerId,
      firstName: playerData.firstName,
      lastName: playerData.lastName,
    };

    try {
      await this.savePlayerToDb(player);
    } catch (error) {
      return undefined;
    }

    return player;
  }

  async getPlayer(id: string): Promise<MongoPlayer> {
    return this.playerModel.findOne({ id: id }, { _id: false }).exec();
  }

  async getAllPlayers(): Promise<MongoPlayer[]> {
    return this.playerModel.find({}, { _id: false }).exec();
  }

  async isPlayer(id: string): Promise<boolean> {
    return (await this.getPlayer(id)) !== null;
  }
}
