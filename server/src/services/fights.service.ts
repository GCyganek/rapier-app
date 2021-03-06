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
import { FightData } from '../interfaces/fight-data.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FightDocument, MongoFight } from '../schemas/fight.schema';
import { customAlphabet } from 'nanoid';
import 'dotenv/config';

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
    return this.fightModel.create(fight);
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

  generateJudgeIds(nanoid: () => string, n = 3): string[] {
    const judgeIds = [];

    for (let i = 0; i < n; i++) {
      let new_id;
      do {
        new_id = nanoid();
      } while (judgeIds.includes(new_id));
      judgeIds.push(new_id);
    }

    return judgeIds;
  }

  async generateFightId(nanoid: () => string): Promise<string> {
    let new_id;
    do {
      new_id = nanoid();
    } while (
      this.getFight(new_id) !== undefined ||
      (await this.getFightFromDb(new_id)) !== null
    );

    return new_id;
  }

  async newFightFromData(fightData: FightData): Promise<FightImpl> {
    const endConditions = new Map<FightEndConditionName, number>();
    fightData.endConditions.forEach((condition) =>
      endConditions.set(condition.name, condition.value),
    );

    const nanoid = customAlphabet('0123456789', 7);
    const judgeIds = this.generateJudgeIds(nanoid);

    const fight = new FightImpl(
      await this.generateFightId(nanoid),
      judgeIds[0],
      judgeIds[1],
      judgeIds[2],
      fightData.redPlayerId,
      fightData.bluePlayerId,
      endConditions,
    );

    if (await this.newFight(fight)) {
      return fight;
    } else {
      return undefined;
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

      if (['test', 'prod'].includes(process.env.NODE_ENV)) {
        if (fightData.state === FightState.Finished) {
          return ResponseStatus.FightFinished;
        }
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

  startFight(fightId: string, timeInMillis: number): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (fight.allJudgesAssigned() === false) {
      return ResponseStatus.NotReady;
    } else if (fight.state != FightState.Scheduled) {
      return ResponseStatus.BadRequest;
    }

    if (fight.startFight(timeInMillis)) {
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
          eventsHistory: fight.eventsHistory as any,
          startedAt: fight.startedAt,
          finishedAt: fight.finishedAt,
          fightDuration: fight.duration,
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

  resumeTimer(fightId: string, timeInMillis: number): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (fight.state != FightState.Paused) {
      return ResponseStatus.BadRequest;
    }

    if (fight.resumeFight(timeInMillis)) {
      return ResponseStatus.OK;
    }
    return ResponseStatus.BadRequest;
  }

  pauseTimer(fightId: string, timeInMillis: number): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (fight.state != FightState.Running) {
      return ResponseStatus.BadRequest;
    }

    if (fight.pauseFight(timeInMillis)) {
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
