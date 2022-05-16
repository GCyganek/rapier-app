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
import { FightDataInterface } from '../interfaces/fight-data.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FightDocument, MongoFight } from '../schemas/fight.schema';

@Injectable()
export class FightsService {
  private readonly fights: Map<string, FightImpl> = new Map<
    string,
    FightImpl
  >();
  private fightEndConditionFulfilledObserver: FightEndConditionFulfilledObserver;

  constructor(
    @InjectModel(MongoFight.name) private fightModel: Model<FightDocument>,
  ) {}

  async getFightFromDb(id: string): Promise<MongoFight> {
    return this.fightModel.findOne({ id: id }, { _id: false }).exec();
  }

  setFightEndConditionFulfilledObserver(
    observer: FightEndConditionFulfilledObserver,
  ) {
    this.fightEndConditionFulfilledObserver = observer;
  }

  async addNewFightToDb(fight: FightImpl): Promise<MongoFight> {
    const createdFight = this.fightModel.create(fight);
    return createdFight;
  }

  async newFight(fight: FightImpl): Promise<boolean> {
    if ((await this.getFightFromDb(fight.id)) !== null) {
      return false;
    }

    try {
      await this.addNewFightToDb(fight);
    } catch (error) {
      return false;
    }
    return true;
  }

  async newFightFromData(fightData: FightDataInterface): Promise<boolean> {
    const endConditions = new Map<FightEndConditionName, number>();
    fightData.endConditions.forEach((condition) =>
      endConditions.set(condition.name, condition.value),
    );

    const fight = new FightImpl(
      fightData.id,
      fightData.mainJudgeId,
      fightData.redJudgeId,
      fightData.blueJudgeId,
      fightData.redPlayerId,
      fightData.bluePlayerId,
      endConditions,
    );

    return await this.newFight(fight);
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

  setEndConditionFulfilledObserverToFight(fight: FightImpl) {
    if (this.fightEndConditionFulfilledObserver) {
      fight.addFightEndConditionFulfilledObserver(
        this.fightEndConditionFulfilledObserver,
      );
    }
  }

  convertFightDataToFight(fightData: MongoFight) {
    const fight = new FightImpl(
      fightData.id,
      fightData.mainJudgeId,
      fightData.redJudgeId,
      fightData.blueJudgeId,
      fightData.redPlayer.id,
      fightData.bluePlayer.id,
      fightData.endConditions,
    );

    this.fights.set(fight.id, fight);

    this.setEndConditionFulfilledObserverToFight(fight);

    return fight;
  }

  async addJudge(
    fightId: string,
    judgeId: string,
    socket: Socket,
  ): Promise<ResponseStatus> {
    let fight = this.fights.get(fightId);

    if (fight === null || fight === undefined) {
      const fightData = await this.getFightFromDb(fightId);

      if (fightData === null) {
        return ResponseStatus.NotFound;
      }

      fight = this.convertFightDataToFight(fightData);
    }

    if (fight === null || fight === undefined) {
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

  async updateFight(fight: FightImpl) {
    return this.fightModel
      .updateOne(
        { id: fight.id },
        {
          state: fight.state,
          redPlayer: fight.redPlayer,
          bluePlayer: fight.bluePlayer,
          eventsHistory: fight.eventsHistory as any, // 'as any' just for now
        },
      )
      .exec();
  }

  async finishFight(fightId: string): Promise<ResponseStatus> {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (!fight.inProgress()) {
      return ResponseStatus.BadRequest;
    }

    fight.finishFight();

    try {
      await this.updateFight(fight);
    } catch (error) {
      return ResponseStatus.InternalServerError;
    } finally {
      this.fights.delete(fightId);
    }

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

  clearFights() {
    this.fights.clear();
  }

  setFight(fight: FightImpl) {
    if (this.fights.get(fight.id) === undefined) {
      this.fights.set(fight.id, fight);
    }
  }
}
