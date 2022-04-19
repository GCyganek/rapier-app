import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

import { Socket } from 'socket.io';
import { FightsService } from '../services/fights.service';
import { Response, ResponseStatus } from '../interfaces/response.interface';
import { PauseTimerResponse } from '../interfaces/pause-timer-response.interface';
import { Event } from '../interfaces/event.interface';
import { NewEventsResponse } from '../interfaces/new-events-response';
import { FightEndConditionFulfilledObserver } from '../interfaces/observers/fight-end-condition-fulfilled-observer.interface';
import { FightEndConditionFulfilledResponse } from '../interfaces/fight-end-condition-fulfilled-response.interface';
import { FightEndConditionName } from '../interfaces/fight.interface';
import { FightImpl } from '../classes/fight.class';

@WebSocketGateway()
export class JudgesGateway implements FightEndConditionFulfilledObserver {
  constructor(private fightsService: FightsService) {
    fightsService.setFightEndConditionFulfilledObserver(this);
  }

  sendToAllJudges(fight: FightImpl, event: string, response: any) {
    if (fight.mainJudge.socket != null) {
      fight.mainJudge.socket.emit(event, response);
    }
    if (fight.redJudge.socket != null) {
      fight.redJudge.socket.emit(event, response);
    }
    if (fight.blueJudge.socket != null) {
      fight.blueJudge.socket.emit(event, response);
    }
  }

  @SubscribeMessage('join')
  join(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const response: Response = {
      status: this.fightsService.addJudge(fightId, judgeId, client),
    };
    client.emit('join', response);
  }

  @SubscribeMessage('startFight')
  startFight(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.getFight(fightId)) {
      return client.emit('startFight', { status: ResponseStatus.NotFound });
    }

    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit('startFight', { status: ResponseStatus.Unauthorized });
    }

    const response: Response = {
      status: this.fightsService.startFight(fightId),
    };
    const fight = this.fightsService.getFight(fightId);

    if (response.status != ResponseStatus.OK) {
      return client.emit('startFight', response);
    }

    this.sendToAllJudges(fight, 'startFight', response);
  }

  @SubscribeMessage('finishFight')
  finishFight(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.getFight(fightId)) {
      return client.emit('finishFight', { status: ResponseStatus.NotFound });
    }

    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit('finishFight', {
        status: ResponseStatus.Unauthorized,
      });
    }

    const response: Response = {
      status: this.fightsService.finishFight(fightId),
    };
    const fight = this.fightsService.getFight(fightId);

    if (response.status != ResponseStatus.OK) {
      return client.emit('finishFight', response);
    }

    this.sendToAllJudges(fight, 'finishFight', response);
  }

  @SubscribeMessage('resumeTimer')
  resumeTimer(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.getFight(fightId)) {
      return client.emit('resumeTimer', { status: ResponseStatus.NotFound });
    }

    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit('resumeTimer', {
        status: ResponseStatus.Unauthorized,
      });
    }

    const response: Response = {
      status: this.fightsService.resumeTimer(fightId),
    };
    const fight = this.fightsService.getFight(fightId);

    if (response.status != ResponseStatus.OK) {
      return client.emit('resumeTimer', response);
    }

    this.sendToAllJudges(fight, 'resumeTimer', response);
  }

  @SubscribeMessage('pauseTimer')
  pauseTimer(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @MessageBody('exactPauseTimeInMillis') exactPauseTimeInMillis: number,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.getFight(fightId)) {
      return client.emit('pauseTimer', { status: ResponseStatus.NotFound });
    }

    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit('pauseTimer', { status: ResponseStatus.Unauthorized });
    }

    const response: PauseTimerResponse = {
      status: this.fightsService.pauseTimer(fightId, exactPauseTimeInMillis),
      exactPauseTimeInMillis: exactPauseTimeInMillis,
    };
    const fight = this.fightsService.getFight(fightId);

    if (response.status != ResponseStatus.OK) {
      return client.emit('pauseTimer', response);
    }

    this.sendToAllJudges(fight, 'pauseTimer', response);
  }

  @SubscribeMessage('newEvents')
  newEvents(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @MessageBody('events') events: Event[],
    @MessageBody('redPlayerPoints') redPlayerPoints: number,
    @MessageBody('bluePlayerPoints') bluePlayerPoints: number,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.getFight(fightId)) {
      return client.emit('newEvents', { status: ResponseStatus.NotFound });
    }

    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit('newEvents', { status: ResponseStatus.Unauthorized });
    }

    const status = this.fightsService.newEvents(
      fightId,
      events,
      redPlayerPoints,
      bluePlayerPoints,
    );
    const fight = this.fightsService.getFight(fightId);

    if (status != ResponseStatus.OK) {
      return client.emit('newEvents', { status: status });
    }

    const response: NewEventsResponse = {
      status: status,
      allEvents: events,
      redPlayer: fight.redPlayer,
      bluePlayer: fight.bluePlayer,
    };

    this.sendToAllJudges(fight, 'newEvents', response);

    fight.checkIfEnoughPointsToEndFight();
  }

  fightEndConditionFulfilled(
    conditionName: FightEndConditionName,
    fight: FightImpl,
  ): void {
    const response: FightEndConditionFulfilledResponse = {
      status: ResponseStatus.OK,
      conditionName: conditionName,
    };

    this.sendToAllJudges(fight, 'fightEndConditionFulfilled', response);
  }
}
