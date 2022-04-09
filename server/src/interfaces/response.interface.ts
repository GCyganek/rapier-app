export interface ResponseInterface {
  status: ResponseStatus;
}

export enum ResponseStatus {
  OK,
  Unauthorized,
  NotFound,
  NotReady,
  BadRequest,
}

export interface PauseTimerResponseInterface extends ResponseInterface {
  exactPauseTimeInMilis: number;
}
