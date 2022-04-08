import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { PlayersDataResponse } from 'src/interfaces/playersDataResponse.interface';

import { Socket } from 'socket.io';
import { PlayersService } from 'src/players/players.service';
import { FightsService } from '../fights/fights.service';
import {
  ResponseInterface,
  ResponseStatus,
} from '../interfaces/response.interface';
import { FightInterface } from 'src/interfaces/fight.interface';
import { emit } from 'process';

@WebSocketGateway()
export class JudgesGateway {
  constructor(private fightsService: FightsService, private playersService: PlayersService) {}

  @SubscribeMessage('join')
  join(
    @MessageBody('fightId') fightId: string,
    @MessageBody('judgeId') judgeId: string,
    @ConnectedSocket() client: Socket,
  ) {

    let response: PlayersDataResponse = {
      status: this.fightsService.addJudge(fightId, judgeId, client),

      redPlayerFirstName: null,
      redPlayerLastName: null,
    
      bluePlayerFirstName: null,
      bluePlayerLastName: null
    };

    if (response.status != ResponseStatus.OK){
        client.emit('join', response)
        return;
    }

    const fight: FightInterface = this.fightsService.getFight(fightId)
    const redPlayer = this.playersService.getPlayer(fight.redPlayerId);
    const bluePlayer = this.playersService.getPlayer(fight.bluePlayerId);

    response.redPlayerFirstName = redPlayer.firstName,
    response.redPlayerLastName = redPlayer.lastName,
  
    response.bluePlayerFirstName = bluePlayer.firstName,
    response.bluePlayerLastName = bluePlayer.lastName
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
