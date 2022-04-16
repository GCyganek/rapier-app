import exp from 'constants';
import { FightTimeEndedObserver } from 'src/interfaces/observers/fight-time-ended-observer.interface';
import { Timer } from '../../../src/classes/timer/timer.class';

describe('Timer', () => {
  let timer: Timer;

  beforeEach(() => {
    timer = new Timer(1, 'id');
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

  class MockFightTimeEndedObserver implements FightTimeEndedObserver {
    fightTimeEnded(fightId: string): void {
      return;
    }
  }

  const mockFightTimeEndedObserver = new MockFightTimeEndedObserver();

  describe('addFightTimeEndedObserver', () => {
    it('should add observer to an empty observers list', () => {
      timer.addFightTimeEndedObserver(mockFightTimeEndedObserver);
      expect(timer.endTimeObservers.length).toBe(1);
    });

    it('should not add the same observer twice', () => {
      timer.addFightTimeEndedObserver(mockFightTimeEndedObserver);
      timer.addFightTimeEndedObserver(mockFightTimeEndedObserver);
      expect(timer.endTimeObservers.length).toBe(1);
    });
  });

  describe('removeFightTimeEndedObserver', () => {
    it('should remove observer from observers list', () => {
      timer.addFightTimeEndedObserver(mockFightTimeEndedObserver);
      expect(timer.endTimeObservers.length).toBe(1);
      timer.removeFightTimeEndedObserver(mockFightTimeEndedObserver);
      expect(timer.endTimeObservers.length).toBe(0);
    });
  });

  describe('notifyTimeEnded', () => {
    it('should notify observer when time ends', () => {
      const spy = jest.spyOn(mockFightTimeEndedObserver, 'fightTimeEnded');
      timer.addFightTimeEndedObserver(mockFightTimeEndedObserver);
      timer.endTimer();
      timer.notifyTimeEnded();
      expect(spy).toBeCalledTimes(1);
    });
  });
});
