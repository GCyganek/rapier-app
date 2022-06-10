import { FightState } from './fight.interface';

export default interface ReconnectResponse {
  timeInMillis: number;
  fightState: FightState;
  redPlayerPoints: number;
  bluePlayerPoints: number;
}
