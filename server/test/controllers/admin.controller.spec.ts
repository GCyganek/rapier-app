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
        '[{"firstName": "Janek","lastName": "Kowalski"},' +
          '{"firstName": "Andrzej","lastName": "Nowak"},' +
          '{"firstName": "Marek","lastName": "Jarek"}]',
      );
      expect(response.length).toEqual(3);
      expect(response[0].length).toEqual(7);
      expect(response[1].length).toEqual(7);
      expect(response[2].length).toEqual(7);
    });
  });

  describe('loadFights', () => {
    it('should return FightResponse for all added fights', async () => {
      jest.spyOn(fightModel, 'create').mockImplementation(() => {
        Promise.resolve(mockFight); // simulates returning just added fight
      });

      jest.spyOn(fightModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null), // would return null from database for non-existing fight ids
      } as any);

      jest.spyOn(playerModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMongoPlayer), // simulates returning player with "player_1" id instead of null
      } as any);

      const adminController = app.get<AdminController>(AdminController);
      const response = await adminController.loadFights(
        '[{"redPlayerId": "player1","bluePlayerId": "player1","endConditions": ' +
          '[{"name": "TIME_ENDED","value": "5"},{"name": "ENOUGH_POINTS","value": "15"}]},' +
          '{"redPlayerId": "player1","bluePlayerId": "player1","endConditions": ' +
          '[{"name": "ENOUGH_POINTS","value": "10"}]}]',
      );
      expect(response.length).toEqual(2);
      expect(response[0]).not.toBeUndefined();
      expect(response[1]).not.toBeUndefined();
    });
  });

  it('should not create fight with random player', async () => {
    jest.spyOn(playerModel, 'findOne').mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    } as any);

    const adminController = app.get<AdminController>(AdminController);
    const response = await adminController.loadFights(
      '[{"redPlayerId":"random_player","bluePlayerId":"player2","endConditions":[]}]',
    );
    expect(response.length).toEqual(1);
    expect(response[0]).toBeUndefined();
  });
});
