import { ResponseInterface, ResponseStatus } from "src/interfaces/response.interface";

export class PlayersDataResponse implements ResponseInterface {
    status: ResponseStatus;

    redPlayerFirstName: string;
    redPlayerLastName: string;
    redPlayerPoints: number;
  
    bluePlayerFirstName: string;
    bluePlayerLastName: string;
    bluePlayerPoints: number;
}