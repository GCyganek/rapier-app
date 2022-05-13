import { Event } from '../interfaces/event.interface';
import {
  Fight,
  FightEndConditionName,
  FightState,
  JudgeState,
  PlayerState,
} from '../interfaces/fight.interface';
import { Timer } from './timer.class';
import { Socket } from 'socket.io';
import { FightEndConditionFulfilledObserver } from '../interfaces/observers/fight-end-condition-fulfilled-observer.interface';
import { FightEndConditionFulfilledPublisher } from '../interfaces/publishers/fight-end-condition-fulfilled-publisher.interface';
import { assert } from 'console';
import { JudgeRole } from '../interfaces/join-response.interface';

export class FightImpl
  implements
    Fight,
    FightEndConditionFulfilledObserver,
    FightEndConditionFulfilledPublisher
{
  state: FightState;
  timer?: Timer;
  mainJudge: JudgeState;
  redJudge: JudgeState;
  blueJudge: JudgeState;
  redPlayer: PlayerState;
  bluePlayer: PlayerState;
  eventsHistory: Event[];

  private fightEndAlreadyNotified;
  readonly fightEndConditionFulfilledObservers: FightEndConditionFulfilledObserver[];

  constructor(
    readonly id: string,
    readonly mainJudgeId: string,
    readonly redJudgeId: string,
    readonly blueJudgeId: string,
    readonly redPlayerId: string,
    readonly bluePlayerId: string,
    readonly endConditions: Map<FightEndConditionName, number>,
  ) {
    this.id = id;
    this.state = FightState.Scheduled;
    this.mainJudge = { id: mainJudgeId, socket: null };
    this.redJudge = { id: redJudgeId, socket: null };
    this.blueJudge = { id: blueJudgeId, socket: null };
    this.redPlayer = { id: redPlayerId, points: 0 };
    this.bluePlayer = { id: bluePlayerId, points: 0 };
    this.eventsHistory = [];

    const timeConditionValue = this.endConditions.get(
      FightEndConditionName.TimeEnded,
    );
    if (timeConditionValue) {
      this.timer = new Timer(timeConditionValue, this);
      this.timer.addFightEndConditionFulfilledObserver(this);
    }

    this.fightEndAlreadyNotified = false;
    this.fightEndConditionFulfilledObservers = [];
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

  isJudge(judgeId: string): boolean {
    return [this.mainJudge.id, this.redJudge.id, this.blueJudge.id].includes(
      judgeId,
    );
  }

  isMainJudge(judgeId: string): boolean {
    return this.mainJudge.id == judgeId;
  }

  getJudgeRole(judgeId: string): JudgeRole {
    if (this.mainJudge.id == judgeId) return JudgeRole.MainJudge;
    else if (this.redJudge.id == judgeId) return JudgeRole.RedJudge;
    else if (this.blueJudge.id == judgeId) return JudgeRole.BlueJudge;
    else return undefined;
  }

  inProgress(): boolean {
    return [FightState.Running, FightState.Paused].includes(this.state);
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
    const pointsConditionValue = this.endConditions.get(
      FightEndConditionName.EnoughPoints,
    );

    if (!pointsConditionValue) return;
    if (
      this.redPlayer.points >= pointsConditionValue ||
      this.bluePlayer.points >= pointsConditionValue
    ) {
      this.notifyFightEndConditionFulfilled(FightEndConditionName.EnoughPoints);
    }
  }

  addFightEndConditionFulfilledObserver(
    observer: FightEndConditionFulfilledObserver,
  ): void {
    if (this.endConditions.size === 0) return;
    const observerIndex = this.fightEndConditionFulfilledObservers.findIndex(
      (obs) => JSON.stringify(obs) == JSON.stringify(observer),
    );

    if (observerIndex != -1) return;

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
