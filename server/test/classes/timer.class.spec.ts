import { FightImpl } from '../../src/classes/fight.class';
import { Timer } from '../../src/classes/timer.class';
import {
  FightEndCondition,
  FightEndConditionName,
} from '../../src/interfaces/fight-end-condition.interface';
import { FightState } from '../../src/interfaces/fight.interface';
import { FightEndConditionFulfilledObserver } from '../../src/interfaces/observers/fight-end-condition-fulfilled-observer.interface';

describe('Timer', () => {
  const fight = new FightImpl(
    'mockup',
    FightState.Scheduled,
    { id: 'main', socket: null },
    { id: 'red', socket: null },
    { id: 'blue', socket: null },
    { id: 'player1', points: 0 },
    { id: 'player2', points: 0 },
    new Set<FightEndCondition>([
      { name: FightEndConditionName.TimeEnded, value: 1 },
    ]),
    [],
  );
  let timer: Timer;

  beforeEach(() => {
    timer = new Timer(1, fight);
  });

  afterEach(() => {
    timer.endTimer();
  });

  describe('resumeTimer', () => {
    it('should start running when it was not already started', () => {
      expect(timer.resumeTimer()).toBeTruthy();
      expect(timer.timeoutSet()).toBeTruthy();
    });

    it('should return false after trying to resume timer if it is already running', () => {
      timer.resumeTimer();
      expect(timer.resumeTimer()).toBeFalsy();
      expect(timer.timeoutSet()).toBeTruthy();
    });

    it('should not resume if time has already ended', () => {
      timer.endTimer();
      expect(timer.resumeTimer()).toBeFalsy();
      expect(timer.timeoutSet()).toBeFalsy();
    });
  });

  describe('pauseTimer', () => {
    it('should pause timer when it is running and time has not ended yet', () => {
      timer.resumeTimer();
      expect(timer.timeoutSet()).toBeTruthy();
      expect(timer.pauseTimer(Date.now())).toBeTruthy();
      expect(timer.timeoutSet()).toBeFalsy();
    });

    it('should return false after trying to pause timer if it is already paused', () => {
      timer.pauseTimer(Date.now());
      expect(timer.pauseTimer(Date.now())).toBeFalsy();
      expect(timer.timeoutSet()).toBeFalsy();
    });

    it('should not pause if time has already ended', () => {
      timer.endTimer();
      expect(timer.pauseTimer(Date.now())).toBeFalsy();
      expect(timer.timeoutSet()).toBeFalsy();
    });
  });

  describe('endTimer', () => {
    it('should end timer when it is running', () => {
      timer.resumeTimer();
      expect(timer.timeoutSet()).toBeTruthy();
      expect(timer.hasTimeEnded()).toBeFalsy();
      timer.endTimer();
      expect(timer.timeoutSet()).toBeFalsy();
      expect(timer.hasTimeEnded()).toBeTruthy();
    });

    it('should end timer when it is paused', () => {
      expect(timer.timeoutSet()).toBeFalsy();
      expect(timer.hasTimeEnded()).toBeFalsy();
      timer.endTimer();
      expect(timer.timeoutSet()).toBeFalsy();
      expect(timer.hasTimeEnded()).toBeTruthy();
    });
  });

  class MockFightTimeEndedObserver
    implements FightEndConditionFulfilledObserver
  {
    fightEndConditionFulfilled(
      conditionName: FightEndConditionName,
      fightReceived: FightImpl,
    ): void {
      expect(conditionName).toBe(FightEndConditionName.TimeEnded);
      expect(fightReceived).toBe(fight);
      return;
    }
  }

  const mockFightTimeEndedObserver = new MockFightTimeEndedObserver();

  describe('addFightEndConditionFulfilledObserver', () => {
    it('should add observer to an empty observers list', () => {
      timer.addFightEndConditionFulfilledObserver(mockFightTimeEndedObserver);
      expect(timer.endTimeObservers.length).toBe(1);
    });

    it('should not add the same observer twice', () => {
      timer.addFightEndConditionFulfilledObserver(mockFightTimeEndedObserver);
      timer.addFightEndConditionFulfilledObserver(mockFightTimeEndedObserver);
      expect(timer.endTimeObservers.length).toBe(1);
    });
  });

  describe('removeFightTimeEndedObserver', () => {
    it('should remove observer from observers list', () => {
      timer.addFightEndConditionFulfilledObserver(mockFightTimeEndedObserver);
      expect(timer.endTimeObservers.length).toBe(1);
      timer.removeFightEndConditionFulfilledObserver(
        mockFightTimeEndedObserver,
      );
      expect(timer.endTimeObservers.length).toBe(0);
    });
  });

  describe('notifyTimeEnded', () => {
    it('should notify observer when time ends', () => {
      const spy = jest.spyOn(
        mockFightTimeEndedObserver,
        'fightEndConditionFulfilled',
      );
      timer.addFightEndConditionFulfilledObserver(mockFightTimeEndedObserver);
      timer.endTimer();
      timer.notifyTimeEnded();
      expect(spy).toBeCalledTimes(1);
    });
  });
});
