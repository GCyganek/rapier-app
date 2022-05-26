import { Response } from './response.interface';

export interface TimerResponse extends Response {
  exactTimeInMillis: number;
}
