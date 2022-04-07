export class ResponseInterface {
  status: ResponseStatus;
}

export enum ResponseStatus {
  OK,
  Unauthorized,
  NotFound,
  NotReady,
  BadRequest,
}
