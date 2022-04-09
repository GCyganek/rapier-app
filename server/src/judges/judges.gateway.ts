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
  PauseTimerResponseInterface,
  ResponseInterface,
  ResponseStatus,
} from '../interfaces/response.interface';

@WebSocketGateway()
export class JudgesGateway {
  constructor(private fightsService: FightsService) {}

  sendToAllJudges(fight: FightInterface, event: string, response: any) {
    if (fight.mainJudgeSocket != null) {
      fight.mainJudgeSocket.emit(event, response);
    }
    if (fight.redJudgeSocket != null) {
      fight.redJudgeSocket.emit(event, response);
    }
    if (fight.blueJudgeSocket != null) {
      fight.blueJudgeSocket.emit(event, response);
    }
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
    if (!this.fightsService.getFight(fightId)) {
      return client.emit('startFight', { status: ResponseStatus.NotFound });
    }

    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit('startFight', { status: ResponseStatus.Unauthorized });
    }

    const response: ResponseInterface = {
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

    const response: ResponseInterface = {
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

    const response: ResponseInterface = {
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
    @MessageBody('exactPauseTimeInMilis') exactPauseTimeInMilis: number,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.getFight(fightId)) {
      return client.emit('pauseTimer', { status: ResponseStatus.NotFound });
    }

    if (!this.fightsService.isMainJudge(fightId, judgeId)) {
      return client.emit('pauseTimer', { status: ResponseStatus.Unauthorized });
    }

    const response: PauseTimerResponseInterface = {
      status: this.fightsService.pauseTimer(fightId, exactPauseTimeInMilis),
      exactPauseTimeInMilis: exactPauseTimeInMilis,
    };
    const fight = this.fightsService.getFight(fightId);

    if (response.status != ResponseStatus.OK) {
      return client.emit('pauseTimer', response);
    }

    this.sendToAllJudges(fight, 'pauseTimer', response);
  }
}
