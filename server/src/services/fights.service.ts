import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Timer } from '../classes/timer/timer.class';
import { Fight, FightState } from '../interfaces/fight.interface';
import { ResponseStatus } from '../interfaces/response.interface';
import { Event } from '../interfaces/event.interface';

@Injectable()
export class FightsService {
  private readonly fights: Map<string, Fight> = new Map<string, Fight>();

  constructor() {
    const fight: Fight = {
      id: 'mockup',
      state: FightState.Scheduled,
      timer: new Timer(1),

      mainJudge: {
        id: 'main',
        socket: null,
      },
      redJudge: {
        id: 'red',
        socket: null,
      },
      blueJudge: {
        id: 'blue',
        socket: null,
      },

      redPlayer: {
        id: 'player1',
        points: 0,
      },
      bluePlayer: {
        id: 'player2',
        points: 0,
      },

      eventsHistory: [],
    };
    this.newFight(fight);
  }

  newFight(fight: Fight) {
    this.fights.set(fight.id, fight);
  }

  getFight(id: string): Fight {
    return this.fights.get(id);
  }

  isJudge(fightId: string, judgeId: string): boolean {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return false;
    }

    return [fight.mainJudge.id, fight.redJudge.id, fight.blueJudge.id].includes(
      judgeId,
    );
  }

  isMainJudge(fightId: string, judgeId: string): boolean {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return false;
    }

    return judgeId == fight.mainJudge.id;
  }

  addJudge(fightId: string, judgeId: string, socket: Socket): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (
      (judgeId == fight.mainJudge.id &&
        fight.mainJudge.socket != null &&
        fight.mainJudge.socket != socket) ||
      (judgeId == fight.redJudge.id &&
        fight.redJudge.socket != null &&
        fight.redJudge.socket != socket) ||
      (judgeId == fight.blueJudge.id &&
        fight.blueJudge.socket != null &&
        fight.blueJudge.socket != socket)
    ) {
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

  startFight(fightId: string): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (
      fight.mainJudge.socket == null ||
      fight.redJudge.socket == null ||
      fight.blueJudge.socket == null
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

  resumeTimer(fightId: string): ResponseStatus {
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

  pauseTimer(fightId: string, exactPauseTimeInMillis: number): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (fight.state != FightState.Running) {
      return ResponseStatus.BadRequest;
    }

    if (
      fight.timer.hasTimeEnded() ||
      fight.timer.pauseTimer(exactPauseTimeInMillis)
    ) {
      fight.state = FightState.Paused;
      return ResponseStatus.OK;
    }
    return ResponseStatus.BadRequest;
  }

  newEvents(
    fightId: string,
    events: Event[],
    playerId: string,
    playerPoints: number,
  ): ResponseStatus {
    const fight = this.fights.get(fightId);

    if (fight == undefined) {
      return ResponseStatus.NotFound;
    } else if (![FightState.Running, FightState.Paused].includes(fight.state)) {
      return ResponseStatus.BadRequest;
    }

    if (playerId == fight.redPlayer.id) {
      fight.redPlayer.points += playerPoints;
    } else if (playerId == fight.blueJudge.id) {
      fight.bluePlayer.points += playerPoints;
    } else {
      return ResponseStatus.BadRequest;
    }

    fight.eventsHistory = fight.eventsHistory.concat(events);
    return ResponseStatus.OK;
  }
}
