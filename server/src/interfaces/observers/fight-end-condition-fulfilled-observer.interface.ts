import { FightEndCondition } from "../fight-end-condition-fulfilled-response.interface";
import { Fight } from "../fight.interface";

export interface FightEndConditionFulfilledObserver {
    fightEndConditionFulfilled(condition: FightEndCondition, fight: Fight): void;
}