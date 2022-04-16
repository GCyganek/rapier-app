import { FightTimeEndedObserver } from "../observers/fight-time-ended-observer.interface";

export interface FightTimeEndedPublisher {
    addFightTimeEndedObserver(observer: FightTimeEndedObserver): void;
    removeFightTimeEndedObserver(observer: FightTimeEndedObserver): void;
    notifyTimeEnded(): void;
}