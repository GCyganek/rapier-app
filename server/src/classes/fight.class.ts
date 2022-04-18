import { Event } from '../interfaces/event.interface';
import {
  FightEndCondition,
  FightEndConditionName,
} from '../interfaces/fight-end-condition.interface';
import {
  FightState,
  Fight,
  JudgeState,
  PlayerState,
} from '../interfaces/fight.interface';
import { Timer } from './timer.class';
import { Socket } from 'socket.io';
import { FightEndConditionFulfilledObserver } from '../interfaces/observers/fight-end-condition-fulfilled-observer.interface';
import { FightEndConditionFulfilledPublisher } from '../interfaces/publishers/fight-end-condition-fulfilled-publisher.interface';
import { assert } from 'console';

export class FightImpl
  implements
    Fight,
    FightEndConditionFulfilledObserver,
    FightEndConditionFulfilledPublisher
{
  state: FightState;
  eventsHistory: Event[];
  timer?: Timer;
  private fightEndAlreadyNotified = false;
  public readonly fightEndConditionFulfilledObservers: FightEndConditionFulfilledObserver[] =
    [];

  constructor(
    readonly id: string,
    state: FightState,
    readonly mainJudge: JudgeState,
    readonly redJudge: JudgeState,
    readonly blueJudge: JudgeState,
    readonly redPlayer: PlayerState,
    readonly bluePlayer: PlayerState,
    readonly endConditions: Set<FightEndCondition>,
    eventsHistory: Event[],
  ) {
    this.state = state;
    this.eventsHistory = eventsHistory;
    const timeCondition: FightEndCondition = this.getConditionWithName(
      FightEndConditionName.TimeEnded,
    );
    if (timeCondition) {
      this.timer = new Timer(timeCondition.value, this);
      this.timer.addFightEndConditionFulfilledObserver(this);
    }
  }

  getConditionWithName(
    conditionName: FightEndConditionName,
  ): FightEndCondition {
    for (const condition of this.endConditions) {
      if (condition.name === conditionName) {
        return condition;
      }
    }
    return null;
  }

  judgeSocketAlreadyAssigned(judgeId: string, socket: Socket): boolean {
    return (
      (judgeId == this.mainJudge.id &&
        this.mainJudge.socket != null &&
        this.mainJudge.socket != socket) ||
      (judgeId == this.redJudge.id &&
        this.redJudge.socket != null &&
        this.redJudge.socket != socket) ||
      (judgeId == this.blueJudge.id &&
        this.blueJudge.socket != null &&
        this.blueJudge.socket != socket)
    );
  }

  allJudgesAssigned(): boolean {
    return (
      this.mainJudge.socket != null &&
      this.redJudge.socket != null &&
      this.blueJudge.socket != null
    );
  }

  startFight(): boolean {
    if (this.timer) {
      if (this.timer.resumeTimer()) {
        this.state = FightState.Running;
        return true;
      }
      return false;
    }
    this.state = FightState.Running;
    return true;
  }

  finishFight(): void {
    if (this.timer) {
      this.timer.endTimer();
    }

    this.state = FightState.Finished;
  }

  resumeFight(): boolean {
    if (this.timer) {
      if (this.timer.hasTimeEnded() || this.timer.resumeTimer()) {
        this.state = FightState.Running;
        return true;
      }
      return false;
    }
    this.state = FightState.Running;
    return true;
  }

  pauseFight(exactPauseTimeInMillis: number): boolean {
    if (this.timer) {
      if (
        this.timer.hasTimeEnded() ||
        this.timer.pauseTimer(exactPauseTimeInMillis)
      ) {
        this.state = FightState.Paused;
        return true;
      }
      return false;
    }
    this.state = FightState.Paused;
    return true;
  }

  addNewEvents(
    events: Event[],
    redPlayerPoints: number,
    bluePlayerPoints: number,
  ): boolean {
    if (redPlayerPoints < 0 || bluePlayerPoints < 0) {
      return false;
    }

    this.redPlayer.points += redPlayerPoints;
    this.bluePlayer.points += bluePlayerPoints;
    this.eventsHistory = this.eventsHistory.concat(events);
    return true;
  }

  checkIfEnoughPointsToEndFight(): void {
    if (this.fightEndAlreadyNotified) return;
    const pointsCondition = this.getConditionWithName(
      FightEndConditionName.EnoughPoints,
    );
    if (!pointsCondition) return;
    if (
      this.redPlayer.points >= pointsCondition.value ||
      this.bluePlayer.points >= pointsCondition.value
    ) {
      this.notifyFightEndConditionFulfilled(FightEndConditionName.EnoughPoints);
    }
  }

  addFightEndConditionFulfilledObserver(
    observer: FightEndConditionFulfilledObserver,
  ): void {
    if (this.endConditions.size === 0) return;
    const obsToRemoveIndex = this.fightEndConditionFulfilledObservers.findIndex(
      (obs) => JSON.stringify(obs) == JSON.stringify(observer),
    );

    if (obsToRemoveIndex != -1) return;

    this.fightEndConditionFulfilledObservers.push(observer);
  }

  removeFightEndConditionFulfilledObserver(
    observer: FightEndConditionFulfilledObserver,
  ): void {
    const obsToRemoveIndex = this.fightEndConditionFulfilledObservers.findIndex(
      (obs) => JSON.stringify(obs) == JSON.stringify(observer),
    );

    if (obsToRemoveIndex == -1) return;

    this.fightEndConditionFulfilledObservers.splice(obsToRemoveIndex, 1);
  }

  notifyFightEndConditionFulfilled(condition: FightEndConditionName): void {
    for (const observer of this.fightEndConditionFulfilledObservers) {
      observer.fightEndConditionFulfilled(condition, this);
    }

    this.fightEndAlreadyNotified = true;
  }

  fightEndConditionFulfilled(
    conditionName: FightEndConditionName,
    fight: FightImpl,
  ): void {
    assert(fight.id === this.id);
    this.notifyFightEndConditionFulfilled(conditionName);
  }
}
