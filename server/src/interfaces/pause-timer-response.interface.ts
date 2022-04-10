import { Response } from './response.interface';

export interface PauseTimerResponse extends Response {
  exactPauseTimeInMillis: number;
}
