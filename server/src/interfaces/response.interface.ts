export interface Response {
  status: ResponseStatus;
}

export enum ResponseStatus {
  OK = 'OK',
  Unauthorized = 'UNAUTHORIZED',
  NotFound = 'NOT_FOUND',
  NotReady = 'NOT_READY',
  BadRequest = 'BAD_REQUEST',
}
