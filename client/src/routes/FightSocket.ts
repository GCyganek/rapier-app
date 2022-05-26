import type { DefaultEventsMap } from '@socket.io/component-emitter';
import type { Response } from 'model/Communication';
import { io, Socket } from 'socket.io-client';
import { Writable, writable } from 'svelte/store';

export const key = Symbol();

export enum Events {
  Join = 'join',
  StartFight = 'startFight',
  FinishFight = 'finishFight',
  PauseTimer = 'pauseTimer',
  ResumeTimer = 'resumeTimer',
  NewEvents = 'newEvents',
  EventsSuggestion = 'eventsSuggestion',
  FightEndConditionFulfilled = 'fightEndConditionFulfilled',
}

namespace FightSocket {
  export type Listener = (...args: any[]) => void;
}

export class FightSocket {
  private socket: Socket<DefaultEventsMap, DefaultEventsMap>;
  private role: Response.JudgeRole;
  #newEvents: Writable<Response.NewEvent>;
  #redSuggestion: Writable<Response.Suggestion>;
  #blueSuggestion: Writable<Response.Suggestion>;

  constructor(private fightId: string, private judgeId: string) {
    this.socket = io(location.host);
    this.role = null;

    this.socket.on('connect', () => console.log('Connection established.'));
    this.socket.on('disconnect', console.warn);
    this.socket.on('connect_error', console.error);
    this.#newEvents = writable();
  }

  awaitNewEvents() {
    if (!this.socket.hasListeners(Events.NewEvents)) {
      this.socket.on(Events.NewEvents, (response: Response.NewEvent) => {
        this.#newEvents.set(response);
      });
    }

    return this.#newEvents;
  }

  awaitSuggestions() {
    const listener = (response: Response.Suggestion) => {
      switch (response.judgeColor) {
        case 'RED':
          return this.#redSuggestion.set(response);

        case 'BLUE':
          return this.#blueSuggestion.set(response);
      }
    };

    if (this.socket.hasListeners(Events.EventsSuggestion))
      this.socket.on(Events.EventsSuggestion, listener);

    return [this.#redSuggestion, this.#blueSuggestion];
  }

  get newEvents() {
    return this.#newEvents;
  }

  private promiseFor<T extends Response.Base>(
    event: Events,
    action: (a: T) => void = null,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.socket.once(event, (response: T) => {
        if (action !== null) action(response);

        response.status !== 'OK' ? reject(response.status) : resolve(response);
      });
    });
  }

  join() {
    this.socket.emit(Events.Join, this.getIds());
    return this.promiseFor<Response.Join>(
      Events.Join,
      (r) => (this.role = r.role),
    );
  }

  startFight() {
    if (this.role === 'MAIN')
      this.socket.emit(Events.StartFight, this.getIds());

    return this.promiseFor<Response.Base>(Events.StartFight);
  }

  finishFight() {
    if (this.role === 'MAIN')
      this.socket.emit(Events.FinishFight, this.getIds());

    return this.promiseFor<Response.Base>(Events.FinishFight);
  }

  pauseTimer() {
    this.socket.emit(Events.PauseTimer, this.getIds());
  }

  resumeTimer() {
    this.socket.emit(Events.ResumeTimer, this.getIds());
  }

  sendEvents(points) {
    const eventsParameters = {
      fightId: this.fightId,
      judgeId: this.judgeId,
      //TODO EVENTS
      events: null,
      redPlayerPoints: points['red'],
      bluePlayerPoints: points['blue'],
    };
    if (this.role === 'MAIN')
      this.socket.emit(Events.NewEvents, eventsParameters);
    else this.socket.emit(Events.EventsSuggestion, eventsParameters);
  }

  on(event: Events, listener: FightSocket.Listener) {
    this.socket.on(event, listener);
  }

  private getIds() {
    return { fightId: this.fightId, judgeId: this.judgeId };
  }
}
