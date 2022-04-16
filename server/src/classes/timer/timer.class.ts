import { FightTimeEndedObserver } from 'src/interfaces/observers/fight-time-ended-observer.interface';
import { FightTimeEndedPublisher } from 'src/interfaces/publishers/fight-time-ended-publisher.interface';
import { TimerConstants } from './timer-constants.class';

export class Timer implements FightTimeEndedPublisher {
  private timeoutId: NodeJS.Timeout = null;
  private remainingMillis: number;
  private lastTimerStart: number;
  private timeEnded = false;
  public readonly endTimeObservers: FightTimeEndedObserver[] = [];

  constructor(public readonly timeInMinutes: number, public readonly fightId: string) {
    this.remainingMillis =
      timeInMinutes * TimerConstants.MILLISECONDS_IN_MINUTE;
  }

  resumeTimer(): boolean {
    if (this.timeoutId || this.timeEnded) return false;

    this.lastTimerStart = Date.now();
    this.timeoutId = setTimeout(this.notifyTimeEnded, this.remainingMillis);
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

  notifyTimeEnded(): void {
    this.timeEnded = true;

    for (const observer of this.endTimeObservers) {
      observer.fightTimeEnded(this.fightId);
    }
  }

  addFightTimeEndedObserver(observer: FightTimeEndedObserver): void {
    let obsToRemoveIndex = this.endTimeObservers.findIndex(obs => JSON.stringify(obs) == JSON.stringify(observer));

    if (obsToRemoveIndex != -1) return;

    this.endTimeObservers.push(observer);
  }
  
  removeFightTimeEndedObserver(observer: FightTimeEndedObserver): void {
    let obsToRemoveIndex = this.endTimeObservers.findIndex(obs => JSON.stringify(obs) == JSON.stringify(observer));

    if (obsToRemoveIndex == -1) return;

    this.endTimeObservers.splice(obsToRemoveIndex, 1);
  }
}
