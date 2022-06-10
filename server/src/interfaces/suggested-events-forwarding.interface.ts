import { Event } from './event.interface';
import { JudgeRole } from './join-response.interface';

export interface SuggestedEventsForwarding {
  judgeColor: JudgeRole;
  events: Event[];
  redPlayerPoints: number;
  bluePlayerPoints: number;
}
