import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

import { Socket } from 'socket.io';
import { FightInterface } from '../interfaces/fight.interface';
import { FightsService } from '../fights/fights.service';
import {
  ResponseInterface,
  ResponseStatus,
} from '../interfaces/response.interface';

@WebSocketGateway()
export class JudgesGateway {
  constructor(private fightsService: FightsService) {}

  sendToAllJudges(fight: FightInterface, event: string, response: any) {
    fight.mainJudgeSocket.emit(event, response);
    fight.redJudgeSocket.emit(event, response);
    fight.blueJudgeSocket.emit(event, response);
  }

  @SubscribeMessage('join')
  join(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const response: ResponseInterface = {
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
    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      client.emit('startFight', { status: ResponseStatus.Unauthorized });
      return;
    }

    const response: ResponseInterface = {
      status: this.fightsService.startFight(fightId),
    };
    const fight = this.fightsService.getFight(fightId);

    this.sendToAllJudges(fight, 'startFight', response);
  }

  @SubscribeMessage('finishFight')
  finishFight(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      client.emit('finishFight', { status: ResponseStatus.Unauthorized });
      return;
    }

    const response: ResponseInterface = {
      status: this.fightsService.finishFight(fightId),
    };
    const fight = this.fightsService.getFight(fightId);

    this.sendToAllJudges(fight, 'finishFight', response);
  }

  @SubscribeMessage('startTimer')
  startTimer(
    @MessageBody('fightId') fightId: string, 
    @MessageBody('judgeId') judgeId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      client.emit('startTimer', { status: ResponseStatus.Unauthorized });
      return;
    }

    const response: ResponseInterface = {
      status: this.fightsService.startTimer(fightId),
    };
    const fight = this.fightsService.getFight(fightId);

    this.sendToAllJudges(fight, 'startTimer', response);
  }

  @SubscribeMessage('pauseTimer')
  pauseTimer(
    @MessageBody('fightId') fightId: string, 
    @MessageBody('judgeId') judgeId: string,
    @MessageBody('timeInMilisWhenPaused') timeInMilisWhenPaused: number,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      client.emit('pauseTimer', { status: ResponseStatus.Unauthorized });
      return;
    }

    const response: ResponseInterface = {
      status: this.fightsService.pauseTimer(fightId, timeInMilisWhenPaused),
    };
    const fight = this.fightsService.getFight(fightId);

    this.sendToAllJudges(fight, 'pauseTimer', { response: response.status, timeInMilisWhenPaused: timeInMilisWhenPaused } );
  }
}
