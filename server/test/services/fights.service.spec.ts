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
import { FightData } from '../../src/interfaces/fight-data.interface';
import { MongoFight } from '../../src/schemas/fight.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { mockMongoFight } from '../constants/mock-mongo-fight';
import { customAlphabet } from 'nanoid';

const mockMongoFightData: FightData = {
  redPlayerId: 'redPlayer',
  bluePlayerId: 'bluePlayer',
  endConditions: [
    {
      name: FightEndConditionName.EnoughPoints,
      value: 5,
    },
    {
      name: FightEndConditionName.TimeEnded,
      value: 1,
    },
  ],
};

describe('FightsService', () => {
  let app: TestingModule;
  let fightsService: FightsService;
  let manager: Manager;
  let model: Model<MongoFight>;

  const mockFight = new FightImpl(
    mockMongoFight.id,
    mockMongoFight.mainJudgeId,
    mockMongoFight.redJudgeId,
    mockMongoFight.blueJudgeId,
    mockMongoFight.redJudgeId,
    mockMongoFight.blueJudgeId,
    mockMongoFight.endConditions,
  );

  class MockFightEndConditionFulfilledObserver
    implements FightEndConditionFulfilledObserver
  {
    fightEndConditionFulfilled(
      condition: FightEndConditionName,
      fightReceived: FightImpl,
    ): void {
      expect(condition).toBe(FightEndConditionName.EnoughPoints);
      expect(fightReceived).toBe(mockFight);
      return;
    }
  }

  const mockFightEndConditionFulfilledObserver =
    new MockFightEndConditionFulfilledObserver();

  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [
        FightsService,
        {
          provide: getModelToken(MongoFight.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockFight),
            constructor: jest.fn().mockResolvedValue(mockFight),
            findOne: jest.fn(),
            updateOne: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    fightsService = app.get<FightsService>(FightsService);
    model = app.get<Model<MongoFight>>(getModelToken(MongoFight.name));
    manager = new Manager('wss://localhost:3000');
  });

  afterAll(() => {
    for (const socket of [
      mockFight.blueJudge.socket,
      mockFight.redJudge.socket,
      mockFight.mainJudge.socket,
    ]) {
      if (socket != null) {
        socket.disconnect();
      }
    }
  });

  it('should be defined', () => {
    expect(fightsService).toBeDefined();
  });

  describe('newFight', () => {
    it('should create new fight', async () => {
      jest.spyOn(model, 'create').mockImplementationOnce(() => {
        Promise.resolve(mockFight);
      });

      jest.spyOn(model, 'findOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      expect(await fightsService.newFight(mockFight)).toBeTruthy();

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockMongoFight),
      } as any);

      expect(fightsService.getFightFromDb(mockFight.id)).not.toBeUndefined();
    });
  });

  describe('generateFightId', () => {
    it('should generate unique id fight', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      const nanoid = customAlphabet('0123456789', 7);
      const id = await fightsService.generateFightId(nanoid);

      expect(id.length).toEqual(7);
    });
  });

  describe('generateJudgeIds', () => {
    it('should generate unique ids for all judges', () => {
      const nanoid = customAlphabet('0123456789', 7);
      const ids = fightsService.generateJudgeIds(nanoid);

      expect(ids[0]).not.toStrictEqual(ids[1]);
      expect(ids[0]).not.toStrictEqual(ids[2]);
      expect(ids[1]).not.toStrictEqual(ids[2]);
      expect(ids[0].length).toEqual(7);
      expect(ids[1].length).toEqual(7);
      expect(ids[2].length).toEqual(7);
    });
  });

  describe('newFightFromData', () => {
    it('should create new fight from FightDataInterface', async () => {
      jest.spyOn(model, 'create').mockImplementationOnce(() => {
        Promise.resolve(mockMongoFight);
      });

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      expect(
        await fightsService.newFightFromData(mockMongoFightData),
      ).not.toBeUndefined();

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockMongoFight),
      } as any);

      expect(
        await fightsService.getFightFromDb(mockMongoFight.id),
      ).not.toBeUndefined();
    });
  });

  describe('getFightFromDb', () => {
    it('should find newly created fight', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      expect(
        await fightsService.getFightFromDb(mockFight.id),
      ).not.toBeUndefined();
    });

    it('should not find random fight', async () => {
      jest.spyOn(model, 'findOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      expect(await fightsService.getFightFromDb('test 123')).toBeNull();
    });
  });

  describe('addJudge', () => {
    it('random judge should not able to join fight', async () => {
      jest.spyOn(model, 'findOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockMongoFight),
      } as any);

      expect(await fightsService.addJudge(mockFight.id, 'test 123', null)).toBe(
        ResponseStatus.Unauthorized,
      );

      fightsService.clearFights();
    });

    it('should not be able to join random fight', async () => {
      jest.spyOn(model, 'findOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      expect(
        await fightsService.addJudge('test 123', mockFight.mainJudge.id, null),
      ).toBe(ResponseStatus.NotFound);
    });

    it('red judge should be able to join fight and save his/her socket', async () => {
      jest.spyOn(model, 'findOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockMongoFight),
      } as any);

      fightsService.setFightEndConditionFulfilledObserver(
        mockFightEndConditionFulfilledObserver,
      );

      expect(
        await fightsService.addJudge(mockFight.id, mockFight.redJudge.id, null),
      ).toBe(ResponseStatus.OK);

      const fight = fightsService.getFight(mockFight.id);
      expect(fight.fightEndConditionFulfilledObservers.length).toBe(1);
      expect(fight.fightEndConditionFulfilledObservers[0]).toBe(
        mockFightEndConditionFulfilledObserver,
      );
    });
  });

  describe('startFight', () => {
    jest.useFakeTimers();

    beforeEach(() => {
      mockFight.timer = new Timer(1, mockFight);
    });

    afterEach(() => {
      mockFight.timer.endTimer();
    });

    it('should not start random fight', () => {
      expect(fightsService.startFight('test 123')).toBe(
        ResponseStatus.NotFound,
      );
    });

    it('should not start fight without all judges', async () => {
      const socket = manager.socket('/');

      jest.spyOn(model, 'findOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockMongoFight),
      } as any);

      await fightsService.addJudge(
        mockFight.id,
        mockFight.mainJudge.id,
        socket as any,
      );

      jest.spyOn(model, 'findOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockMongoFight),
      } as any);

      await fightsService.addJudge(
        mockFight.id,
        mockFight.redJudge.id,
        socket as any,
      );

      expect(fightsService.startFight(mockFight.id)).toBe(
        ResponseStatus.NotReady,
      );
    });

    it('should start ready fight after missing judge joined', async () => {
      const socket = manager.socket('/');

      await fightsService.addJudge(
        mockFight.id,
        mockFight.blueJudge.id,
        socket as any,
      );

      expect(fightsService.startFight(mockFight.id)).toBe(ResponseStatus.OK);
    });

    it('should not start not running fight', () => {
      mockFight.state = FightState.Finished;
      expect(fightsService.startFight(mockFight.id)).toBe(
        ResponseStatus.BadRequest,
      );
    });
  });

  describe('isJudge', () => {
    it('should check if given Judge.id belongs to main judge', () => {
      expect(
        fightsService.isJudge(mockFight.id, mockFight.mainJudge.id),
      ).toBeTruthy();
    });

    it('should check if given Judge.id belongs to red judge', () => {
      expect(
        fightsService.isJudge(mockFight.id, mockFight.redJudge.id),
      ).toBeTruthy();
    });

    it('should check if given Judge.id not belongs to random judge', () => {
      expect(fightsService.isJudge(mockFight.id, 'test 123')).not.toBeTruthy();
    });

    it('should check if given Judge.id not belongs to random fight', () => {
      expect(
        fightsService.isJudge('test 123', mockFight.mainJudge.id),
      ).not.toBeTruthy();
    });
  });

  describe('isMainJudge', () => {
    it('should check if given Judge.id belongs to the main judge', () => {
      expect(
        fightsService.isMainJudge(mockFight.id, mockFight.mainJudge.id),
      ).toBeTruthy();
    });

    it('should check if given Judge.id not belongs to the main judge', () => {
      expect(
        fightsService.isMainJudge(mockFight.id, mockFight.redJudge.id),
      ).not.toBeTruthy();
    });

    it('should check if random Judge.id not belongs to the main judge', () => {
      expect(
        fightsService.isMainJudge(mockFight.id, 'test 123'),
      ).not.toBeTruthy();
    });

    it('should check if main Judge.id not belongs to the random fight', () => {
      expect(
        fightsService.isMainJudge('test 123', mockFight.mainJudge.id),
      ).not.toBeTruthy();
    });
  });

  describe('finishFight', () => {
    jest.useFakeTimers();
    it('should not finish random fight', async () => {
      expect(await fightsService.finishFight('test 123')).toBe(
        ResponseStatus.NotFound,
      );
    });

    it('should not finish not running fight', async () => {
      const fight = fightsService.getFight(mockFight.id);
      fight.state = FightState.Finished;

      expect(await fightsService.finishFight(mockFight.id)).toBe(
        ResponseStatus.BadRequest,
      );

      fightsService.setFight(fight);
    });

    it('should finish running fight', async () => {
      jest.spyOn(model, 'updateOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const fight = fightsService.getFight(mockFight.id);
      fight.state = FightState.Running;

      expect(await fightsService.finishFight(mockFight.id)).toBe(
        ResponseStatus.OK,
      );

      fightsService.setFight(fight);
    });

    it('should finish paused fight', async () => {
      jest.spyOn(model, 'updateOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const fight = fightsService.getFight(mockFight.id);
      fight.state = FightState.Paused;

      expect(await fightsService.finishFight(mockFight.id)).toBe(
        ResponseStatus.OK,
      );

      fightsService.setFight(fight);
    });

    it('should end the timer if it was running', async () => {
      jest.spyOn(model, 'updateOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const fight = fightsService.getFight(mockFight.id);

      fight.timer = new Timer(1, mockFight);
      fight.state = FightState.Scheduled;

      fightsService.startFight(mockFight.id);
      expect(fight.timer.timeoutSet()).toBeTruthy();
      await fightsService.finishFight(mockFight.id);
      expect(fight.timer.timeoutSet()).toBeFalsy();

      fightsService.setFight(fight);
    });

    it('should leave the timer as ended when it has already ended running earlier', async () => {
      const fight = fightsService.getFight(mockFight.id);

      fight.state = FightState.Scheduled;
      fight.timer = new Timer(1, mockFight);

      fightsService.startFight(mockFight.id);
      expect(fight.timer.hasTimeEnded()).toBeFalsy();

      fight.timer.endTimer();
      expect(fight.timer.hasTimeEnded()).toBeTruthy();
      await fightsService.finishFight(mockFight.id);
      expect(fight.timer.hasTimeEnded()).toBeTruthy();

      fightsService.setFight(fight);
    });
  });

  describe('startTimer', () => {
    jest.useFakeTimers();
    let fight;

    beforeEach(() => {
      fight = fightsService.getFight(mockFight.id);
      fight.timer = new Timer(1, mockFight);
    });

    afterEach(() => {
      fight.timer.endTimer();
    });

    it('should resume timer again when it was paused', () => {
      fight.state = FightState.Scheduled;
      const exactTimeInMillis = Date.now();
      fightsService.startFight(mockFight.id);
      fightsService.pauseTimer(mockFight.id, Date.now());
      expect(fightsService.resumeTimer(mockFight.id, exactTimeInMillis)).toBe(
        ResponseStatus.OK,
      );
      expect(fight.state).toBe(FightState.Running);
      expect(fight.timer.timeoutSet()).toBeTruthy();
    });

    it('should resume timer again when it was paused after fight time has already passed', () => {
      fight.state = FightState.Scheduled;
      const exactTimeInMillis = Date.now();
      fightsService.startFight(mockFight.id);
      fightsService.pauseTimer(mockFight.id, Date.now());
      fight.timer.endTimer();
      expect(fightsService.resumeTimer(mockFight.id, exactTimeInMillis)).toBe(
        ResponseStatus.OK,
      );
      expect(fight.state).toBe(FightState.Running);
      expect(fight.timer.timeoutSet()).toBeFalsy();
    });

    it('should return bad request when fight is in running state', () => {
      fight.state = FightState.Scheduled;
      const exactTimeInMillis = Date.now();
      expect(fightsService.startFight(mockFight.id)).toBe(ResponseStatus.OK);
      expect(fightsService.resumeTimer(mockFight.id, exactTimeInMillis)).toBe(
        ResponseStatus.BadRequest,
      );
    });
  });

  describe('pauseTimer', () => {
    jest.useFakeTimers();
    let fight;

    beforeEach(() => {
      fight = fightsService.getFight(mockFight.id);
      fight.timer = new Timer(1, mockFight);
      fight.state = FightState.Scheduled;
      fightsService.startFight(mockFight.id);
    });

    afterEach(() => {
      fight.timer.endTimer();
    });

    afterAll(() => {
      fight.timer = new Timer(1, mockFight);
      fight.state = FightState.Scheduled;
      fightsService.setFight(fight);
    });

    it('should pause timer again when it is running', () => {
      expect(fightsService.pauseTimer(mockFight.id, Date.now())).toBe(
        ResponseStatus.OK,
      );
      expect(fight.state).toBe(FightState.Paused);
      expect(fight.timer.timeoutSet()).toBeFalsy();
    });

    it('should pause timer again when it is running after fight time has already passed', () => {
      fight.timer.endTimer();
      expect(fightsService.pauseTimer(mockFight.id, Date.now())).toBe(
        ResponseStatus.OK,
      );
      expect(fight.state).toBe(FightState.Paused);
    });

    it('should return bad request when trying to pause fight in paused state', () => {
      fightsService.pauseTimer(mockFight.id, Date.now());
      expect(fightsService.pauseTimer(mockFight.id, Date.now())).toBe(
        ResponseStatus.BadRequest,
      );
    });
  });

  describe('handling events', () => {
    jest.useFakeTimers();
    let events: Event[];
    const redPlayerPoints = 2;
    const bluePlayerPoints = 1;
    let fight;

    beforeAll(() => {
      fight = fightsService.getFight(mockFight.id);
      events = [
        { id: 'a', playerColor: 'red' },
        { id: 'b', playerColor: 'blue' },
        { id: 'a', playerColor: 'red' },
      ];
    });

    describe('newEvents', () => {
      it('should not add events for random fight', () => {
        expect(
          fightsService.newEvents(
            'test 123',
            events,
            redPlayerPoints,
            bluePlayerPoints,
          ),
        ).toBe(ResponseStatus.NotFound);

        const fight = fightsService.getFight(mockFight.id);

        expect(fight.redPlayer.points).toBe(0);
        expect(fight.bluePlayer.points).toBe(0);
        expect(fight.eventsHistory).toStrictEqual([]);
      });

      it('should not add events for scheduled fight', () => {
        expect(
          fightsService.newEvents(
            mockFight.id,
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
          fightsService.newEvents(mockFight.id, events, -1, bluePlayerPoints),
        ).toBe(ResponseStatus.BadRequest);

        expect(fight.redPlayer.points).toBe(0);
        expect(fight.bluePlayer.points).toBe(0);
        expect(fight.eventsHistory).toStrictEqual([]);
      });

      it('should not add events for finished fight', () => {
        fight.state = FightState.Finished;
        expect(
          fightsService.newEvents(
            mockFight.id,
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
          fightsService.newEvents(
            mockFight.id,
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
        fight.state = FightState.Paused;
        expect(
          fightsService.newEvents(
            mockFight.id,
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
          fightsService.eventsCanBeSuggested(
            'test 123',
            redPlayerPoints,
            bluePlayerPoints,
          ),
        ).toBe(ResponseStatus.NotFound);
      });

      it('should return BadRequest for events suggestion with negative number of points', () => {
        expect(
          fightsService.eventsCanBeSuggested(
            mockFight.id,
            -1,
            bluePlayerPoints,
          ),
        ).toBe(ResponseStatus.BadRequest);
      });

      it('should return OK for correct events suggestion and fight in progress', () => {
        fight.state = FightState.Running;

        expect(
          fightsService.eventsCanBeSuggested(
            mockFight.id,
            redPlayerPoints,
            bluePlayerPoints,
          ),
        ).toBe(ResponseStatus.OK);
      });

      it('should return BadRequest for correct events suggestion and fight scheduled', () => {
        fight.state = FightState.Scheduled;

        expect(
          fightsService.eventsCanBeSuggested(
            mockFight.id,
            redPlayerPoints,
            bluePlayerPoints,
          ),
        ).toBe(ResponseStatus.BadRequest);
      });

      it('should return BadRequest for correct events suggestion and fight that has already ended', () => {
        fight.state = FightState.Finished;

        expect(
          fightsService.eventsCanBeSuggested(
            mockFight.id,
            redPlayerPoints,
            bluePlayerPoints,
          ),
        ).toBe(ResponseStatus.BadRequest);
      });
    });
  });
});
