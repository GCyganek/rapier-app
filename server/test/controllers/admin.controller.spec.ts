import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../../src/controllers/admin.controller';
import { PlayersService } from '../../src/services/players.service';
import { FightsService } from '../../src/services/fights.service';
import { getModelToken } from '@nestjs/mongoose';
import { MongoFight } from '../../src/schemas/fight.schema';
import { MongoPlayer } from '../../src/schemas/player.schema';
import { mockMongoFight } from '../constants/mock-mongo-fight';
import { FightImpl } from '../../src/classes/fight.class';
import { Model } from 'mongoose';
import { mockMongoPlayer } from '../constants/mock-mongo-player';

describe('AdminController', () => {
  let app: TestingModule;
  let fightModel: Model<MongoFight>;
  let playerModel: Model<MongoPlayer>;
  let mockFight;

  beforeAll(async () => {
    mockFight = new FightImpl(
      mockMongoFight.id,
      mockMongoFight.mainJudgeId,
      mockMongoFight.redJudgeId,
      mockMongoFight.blueJudgeId,
      mockMongoFight.redJudgeId,
      mockMongoFight.blueJudgeId,
      mockMongoFight.endConditions,
    );

    app = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        PlayersService,
        FightsService,
        {
          provide: getModelToken(MongoFight.name),
          useValue: {
            findOne: jest.fn(),
            updateOne: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken(MongoPlayer.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    fightModel = app.get<Model<MongoFight>>(getModelToken(MongoFight.name));
    playerModel = app.get<Model<MongoPlayer>>(getModelToken(MongoPlayer.name));
  });

  describe('loadPlayers', () => {
    it('should return ids of all added players', async () => {
      jest.spyOn(playerModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null), // would return null from database for non-existing player ids
      } as any);

      const adminController = app.get<AdminController>(AdminController);
      const response = await adminController.loadPlayers(
        '[{"id": "player_1","firstName": "Janek","lastName": "Kowalski"},' +
          '{"id": "player_2","firstName": "Andrzej","lastName": "Nowak"},' +
          '{"id": "player_3","firstName": "Marek","lastName": "Jarek"}]',
      );
      expect(response).toStrictEqual(['player_1', 'player_2', 'player_3']);
    });

    it('should not overwrite existing players', async () => {
      jest.spyOn(playerModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMongoPlayer), // simulates returning player with "player_1" id instead of null
      } as any);

      const adminController = app.get<AdminController>(AdminController);
      const response = await adminController.loadPlayers(
        '[{"id": "player_1","firstName": "Marek","lastName": "Kowalski"}]',
      );
      expect(response).toStrictEqual([]);
    });
  });

  describe('loadFights', () => {
    it('should return ids of all added fights', async () => {
      jest.spyOn(fightModel, 'create').mockImplementation(() => {
        Promise.resolve(mockFight); // simulates returning just added fight
      });

      jest.spyOn(fightModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null), // would return null from database for non-existing fight ids
      } as any);

      const adminController = app.get<AdminController>(AdminController);
      const response = await adminController.loadFights(
        '[{"id": "fight1","mainJudgeId": "main","redJudgeId": "red",' +
          '"blueJudgeId": "blue","redPlayerId": "player1","bluePlayerId": "player2",' +
          '"endConditions": [{"name": "TIME_ENDED","value": "5"},{"name": "ENOUGH_POINTS",' +
          '"value": "15"}]},{"id": "fight2","mainJudgeId": "main_judge","redJudgeId": ' +
          '"red_judge","blueJudgeId": "blue_judge","redPlayerId": "player3",' +
          '"bluePlayerId": "player2","endConditions": [{"name": "ENOUGH_POINTS","value": "10"}]}]',
      );
      expect(response).toStrictEqual(['fight1', 'fight2']);
    });

    it('should not overwrite existing fights', async () => {
      jest.spyOn(fightModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFight), // simulates returning fight with "fight1" id instead of null from db
      } as any);

      const adminController = app.get<AdminController>(AdminController);
      const response = await adminController.loadFights(
        '[{"id": "fight1","mainJudgeId": "different_id","redJudgeId": "red",' +
          '"blueJudgeId": "blue","redPlayerId": "player1","bluePlayerId": "player2",' +
          '"endConditions": []}]',
      );
      expect(response).toStrictEqual([]);
    });
  });
});
