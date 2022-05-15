import type { DefaultEventsMap } from "@socket.io/component-emitter";
import type { Response } from "model/Communication";
import { io, Socket } from "socket.io-client";

export const key: Symbol = Symbol();

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

namespace FightSocket {
    export type Listener = (...args: any[]) => void;
};

export class FightSocket  {
    private socket: Socket<DefaultEventsMap, DefaultEventsMap>;

    constructor(private fightId: string, private judgeId: string) {
        this.socket = io(location.host);

        this.socket.on('connect', console.log.bind('Connection established.'));
        this.socket.on('disconnect', console.warn);
        this.socket.on('connect_error', console.error);
    }

    private promiseFor<T extends Response.Base>(event: Events): Promise<T> {
        return new Promise((resolve, reject) => {
            this.socket.once(event, (response: T) => {
                response.status !== 'OK'
                    ? reject(response.status)
                    : resolve(response);
            });
        });
    }

    join() {
        this.socket.emit(Events.Join, this.getIds());
        return this.promiseFor<Response.Join>(Events.Join);
    }

    pauseTimer() {
        this.socket.emit(Events.PauseTimer, this.getIds());
    }

    resumeTimer() {
        this.socket.emit(Events.ResumeTimer, this.getIds());
    }

    /// Considering if it is useful
    on(event: Events, listener: FightSocket.Listener) {
        this.socket.on(event, listener);
    }

    private getIds() {
        return { fightId: this.fightId, judgeId: this.judgeId };
    }
}
