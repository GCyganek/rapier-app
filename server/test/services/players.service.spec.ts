import { Test, TestingModule } from '@nestjs/testing';
import { ResponseStatus } from '../../src/interfaces/response.interface';
import { PlayersService } from '../../src/services/players.service';
import { Player } from '../../src/interfaces/player.interface';

describe('PlayersService', () => {
  let app: TestingModule;
  let playersService: PlayersService;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [PlayersService],
    }).compile();
    playersService = app.get(PlayersService);
  });

  describe('newPlayer', () => {
    it('should create new player', () => {
      const player: Player = {
          id: "NewPlayer1",
          lastName: "Nowak",
          firstName: "Jan"
      }
      expect(playersService.newPlayer(player)).toBe(ResponseStatus.OK);
      expect(playersService.getPlayer(player.id)).toStrictEqual(player);
    });

    it('should not create player with duplicated id', () => {
        const player: Player = {
            id: "NewPlayer1",
            lastName: "kowalska",
            firstName: "Maria"
        }
        expect(playersService.newPlayer(player)).toBe(ResponseStatus.BadRequest);
    });
  });

  describe('getPlayer', () => {
    it('should return existing player', () => {
      const player: Player = {
          id: "NewPlayer1",
          lastName: "Nowak",
          firstName: "Jan"
      }
      expect(playersService.getPlayer(player.id)).toStrictEqual(player);
    });

    it('should not find invalid player', () => {
        const player: Player = {
            id: "546543231546548",
            lastName: "kowalska",
            firstName: "Maria"
        }
        expect(playersService.getPlayer(player.id)).toBe(undefined);
    });
  });

});
