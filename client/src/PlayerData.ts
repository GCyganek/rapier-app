export enum PlayerColor {
    Red = "red",
    Blue = "blue"
};

export interface PlayerData {
    name: string;
    points: number;
    color: PlayerColor;
};