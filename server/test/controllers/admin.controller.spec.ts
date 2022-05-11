import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../../src/controllers/admin.controller';
import { PlayersService } from '../../src/services/players.service';
import { FightsService } from '../../src/services/fights.service';

describe('AdminController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [PlayersService, FightsService],
    }).compile();
  });

  describe('loadPlayers', () => {
    it('should return ids of all added players', () => {
      const adminController = app.get<AdminController>(AdminController);
      const response = adminController.loadPlayers(
        '[{"id": "player_1","firstName": "Janek","lastName": "Kowalski"},' +
          '{"id": "player_2","firstName": "Andrzej","lastName": "Nowak"},' +
          '{"id": "player_3","firstName": "Marek","lastName": "Jarek"}]',
      );
      expect(response).toStrictEqual(['player_1', 'player_2', 'player_3']);
    });

    it('should not overwrite existing players', () => {
      const adminController = app.get<AdminController>(AdminController);
      const response = adminController.loadPlayers(
        '[{"id": "player_1","firstName": "Marek","lastName": "Kowalski"}]',
      );
      expect(response).toStrictEqual([]);
    });
  });

  describe('loadFights', () => {
    it('should return ids of all added fights', () => {
      const adminController = app.get<AdminController>(AdminController);
      const response = adminController.loadFights(
        '[{"id": "fight1","mainJudgeId": "main","redJudgeId": "red",' +
          '"blueJudgeId": "blue","redPlayerId": "player1","bluePlayerId": "player2",' +
          '"endConditions": [{"name": "TIME_ENDED","value": "5"},{"name": "ENOUGH_POINTS",' +
          '"value": "15"}]},{"id": "fight2","mainJudgeId": "main_judge","redJudgeId": ' +
          '"red_judge","blueJudgeId": "blue_judge","redPlayerId": "player3",' +
          '"bluePlayerId": "player2","endConditions": [{"name": "ENOUGH_POINTS","value": "10"}]}]',
      );
      expect(response).toStrictEqual(['fight1', 'fight2']);
    });

    it('should not overwrite existing fights', () => {
      const adminController = app.get<AdminController>(AdminController);
      const response = adminController.loadFights(
        '[{"id": "fight1","mainJudgeId": "different_id","redJudgeId": "red",' +
          '"blueJudgeId": "blue","redPlayerId": "player1","bluePlayerId": "player2",' +
          '"endConditions": []}]',
      );
      expect(response).toStrictEqual([]);
    });
  });
});
