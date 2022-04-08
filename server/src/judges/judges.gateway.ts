import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

import { Socket } from 'socket.io';
import { FightsService } from '../fights/fights.service';
import {
  ResponseInterface,
  ResponseStatus,
} from '../interfaces/response.interface';

@WebSocketGateway()
export class JudgesGateway {
  constructor(private fightsService: FightsService) {}

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

    fight.mainJudgeSocket.emit('startFight', response);
    fight.redJudgeSocket.emit('startFight', response);
    fight.blueJudgeSocket.emit('startFight', response);
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

    fight.mainJudgeSocket.emit('finishFight', response);
    fight.redJudgeSocket.emit('finishFight', response);
    fight.blueJudgeSocket.emit('finishFight', response);
  }
}
