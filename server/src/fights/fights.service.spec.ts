import { Test, TestingModule } from '@nestjs/testing';
import { FightsService } from './fights.service';
import { FightInterface, FightState } from '../interfaces/fight.interface';
import { ResponseStatus } from '../interfaces/response.interface';

describe('FightsService', () => {
  let app: TestingModule;
  const fight: FightInterface = {
    id: 'mockup',
    state: FightState.Scheduled,

    mainJudgeId: 'main',
    redJudgeId: 'red',
    blueJudgeId: 'blue',

    mainJudgeSocket: null,
    redJudgeSocket: null,
    blueJudgeSocket: null,

    redPlayerId: 'player1',
    bluePlayerId: 'player2',

    redEventsHistory: [],
    blueEventsHistory: [],
  };

  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [FightsService],
    }).compile();
  });

  describe('newFight and getFight', () => {
    it('should create new fight and find it', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(fightService.getFight(fight.id)).not.toBeUndefined();
      expect(fightService.getFight('test 123')).toBeUndefined();
    });
  });

  describe('isJudge', () => {
    it('should check if given judgeId belongs to fight judge', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(fightService.isJudge(fight.id, fight.mainJudgeId)).toBeTruthy();
      expect(fightService.isJudge(fight.id, fight.redJudgeId)).toBeTruthy();
      expect(fightService.isJudge(fight.id, fight.blueJudgeId)).toBeTruthy();
      expect(fightService.isJudge(fight.id, 'test 123')).not.toBeTruthy();
      expect(
        fightService.isJudge('test 123', fight.mainJudgeId),
      ).not.toBeTruthy();
    });
  });

  describe('isMainJudge', () => {
    it('should check if given judgeId belongs to the main judge', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(
        fightService.isMainJudge(fight.id, fight.mainJudgeId),
      ).toBeTruthy();
      expect(
        fightService.isMainJudge(fight.id, fight.redJudgeId),
      ).not.toBeTruthy();
    });
  });

  describe('addJudge', () => {
    it('should check if judge is able to join fight and save his/her socket', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(fightService.addJudge(fight.id, 'test 123', null)).toBe(
        ResponseStatus.Unauthorized,
      );
      expect(fightService.addJudge('test 123', fight.mainJudgeId, null)).toBe(
        ResponseStatus.NotFound,
      );
      expect(fightService.addJudge(fight.id, fight.redJudgeId, null)).toBe(
        ResponseStatus.OK,
      );
    });
  });

  describe('startFight', () => {
    it('should check if fight is ready to start and start it', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(fightService.startFight('test 123')).toBe(ResponseStatus.NotFound);
      fightService.addJudge(fight.id, fight.mainJudgeId, null);
      fightService.addJudge(fight.id, fight.redJudgeId, null);
      expect(fightService.startFight(fight.id)).toBe(ResponseStatus.NotReady);
      return; // TODO add socket mockups
      fightService.addJudge(fight.id, fight.blueJudgeId, null);
      expect(fightService.startFight(fight.id)).toBe(ResponseStatus.OK);
      fightService.getFight(fight.id).state = FightState.Finished;
      expect(fightService.startFight(fight.id)).toBe(ResponseStatus.BadRequest);
    });
  });

  describe('finishFight', () => {
    it('should check if fight can be finished and finish it', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(fightService.finishFight('test 123')).toBe(
        ResponseStatus.NotFound,
      );
      fightService.getFight(fight.id).state = FightState.Finished;
      expect(fightService.finishFight(fight.id)).toBe(
        ResponseStatus.BadRequest,
      );
      fightService.getFight(fight.id).state = FightState.Running;
      expect(fightService.finishFight(fight.id)).toBe(ResponseStatus.OK);
    });
  });
});
