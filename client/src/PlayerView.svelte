<script context="module" lang="ts">
    /// TODO: Get real player data from backend server

    export enum PlayerColor {
        Red = "red",
        Blue = "blue"
    };

    export interface PlayerData {
        name: string;
        points: number;
        color: PlayerColor;
    };
</script>

<script lang="ts">
    export let playerData: PlayerData;
</script>

<style>
    div {
        padding: 10px;
    }

    div.red {
        background-color: rgb(199, 43, 43);
        color: white;
    }

    div.blue {
        background-color: rgb(35, 35, 178);
        color: white;
    }
</style>

<div class="{playerData.color}">
    <p> {playerData.name} </p>
    <p> Points: {playerData.points} </p>
</div>