import { Event } from './event.interface';
import { Response } from './response.interface';
import { PlayerState } from './fight.interface';

export interface NewEventsResponse extends Response {
  allEvents: Event[];
  redPlayer: PlayerState;
  bluePlayer: PlayerState;
}
