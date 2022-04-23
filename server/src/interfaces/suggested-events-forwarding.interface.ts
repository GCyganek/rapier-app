import { Event } from './event.interface';

export interface SuggestedEventsForwarding {
  judgeColor: string;
  events: Event[];
  redPlayerPoints: number;
  bluePlayerPoints: number;
}
