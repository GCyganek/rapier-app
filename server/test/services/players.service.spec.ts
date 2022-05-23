import { Test, TestingModule } from '@nestjs/testing';
import { PlayersService } from '../../src/services/players.service';
import { Player } from '../../src/interfaces/player.interface';
import { getModelToken } from '@nestjs/mongoose';
import { MongoPlayer } from '../../src/schemas/player.schema';
import { Model } from 'mongoose';
import { mockMongoPlayer } from '../constants/mock-mongo-player';
import { customAlphabet } from 'nanoid';

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

  describe('generatePlayerId', () => {
    it('should generate unique id fight', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      const nanoid = customAlphabet('0123456789', 7);
      const id = await playersService.generatePlayerId(nanoid);

      expect(id.length).toEqual(7);
    });
  });

  describe('newPlayer', () => {
    it('should create new player', async () => {
      jest.spyOn(model, 'create').mockImplementationOnce(() => {
        Promise.resolve(mockMongoPlayer);
      });

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      const player = await playersService.newPlayer(mockMongoPlayer);
      expect(player).not.toBeUndefined();
      expect(player.id.length).toEqual(7);

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockMongoPlayer),
      } as any);

      expect(
        (await playersService.getPlayer(player.id)).firstName,
      ).toStrictEqual(mockMongoPlayer.firstName);

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockMongoPlayer),
      } as any);

      expect(
        (await playersService.getPlayer(player.id)).lastName,
      ).toStrictEqual(mockMongoPlayer.lastName);
    });
  });

  describe('getPlayer', () => {
    it('should not find invalid player', async () => {
      const player: Player = {
        id: 'random_id_1234',
        lastName: 'kowalska',
        firstName: 'Maria',
      };
      expect(await playersService.getPlayer(player.id)).toBeUndefined();
    });
  });
});
