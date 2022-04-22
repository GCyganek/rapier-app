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
import { JoinResponse } from '../interfaces/join-response.interface';
import { PlayersService } from '../services/players.service';
import { SuggestedEventsForwarding } from '../interfaces/suggested-events-forwarding.interface';
import { JudgesSocketEvents } from '../interfaces/judges-socket-events.enum';

@WebSocketGateway()
export class JudgesGateway implements FightEndConditionFulfilledObserver {
  constructor(
    private fightsService: FightsService,
    private playersService: PlayersService,
  ) {
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

  @SubscribeMessage(JudgesSocketEvents.JOIN)
  join(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const response: JoinResponse = {
      status: this.fightsService.addJudge(fightId, judgeId, client),
      redPlayer: null,
      bluePlayer: null,
    };
    if (response.status != ResponseStatus.OK) {
      return client.emit(JudgesSocketEvents.JOIN, response);
    }

    const fight: FightImpl = this.fightsService.getFight(fightId);
    (response.redPlayer = this.playersService.getPlayer(fight.redPlayer.id)),
      (response.bluePlayer = this.playersService.getPlayer(
        fight.bluePlayer.id,
      ));

    return client.emit(JudgesSocketEvents.JOIN, response);
  }

  @SubscribeMessage(JudgesSocketEvents.START_FIGHT)
  startFight(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.getFight(fightId)) {
      return client.emit(JudgesSocketEvents.START_FIGHT, {
        status: ResponseStatus.NotFound,
      });
    }

    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit(JudgesSocketEvents.START_FIGHT, {
        status: ResponseStatus.Unauthorized,
      });
    }

    const response: Response = {
      status: this.fightsService.startFight(fightId),
    };
    const fight = this.fightsService.getFight(fightId);

    if (response.status != ResponseStatus.OK) {
      return client.emit(JudgesSocketEvents.START_FIGHT, response);
    }

    this.sendToAllJudges(fight, JudgesSocketEvents.START_FIGHT, response);
  }

  @SubscribeMessage(JudgesSocketEvents.FINISH_FIGHT)
  finishFight(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.getFight(fightId)) {
      return client.emit(JudgesSocketEvents.FINISH_FIGHT, {
        status: ResponseStatus.NotFound,
      });
    }

    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit(JudgesSocketEvents.FINISH_FIGHT, {
        status: ResponseStatus.Unauthorized,
      });
    }

    const response: Response = {
      status: this.fightsService.finishFight(fightId),
    };
    const fight = this.fightsService.getFight(fightId);

    if (response.status != ResponseStatus.OK) {
      return client.emit(JudgesSocketEvents.FINISH_FIGHT, response);
    }

    this.sendToAllJudges(fight, JudgesSocketEvents.FINISH_FIGHT, response);
  }

  @SubscribeMessage(JudgesSocketEvents.RESUME_TIMER)
  resumeTimer(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.getFight(fightId)) {
      return client.emit(JudgesSocketEvents.RESUME_TIMER, {
        status: ResponseStatus.NotFound,
      });
    }

    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit(JudgesSocketEvents.RESUME_TIMER, {
        status: ResponseStatus.Unauthorized,
      });
    }

    const response: Response = {
      status: this.fightsService.resumeTimer(fightId),
    };
    const fight = this.fightsService.getFight(fightId);

    if (response.status != ResponseStatus.OK) {
      return client.emit(JudgesSocketEvents.RESUME_TIMER, response);
    }

    this.sendToAllJudges(fight, JudgesSocketEvents.RESUME_TIMER, response);
  }

  @SubscribeMessage(JudgesSocketEvents.PAUSE_TIMER)
  pauseTimer(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @MessageBody('exactPauseTimeInMillis') exactPauseTimeInMillis: number,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.getFight(fightId)) {
      return client.emit(JudgesSocketEvents.PAUSE_TIMER, {
        status: ResponseStatus.NotFound,
      });
    }

    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit(JudgesSocketEvents.PAUSE_TIMER, {
        status: ResponseStatus.Unauthorized,
      });
    }

    const response: PauseTimerResponse = {
      status: this.fightsService.pauseTimer(fightId, exactPauseTimeInMillis),
      exactPauseTimeInMillis: exactPauseTimeInMillis,
    };
    const fight = this.fightsService.getFight(fightId);

    if (response.status != ResponseStatus.OK) {
      return client.emit(JudgesSocketEvents.PAUSE_TIMER, response);
    }

    this.sendToAllJudges(fight, JudgesSocketEvents.PAUSE_TIMER, response);
  }

  @SubscribeMessage(JudgesSocketEvents.NEW_EVENTS)
  newEvents(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @MessageBody('events') events: Event[],
    @MessageBody('redPlayerPoints') redPlayerPoints: number,
    @MessageBody('bluePlayerPoints') bluePlayerPoints: number,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.getFight(fightId)) {
      return client.emit(JudgesSocketEvents.NEW_EVENTS, {
        status: ResponseStatus.NotFound,
      });
    }

    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit(JudgesSocketEvents.NEW_EVENTS, {
        status: ResponseStatus.Unauthorized,
      });
    }

    const status = this.fightsService.newEvents(
      fightId,
      events,
      redPlayerPoints,
      bluePlayerPoints,
    );

    if (status != ResponseStatus.OK) {
      return client.emit(JudgesSocketEvents.NEW_EVENTS, { status: status });
    }

    const fight = this.fightsService.getFight(fightId);

    const response: NewEventsResponse = {
      status: status,
      allEvents: events,
      redPlayer: fight.redPlayer,
      bluePlayer: fight.bluePlayer,
    };

    this.sendToAllJudges(fight, JudgesSocketEvents.NEW_EVENTS, response);

    fight.checkIfEnoughPointsToEndFight();
  }

  @SubscribeMessage(JudgesSocketEvents.EVENTS_SUGGESTION)
  eventsSuggestion(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @MessageBody('events') events: Event[],
    @MessageBody('redPlayerPoints') redPlayerPoints: number,
    @MessageBody('bluePlayerPoints') bluePlayerPoints: number,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.getFight(fightId)) {
      return client.emit(JudgesSocketEvents.EVENTS_SUGGESTION, {
        status: ResponseStatus.NotFound,
      });
    }

    if (this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit(JudgesSocketEvents.EVENTS_SUGGESTION, {
        status: ResponseStatus.Unauthorized,
      });
    }

    const status = this.fightsService.eventsCanBeSuggested(
      fightId,
      redPlayerPoints,
      bluePlayerPoints,
    );

    if (status !== ResponseStatus.OK) {
      return client.emit(JudgesSocketEvents.EVENTS_SUGGESTION, {
        status: status,
      });
    }
    client.emit(JudgesSocketEvents.EVENTS_SUGGESTION, { status: status });

    const fight = this.fightsService.getFight(fightId);

    const judgeColor = judgeId === fight.redJudgeId ? 'red' : 'blue';

    const forwarding: SuggestedEventsForwarding = {
      judgeColor: judgeColor,
      events: events,
      redPlayerPoints: redPlayerPoints,
      bluePlayerPoints: bluePlayerPoints,
    };

    fight.mainJudge.socket.emit(
      JudgesSocketEvents.EVENTS_SUGGESTION,
      forwarding,
    );
  }

  fightEndConditionFulfilled(
    conditionName: FightEndConditionName,
    fight: FightImpl,
  ): void {
    const response: FightEndConditionFulfilledResponse = {
      status: ResponseStatus.OK,
      conditionName: conditionName,
    };

    this.sendToAllJudges(
      fight,
      JudgesSocketEvents.FIGHT_END_CONDITION_FULFILLED,
      response,
    );
  }
}
