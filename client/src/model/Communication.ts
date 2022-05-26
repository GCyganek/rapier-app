import type { Fighter } from './Fighter';

export namespace Response {
  export type Color = 'RED' | 'BLUE';
  export type JudgeRole = 'MAIN' | Color;
  export type Status =
    | 'OK'
    | 'BAD_REQUEST'
    | 'UNAUTHORIZED'
    | 'NOT_FOUND'
    | 'NOT_READY';

  export class Base {
    status: Status;
  }

  export class Join extends Base {
    redPlayer: Fighter;
    bluePlayer: Fighter;
    role: JudgeRole;
  }

  export class Pause extends Base {
    exactPauseTimeInMillis: number;
  }

  export class FightEvent {
    id: string;
    playerColor: Color;
  }

  export class PlayerState {
    id: string;
    points: number;
  }

  export class NewEvent extends Base {
    allEvents: FightEvent[];
    redPlayer: PlayerState;
    bluePlayer: PlayerState;
  }

  export class Suggestion extends Base {
    judgeColor: Color;
    events: FightEvent[];
    redPlayerPoints: number;
    bluePlayerPoints: number;
  }

  export type Condition = 'TIME_ENDED' | 'ENOUGH_POINTS';

  export class EndCondition extends Base {
    conditionName: Condition;
  }
}
