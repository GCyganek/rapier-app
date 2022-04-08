import { Test, TestingModule } from '@nestjs/testing';
import { FightsService } from './fights.service';
import { FightInterface, FightState } from '../interfaces/fight.interface';
import { ResponseStatus } from '../interfaces/response.interface';
import { Manager } from 'socket.io-client';
import { Timer } from '../classes/timer.class';

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

    timer: new Timer(1)
  };

  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [FightsService],
    }).compile();
  });

  describe('newFight', () => {
    it('should create new fight and find it', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(fightService.getFight(fight.id)).not.toBeUndefined();
    });
  });

  describe('getFight', () => {
    it('should find newly created fight', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(fightService.getFight(fight.id)).not.toBeUndefined();
    });

    it('should not find random fight', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(fightService.getFight('test 123')).toBeUndefined();
    });
  });

  describe('isJudge', () => {
    it('should check if given judgeId belongs to main judge', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(fightService.isJudge(fight.id, fight.mainJudgeId)).toBeTruthy();
    });

    it('should check if given judgeId belongs to red judge', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(fightService.isJudge(fight.id, fight.redJudgeId)).toBeTruthy();
    });

    it('should check if given judgeId not belongs to random judge', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(fightService.isJudge(fight.id, 'test 123')).not.toBeTruthy();
    });

    it('should check if given judgeId not belongs to random fight', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
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
    });

    it('should check if given judgeId not belongs to the main judge', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(
        fightService.isMainJudge(fight.id, fight.redJudgeId),
      ).not.toBeTruthy();
    });

    it('should check if random judgeId not belongs to the main judge', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(fightService.isMainJudge(fight.id, 'test 123')).not.toBeTruthy();
    });

    it('should check if main judgeId not belongs to the random fight', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(
        fightService.isMainJudge('test 123', fight.mainJudgeId),
      ).not.toBeTruthy();
    });
  });

  describe('addJudge', () => {
    it('random judge should not able to join fight', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(fightService.addJudge(fight.id, 'test 123', null)).toBe(
        ResponseStatus.Unauthorized,
      );
    });

    it('should not be able to join random fight', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(fightService.addJudge('test 123', fight.mainJudgeId, null)).toBe(
        ResponseStatus.NotFound,
      );
    });

    it('red judge should be able to join fight and save his/her socket', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(fightService.addJudge(fight.id, fight.redJudgeId, null)).toBe(
        ResponseStatus.OK,
      );
    });
  });

  describe('startFight', () => {
    it('should not start random fight', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(fightService.startFight('test 123')).toBe(ResponseStatus.NotFound);
    });

    it('should not start fight without all judges', () => {
      const manager = new Manager('wss://localhost:3000');
      const socket = manager.socket('/');
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      fightService.addJudge(fight.id, fight.mainJudgeId, socket as any);
      fightService.addJudge(fight.id, fight.redJudgeId, socket as any);
      expect(fightService.startFight(fight.id)).toBe(ResponseStatus.NotReady);
    });

    it('should start ready fight', () => {
      const manager = new Manager('wss://localhost:3000');
      const socket = manager.socket('/');
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      fightService.addJudge(fight.id, fight.mainJudgeId, socket as any);
      fightService.addJudge(fight.id, fight.redJudgeId, socket as any);
      fightService.addJudge(fight.id, fight.blueJudgeId, socket as any);
      expect(fightService.startFight(fight.id)).toBe(ResponseStatus.OK);
    });

    it('should not start not running fight', () => {
      const manager = new Manager('wss://localhost:3000');
      const socket = manager.socket('/');
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      fightService.addJudge(fight.id, fight.mainJudgeId, socket as any);
      fightService.addJudge(fight.id, fight.redJudgeId, socket as any);
      fightService.addJudge(fight.id, fight.blueJudgeId, socket as any);
      fightService.getFight(fight.id).state = FightState.Finished;
      expect(fightService.startFight(fight.id)).toBe(ResponseStatus.BadRequest);
    });
  });

  describe('finishFight', () => {
    it('should not finish random fight', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      expect(fightService.finishFight('test 123')).toBe(
        ResponseStatus.NotFound,
      );
    });

    it('should not finish not running fight', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      fightService.getFight(fight.id).state = FightState.Finished;
      expect(fightService.finishFight(fight.id)).toBe(
        ResponseStatus.BadRequest,
      );
    });

    it('should finish running fight', () => {
      const fightService = app.get(FightsService);
      fightService.newFight(fight);
      fightService.getFight(fight.id).state = FightState.Running;
      expect(fightService.finishFight(fight.id)).toBe(ResponseStatus.OK);
    });
  });
});
