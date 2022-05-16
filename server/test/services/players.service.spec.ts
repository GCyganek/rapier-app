import { Test, TestingModule } from '@nestjs/testing';
import { ResponseStatus } from '../../src/interfaces/response.interface';
import { PlayersService } from '../../src/services/players.service';
import { Player } from '../../src/interfaces/player.interface';
import { getModelToken } from '@nestjs/mongoose';
import { MongoPlayer } from '../../src/schemas/player.schema';
import { Model } from 'mongoose';
import { mockMongoPlayer } from '../constants/mock-mongo-player';

describe('PlayersService', () => {
  let playersService: PlayersService;
  let model: Model<MongoPlayer>;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        PlayersService,
        {
          provide: getModelToken(MongoPlayer.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockMongoPlayer),
            constructor: jest.fn().mockResolvedValue(mockMongoPlayer),
            findOne: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    playersService = app.get<PlayersService>(PlayersService);
    model = app.get<Model<MongoPlayer>>(getModelToken(MongoPlayer.name));
  });

  it('should be defined', () => {
    expect(playersService).toBeDefined();
  });

  describe('newPlayer', () => {
    it('should create new player', async () => {
      jest.spyOn(model, 'create').mockImplementationOnce(() => {
        Promise.resolve(mockMongoPlayer);
      });

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      expect(await playersService.newPlayer(mockMongoPlayer)).toBe(
        ResponseStatus.OK,
      );

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockMongoPlayer),
      } as any);

      expect(await playersService.getPlayer(mockMongoPlayer.id)).toStrictEqual(
        mockMongoPlayer,
      );
    });

    it('should not create player with duplicated id', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockMongoPlayer),
      } as any);

      jest.spyOn(model, 'create').mockImplementationOnce(() => {
        Promise.resolve(mockMongoPlayer);
      });

      expect(await playersService.newPlayer(mockMongoPlayer)).toBe(
        ResponseStatus.BadRequest,
      );
    });
  });

  describe('getPlayer', () => {
    it('should return existing player', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockMongoPlayer),
      } as any);

      expect(await playersService.getPlayer(mockMongoPlayer.id)).toStrictEqual(
        mockMongoPlayer,
      );
    });

    it('should not find invalid player', async () => {
      const player: Player = {
        id: '546543231546548',
        lastName: 'kowalska',
        firstName: 'Maria',
      };
      expect(await playersService.getPlayer(player.id)).toBeUndefined();
    });
  });
});
