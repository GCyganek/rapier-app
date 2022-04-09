export interface Response {
  status: ResponseStatus;
}

export enum ResponseStatus {
  OK,
  Unauthorized,
  NotFound,
  NotReady,
  BadRequest,
}
