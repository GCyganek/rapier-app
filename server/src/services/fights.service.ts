import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Timer } from '../classes/timer/timer.class';
import { Fight, FightState } from '../interfaces/fight.interface';
import { ResponseStatus } from '../interfaces/response.interface';
import { Event } from '../interfaces/event.interface';
import { FightTimeEndedObserver } from 'src/interfaces/observers/fight-time-ended-observer.interface';
import { FightEndConditionFulfilledPublisher } from '../interfaces/publishers/fight-end-condition-fulfilled-publisher.interface';
import { FightEndConditionFulfilledObserver } from '../interfaces/observers/fight-end-condition-fulfilled-observer.interface';
import { FightEndCondition } from '../interfaces/fight-end-condition-fulfilled-response.interface';

@Injectable()
export class FightsService implements FightTimeEndedObserver, FightEndConditionFulfilledPublisher {
  private readonly fights: Map<string, Fight> = new Map<string, Fight>();
  public readonly fightEndConditionFulfilledObservers: FightEndConditionFulfilledObserver[] = [];

  constructor() {
    let fightId = 'mockup';
    
    const fight: Fight = {
      id: fightId,
      state: FightState.Scheduled,
      timer: new Timer(1, fightId),

      mainJudge: {
        id: 'main',
        socket: null,
      },
      redJudge: {
        id: 'red',
        socket: null,
      },
      blueJudge: {
        id: 'blue',
        socket: null,
      },

      redPlayer: {
        id: 'player1',
        points: 0,
      },
      bluePlayer: {
        id: 'player2',
        points: 0,
      },

      pointsToEndFight: 5,

      eventsHistory: [],
    };
    this.newFight(fight);
  }

  newFight(fight: Fight) {
    this.fights.set(fight.id, fight);
    fight.timer.addFightTimeEndedObserver(this);
  }

  getFight(id: string): Fight {
    return this.fights.get(id);
  }

  isJudge(fightId: string, judgeId: string): boolean {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return false;
    }

    return [fight.mainJudge.id, fight.redJudge.id, fight.blueJudge.id].includes(
      judgeId,
    );
  }

  isMainJudge(fightId: string, judgeId: string): boolean {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return false;
    }

    return judgeId == fight.mainJudge.id;
  }

  addJudge(fightId: string, judgeId: string, socket: Socket): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (
      (judgeId == fight.mainJudge.id &&
        fight.mainJudge.socket != null &&
        fight.mainJudge.socket != socket) ||
      (judgeId == fight.redJudge.id &&
        fight.redJudge.socket != null &&
        fight.redJudge.socket != socket) ||
      (judgeId == fight.blueJudge.id &&
        fight.blueJudge.socket != null &&
        fight.blueJudge.socket != socket)
    ) {
      return ResponseStatus.BadRequest;
    } else if (judgeId == fight.mainJudge.id) {
      fight.mainJudge.socket = socket;
    } else if (judgeId == fight.redJudge.id) {
      fight.redJudge.socket = socket;
    } else if (judgeId == fight.blueJudge.id) {
      fight.blueJudge.socket = socket;
    } else {
      return ResponseStatus.Unauthorized;
    }

    return ResponseStatus.OK;
  }

  startFight(fightId: string): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (
      fight.mainJudge.socket == null ||
      fight.redJudge.socket == null ||
      fight.blueJudge.socket == null
    ) {
      return ResponseStatus.NotReady;
    } else if (fight.state != FightState.Scheduled) {
      return ResponseStatus.BadRequest;
    }

    if (fight.timer.resumeTimer()) {
      fight.state = FightState.Running;
      return ResponseStatus.OK;
    }
    return ResponseStatus.BadRequest;
  }

  finishFight(fightId: string): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (![FightState.Running, FightState.Paused].includes(fight.state)) {
      return ResponseStatus.BadRequest;
    }

    fight.timer.endTimer();
    fight.state = FightState.Finished;
    return ResponseStatus.OK;
  }

  resumeTimer(fightId: string): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (fight.state != FightState.Paused) {
      return ResponseStatus.BadRequest;
    }

    if (fight.timer.hasTimeEnded() || fight.timer.resumeTimer()) {
      fight.state = FightState.Running;
      return ResponseStatus.OK;
    }
    return ResponseStatus.BadRequest;
  }

  pauseTimer(fightId: string, exactPauseTimeInMillis: number): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (fight.state != FightState.Running) {
      return ResponseStatus.BadRequest;
    }

    if (
      fight.timer.hasTimeEnded() ||
      fight.timer.pauseTimer(exactPauseTimeInMillis)
    ) {
      fight.state = FightState.Paused;
      return ResponseStatus.OK;
    }
    return ResponseStatus.BadRequest;
  }

  newEvents(
    fightId: string,
    events: Event[],
    redPlayerPoints: number,
    bluePlayerPoints: number,
  ): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (![FightState.Running, FightState.Paused].includes(fight.state)) {
      return ResponseStatus.BadRequest;
    }

    if (redPlayerPoints < 0 || bluePlayerPoints < 0) {
      return ResponseStatus.BadRequest;
    }

    fight.redPlayer.points += redPlayerPoints;
    fight.bluePlayer.points += bluePlayerPoints;
    fight.eventsHistory = fight.eventsHistory.concat(events);

    return ResponseStatus.OK;
  }

  checkIfEnoughPointsToEndFight(fight: Fight) {
    if (fight.redPlayer.points >= fight.pointsToEndFight || fight.bluePlayer.points >= fight.pointsToEndFight) {
      this.notifyFightEndConditionFulfilled(FightEndCondition.EnoughPoints, fight);
    }
  }

  addFightEndConditionFulfilledObserver(observer: FightEndConditionFulfilledObserver): void {
    let obsToRemoveIndex = this.fightEndConditionFulfilledObservers.findIndex(obs => JSON.stringify(obs) == JSON.stringify(observer));

    if (obsToRemoveIndex != -1) return;

    this.fightEndConditionFulfilledObservers.push(observer);
  }

  removeFightEndConditionFulfilledObserver(observer: FightEndConditionFulfilledObserver): void {
    let obsToRemoveIndex = this.fightEndConditionFulfilledObservers.findIndex(obs => JSON.stringify(obs) == JSON.stringify(observer));

    if (obsToRemoveIndex == -1) return;

    this.fightEndConditionFulfilledObservers.splice(obsToRemoveIndex, 1);
  }

  notifyFightEndConditionFulfilled(condition: FightEndCondition, fight: Fight): void {
    for (const observer of this.fightEndConditionFulfilledObservers) {
      observer.fightEndConditionFulfilled(condition, fight);
    }
  }

  fightTimeEnded(fightId: string): void {
    const fight = this.fights.get(fightId);

    if (fight == undefined) return;

    this.notifyFightEndConditionFulfilled(FightEndCondition.TimeEnded, fight);
  }
}
