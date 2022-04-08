import { Test, TestingModule } from '@nestjs/testing';
import { FightsService } from './fights.service';
import { FightInterface, FightState } from '../interfaces/fight.interface';
import { ResponseStatus } from '../interfaces/response.interface';
import { Manager } from 'socket.io-client';
import { Timer } from '../classes/timer/timer.class';

describe('FightsService', () => {
  let app: TestingModule;
  let fightService: FightsService;
  let manager: Manager;
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

    timer: new Timer(1),
  };

  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [FightsService],
    }).compile();
    fightService = app.get(FightsService);
  });

  describe('newFight', () => {
    it('should create new fight and find it', () => {
      fightService.newFight(fight);
      expect(fightService.getFight(fight.id)).not.toBeUndefined();
    });
  });

  describe('getFight', () => {
    it('should find newly created fight', () => {
      expect(fightService.getFight(fight.id)).not.toBeUndefined();
    });

    it('should not find random fight', () => {
      expect(fightService.getFight('test 123')).toBeUndefined();
    });
  });

  describe('isJudge', () => {

    it('should check if given judgeId belongs to main judge', () => {
      expect(fightService.isJudge(fight.id, fight.mainJudgeId)).toBeTruthy();
    });

    it('should check if given judgeId belongs to red judge', () => {
      expect(fightService.isJudge(fight.id, fight.redJudgeId)).toBeTruthy();
    });

    it('should check if given judgeId not belongs to random judge', () => {
      expect(fightService.isJudge(fight.id, 'test 123')).not.toBeTruthy();
    });

    it('should check if given judgeId not belongs to random fight', () => {
      expect(
        fightService.isJudge('test 123', fight.mainJudgeId),
      ).not.toBeTruthy();
    });
  });

  describe('isMainJudge', () => {

    it('should check if given judgeId belongs to the main judge', () => {
      expect(
        fightService.isMainJudge(fight.id, fight.mainJudgeId),
      ).toBeTruthy();
    });

    it('should check if given judgeId not belongs to the main judge', () => {
      expect(
        fightService.isMainJudge(fight.id, fight.redJudgeId),
      ).not.toBeTruthy();
    });

    it('should check if random judgeId not belongs to the main judge', () => {
      expect(fightService.isMainJudge(fight.id, 'test 123')).not.toBeTruthy();
    });

    it('should check if main judgeId not belongs to the random fight', () => {
      expect(
        fightService.isMainJudge('test 123', fight.mainJudgeId),
      ).not.toBeTruthy();
    });
  });

  describe('addJudge', () => {
        
    it('random judge should not able to join fight', () => {
      expect(fightService.addJudge(fight.id, 'test 123', null)).toBe(
        ResponseStatus.Unauthorized,
      );
    });

    it('should not be able to join random fight', () => {
      expect(fightService.addJudge('test 123', fight.mainJudgeId, null)).toBe(
        ResponseStatus.NotFound,
      );
    });

    it('red judge should be able to join fight and save his/her socket', () => {
      expect(fightService.addJudge(fight.id, fight.redJudgeId, null)).toBe(
        ResponseStatus.OK,
      );
    });
  });

  describe('startFight', () => {

    beforeAll(() => {
      manager = new Manager('wss://localhost:3000');
    })

    afterAll(() => {
      manager._close();
    })

    beforeEach(() => {
      fight.timer = new Timer(1);
    });

    afterEach(() => {
      fight.timer.endTimer();
    })

    it('should not start random fight', () => {
      expect(fightService.startFight('test 123')).toBe(ResponseStatus.NotFound);
    });

    it('should not start fight without all judges', () => {
      const socket = manager.socket('/');
      fightService.addJudge(fight.id, fight.mainJudgeId, socket as any);
      fightService.addJudge(fight.id, fight.redJudgeId, socket as any);
      expect(fightService.startFight(fight.id)).toBe(ResponseStatus.NotReady);
    });

    it('should start ready fight after missing judge joined', () => {
      const socket = manager.socket('/');
      fightService.addJudge(fight.id, fight.blueJudgeId, socket as any);
      expect(fightService.startFight(fight.id)).toBe(ResponseStatus.OK);
    });

    it('should not start not running fight', () => {
      fight.state = FightState.Finished;
      expect(fightService.startFight(fight.id)).toBe(ResponseStatus.BadRequest);
    });
  });

  describe('finishFight', () => {
    it('should not finish random fight', () => {
      expect(fightService.finishFight('test 123')).toBe(
        ResponseStatus.NotFound,
      );
    });

    it('should not finish not running fight', () => {
     fight.state = FightState.Finished;
      expect(fightService.finishFight(fight.id)).toBe(
        ResponseStatus.BadRequest,
      );
    });

    it('should finish running fight', () => {
      fight.state = FightState.Running;
      expect(fightService.finishFight(fight.id)).toBe(ResponseStatus.OK);
    });

    it('should finish paused fight', () => {
      fight.state = FightState.Paused;
      expect(fightService.finishFight(fight.id)).toBe(ResponseStatus.OK);
    });

    it('should end the timer if it was running', () => {
      fight.timer = new Timer(1);
      fight.state = FightState.Scheduled;
      fightService.startFight(fight.id);
      expect(fight.timer.timeoutSet()).toBeTruthy();
      fightService.finishFight(fight.id);
      expect(fight.timer.timeoutSet()).toBeFalsy();
    });

    it('should leave the timer as ended when it has already ended running earlier', () => {
      fight.state = FightState.Scheduled;
      fightService.startFight(fight.id);
      fight.timer.endTimer();
      expect(fight.timer.hasTimeEnded()).toBeTruthy();
      fightService.finishFight(fight.id);
      expect(fight.timer.hasTimeEnded()).toBeTruthy();
    });
  });

  describe('startTimer', () => {
    beforeEach(() => {
      fight.timer = new Timer(1);
    });

    afterEach(() => {
      fight.timer.endTimer();
    })

    it('should start timer again when it was paused', () => {
      fight.state = FightState.Scheduled;
      fightService.startFight(fight.id);
      fightService.pauseTimer(fight.id, Date.now());
      expect(fightService.startTimer(fight.id)).toBe(ResponseStatus.OK);
      expect(fight.state).toBe(FightState.Running);
      expect(fight.timer.timeoutSet()).toBeTruthy();
    });

    it('should start timer again when it was paused after fight time has already passed', () => {
      fight.state = FightState.Scheduled;
      fightService.startFight(fight.id);
      fightService.pauseTimer(fight.id, Date.now());
      fight.timer.endTimer();
      expect(fightService.startTimer(fight.id)).toBe(ResponseStatus.OK);
      expect(fight.state).toBe(FightState.Running);
      expect(fight.timer.timeoutSet()).toBeFalsy();
    });

    it('should return bad request when fight is in running state', () => {
      fight.state = FightState.Scheduled;
      fightService.startFight(fight.id);
      expect(fightService.startTimer(fight.id)).toBe(ResponseStatus.BadRequest);
    });
  });

  describe('pauseTimer', () => {
    beforeEach(() => {
      fight.timer = new Timer(1);
      fight.state = FightState.Scheduled;
      fightService.startFight(fight.id);
    });

    afterEach(() => {
      fight.timer.endTimer();
    })

    it('should pause timer again when it is running', () => {
      expect(fightService.pauseTimer(fight.id, Date.now())).toBe(ResponseStatus.OK);
      expect(fight.state).toBe(FightState.Paused);
      expect(fight.timer.timeoutSet()).toBeFalsy();
    });

    it('should pause timer again when it is running after fight time has already passed', () => {
      fight.timer.endTimer();
      expect(fightService.pauseTimer(fight.id, Date.now())).toBe(ResponseStatus.OK);
      expect(fight.state).toBe(FightState.Paused);
    });

    it('should return bad request when trying to pause fight in paused state', () => {
      fightService.pauseTimer(fight.id, Date.now());
      expect(fightService.pauseTimer(fight.id, Date.now())).toBe(ResponseStatus.BadRequest);
    });
  });
});
