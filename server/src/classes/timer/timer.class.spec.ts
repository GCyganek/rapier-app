import { Timer } from './timer.class';

describe('Timer', () => {
  let timer: Timer;

  beforeEach(() => {
    timer = new Timer(1);
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
});
