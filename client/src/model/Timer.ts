import { writable } from 'svelte/store';

type Timeout = ReturnType<typeof setTimeout>;

const toSec = (millis: number) => Math.floor(millis / 1000);

export class PreciseTimer {
  private startPoint: number;
  private syncStartPoint: number;
  private pausePoint: number;
  private timeout: Timeout;

  public time = writable(0);
  public paused = writable(false);

  constructor(syncStart: number) {
    this.startPoint = Date.now();
    this.syncStartPoint = syncStart;
    this.pausePoint = 0;
    this.timeout = setTimeout(PreciseTimer.timeoutCallback, 0, this);
  }

  resume(from: number) {
    if (this.pausePoint === 0)
      throw new Error('Cannot call resume on already running timer.');

    this.startPoint += from - this.pausePoint;
    this.timeout = setTimeout(PreciseTimer.timeoutCallback, 0, this);
    this.pausePoint = 0;
    this.paused.set(false);
  }

  pause(at: number) {
    clearTimeout(this.timeout);

    this.pausePoint = at;
    // this.time.set(toSec(at - this.syncStartPoint));
    this.paused.set(true);
  }

  private static timeoutCallback(timer: PreciseTimer) {
    const now = Date.now();
    const delta = now - timer.startPoint;
    const timeout = 1000 - (delta % 1000);

    timer.time.set(toSec(delta));
    timer.timeout = setTimeout(
      PreciseTimer.timeoutCallback,
      timeout + 1,
      timer,
    );
  }
}
