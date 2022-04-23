import { Test, TestingModule } from '@nestjs/testing';
import { FightsService } from '../../src/services/fights.service';
import {
  FightEndConditionName,
  FightState,
} from '../../src/interfaces/fight.interface';
import { ResponseStatus } from '../../src/interfaces/response.interface';
import { Event } from '../../src/interfaces/event.interface';
import { Manager } from 'socket.io-client';
import { Timer } from '../../src/classes/timer.class';
import { FightImpl } from '../../src/classes/fight.class';
import { FightEndConditionFulfilledObserver } from 'src/interfaces/observers/fight-end-condition-fulfilled-observer.interface';

describe('FightsService', () => {
  let app: TestingModule;
  let fightService: FightsService;
  let manager: Manager;

  const fight = new FightImpl(
    'mockup',
    'main',
    'red',
    'blue',
    'player1',
    'player2',
    new Map<FightEndConditionName, number>([
      [FightEndConditionName.EnoughPoints, 5],
      [FightEndConditionName.TimeEnded, 1],
    ]),
  );

  class MockFightEndConditionFulfilledObserver
    implements FightEndConditionFulfilledObserver
  {
    fightEndConditionFulfilled(
      condition: FightEndConditionName,
      fightReceived: FightImpl,
    ): void {
      expect(condition).toBe(FightEndConditionName.EnoughPoints);
      expect(fightReceived).toBe(fight);
      return;
    }
  }

  const mockFightEndConditionFulfilledObserver =
    new MockFightEndConditionFulfilledObserver();

  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [FightsService],
    }).compile();
    fightService = app.get(FightsService);
    manager = new Manager('wss://localhost:3000');
  });

  afterAll(() => {
    for (const socket of [
      fight.blueJudge.socket,
      fight.redJudge.socket,
      fight.mainJudge.socket,
    ]) {
      if (socket != null) {
        socket.disconnect();
      }
    }
  });

  describe('newFight', () => {
    it('should create new fight, add observer to it and find it', () => {
      expect(fight.fightEndConditionFulfilledObservers.length).toBe(0);
      fightService.setFightEndConditionFulfilledObserver(
        mockFightEndConditionFulfilledObserver,
      );
      fightService.newFight(fight);
      expect(fight.fightEndConditionFulfilledObservers.length).toBe(1);
      expect(fight.fightEndConditionFulfilledObservers[0]).toBe(
        mockFightEndConditionFulfilledObserver,
      );
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
    it('should check if given Judge.id belongs to main judge', () => {
      expect(fightService.isJudge(fight.id, fight.mainJudge.id)).toBeTruthy();
    });

    it('should check if given Judge.id belongs to red judge', () => {
      expect(fightService.isJudge(fight.id, fight.redJudge.id)).toBeTruthy();
    });

    it('should check if given Judge.id not belongs to random judge', () => {
      expect(fightService.isJudge(fight.id, 'test 123')).not.toBeTruthy();
    });

    it('should check if given Judge.id not belongs to random fight', () => {
      expect(
        fightService.isJudge('test 123', fight.mainJudge.id),
      ).not.toBeTruthy();
    });
  });

  describe('isMainJudge', () => {
    it('should check if given Judge.id belongs to the main judge', () => {
      expect(
        fightService.isMainJudge(fight.id, fight.mainJudge.id),
      ).toBeTruthy();
    });

    it('should check if given Judge.id not belongs to the main judge', () => {
      expect(
        fightService.isMainJudge(fight.id, fight.redJudge.id),
      ).not.toBeTruthy();
    });

    it('should check if random Judge.id not belongs to the main judge', () => {
      expect(fightService.isMainJudge(fight.id, 'test 123')).not.toBeTruthy();
    });

    it('should check if main Judge.id not belongs to the random fight', () => {
      expect(
        fightService.isMainJudge('test 123', fight.mainJudge.id),
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
      expect(fightService.addJudge('test 123', fight.mainJudge.id, null)).toBe(
        ResponseStatus.NotFound,
      );
    });

    it('red judge should be able to join fight and save his/her socket', () => {
      expect(fightService.addJudge(fight.id, fight.redJudge.id, null)).toBe(
        ResponseStatus.OK,
      );
    });
  });

  describe('startFight', () => {
    beforeEach(() => {
      fight.timer = new Timer(1, fight);
    });

    afterEach(() => {
      fight.timer.endTimer();
    });

    it('should not start random fight', () => {
      expect(fightService.startFight('test 123')).toBe(ResponseStatus.NotFound);
    });

    it('should not start fight without all judges', () => {
      const socket = manager.socket('/');
      fightService.addJudge(fight.id, fight.mainJudge.id, socket as any);
      fightService.addJudge(fight.id, fight.redJudge.id, socket as any);
      expect(fightService.startFight(fight.id)).toBe(ResponseStatus.NotReady);
    });

    it('should start ready fight after missing judge joined', () => {
      const socket = manager.socket('/');
      fightService.addJudge(fight.id, fight.blueJudge.id, socket as any);
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
      fight.timer = new Timer(1, fight);
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
      fight.timer = new Timer(1, fight);
    });

    afterEach(() => {
      fight.timer.endTimer();
    });

    it('should resume timer again when it was paused', () => {
      fight.state = FightState.Scheduled;
      fightService.startFight(fight.id);
      fightService.pauseTimer(fight.id, Date.now());
      expect(fightService.resumeTimer(fight.id)).toBe(ResponseStatus.OK);
      expect(fight.state).toBe(FightState.Running);
      expect(fight.timer.timeoutSet()).toBeTruthy();
    });

    it('should resume timer again when it was paused after fight time has already passed', () => {
      fight.state = FightState.Scheduled;
      fightService.startFight(fight.id);
      fightService.pauseTimer(fight.id, Date.now());
      fight.timer.endTimer();
      expect(fightService.resumeTimer(fight.id)).toBe(ResponseStatus.OK);
      expect(fight.state).toBe(FightState.Running);
      expect(fight.timer.timeoutSet()).toBeFalsy();
    });

    it('should return bad request when fight is in running state', () => {
      fight.state = FightState.Scheduled;
      fightService.startFight(fight.id);
      expect(fightService.resumeTimer(fight.id)).toBe(
        ResponseStatus.BadRequest,
      );
    });
  });

  describe('pauseTimer', () => {
    beforeEach(() => {
      fight.timer = new Timer(1, fight);
      fight.state = FightState.Scheduled;
      fightService.startFight(fight.id);
    });

    afterEach(() => {
      fight.timer.endTimer();
    });

    afterAll(() => {
      fight.timer = new Timer(1, fight);
      fight.state = FightState.Scheduled;
    });

    it('should pause timer again when it is running', () => {
      expect(fightService.pauseTimer(fight.id, Date.now())).toBe(
        ResponseStatus.OK,
      );
      expect(fight.state).toBe(FightState.Paused);
      expect(fight.timer.timeoutSet()).toBeFalsy();
    });

    it('should pause timer again when it is running after fight time has already passed', () => {
      fight.timer.endTimer();
      expect(fightService.pauseTimer(fight.id, Date.now())).toBe(
        ResponseStatus.OK,
      );
      expect(fight.state).toBe(FightState.Paused);
    });

    it('should return bad request when trying to pause fight in paused state', () => {
      fightService.pauseTimer(fight.id, Date.now());
      expect(fightService.pauseTimer(fight.id, Date.now())).toBe(
        ResponseStatus.BadRequest,
      );
    });
  });

  describe('handling events', () => {
    let events: Event[];
    const redPlayerPoints = 2;
    const bluePlayerPoints = 1;

    beforeAll(() => {
      events = [
        { id: 'a', playerColor: 'red' },
        { id: 'b', playerColor: 'blue' },
        { id: 'a', playerColor: 'red' },
      ];
    });

    describe('newEvents', () => {
      it('should not add events for random fight', () => {
        expect(
          fightService.newEvents(
            'test 123',
            events,
            redPlayerPoints,
            bluePlayerPoints,
          ),
        ).toBe(ResponseStatus.NotFound);

        expect(fight.redPlayer.points).toBe(0);
        expect(fight.bluePlayer.points).toBe(0);
        expect(fight.eventsHistory).toStrictEqual([]);
      });

      it('should not add events for scheduled fight', () => {
        expect(
          fightService.newEvents(
            fight.id,
            events,
            redPlayerPoints,
            bluePlayerPoints,
          ),
        ).toBe(ResponseStatus.BadRequest);

        expect(fight.redPlayer.points).toBe(0);
        expect(fight.bluePlayer.points).toBe(0);
        expect(fight.eventsHistory).toStrictEqual([]);
      });

      it('should not add events with negative number of points', () => {
        expect(
          fightService.newEvents(fight.id, events, -1, bluePlayerPoints),
        ).toBe(ResponseStatus.BadRequest);

        expect(fight.redPlayer.points).toBe(0);
        expect(fight.bluePlayer.points).toBe(0);
        expect(fight.eventsHistory).toStrictEqual([]);
      });

      it('should not add events for finished fight', () => {
        fight.state = FightState.Finished;
        expect(
          fightService.newEvents(
            fight.id,
            events,
            redPlayerPoints,
            bluePlayerPoints,
          ),
        ).toBe(ResponseStatus.BadRequest);

        expect(fight.redPlayer.points).toBe(0);
        expect(fight.bluePlayer.points).toBe(0);
        expect(fight.eventsHistory).toStrictEqual([]);
      });

      it('should add new events for running fight', () => {
        fight.state = FightState.Running;
        expect(
          fightService.newEvents(
            fight.id,
            events,
            redPlayerPoints,
            bluePlayerPoints,
          ),
        ).toBe(ResponseStatus.OK);

        expect(fight.redPlayer.points).toBe(2);
        expect(fight.bluePlayer.points).toBe(1);
        expect(fight.eventsHistory).toStrictEqual(events);

        fight.redPlayer.points = 0;
        fight.bluePlayer.points = 0;
        fight.eventsHistory = [];
      });

      it('should add new events for paused fight', () => {
        expect(
          fightService.newEvents(
            fight.id,
            events,
            redPlayerPoints,
            bluePlayerPoints,
          ),
        ).toBe(ResponseStatus.OK);

        expect(fight.redPlayer.points).toBe(2);
        expect(fight.bluePlayer.points).toBe(1);
        expect(fight.eventsHistory).toStrictEqual(events);

        fight.redPlayer.points = 0;
        fight.bluePlayer.points = 0;
        fight.eventsHistory = [];
      });
    });

    describe('eventsCanBeSuggested', () => {
      it('should return NotFound for fight with random fightId', () => {
        expect(
          fightService.eventsCanBeSuggested(
            'test 123',
            redPlayerPoints,
            bluePlayerPoints,
          ),
        ).toBe(ResponseStatus.NotFound);
      });

      it('should return BadRequest for events suggestion with negative number of points', () => {
        expect(
          fightService.eventsCanBeSuggested(fight.id, -1, bluePlayerPoints),
        ).toBe(ResponseStatus.BadRequest);
      });

      it('should return OK for correct events suggestion and fight in progress', () => {
        fight.state = FightState.Running;

        expect(
          fightService.eventsCanBeSuggested(
            fight.id,
            redPlayerPoints,
            bluePlayerPoints,
          ),
        ).toBe(ResponseStatus.OK);
      });

      it('should return BadRequest for correct events suggestion and fight scheduled', () => {
        fight.state = FightState.Scheduled;

        expect(
          fightService.eventsCanBeSuggested(
            fight.id,
            redPlayerPoints,
            bluePlayerPoints,
          ),
        ).toBe(ResponseStatus.BadRequest);
      });

      it('should return BadRequest for correct events suggestion and fight that has already ended', () => {
        fight.state = FightState.Finished;

        expect(
          fightService.eventsCanBeSuggested(
            fight.id,
            redPlayerPoints,
            bluePlayerPoints,
          ),
        ).toBe(ResponseStatus.BadRequest);
      });
    });
  });
});
