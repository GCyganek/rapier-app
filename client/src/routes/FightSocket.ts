import type { DefaultEventsMap } from "@socket.io/component-emitter";
import { io, Socket } from "socket.io-client";
import type { Fighter } from "./fight/bar/FighterInfo.svelte";

export enum Events {
    Join            = 'join',
    StartFight      = 'startFight',
    FinishFight     = 'finishFight',
    PauseTimer      = 'pauseTimer',
    ResumeTimer     = 'resumeTimer',
    NewEvents       = 'newEvents',
    EventsSuggestion = 'eventsSuggestion',
    FightEndConditionFulfilled = 'fightEndConditionFulfilled'
};

export class JoinResponse {
    status: string;
    redPlayer: Fighter;
    bluePlayer: Fighter;
};

export class FightSocket  {
    private socket: Socket<DefaultEventsMap, DefaultEventsMap>;
    public connection: Promise<JoinResponse>;

    constructor(private fightId: string, private judgeId: string) {
        this.socket = io(location.host);

        this.socket.on('connect', () => {
            this.socket.emit(Events.Join, this.emitArg());
        });
        
        this.socket.on('disconnect', console.warn);
        this.socket.on('connect_error', console.error);

        this.connection = new Promise((resolve, reject) => {
            this.socket.once(Events.Join, (response) => {
                response.status !== 'OK' 
                    ? reject(response.status)
                    : resolve(response);
            });
        });
    }

    pauseTimer() {
        this.socket.emit(Events.PauseTimer, this.emitArg());
    }

    resumeTimer() {
        this.socket.emit(Events.ResumeTimer, this.emitArg());
    }

    private emitArg() {
        return { fightId: this.fightId, judgeId: this.judgeId };
    }

}