import type { DefaultEventsMap } from '@socket.io/component-emitter';
import type { Response } from 'model/Communication';
import type { Writable } from 'svelte/store';
import { io, Socket } from 'socket.io-client';
import { writable } from 'svelte/store';
import type { SequenceElement } from '../model/SequenceElement';

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
    this.#redSuggestion = writable();
    this.#blueSuggestion = writable();
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
      switch (response.judgeColor.toUpperCase()) {
        case 'RED':
          return this.#redSuggestion.set(response);

        case 'BLUE':
          return this.#blueSuggestion.set(response);
      }
    };

    this.socket.on(Events.EventsSuggestion, listener);

    return [this.#redSuggestion, this.#blueSuggestion];
  }

  awaitEndCondition() {
    return this.promiseFor<Response.EndCondition>(
      Events.FightEndConditionFulfilled,
    );
  }

  get newEvents() {
    return this.#newEvents;
  }

  close() {
    this.socket.close();
  }

  join() {
    this.socket.emit(Events.Join, this.getIds());
    return this.promiseFor<Response.Join>(
      Events.Join,
      (r) => (this.role = r.role),
    );
  }

  startFight(at: number) {
    if (this.role === 'MAIN')
      this.socket.emit(Events.StartFight, {
        ...this.getIds(),
        timeInMillis: at,
      });

    return this.promiseFor<Response.Timer>(Events.StartFight);
  }

  finishFight() {
    if (this.role === 'MAIN')
      this.socket.emit(Events.FinishFight, this.getIds());

    return this.promiseFor<Response.Base>(Events.FinishFight);
  }

  pauseTimer(at: number) {
    if (this.role === 'MAIN')
      this.socket.emit(Events.PauseTimer, {
        timeInMillis: at,
        ...this.getIds(),
      });

    return this.promiseFor<Response.Timer>(Events.PauseTimer);
  }

  resumeTimer(at: number) {
    if (this.role === 'MAIN')
      this.socket.emit(Events.ResumeTimer, {
        timeInMillis: at,
        ...this.getIds(),
      });

    return this.promiseFor<Response.Timer>(Events.ResumeTimer);
  }

  sendEvents(points: { [x: string]: any }, stack: SequenceElement[]) {
    const eventsParameters = {
      fightId: this.fightId,
      judgeId: this.judgeId,
      //TODO EVENTS
      events: stack,
      redPlayerPoints: points['red'],
      bluePlayerPoints: points['blue'],
    };
    this.socket.emit(
      this.role === 'MAIN' ? Events.NewEvents : Events.EventsSuggestion,
      eventsParameters,
    );
  }

  on(event: Events, listener: FightSocket.Listener) {
    this.socket.on(event, listener);
  }

  private getIds() {
    return { fightId: this.fightId, judgeId: this.judgeId };
  }
}
