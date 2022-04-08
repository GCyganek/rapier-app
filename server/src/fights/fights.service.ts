import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Timer } from '../classes/timer/timer.class';
import { FightInterface, FightState } from '../interfaces/fight.interface';
import { ResponseStatus } from '../interfaces/response.interface';

@Injectable()
export class FightsService {
  private readonly fights: Map<string, FightInterface> = new Map<
    string,
    FightInterface
  >();

  constructor() {
    const fight: FightInterface = {
      id: 'mockup',
      state: FightState.Scheduled,

      mainJudgeId: 'main',
      redJudgeId: 'red',
      blueJudgeId: 'blue',

      mainJudgeSocket: null,
      redJudgeSocket: null,
      blueJudgeSocket: null,

      redPlayerId: 'player1',
      bluePlayerId: 'player2',

      redEventsHistory: [],
      blueEventsHistory: [],

      timer: new Timer(1),
    };
    this.newFight(fight);
  }

  newFight(fight: FightInterface) {
    this.fights.set(fight.id, fight);
  }

  getFight(id: string): FightInterface {
    return this.fights.get(id);
  }

  isJudge(fightId: string, judgeId: string): boolean {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return false;
    }

    return [fight.mainJudgeId, fight.redJudgeId, fight.blueJudgeId].includes(
      judgeId,
    );
  }

  isMainJudge(fightId: string, judgeId: string): boolean {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return false;
    }

    return judgeId == fight.mainJudgeId;
  }

  addJudge(fightId: string, judgeId: string, socket: Socket): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (
      (judgeId == fight.mainJudgeId &&
        fight.mainJudgeSocket != null &&
        fight.mainJudgeSocket != socket) ||
      (judgeId == fight.redJudgeId &&
        fight.redJudgeSocket != null &&
        fight.redJudgeSocket != socket) ||
      (judgeId == fight.blueJudgeId &&
        fight.blueJudgeSocket != null &&
        fight.blueJudgeSocket != socket)
    ) {
      return ResponseStatus.BadRequest;
    } else if (judgeId == fight.mainJudgeId) {
      fight.mainJudgeSocket = socket;
    } else if (judgeId == fight.redJudgeId) {
      fight.redJudgeSocket = socket;
    } else if (judgeId == fight.blueJudgeId) {
      fight.blueJudgeSocket = socket;
    } else {
      return ResponseStatus.Unauthorized;
    }

    return ResponseStatus.OK;
  }

  startFight(fightId: string): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (
      fight.mainJudgeSocket == null ||
      fight.redJudgeSocket == null ||
      fight.blueJudgeSocket == null
    ) {
      return ResponseStatus.NotReady;
    } else if (fight.state != FightState.Scheduled) {
      return ResponseStatus.BadRequest;
    }

    if (fight.timer.resumeTimer()) {
      fight.state = FightState.Running;
      return ResponseStatus.OK;
    }
    return ResponseStatus.BadRequest;
  }

  finishFight(fightId: string): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (![FightState.Running, FightState.Paused].includes(fight.state)) {
      return ResponseStatus.BadRequest;
    }

    fight.timer.endTimer();
    fight.state = FightState.Finished;
    return ResponseStatus.OK;
  }

  startTimer(fightId: string): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (fight.state != FightState.Paused) {
      return ResponseStatus.BadRequest;
    }

    if (fight.timer.hasTimeEnded() || fight.timer.resumeTimer()) {
      fight.state = FightState.Running;
      return ResponseStatus.OK;
    }
    return ResponseStatus.BadRequest;
  }

  pauseTimer(fightId: string, exactPauseTimeInMilis: number): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (fight.state != FightState.Running) {
      return ResponseStatus.BadRequest;
    }

    if (fight.timer.hasTimeEnded() || fight.timer.pauseTimer(exactPauseTimeInMilis)) {
      fight.state = FightState.Paused;
      return ResponseStatus.OK;
    }
    return ResponseStatus.BadRequest;
  }
}
