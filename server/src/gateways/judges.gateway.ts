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

  @SubscribeMessage(JudgesSocketEvents.Join)
  async join(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const status = await this.fightsService.addJudge(fightId, judgeId, client);
    if (status != ResponseStatus.OK) {
      return client.emit(JudgesSocketEvents.Join, { status: status });
    }

    const fight: FightImpl = this.fightsService.getFight(fightId);
    const role = fight.getJudgeRole(judgeId);
    const connectedJudges = fight.getConnectedJudgesStatus();
    connectedJudges.delete(role);

    const response: JoinResponse = {
      connected: [...connectedJudges.keys()],
      status: status,
      role: fight.getJudgeRole(judgeId),
      redPlayer: await this.playersService.getPlayer(fight.redPlayer.id),
      bluePlayer: await this.playersService.getPlayer(fight.bluePlayer.id),
    };

    for (const [, judgeState] of connectedJudges.entries()) {
      judgeState.socket.emit(JudgesSocketEvents.JudgeJoined, {
        newJudge: role,
      });
    }

    return client.emit(JudgesSocketEvents.Join, response);
  }

  @SubscribeMessage(JudgesSocketEvents.StartFight)
  startFight(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.getFight(fightId)) {
      return client.emit(JudgesSocketEvents.StartFight, {
        status: ResponseStatus.NotFound,
      });
    }

    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit(JudgesSocketEvents.StartFight, {
        status: ResponseStatus.Unauthorized,
      });
    }

    const response: Response = {
      status: this.fightsService.startFight(fightId),
    };
    const fight = this.fightsService.getFight(fightId);

    if (response.status != ResponseStatus.OK) {
      return client.emit(JudgesSocketEvents.StartFight, response);
    }

    this.sendToAllJudges(fight, JudgesSocketEvents.StartFight, response);
  }

  @SubscribeMessage(JudgesSocketEvents.FinishFight)
  async finishFight(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.getFight(fightId)) {
      return client.emit(JudgesSocketEvents.FinishFight, {
        status: ResponseStatus.NotFound,
      });
    }

    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit(JudgesSocketEvents.FinishFight, {
        status: ResponseStatus.Unauthorized,
      });
    }

    const fight = this.fightsService.getFight(fightId);
    const response: Response = {
      status: await this.fightsService.finishFight(fightId),
    };

    if (response.status != ResponseStatus.OK) {
      return client.emit(JudgesSocketEvents.FinishFight, response);
    }

    this.sendToAllJudges(fight, JudgesSocketEvents.FinishFight, response);
  }

  @SubscribeMessage(JudgesSocketEvents.ResumeTimer)
  resumeTimer(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.getFight(fightId)) {
      return client.emit(JudgesSocketEvents.ResumeTimer, {
        status: ResponseStatus.NotFound,
      });
    }

    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit(JudgesSocketEvents.ResumeTimer, {
        status: ResponseStatus.Unauthorized,
      });
    }

    const response: Response = {
      status: this.fightsService.resumeTimer(fightId),
    };
    const fight = this.fightsService.getFight(fightId);

    if (response.status != ResponseStatus.OK) {
      return client.emit(JudgesSocketEvents.ResumeTimer, response);
    }

    this.sendToAllJudges(fight, JudgesSocketEvents.ResumeTimer, response);
  }

  @SubscribeMessage(JudgesSocketEvents.PauseTimer)
  pauseTimer(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @MessageBody('exactPauseTimeInMillis') exactPauseTimeInMillis: number,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.getFight(fightId)) {
      return client.emit(JudgesSocketEvents.PauseTimer, {
        status: ResponseStatus.NotFound,
      });
    }

    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit(JudgesSocketEvents.PauseTimer, {
        status: ResponseStatus.Unauthorized,
      });
    }

    const response: PauseTimerResponse = {
      status: this.fightsService.pauseTimer(fightId, exactPauseTimeInMillis),
      exactPauseTimeInMillis: exactPauseTimeInMillis,
    };
    const fight = this.fightsService.getFight(fightId);

    if (response.status != ResponseStatus.OK) {
      return client.emit(JudgesSocketEvents.PauseTimer, response);
    }

    this.sendToAllJudges(fight, JudgesSocketEvents.PauseTimer, response);
  }

  @SubscribeMessage(JudgesSocketEvents.NewEvents)
  newEvents(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @MessageBody('events') events: Event[],
    @MessageBody('redPlayerPoints') redPlayerPoints: number,
    @MessageBody('bluePlayerPoints') bluePlayerPoints: number,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.getFight(fightId)) {
      return client.emit(JudgesSocketEvents.NewEvents, {
        status: ResponseStatus.NotFound,
      });
    }

    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit(JudgesSocketEvents.NewEvents, {
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
      return client.emit(JudgesSocketEvents.NewEvents, { status: status });
    }

    const fight = this.fightsService.getFight(fightId);

    const response: NewEventsResponse = {
      status: status,
      allEvents: events,
      redPlayer: fight.redPlayer,
      bluePlayer: fight.bluePlayer,
    };

    this.sendToAllJudges(fight, JudgesSocketEvents.NewEvents, response);

    fight.checkIfEnoughPointsToEndFight();
  }

  @SubscribeMessage(JudgesSocketEvents.EventsSuggestion)
  eventsSuggestion(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @MessageBody('events') events: Event[],
    @MessageBody('redPlayerPoints') redPlayerPoints: number,
    @MessageBody('bluePlayerPoints') bluePlayerPoints: number,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.getFight(fightId)) {
      return client.emit(JudgesSocketEvents.EventsSuggestion, {
        status: ResponseStatus.NotFound,
      });
    }

    if (this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit(JudgesSocketEvents.EventsSuggestion, {
        status: ResponseStatus.Unauthorized,
      });
    }

    const status = this.fightsService.eventsCanBeSuggested(
      fightId,
      redPlayerPoints,
      bluePlayerPoints,
    );

    if (status !== ResponseStatus.OK) {
      return client.emit(JudgesSocketEvents.EventsSuggestion, {
        status: status,
      });
    }
    client.emit(JudgesSocketEvents.EventsSuggestion, { status: status });

    const fight = this.fightsService.getFight(fightId);

    const judgeColor = judgeId === fight.redJudgeId ? 'red' : 'blue';

    const forwarding: SuggestedEventsForwarding = {
      judgeColor: judgeColor,
      events: events,
      redPlayerPoints: redPlayerPoints,
      bluePlayerPoints: bluePlayerPoints,
    };

    fight.mainJudge.socket.emit(
      JudgesSocketEvents.EventsSuggestion,
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
      JudgesSocketEvents.FightEndConditionFulfilled,
      response,
    );
  }
}
