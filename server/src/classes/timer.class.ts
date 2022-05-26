import { FightEndConditionName } from '../interfaces/fight.interface';
import { FightEndConditionFulfilledObserver } from '../interfaces/observers/fight-end-condition-fulfilled-observer.interface';
import { FightEndConditionFulfilledPublisher } from '../interfaces/publishers/fight-end-condition-fulfilled-publisher.interface';
import { FightImpl } from './fight.class';

export class Timer implements FightEndConditionFulfilledPublisher {
  private timeoutId: NodeJS.Timeout = null;
  private remainingMillis: number;
  private lastTimerStart: number;
  private timeEnded = false;
  public readonly endTimeObservers: FightEndConditionFulfilledObserver[] = [];
  public static readonly MILLISECONDS_IN_MINUTE = 60000;

  constructor(
    public readonly timeInMinutes: number,
    public readonly fight: FightImpl,
  ) {
    this.remainingMillis = timeInMinutes * Timer.MILLISECONDS_IN_MINUTE;
  }

  resumeTimer(exactTimeInMillis: number): boolean {
    if (this.timeoutId || this.timeEnded) return false;

    this.lastTimerStart = exactTimeInMillis;
    this.timeoutId = setTimeout(
      this.notifyTimeEnded.bind(this),
      this.remainingMillis,
    );
    return true;
  }

  pauseTimer(exactTimeInMillis: number): boolean {
    if (this.timeoutId == null || this.timeEnded) return false;

    clearTimeout(this.timeoutId);
    this.timeoutId = null;
    this.remainingMillis -= exactTimeInMillis - this.lastTimerStart;
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

    this.notifyFightEndConditionFulfilled(FightEndConditionName.TimeEnded);
  }

  notifyFightEndConditionFulfilled(conditionName: FightEndConditionName): void {
    this.timeEnded = true;

    for (const observer of this.endTimeObservers) {
      observer.fightEndConditionFulfilled(conditionName, this.fight);
    }
  }

  addFightEndConditionFulfilledObserver(
    observer: FightEndConditionFulfilledObserver,
  ): void {
    const observerIndex = this.endTimeObservers.findIndex(
      (obs) => JSON.stringify(obs) == JSON.stringify(observer),
    );

    if (observerIndex != -1) return;

    this.endTimeObservers.push(observer);
  }

  removeFightEndConditionFulfilledObserver(
    observer: FightEndConditionFulfilledObserver,
  ): void {
    const obsToRemoveIndex = this.endTimeObservers.findIndex(
      (obs) => JSON.stringify(obs) == JSON.stringify(observer),
    );

    if (obsToRemoveIndex == -1) return;

    this.endTimeObservers.splice(obsToRemoveIndex, 1);
  }
}
