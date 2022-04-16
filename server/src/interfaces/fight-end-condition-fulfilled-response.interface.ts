import { Response } from "./response.interface";

export interface FightEndConditionFulfilledResponse extends Response {
    condition: FightEndCondition;
}

export enum FightEndCondition {
    TimeEnded,
    EnoughPoints,
}