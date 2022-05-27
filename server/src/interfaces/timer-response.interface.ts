import { Response } from './response.interface';

export interface TimerResponse extends Response {
  timeInMillis: number;
}
