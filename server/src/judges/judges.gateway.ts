import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { PlayersDataResponse } from 'classes/playersDataResponse.class';

import { Socket } from 'socket.io';
import { PlayersService } from 'src/players/players.service';
import { FightsService } from '../fights/fights.service';
import {
  ResponseInterface,
  ResponseStatus,
} from '../interfaces/response.interface';

@WebSocketGateway()
export class JudgesGateway {
  constructor(private fightsService: FightsService, private playersService: PlayersService) {}

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
    }

    const response: ResponseInterface = {
      status: this.fightsService.finishFight(fightId),
    };
    const fight = this.fightsService.getFight(fightId);

    fight.mainJudgeSocket.emit('finishFight', response);
    fight.redJudgeSocket.emit('finishFight', response);
    fight.blueJudgeSocket.emit('finishFight', response);
  }

  @SubscribeMessage('getPlayerData')
  getPlayerData(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.fightsService.isJudge(fightId, judgeId)) {
      client.emit('getPlayerData', { status: ResponseStatus.Unauthorized });
      return
    }

    const fight = this.fightsService.getFight(fightId);

    const redPlayer = this.playersService.getPlayer(fight.redPlayerId);
    const bluePlayer = this.playersService.getPlayer(fight.bluePlayerId);

    let redPoints: number = 0;
    fight.redEventsHistory.forEach( event => {redPoints += event.points})

    let bluePoints: number = 0;
    fight.blueEventsHistory.forEach(event => {bluePoints += event.points})

    const response: PlayersDataResponse = {
      status: ResponseStatus.OK,

      redPlayerFirstName: redPlayer.firstName,
      redPlayerLastName: redPlayer.lastName,
      redPlayerPoints: redPoints,

      bluePlayerFirstName: bluePlayer.firstName,
      bluePlayerLastName: bluePlayer.lastName,
      bluePlayerPoints: bluePoints
    }

    client.emit("getPlayerData", response)
  }
}
