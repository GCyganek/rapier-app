export class ResponseInterface {
  status: ResponseStatus;
  playersData?: PlayersData;
}

export enum ResponseStatus {
  OK,
  Unauthorized,
  NotFound,
  NotReady,
  BadRequest,
}

export class PlayersData{
  redPlayerFirstName: string;
  redPlayerLastName: string;
  redPlayerPoints: number;

  bluePlayerFirstName: string;
  bluePlayerLastName: string;
  bluePlayerPoints: number;
}
