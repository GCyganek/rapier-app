import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import {
  FightEndConditionName,
  FightState,
} from '../interfaces/fight.interface';
import { ResponseStatus } from '../interfaces/response.interface';
import { Event } from '../interfaces/event.interface';
import { FightEndConditionFulfilledObserver } from '../interfaces/observers/fight-end-condition-fulfilled-observer.interface';
import { FightImpl } from '../classes/fight.class';

@Injectable()
export class FightsService {
  private readonly fights: Map<string, FightImpl> = new Map<
    string,
    FightImpl
  >();
  private fightEndConditionFulfilledObserver: FightEndConditionFulfilledObserver;

  constructor() {
    const fight = new FightImpl(
      'mockup',
      'main',
      'red',
      'blue',
      'player1',
      'player2',
      new Map<FightEndConditionName, number>([
        [FightEndConditionName.EnoughPoints, 5],
        [FightEndConditionName.TimeEnded, 1],
      ]),
    );
    this.newFight(fight);
  }

  setFightEndConditionFulfilledObserver(
    observer: FightEndConditionFulfilledObserver,
  ) {
    this.fightEndConditionFulfilledObserver = observer;
  }

  newFight(fight: FightImpl) {
    this.fights.set(fight.id, fight);
    if (this.fightEndConditionFulfilledObserver) {
      fight.addFightEndConditionFulfilledObserver(
        this.fightEndConditionFulfilledObserver,
      );
    }
  }

  getFight(id: string): FightImpl {
    return this.fights.get(id);
  }

  isJudge(fightId: string, judgeId: string): boolean {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return false;
    }

    return fight.isJudge(judgeId);
  }

  isMainJudge(fightId: string, judgeId: string): boolean {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return false;
    }

    return fight.isMainJudge(judgeId);
  }

  addJudge(fightId: string, judgeId: string, socket: Socket): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (fight.judgeSocketAlreadyAssigned(judgeId, socket)) {
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
    } else if (fight.allJudgesAssigned() === false) {
      return ResponseStatus.NotReady;
    } else if (fight.state != FightState.Scheduled) {
      return ResponseStatus.BadRequest;
    }

    if (fight.startFight()) {
      return ResponseStatus.OK;
    }
    return ResponseStatus.BadRequest;
  }

  finishFight(fightId: string): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (!fight.inProgress()) {
      return ResponseStatus.BadRequest;
    }

    fight.finishFight();
    return ResponseStatus.OK;
  }

  resumeTimer(fightId: string): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (fight.state != FightState.Paused) {
      return ResponseStatus.BadRequest;
    }

    if (fight.resumeFight()) {
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

    if (fight.pauseFight(exactPauseTimeInMillis)) {
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
    } else if (!fight.inProgress()) {
      return ResponseStatus.BadRequest;
    }

    if (fight.addNewEvents(events, redPlayerPoints, bluePlayerPoints)) {
      return ResponseStatus.OK;
    }
    return ResponseStatus.BadRequest;
  }

  eventsCanBeSuggested(
    fightId: string,
    redPlayerPoints: number,
    bluePlayerPoints: number,
  ): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (
      !fight.inProgress() ||
      redPlayerPoints < 0 ||
      bluePlayerPoints < 0
    ) {
      return ResponseStatus.BadRequest;
    }

    return ResponseStatus.OK;
  }
}
