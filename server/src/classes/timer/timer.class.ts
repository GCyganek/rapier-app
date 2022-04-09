import { TimerConstants } from './timer-constants.class';

export class Timer {
  private timeoutId: NodeJS.Timeout = null;
  private remainingMillis: number;
  private lastTimerStart: number;
  private timeEnded = false;

  constructor(public readonly timeInMinutes: number) {
    this.remainingMillis =
      timeInMinutes * TimerConstants.MILLISECONDS_IN_MINUTE;
  }

  resumeTimer(): boolean {
    if (this.timeoutId || this.timeEnded) return false;

    this.lastTimerStart = Date.now();
    this.timeoutId = setTimeout(this.notify, this.remainingMillis);
    return true;
  }

  pauseTimer(exactPauseTimeInMillis: number): boolean {
    if (this.timeoutId == null || this.timeEnded) return false;

    clearTimeout(this.timeoutId);
    this.timeoutId = null;
    this.remainingMillis -= exactPauseTimeInMillis - this.lastTimerStart;
    return true;
  }

  timeoutSet(): boolean {
    return this.timeoutId != null;
  }

  endTimer(): void {
    if (this.timeoutId != null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.timeEnded = true;
  }

  hasTimeEnded(): boolean {
    return this.timeEnded;
  }

  private notify(): void {
    this.timeEnded = true;
  }
}
